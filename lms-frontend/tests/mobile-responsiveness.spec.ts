import { test, expect, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

// The devices we want to test
const targetDevices = [
  { name: 'iPhone 14', config: devices['iPhone 14'] },
  { name: 'Pixel 7', config: devices['Pixel 7'] },
  { name: 'iPad Mini', config: devices['iPad Mini'] }
];

interface OverflowReport {
  device: string;
  route: string;
  scrollWidth: number;
  clientWidth: number;
}

const overflowErrors: OverflowReport[] = [];

test.describe('Mobile Responsiveness Integrity Suite', () => {
  // Give this test a massive timeout since it iterates 118 * 3 = 354 pages
  test.describe.configure({ timeout: 900000 });

  test.afterAll(async () => {
    let markdown = `# Mobile Responsiveness Report\n\n`;
    markdown += `## Scan Summary\n`;
    markdown += `- **Devices Evaluated:** ${targetDevices.map(d => d.name).join(', ')}\n`;
    markdown += `- **Routes Scanned per Device:** ${modulesData.length}\n`;
    markdown += `- **Total Pages Analyzed:** ${modulesData.length * targetDevices.length}\n`;
    markdown += `- **Horizontal Overflows Detected:** ${overflowErrors.length}\n\n`;

    if (overflowErrors.length > 0) {
      markdown += `## Overflow Errors\n\n`;
      markdown += `| Device | Route | Viewport Width | Content Width |\n`;
      markdown += `| --- | --- | --- | --- |\n`;
      overflowErrors.forEach(err => {
        markdown += `| ${err.device} | ${err.route} | ${err.clientWidth}px | ${err.scrollWidth}px |\n`;
      });
    } else {
      markdown += `\n✅ **Perfect Responsiveness:** All 354 pages scaled flawlessly with no horizontal clipping!\n`;
    }

    const reportPath = path.resolve(__dirname, '../../mobile-responsiveness-report.md');
    fs.writeFileSync(reportPath, markdown, 'utf8');
  });

  // Loop over each device
  for (const targetDevice of targetDevices) {
    test(`Responsive check on ${targetDevice.name}`, async ({ browser }) => {
      // Create a new context specifically emulating the target device
      const context = await browser.newContext({
        ...targetDevice.config,
      });

      const page = await context.newPage();
      
      const screenshotsDir = path.resolve(__dirname, 'screenshots', 'mobile', targetDevice.name.replace(/\s+/g, '-'));
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      // Mock progress API to instantly unlock all modules so we can freely traverse
      await page.route('**/api/progress', async route => {
        if (route.request().method() === 'GET') {
          const fullProgress = modulesData.map((m: any) => ({ module_id: m.id, score: 100 }));
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, progress: fullProgress })
          });
        } else {
          await route.continue();
        }
      });

      // Inject identity to bypass welcome modal
      await page.addInitScript(() => {
        window.localStorage.setItem('asa_user_id', 'mobile-test-user');
        window.localStorage.setItem('asa_user_name', 'Mobile Tester');
      });

      for (const module of modulesData) {
        await page.goto(`/${module.url}`);
        
        // Wait for page to finish rendering
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        await expect(page.locator('#breadcrumbs')).toBeVisible({ timeout: 10000 });

        // Execute JS to mathematically check for layout overflow
        const overflowResult = await page.evaluate(() => {
          const clientWidth = document.documentElement.clientWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          return {
            hasOverflow: scrollWidth > clientWidth,
            clientWidth,
            scrollWidth
          };
        });

        if (overflowResult.hasOverflow) {
          overflowErrors.push({
            device: targetDevice.name,
            route: module.url,
            clientWidth: overflowResult.clientWidth,
            scrollWidth: overflowResult.scrollWidth
          });
        }

        // Take a screenshot to prove the state of the render
        const safeRoute = module.url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        await page.screenshot({ 
          path: path.join(screenshotsDir, `${safeRoute}.png`), 
          fullPage: true 
        });
      }

      await context.close();
    });
  }
});
