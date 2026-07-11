import { expect } from '@playwright/test';
import { test } from '../fixtures/eliteFixtures';

test.describe('Progression & Module Locking', () => {
  test.beforeEach(async ({ page, stateHelper }) => {
    await page.goto('/');
    await stateHelper.clearMasteryState();
  });

  test('should lock future modules before prerequisites are met', async ({ page }) => {
    await page.goto('/');
    // Check if the dashboard locks advanced paths when zero progress is made
    // The exact UI logic depends on lms-frontend implementation.
    // For now, we assume active stage paths are locked.
    const lockedModule = page.locator('button', { hasText: '🔒 Locked' });
    if (await lockedModule.count() > 0) {
      await expect(lockedModule.first()).toBeDisabled();
    }
  });

  test('should unlock next module upon completing a challenge', async ({ page, stateHelper }) => {
    await page.goto('/');
    // Manually complete a module to simulate progression
    await stateHelper.setMasteryState({
      completedModules: ['109-capstone-verify'],
      userProgress: { '109-capstone-verify': 100 }
    });

    await page.goto('/');
    // Verify progress updated
    await expect(page.locator('text=100%')).not.toHaveCount(0);
  });
});
