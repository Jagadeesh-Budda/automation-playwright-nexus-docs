import { Page, Locator } from '@playwright/test';

export class PRReviewPage {
  readonly page: Page;
  readonly container: Locator;
  readonly diffTable: Locator;
  readonly submitButton: Locator;
  readonly successBanner: Locator;
  readonly scoreText: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use data-testid for unambiguous container selection
    this.container = page.locator('[data-testid="pr-review-challenge"]');
    this.diffTable = this.container.locator('table');
    this.submitButton = this.container.locator('button', { hasText: 'Submit Review' });
    this.successBanner = this.container.locator('text=Review Completed');
    this.scoreText = this.container.locator('p', { hasText: 'You earned' });
  }

  async flagLine(lineNumber: number, category: string) {
    // Click the row using data-line attribute
    const row = this.diffTable.locator(`tr[data-line="${lineNumber}"]`);
    // force: true bypasses sticky header interception; position x:5, y:5 clicks the top-left
    // to avoid horizontal overflow issues on Mobile Chrome
    await row.click({ force: true, position: { x: 5, y: 5 } });

    // Wait for the category popover to appear, then click the category button
    const popover = this.diffTable.locator('text=Flag Issue as:').locator('xpath=./ancestor::tr');
    await popover.locator('button', { hasText: category }).click({ force: true });
  }

  async submitReview() {
    await this.submitButton.click({ force: true });
  }

  async getScoreText() {
    return await this.scoreText.textContent();
  }
}
