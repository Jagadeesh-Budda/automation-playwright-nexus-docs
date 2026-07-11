import { expect } from '@playwright/test';
import { test } from '../fixtures/eliteFixtures';

test.describe('Elite Tier Smoke Tests', () => {
  test('should render test bed without crashing', async ({ page }) => {
    const response = await page.goto('/elite-test-bed');
    expect(response?.status()).toBe(200);
    
    // Check main components
    await expect(page.locator('#trace-challenge-section')).toBeVisible();
    await expect(page.locator('#pr-review-section')).toBeVisible();
    await expect(page.locator('#architecture-review-section')).toBeVisible();
  });
});
