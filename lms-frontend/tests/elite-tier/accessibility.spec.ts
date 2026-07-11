import { expect } from '@playwright/test';
import { test } from '../fixtures/eliteFixtures';

test.describe('Accessibility Compliance', () => {
  test('Test Bed should not have any automatically detectable accessibility issues', async ({ page, makeAxeBuilder }) => {
    await page.goto('/elite-test-bed');
    
    // We run axe on the main sections containing the new components
    const accessibilityScanResults = await makeAxeBuilder()
      .include('#trace-challenge-section')
      .include('#pr-review-section')
      .include('#architecture-review-section')
      .analyze();
      
    // Assert no critical or serious violations
    const criticalOrSerious = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(criticalOrSerious).toEqual([]);
  });
});
