import { Page, Locator } from '@playwright/test';

export class ArchitectureReviewPage {
  readonly page: Page;
  readonly container: Locator;
  readonly submitButton: Locator;
  readonly scoreText: Locator;
  readonly fileTabs: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use data-testid for unambiguous container selection
    this.container = page.locator('[data-testid="arch-review-challenge"]');
    this.submitButton = this.container.locator('button', { hasText: 'Submit Architecture Review' });
    this.scoreText = this.container.locator('p', { hasText: 'You found' });
    // File tabs are buttons in the tab bar (before the code table)
    this.fileTabs = this.container.locator('div.flex button');
  }

  async switchToFile(filename: string) {
    const tab = this.container.locator('button', { hasText: filename }).first();
    await tab.click({ force: true });
  }

  async flagLine(lineNumber: number) {
    const row = this.container.locator(`table tr[data-line="${lineNumber}"]`);
    // force: true bypasses sticky header interception; position x:5, y:5 clicks the top-left
    // to avoid horizontal overflow issues on Mobile Chrome
    await row.click({ force: true, position: { x: 5, y: 5 } });
  }

  async submitReview() {
    await this.submitButton.click({ force: true });
  }

  async getScoreText() {
    return await this.scoreText.textContent();
  }
}
