import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

interface ProgressionEvent {
  phase: string;
  action: string;
  result: 'PASS' | 'FAIL';
  details: string;
}

const events: ProgressionEvent[] = [];

test.describe('Curriculum Progression & Unlocking Logic', () => {

  test.afterAll(async () => {
    let markdown = `# Progression Integrity Report\n\n`;
    markdown += `## Simulated Learner Journey\n`;
    markdown += `| Phase | Action | Result | Details |\n`;
    markdown += `| --- | --- | --- | --- |\n`;
    events.forEach(e => {
      const emoji = e.result === 'PASS' ? '✅' : '❌';
      markdown += `| ${e.phase} | ${e.action} | ${emoji} ${e.result} | ${e.details} |\n`;
    });

    const reportPath = path.resolve(__dirname, '../../progression-integrity-report.md');
    fs.writeFileSync(reportPath, markdown, 'utf8');
  });

  test('Learner completes sequential curriculum journey', async ({ page }) => {
    // Phase 0: Ensure we are a brand new user
    // The LMS will automatically assign a random user_id and initialize 0% state
    // We inject an ID manually to bypass the "Welcome" onboarding modal that blocks pointer events
    const testUserId = `tester-${Date.now()}`;
    await page.addInitScript((userId) => {
      if (!window.localStorage.getItem('asa_user_id')) {
        window.localStorage.setItem('asa_user_id', userId);
        window.localStorage.setItem('asa_user_name', 'Playwright Tester');
      }
    }, testUserId);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Identify test modules
    const module1 = modulesData[0];
    const module2 = modulesData[1];
    const module3 = modulesData[2];

    // ==========================================
    // Phase A: Bypass Prevention
    // ==========================================
    await test.step('Phase A: Attempt to bypass locks', async () => {
      // Try to jump straight to module 3
      await page.goto(`/${module3.url}`);
      await page.waitForLoadState('networkidle');

      // Assert the gate is visible
      const isGateVisible = await page.locator('text=Module Gate Locked').isVisible();
      expect(isGateVisible).toBeTruthy();

      // Assert module 1 and 2 are listed as requirements
      const requiresMod1 = await page.locator(`text=${module1.title}`).isVisible();
      const requiresMod2 = await page.locator(`text=${module2.title}`).isVisible();
      expect(requiresMod1).toBeTruthy();
      expect(requiresMod2).toBeTruthy();

      events.push({
        phase: 'Phase A',
        action: 'Direct Navigation to locked module',
        result: 'PASS',
        details: 'System successfully blocked bypass attempt and displayed prerequisites.'
      });
    });

    // ==========================================
    // Phase B: Sequential Completion
    // ==========================================
    await test.step('Phase B: Complete Module 1', async () => {
      await page.goto(`/${module1.url}`);
      await page.waitForLoadState('networkidle');

      // Module 1 has coding tasks, which lock the quiz until the code is verified
      // We will dispatch the verification event to unlock the quiz gate
      await page.evaluate((modId) => {
        window.dispatchEvent(new CustomEvent('codeVerified', { detail: { moduleId: modId } }));
      }, module1.id);

      // Detect quiz start button
      const startButton = page.locator('button:has-text("Start Mastery Assessment")');
      await expect(startButton).toBeVisible();
      await startButton.click();

      // Read the correct answers from modulesData
      // The quiz renders 1 easy, 1 medium, 1 hard question usually, or just whatever is in the pool
      const questions = page.locator('.quiz-item');
      await expect(questions.first()).toBeVisible();
      const questionsCount = await questions.count();

      for (let i = 0; i < questionsCount; i++) {
        const qLocator = questions.nth(i);
        // Find the question text
        const qTextElement = await qLocator.locator('p.font-semibold').textContent();
        
        // Find the corresponding question in the JSON to get the answer
        let correctAnswer = '';
        for (const pool of [module1.quizPool.Easy, module1.quizPool.Medium, module1.quizPool.Hard]) {
          if (!pool) continue;
          const match = pool.find((q: any) => qTextElement?.includes(q.q));
          if (match) correctAnswer = match.a;
        }

        if (correctAnswer) {
          // Click the button containing the exact text of the correct answer
          await qLocator.locator('button', { hasText: correctAnswer }).click();
        } else {
          // Fallback guess
          await qLocator.locator('button').first().click();
        }
      }

      // Submit the quiz and simultaneously wait for the background API progress sync
      const submitButton = page.locator('button:has-text("Submit Assessment")');
      await expect(submitButton).toBeVisible();
      
      const [progressResponse] = await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/progress') && resp.status() === 200, { timeout: 15000 }),
        submitButton.click()
      ]);

      // Wait for success feedback to visibly render
      const resultLocator = page.locator('h4:has-text("Mastery Attained!")').first();
      await expect(resultLocator).toBeVisible({ timeout: 10000 });

      events.push({
        phase: 'Phase B',
        action: `Complete ${module1.id}`,
        result: 'PASS',
        details: 'Learner passed the quiz and completed the module.'
      });
    });

    // ==========================================
    // Phase C: Prerequisite Unlocking
    // ==========================================
    await test.step('Phase C: Verify Module 2 Unlocked', async () => {
      await page.goto(`/${module2.url}`);
      await page.waitForLoadState('networkidle');

      // The gate should NOT be visible
      const isGateVisible = await page.locator('text=Module Gate Locked').isVisible();
      expect(isGateVisible).toBeFalsy();

      // The content should render
      await expect(page.locator('#breadcrumbs')).toBeVisible();

      events.push({
        phase: 'Phase C',
        action: `Navigate to ${module2.id}`,
        result: 'PASS',
        details: 'Module successfully unlocked upon prerequisite completion.'
      });
    });

    // ==========================================
    // Phase D: Dashboard Synchronization
    // ==========================================
    await test.step('Phase D: Verify Dashboard Statistics', async () => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // In the sidebar or dashboard, look for "1 /" to indicate 1 module complete
      const sidebar = page.locator('aside');
      await sidebar.hover();
      
      const sidebarProgress = sidebar.locator('text=1 /');
      await expect(sidebarProgress.first()).toBeVisible();

      events.push({
        phase: 'Phase D',
        action: 'Dashboard Progress Validation',
        result: 'PASS',
        details: 'Sidebar synchronized with backend completion state successfully.'
      });
    });
  });
});
