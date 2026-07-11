import { test, expect } from '../fixtures/eliteFixtures';

// Use standard Playwright timeouts to ensure failures occur natively if not handled
test.describe('Module G: The Failure Academy', () => {

  test.beforeEach(async ({ stateHelper }) => {
    // Calling stateHelper here simply triggers the fixture's initialization,
    // which injects the `asa_user_id` before the app loads, bypassing the profile modal.
  });

  test.describe('JIRA-101: CI Environment Drift', () => {
    test('local environment passes cleanly with data-testid', async ({ page }) => {
      await page.goto('/elite-test-bed');
      const checkoutSection = page.getByTestId('challenge-jira-101');
      
      await expect(checkoutSection.getByTestId('checkout-total')).toHaveText('$99.00');
      await checkoutSection.getByPlaceholder('**** **** **** 4242').fill('1111 2222 3333 4444');
      await checkoutSection.getByRole('button', { name: 'Complete Checkout' }).click({ force: true });
      
      await expect(checkoutSection.getByText('Order Confirmed!')).toBeVisible();
    });

    test('ci environment fails data-testid but can be solved', async ({ page }) => {
      await page.goto('/elite-test-bed?env=ci');
      const checkoutSection = page.getByTestId('challenge-jira-101');
      
      // Prove that data-testid is missing in CI
      await expect(checkoutSection.getByTestId('checkout-total')).toHaveCount(0);
      
      // Solution: Fallback to text matching or role matching for brittle envs
      await expect(checkoutSection.getByText('$ 99 . 00 USD')).toBeVisible();
      
      await checkoutSection.getByPlaceholder('**** **** **** 4242').fill('1111 2222 3333 4444');
      // Button text changed in CI
      await checkoutSection.getByRole('button', { name: 'Confirm Purchase' }).click({ force: true });
      await expect(checkoutSection.getByText('Order Confirmed!')).toBeVisible();
    });
  });

  test.describe('JIRA-102: Deterministic Race Condition', () => {
    test('handles the 6000ms delay on attempt 3 gracefully', async ({ page }) => {
      await page.goto('/elite-test-bed');
      const raceSection = page.getByTestId('challenge-jira-102');
      
      const loadBtn = raceSection.getByTestId('load-users-btn');
      
      // Attempt 1: Fast
      await loadBtn.click({ force: true });
      await expect(raceSection.getByTestId('user-list')).toBeVisible();
      
      // Attempt 2: Fast
      await loadBtn.click({ force: true });
      await expect(raceSection.getByTestId('user-list')).toBeVisible();
      
      // Attempt 3: Race condition triggers (6000ms delay)
      await loadBtn.click({ force: true });
      
      // Prove it handles the delay by extending the timeout
      await expect(raceSection.getByTestId('user-list')).toBeVisible({ timeout: 10000 });
      await expect(raceSection.getByText('Alice Smith')).toBeVisible();
    });
  });

  test.describe('JIRA-103: Browser-Specific Layout Bug', () => {
    test('Chromium can save profile', async ({ page, browserName }) => {
      // We only run the success path in Chromium or Webkit
      test.skip(browserName === 'firefox', 'Firefox has an intentional layout bug');
      
      await page.goto('/elite-test-bed');
      const bugSection = page.getByTestId('challenge-jira-103');
      
      const saveBtn = bugSection.getByTestId('save-profile');
      await saveBtn.click({ force: true });
      
      await expect(bugSection.getByText('Changes applied')).toBeVisible();
    });

    test('Firefox encounters invisible overlay blocking clicks', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'This bug only affects Firefox');
      
      await page.goto('/elite-test-bed');
      const bugSection = page.getByTestId('challenge-jira-103');
      const saveBtn = bugSection.getByTestId('save-profile');
      
      // In Firefox, the strict click will timeout/fail because the "Invisible Cookie Banner" is intercepting it.
      // We wrap it in a try/catch to prove it fails exactly as JIRA-103 states.
      let didFail = false;
      try {
        await saveBtn.click({ timeout: 2000 });
      } catch (e: any) {
        if (e.message.includes('intercepts pointer events')) {
          didFail = true;
        }
      }
      expect(didFail).toBeTruthy();
      
      // Solution: Force click to bypass the overlay
      await saveBtn.click({ force: true });
      await expect(bugSection.getByText('Changes applied')).toBeVisible();
    });
  });

  test.describe('JIRA-104: Friday Data Pollution', () => {
    test('handles huge datasets by paginating automatically', async ({ page }) => {
      // Force Friday mode to trigger massive pagination
      await page.goto('/elite-test-bed?day=friday');
      const dataSection = page.getByTestId('challenge-jira-104');
      
      // Verify massive dataset
      await expect(dataSection.getByText(/TOTAL_RECORDS:\s*2500/)).toBeVisible({ timeout: 10000 });
      
      const targetId = 'ORD-1012';
      
      // Solution: Loop through pages until we find the target
      let found = false;
      for (let i = 0; i < 10; i++) {
        // Give React a moment to render the new page
        await page.waitForTimeout(500);
        
        const hasOrder = await dataSection.getByTestId(`order-row-${targetId}`).isVisible();
        if (hasOrder) {
          found = true;
          break;
        }
        
        // Check if there is a next button that isn't disabled
        const nextBtn = dataSection.getByRole('button', { name: 'Next' });
        if (await nextBtn.isDisabled()) {
          break;
        }
        await nextBtn.click({ force: true });
      }
      
      expect(found).toBeTruthy();
      await expect(dataSection.getByTestId(`order-row-${targetId}`).locator('span')).toHaveText('Processing');
    });
  });

});
