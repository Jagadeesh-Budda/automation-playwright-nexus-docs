import { test, expect } from '@playwright/test';

test.describe('Daily & Weekly Challenges Verification Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Inject custom mock states into LocalStorage before load
    await page.addInitScript(() => {
      window.localStorage.setItem('asa_user_id', 'challenge-test-user');
      window.localStorage.setItem('asa_user_name', 'Challenge Tester');
      
      // Seed a fixed daily challenge metadata so we test consistently
      window.localStorage.setItem('asa_active_daily_challenge', JSON.stringify({
        id: "locator-001",
        assignedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString() // expires in 1 hour
      }));

      // Seed active weekly challenge
      window.localStorage.setItem('asa_active_weekly_challenge', JSON.stringify({
        id: "weekly-001",
        assignedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 5).toISOString() // expires in 5 days
      }));

      window.localStorage.setItem('asa_challenge_streak', '2');
      window.localStorage.setItem('asa_time_spent', '100'); // start with 100 XP
      window.localStorage.setItem('asa_challenge_difficulty_level', 'Easy');
    });

    await page.goto('/');
  });

  test('Should render Daily, Weekly, and Streak panels on the dashboard', async ({ page }) => {
    // 1. Verify Daily Challenge panel text and details
    const dailyTitle = page.locator('text=Daily Challenge');
    await expect(dailyTitle).toBeVisible();

    const categoryBadge = page.locator('text=Locators');
    await expect(categoryBadge).toBeVisible();

    const difficultyBadge = page.locator('text=Easy').first();
    await expect(difficultyBadge).toBeVisible();

    // 2. Verify Weekly Mission panel text
    const weeklyTitle = page.locator('text=Weekly Mission');
    await expect(weeklyTitle).toBeVisible();

    const missionName = page.locator('text=Module Accelerator');
    await expect(missionName).toBeVisible();

    // 3. Verify Streak Board
    const streakTitle = page.locator('text=Challenger Streak');
    await expect(streakTitle).toBeVisible();

    const streakCount = page.locator('text=2 Days');
    await expect(streakCount).toBeVisible();
  });

  test('Answering a Daily Challenge correctly triggers reward and advances streak', async ({ page }) => {
    // Locator challenge expects "button.submit-btn[data-testid='submit-action']"
    const inputField = page.getByPlaceholder('Type your answer here...');
    await expect(inputField).toBeVisible();

    // Fill in the correct answer
    await inputField.fill("button.submit-btn[data-testid='submit-action']");

    // Click submit
    await page.locator('button:has-text("Submit Answer")').click();

    // Success feedback message
    const feedback = page.locator('text=Correct! +20 XP awarded!').first();
    await expect(feedback).toBeVisible();

    // Verify streak card advanced to 3 Days
    const updatedStreak = page.locator('text=3 Days');
    await expect(updatedStreak).toBeVisible();
  });
});
