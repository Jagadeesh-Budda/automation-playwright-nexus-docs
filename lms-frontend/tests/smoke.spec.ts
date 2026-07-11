import { test, expect } from '@playwright/test';

test.describe('LMS Smoke Tests', () => {
  test('Dashboard loads and displays core elements', async ({ page }) => {
    // Navigate to local dashboard
    await page.goto('http://localhost:3000/');

    // Ensure the dashboard title is visible
    await expect(page.getByText('AUTOMATION ENGINEER PATH')).toBeVisible();

    // Verify Career Trajectory panel renders
    await expect(page.getByText('Career Trajectory', { exact: true })).toBeVisible();
    
    // Check if the emblem rendered
    await expect(page.getByText('Junior', { exact: true })).toBeVisible();
    await expect(page.getByText('Specialist', { exact: true })).toBeVisible();
  });

  test('Navigate to a lesson module', async ({ page }) => {
    // Navigate directly to the first lesson
    await page.goto('http://localhost:3000/courses/playwright/01-js-ts-variables');

    // Wait for the lesson content to render
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Verify the Next.js page structure has loaded (sidebar exists)
    const sidebarItems = page.locator('aside');
    expect(await sidebarItems.count()).toBeGreaterThan(0);
  });
});
