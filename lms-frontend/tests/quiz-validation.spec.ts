import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Read all curriculum routes dynamically from modules.json
const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

test.describe('Quiz Validation Suite', () => {
  for (const module of modulesData) {
    // Detect whether the lesson contains a quiz by checking quizPool
    const hasQuizPool = module.quizPool && (
      (module.quizPool.Easy?.length > 0) ||
      (module.quizPool.Medium?.length > 0) ||
      (module.quizPool.Hard?.length > 0)
    );

    if (!hasQuizPool) {
      continue;
    }

    test(`Validate Quiz for module: ${module.id} (${module.url})`, async ({ page }, testInfo) => {
      // Navigate to page, bypass tasks gate using localstorage
      await page.addInitScript((moduleId) => {
        window.localStorage.setItem(`code_verified_${moduleId}`, 'true');
        // Also mock localStorage for user identity to ensure initUser tries to fetch progress
        window.localStorage.setItem('asa_user_id', 'test-user-123');
        window.localStorage.setItem('asa_user_name', 'Playwright Tester');
      }, module.id);

      // Intercept the /api/progress call to spoof completed modules (except the current one) to bypass the module gate lock
      await page.route('**/api/progress', async (route) => {
        const fakeProgress = modulesData
          .filter((m: any) => m.id !== module.id) // Complete everything except the current module
          .map((m: any) => ({ module_id: m.id, score: 100 }));
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, progress: fakeProgress })
        });
      });

      // Visit the lesson page
      await page.goto(`/${module.url}`);

      // Wait for the mastery gate to render
      const gateContainer = page.locator('.animate-fade-in').first();
      await expect(gateContainer).toBeVisible();

      // Detect quiz start button
      const startButton = page.locator('button:has-text("Start Mastery Assessment"), button:has-text("Mark Module Complete")');
      await expect(startButton).toBeVisible();

      const buttonText = await startButton.textContent();
      await startButton.click();

      // If it was "Start Mastery Assessment", the questions should appear.
      if (buttonText?.includes('Start Mastery Assessment')) {
        // Verify the quiz container renders successfully
        const questions = page.locator('.quiz-item');
        await expect(questions.first()).toBeVisible();
        const questionsCount = await questions.count();

        // Verify all answer options are visible and answer each question
        for (let i = 0; i < questionsCount; i++) {
          const qLocator = questions.nth(i);
          await expect(qLocator).toBeVisible();

          // Verify all answer options are visible
          const options = qLocator.locator('button');
          const optionsCount = await options.count();
          expect(optionsCount).toBeGreaterThan(0);

          for (let j = 0; j < optionsCount; j++) {
            await expect(options.nth(j)).toBeVisible();
          }

          // Select an answer (we'll just pick the first option as a guess)
          await options.first().click();
        }

        // Submit the quiz
        const submitButton = page.locator('button:has-text("Submit Assessment")');
        await expect(submitButton).toBeVisible();
        await submitButton.click();
      }

      // Verify a result, feedback message, score, or completion state appears.
      const resultLocator = page.locator('h4:has-text("Mastery Attained!"), h4:has-text("Assessment Failed")').first();
      await expect(resultLocator).toBeVisible({ timeout: 10000 });
    });
  }
});

// Capture screenshots on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath(`failure.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }
});
