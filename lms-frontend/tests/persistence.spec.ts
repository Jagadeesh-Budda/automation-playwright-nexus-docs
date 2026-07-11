import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Dynamically discover curriculum routes from modules.json
const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

test.describe('Curriculum Progress Persistence Suite', () => {
  // We need serial execution to maintain state logic if we were running multiple tests, 
  // but since we orchestrate the whole persistence flow inside a single test block, it's fine.
  test('Verify progression state is preserved across sessions', async ({ browser }) => {
    // We expect at least two modules to run the cross-session gate check
    expect(modulesData.length).toBeGreaterThan(1);
    
    const lesson1 = modulesData[0];
    const lesson2 = modulesData[1];
    const uniqueUserId = `test-user-${Date.now()}`;

    // =========================================================================
    // SESSION 1: COMPLETE LESSON
    // =========================================================================
    let context = await browser.newContext();
    let page = await context.newPage();

    // Inject unique user session for backend isolation, and bypass the interactive
    // sandbox code validations for lesson 1 so we can focus on the mastery assessment.
    await page.addInitScript((data) => {
      window.localStorage.setItem('asa_user_id', data.userId);
      window.localStorage.setItem('asa_user_name', 'Persistence Tester');
      window.localStorage.setItem(`code_verified_${data.moduleId}`, 'true');
    }, { userId: uniqueUserId, moduleId: lesson1.id });

    // 1. Complete a lesson using the same UI action a learner would use
    await page.goto(`/${lesson1.url}`);

    // Wait for gate container to render
    const gateContainer = page.locator('.animate-fade-in').first();
    await expect(gateContainer).toBeVisible();

    // Intercept POST to /api/progress and force a passing score 
    // so we don't have to hardcode answers for randomized quizzes
    await page.route('**/api/progress', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        const body = JSON.parse(request.postData() || '{}');
        body.score = 100; // Force pass
        await route.continue({ postData: JSON.stringify(body) });
      } else {
        await route.continue();
      }
    });

    // Find and click the Assessment or Completion button
    const startButton = page.locator('button:has-text("Start Mastery Assessment"), button:has-text("Mark Module Complete")');
    await expect(startButton).toBeVisible();
    
    const buttonText = await startButton.textContent();
    await startButton.click();

    // If it's a quiz, answer the questions
    if (buttonText?.includes('Start Mastery Assessment')) {
      const questions = page.locator('.quiz-item');
      await expect(questions.first()).toBeVisible();
      const questionsCount = await questions.count();

      for (let i = 0; i < questionsCount; i++) {
        const options = questions.nth(i).locator('button');
        await expect(options.first()).toBeVisible();
        await options.first().click();
      }

      const submitResponsePromise = page.waitForResponse('**/api/progress');
      const submitButton = page.locator('button:has-text("Submit Assessment")');
      await expect(submitButton).toBeVisible();
      await submitButton.click();
      await submitResponsePromise; // wait for the DB save to finish
    }

    // 2. Refresh the page to verify backend persistence!
    // Since we randomly guessed the answers, the local React state might briefly say "Failed",
    // but our network interceptor forced the backend to save a 100% pass rate.
    await page.reload();

    // After reload, the quiz component automatically fetches from API
    // and should successfully show Mastery Attained without needing to resubmit
    const resultLocator = page.locator('h4:has-text("Mastery Attained!")').first();
    await expect(resultLocator).toBeVisible({ timeout: 10000 });

    // =========================================================================
    // SESSION 2: CROSS-SESSION PERSISTENCE
    // =========================================================================
    // Close the browser context to completely wipe runtime memory and session cookies
    await context.close();

    // Open a completely new browser context
    context = await browser.newContext();
    page = await context.newPage();

    // Re-inject the SAME userId. This simulates a user returning to the app on a new day.
    await page.addInitScript((data) => {
      window.localStorage.setItem('asa_user_id', data.userId);
      window.localStorage.setItem('asa_user_name', 'Persistence Tester');
      // We explicitly DO NOT set code_verified_... this time!
    }, { userId: uniqueUserId });

    // 3. Return to the curriculum dashboard and verify progress is stored
    await page.goto('/');
    
    // The dashboard fetches /api/progress on load. We should verify completed chapters metric.
    // The dashboard contains text like: "1 / 118" where 1 is completedChaptersCount.
    // We can look for the specific locator or text.
    const lessonsCompletedMetric = page.locator('span:has-text("/")', { hasText: '118' }).first();
    // Wait for the text to contain '1 / 118'
    await expect(page.getByText('1 / 118')).toBeVisible({ timeout: 10000 });

    // Inject sandbox task completion to reveal the quiz button before navigation
    await page.addInitScript((moduleId) => {
      window.localStorage.setItem(`code_verified_${moduleId}`, 'true');
    }, lesson2.id);

    // 4. Verify completed lessons remain unlocked (Module 2 should be accessible)
    await page.goto(`/${lesson2.url}`);

    // Since Lesson 1 is complete, Lesson 2 should NOT show the "Module Gate Locked" screen
    const lockedGate = page.locator('h2:has-text("Module Gate Locked")');
    await expect(lockedGate).toBeHidden();

    // Instead, Lesson 2 should show its content normally (or the "Mark Module Complete" button for it)
    const lesson2StartButton = page.locator('button:has-text("Start Mastery Assessment"), button:has-text("Mark Module Complete")');
    await expect(lesson2StartButton).toBeVisible();
    
    await context.close();
  });
});
