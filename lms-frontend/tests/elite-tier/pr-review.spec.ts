import { expect } from '@playwright/test';
import { test } from '../fixtures/eliteFixtures';
import { PRReviewPage } from '../pages/PRReviewPage';

test.describe('PRReviewChallenge Component', () => {
  let prPage: PRReviewPage;

  test.beforeEach(async ({ page, stateHelper }) => {
    await page.goto('/');
    await stateHelper.clearMasteryState();
    await page.goto('/elite-test-bed');
    prPage = new PRReviewPage(page);
  });

  test('should render diff lines correctly', async () => {
    await expect(prPage.diffTable).toBeVisible();
    await expect(prPage.diffTable.locator('text=const x = 1;')).toBeVisible();
    await expect(prPage.diffTable.locator('text=const x = 2;')).toBeVisible();
  });

  test('should allow flagging a line and selecting a category', async () => {
    await prPage.flagLine(2, 'Bug');
    await expect(prPage.diffTable.locator('text=Bug').first()).toBeVisible();
  });

  test('should award points for finding known issues (Critical = 5pts)', async ({ stateHelper }) => {
    await prPage.flagLine(2, 'Bug'); // The seeded issue in test bed is Bug on line 2 (Critical)
    await prPage.submitReview();

    await expect(prPage.successBanner).toBeVisible();
    const score = await prPage.getScoreText();
    expect(score).toContain('5 out of 5 points');
  });

  test('should penalize or score 0 for false positives', async () => {
    await prPage.flagLine(3, 'Flakiness'); // Line 3 has no issue
    await prPage.submitReview();

    await expect(prPage.successBanner).toBeVisible(); // Still completes
    const score = await prPage.getScoreText();
    expect(score).toContain('0 out of 5 points'); // Earned 0
  });

  test('should support deselection of lines', async () => {
    // Flag it
    await prPage.flagLine(2, 'Bug');
    await expect(prPage.diffTable.locator('text=Bug').first()).toBeVisible();

    // Click line again to deselect
    const row = prPage.diffTable.locator('tr[data-line="2"]');
    await row.click({ force: true, position: { x: 5, y: 5 } });
    
    // Flag indicator should be gone
    await expect(prPage.diffTable.locator('text=Bug')).toHaveCount(0);
  });
});
