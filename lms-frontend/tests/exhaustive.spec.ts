import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Load modules data
const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

test.describe('Exhaustive Curriculum Check', () => {
  for (const module of modulesData) {
    const slug = module.slug || module.id;
    
    test(`Module Page Loads: ${module.title}`, async ({ page }) => {
      // Go to the specific module's URL
      await page.goto(`http://localhost:3000/courses/playwright/${slug}`);

      // Ensure the page actually loads content (an H1 should exist)
      // Note: If the module is locked, it will show "Module Gate Locked" instead of the module title.
      // We check for either standard chapter content or the locked gate.
      const hasHeader = await page.locator('h1').count() > 0;
      const hasLockedGate = await page.locator('h2', { hasText: 'Module Gate Locked' }).count() > 0;

      expect(hasHeader || hasLockedGate).toBeTruthy();

      // Ensure the Sidebar is still rendered on the layout
      const sidebarItems = page.locator('aside');
      expect(await sidebarItems.count()).toBeGreaterThan(0);
    });
  }
});
