import { test, expect } from '@playwright/test';

test.describe('Adaptive Learning Recommendations E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.evaluate(() => {
      localStorage.clear();
      const randomId = 'test_user_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('asa_user_name', 'Test Student');
      localStorage.setItem('asa_user_id', randomId);
    });
    await page.reload();
    
    // Complete onboarding first to get active profile layout
    await page.getByRole('button', { name: 'Get Started' }).click();
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await page.getByRole('button', { name: 'Become Playwright Expert' }).click();
    await page.getByRole('button', { name: 'Set Goals' }).click();
    await page.getByRole('button', { name: '30 MIN' }).click();
    await page.getByRole('button', { name: 'Confirm Target' }).click();
    await page.getByRole('button', { name: 'Start Learning Path' }).click();
  });

  test('Switching learning paths changes recommended next lesson', async ({ page }) => {
    // 1. Click "Foundations" path selector on dashboard
    await page.getByRole('button', { name: 'Foundations' }).click();
    await expect(page.getByText('Path Timeline (FOUNDATIONS)').first()).toBeVisible();

    // 2. Click "Enterprise SDET" path selector
    await page.getByRole('button', { name: 'Enterprise SDET' }).click();
    await expect(page.getByText('Path Timeline (ENTERPRISE)').first()).toBeVisible();
  });

  test('Skipping lessons shows prerequisite warning banner and supports Continue Anyway', async ({ page }) => {
    // Navigate directly to an out-of-order advanced lesson (e.g. 02-js-ts-functions)
    await page.goto('http://localhost:3000/courses/playwright/02-js-ts-functions');

    // Verify warning banner is displayed
    await expect(page.getByText('Advanced Concept')).toBeVisible();
    await expect(page.getByText('Recommended: Complete "Variables & Data Types" before "Functions & Scope"')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to Prerequisite' })).toBeVisible();

    // Click "Continue Anyway"
    await page.getByRole('button', { name: 'Continue Anyway' }).click();

    // Verify banner is dismissed
    await expect(page.getByText('Advanced Concept')).not.toBeVisible();
  });
});
