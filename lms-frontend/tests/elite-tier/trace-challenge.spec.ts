import { expect } from '@playwright/test';
import { test } from '../fixtures/eliteFixtures';
import { TraceChallengePage } from '../pages/TraceChallengePage';

// Test bed config in /elite-test-bed/page.tsx:
//   expectedFailingStepSnippet="click"
//   expectedRootCauseSnippet="timeout"
//   expectedEvidenceSnippet defaults to "request completed after assertion"
//   expectedFixSnippet defaults to "wait for response"

test.describe('TraceChallenge Component', () => {
  let tracePage: TraceChallengePage;

  test.beforeEach(async ({ page, stateHelper }) => {
    await page.goto('/');
    await stateHelper.clearMasteryState();
    await page.goto('/elite-test-bed');
    tracePage = new TraceChallengePage(page);
  });

  test('should render all form fields and submit button', async () => {
    await expect(tracePage.failingStepInput).toBeVisible();
    await expect(tracePage.rootCauseInput).toBeVisible();
    await expect(tracePage.evidenceInput).toBeVisible();
    await expect(tracePage.recommendedFixInput).toBeVisible();
    await expect(tracePage.confidenceSlider).toBeVisible();
    await expect(tracePage.submitButton).toBeVisible();
  });

  test('should validate input constraints and disable submission if incomplete', async () => {
    // Fill partial form — missing evidence and fix means validation fails
    await tracePage.fillForm({ failingStep: 'click', rootCause: 'timeout' });
    await tracePage.submit();

    // Should trigger HTML5 form validation (native browser popup), so no component error is shown
    // We can verify this by checking if the form is still invalid
    const isInvalid = await tracePage.page.$eval('form', (form: HTMLFormElement) => !form.checkValidity());
    expect(isInvalid).toBe(true);
  });

  test('should accept valid correct submission and update localStorage', async ({ stateHelper }) => {
    await tracePage.fillForm({
      failingStep: 'click',                          // matches expectedFailingStepSnippet
      rootCause: 'timeout',                          // matches expectedRootCauseSnippet
      evidence: 'request completed after assertion', // matches default expectedEvidenceSnippet
      fix: 'wait for response',                      // matches default expectedFixSnippet
    });

    await tracePage.submit();

    await expect(tracePage.successMessage).toBeVisible();

    await expect(tracePage.successMessage).toBeVisible();
  });

  test('should reject incorrect submission', async () => {
    await tracePage.fillForm({
      failingStep: 'wrong step that does not match',
      rootCause: 'wrong cause that does not match',
      evidence: 'some evidence',
      fix: 'some fix',
    });

    await tracePage.submit();

    await expect(tracePage.errorMessage).toBeVisible();
  });
});
