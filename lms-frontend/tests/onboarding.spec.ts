import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Open page with clean localStorage context
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    // Reload to ensure state initializes cleanly
    await page.reload();
  });

  test('Should complete the full onboarding flow with recommendations', async ({ page }) => {
    // 1. Verify Welcome Screen is displayed automatically
    await expect(page.getByText('Welcome to Nexus Academy')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();

    // 2. Click "Get Started" to move to Skill Assessment
    await page.getByRole('button', { name: 'Get Started' }).click();
    await expect(page.getByText('Skill Assessment')).toBeVisible();

    // 3. Click "Skip for now" to move to Goals selection
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page.getByText('Select Your Goals')).toBeVisible();

    // 4. Select learning goals
    await page.getByRole('button', { name: 'Become Playwright Expert' }).click();
    await page.getByRole('button', { name: 'Build Framework' }).click();
    await page.getByRole('button', { name: 'Set Goals' }).click();

    // 5. Select daily study target (30 min chip)
    await expect(page.getByText('Set Daily target')).toBeVisible();
    await page.getByRole('button', { name: '30 MIN' }).click();
    await page.getByRole('button', { name: 'Confirm Target' }).click();

    // 6. Verify Recommendation details
    await expect(page.getByText('Your Profile is Ready')).toBeVisible();
    await expect(page.getByText('30m / day target')).toBeVisible();
    await expect(page.locator('span').filter({ hasText: 'Novice' }).first()).toBeVisible();

    // 7. Complete Onboarding
    await page.getByRole('button', { name: 'Start Learning Path' }).click();

    // 8. Verify Onboarding modal is closed and Learning Profile Widget is visible
    await expect(page.getByText('Welcome to Nexus Academy')).not.toBeVisible();
    await expect(page.getByText('Learning Profile')).toBeVisible();
    await expect(page.getByText('0m / 30m')).toBeVisible();
  });
});
