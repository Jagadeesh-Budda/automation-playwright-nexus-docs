import { expect } from '@playwright/test';
import { test } from '../fixtures/eliteFixtures';

test.describe('Session & Progress Persistence', () => {
  test('should persist progress across browser refresh', async ({ page, stateHelper }) => {
    await page.goto('/');
    await stateHelper.setMasteryState({
      completedModules: ['test-module-x'],
      userProgress: { 'test-module-x': 95 }
    });

    await page.goto('/');
    
    // Refresh the page
    await page.reload();

    // Verify state survived
    const state = await stateHelper.getMasteryState();
    expect(state?.completedModules).toContain('test-module-x');
    expect(state?.userProgress['test-module-x']).toBe(95);
  });
});
