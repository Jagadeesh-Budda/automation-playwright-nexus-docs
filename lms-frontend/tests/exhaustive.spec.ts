import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load modules data
const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

test.describe('Exhaustive Curriculum Check', () => {
  test.beforeEach(async ({ page }) => {
    // Inject identity so the welcome modal/onboarding wizard doesn't intercept pages
    await page.addInitScript(() => {
      window.localStorage.setItem('asa_user_id', 'exhaustive-test-user');
      window.localStorage.setItem('asa_user_name', 'Exhaustive Tester');
    });
  });

  for (const module of modulesData) {
    const slug = module.slug || module.id;
    
    test(`Module Page Loads: ${module.title}`, async ({ page }) => {
      // Go to the specific module's URL
      await page.goto(`http://localhost:3000/courses/playwright/${slug}`);

      // Wait for the 'Decrypting progress ledger...' loading overlay to disappear
      await expect(page.locator('text=Decrypting progress ledger...')).not.toBeVisible({ timeout: 15000 });

      // Wait for either the chapter header (h1) or an h2 section header to appear in the DOM
      const hasContent = await page.waitForSelector('h1, h2', { state: 'attached', timeout: 10000 })
        .then(() => true)
        .catch(() => false);
      
      expect(hasContent).toBeTruthy();

      // Ensure the Sidebar is still rendered on the layout
      const sidebarItems = page.locator('aside');
      expect(await sidebarItems.count()).toBeGreaterThan(0);
    });
  }
});
