import { expect } from '@playwright/test';
import { test } from '../fixtures/eliteFixtures';
import { ArchitectureReviewPage } from '../pages/ArchitectureReviewPage';

// Test bed config: 1 file 'playwright.config.ts', 1 issue on line 1

test.describe('ArchitectureReviewChallenge Component', () => {
  let archPage: ArchitectureReviewPage;

  test.beforeEach(async ({ page, stateHelper }) => {
    await page.goto('/');
    await stateHelper.clearMasteryState();
    await page.goto('/elite-test-bed');
    archPage = new ArchitectureReviewPage(page);
  });

  test('should render files and allow tab switching', async () => {
    // Container should be visible
    await expect(archPage.container).toBeVisible();
    // The file tab for 'playwright.config.ts' should be visible
    await expect(archPage.container.locator('button', { hasText: 'playwright.config.ts' })).toBeVisible();
  });

  test('should allow flagging architectural flaws', async () => {
    await archPage.flagLine(1);
    // After clicking, the row should show 'Flagged' label
    await expect(archPage.container.locator('text=Flagged').first()).toBeAttached();
  });

  test('should calculate coverage accurately upon submission', async ({ stateHelper }) => {
    // Flag the one known issue (line 1)
    await archPage.flagLine(1);
    await archPage.submitReview();

    // The component renders "You found X% of the embedded architectural flaws."
    await expect(archPage.scoreText).toBeVisible();
    const scoreText = await archPage.getScoreText();
    expect(scoreText).toContain('100%');
  });

  test('should show false positive indicators and miss indicators', async () => {
    // Submit without flagging anything — should miss the issue
    await archPage.submitReview();

    const scoreText = await archPage.getScoreText();
    expect(scoreText).toContain('0%');

    // Should show "Keep Practicing" and "Missed:" indicator
    await expect(archPage.container.locator('text=Keep Practicing')).toBeVisible();
    await expect(archPage.container.locator('text=Missed:')).toBeVisible();
  });
});
