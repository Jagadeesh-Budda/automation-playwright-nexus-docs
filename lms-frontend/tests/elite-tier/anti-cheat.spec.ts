import { expect } from '@playwright/test';
import { test } from '../fixtures/eliteFixtures';
import { PRReviewPage } from '../pages/PRReviewPage';

// Test bed config: only line 2 is a real issue (Critical Bug)
// Line 3 is a context line with no embedded issue

test.describe('Anti-Cheat Protection', () => {
  let prPage: PRReviewPage;

  test.beforeEach(async ({ page, stateHelper }) => {
    await page.goto('/');
    await stateHelper.clearMasteryState();
    await page.goto('/elite-test-bed');
    prPage = new PRReviewPage(page);
  });

  test('should score 0 for flagging a line with no real issue', async () => {
    // Line 3 is a context line — not a real issue
    await prPage.flagLine(3, 'Bug');
    await prPage.submitReview();

    const score = await prPage.getScoreText();
    expect(score).toContain('0 out of 5');
  });

  test('should not allow empty submissions to pass', async ({ stateHelper }) => {
    // Submit without flagging anything
    await prPage.submitReview();

    // Score should be 0
    const score = await prPage.getScoreText();
    expect(score).toContain('0 out of 5');
  });
});
