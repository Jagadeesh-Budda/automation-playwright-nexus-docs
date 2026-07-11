import { Page, Locator } from '@playwright/test';

export class TraceChallengePage {
  readonly page: Page;
  readonly container: Locator;
  readonly failingStepInput: Locator;
  readonly rootCauseInput: Locator;
  readonly evidenceInput: Locator;
  readonly recommendedFixInput: Locator;
  readonly confidenceSlider: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use data-testid for unambiguous container selection
    this.container = page.locator('[data-testid="trace-challenge"]');
    // Inputs match DOM order: 1 text input, 3 textareas
    this.failingStepInput = this.container.locator('input[type="text"]').first();
    this.rootCauseInput = this.container.locator('textarea').nth(0);
    this.evidenceInput = this.container.locator('textarea').nth(1);
    this.recommendedFixInput = this.container.locator('textarea').nth(2);
    this.confidenceSlider = this.container.locator('input[type="range"]');
    this.submitButton = this.container.locator('button[type="submit"]');
    // Actual text from TraceChallenge.tsx
    this.successMessage = this.container.locator('text=Elite Debugging Verified!');
    this.errorMessage = this.container.locator('text=Analysis Needs Refinement');
    this.validationErrors = this.container.locator('ul.list-disc li');
  }

  async fillForm(data: {
    failingStep?: string;
    rootCause?: string;
    evidence?: string;
    fix?: string;
    confidence?: string;
  }) {
    if (data.failingStep) await this.failingStepInput.fill(data.failingStep, { force: true });
    if (data.rootCause) await this.rootCauseInput.fill(data.rootCause, { force: true });
    if (data.evidence) await this.evidenceInput.fill(data.evidence, { force: true });
    if (data.fix) await this.recommendedFixInput.fill(data.fix, { force: true });
    if (data.confidence) await this.confidenceSlider.fill(data.confidence, { force: true });
  }

  async submit() {
    await this.submitButton.click({ force: true });
  }
}
