import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

interface RuntimeError {
  type: 'ConsoleError' | 'PageError' | 'RequestFailed';
  message: string;
  route: string;
  url?: string; // For network requests
}

const allErrors: RuntimeError[] = [];

test.describe('Curriculum Runtime Monitoring Scanner', () => {
  // Give this test a massive timeout since it scans 118 pages
  test.describe.configure({ timeout: 400000 });

  test.afterAll(async () => {
    // Generate Reports
    const totalPages = modulesData.length;
    const consoleErrors = allErrors.filter(e => e.type === 'ConsoleError');
    const pageErrors = allErrors.filter(e => e.type === 'PageError');
    const networkFailures = allErrors.filter(e => e.type === 'RequestFailed');

    // 1. JSON Report
    const jsonReport = {
      summary: {
        pagesScanned: totalPages,
        totalErrors: allErrors.length,
        consoleErrors: consoleErrors.length,
        pageErrors: pageErrors.length,
        networkFailures: networkFailures.length,
      },
      errors: allErrors
    };

    const jsonPath = path.resolve(__dirname, '../../runtime-monitoring-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf8');

    // 2. Markdown Report
    let markdown = `# Curriculum Runtime Monitoring Report\n\n`;
    markdown += `## Scan Summary\n`;
    markdown += `- **Pages Scanned:** ${totalPages}\n`;
    markdown += `- **Total Errors Detected:** ${allErrors.length}\n`;
    markdown += `- **Console Errors (incl. Hydration/Promise Rejections):** ${consoleErrors.length}\n`;
    markdown += `- **JavaScript Exceptions (PageErrors):** ${pageErrors.length}\n`;
    markdown += `- **Network Failures:** ${networkFailures.length}\n\n`;

    if (allErrors.length > 0) {
      markdown += `## Error Details\n\n`;
      markdown += `| Type | Route | Message | Details |\n`;
      markdown += `| --- | --- | --- | --- |\n`;
      allErrors.forEach(err => {
        const details = err.url ? `URL: ${err.url}` : '';
        // Sanitize newlines from messages for the markdown table
        const safeMessage = err.message.replace(/\n/g, ' <br> ');
        markdown += `| ${err.type} | ${err.route} | ${safeMessage} | ${details} |\n`;
      });
    } else {
      markdown += `\n✅ **All Systems Green:** No runtime errors detected across the curriculum!\n`;
    }

    const mdPath = path.resolve(__dirname, '../../runtime-monitoring-report.md');
    fs.writeFileSync(mdPath, markdown, 'utf8');
  });

  test('Scan all curriculum pages for runtime errors', async ({ page }) => {
    let currentRoute = 'Init';
    const screenshotsDir = path.resolve(__dirname, 'screenshots');
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const takeScreenshot = async (route: string, type: string) => {
      try {
        const safeRoute = route.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${safeRoute}-${type}-${timestamp}.png`;
        await page.screenshot({ path: path.join(screenshotsDir, filename), fullPage: true });
      } catch (e) {
        // Ignore screenshot failures to not block the main scanner
      }
    };

    // Attach passive listeners
    page.on('console', async msg => {
      if (msg.type() === 'error') {
        allErrors.push({
          type: 'ConsoleError',
          message: msg.text(),
          route: currentRoute
        });
        await takeScreenshot(currentRoute, 'console-error');
      }
    });

    page.on('pageerror', async exception => {
      allErrors.push({
        type: 'PageError',
        message: exception.message,
        route: currentRoute
      });
      await takeScreenshot(currentRoute, 'page-error');
    });

    page.on('requestfailed', async request => {
      // Exclude tests/telemetry noise if necessary, but we capture all for now
      // Sometimes aborts are fine, let's filter out 'net::ERR_ABORTED' if it's just a canceled request
      if (request.failure()?.errorText !== 'net::ERR_ABORTED') {
        allErrors.push({
          type: 'RequestFailed',
          message: request.failure()?.errorText || 'Unknown Network Failure',
          route: currentRoute,
          url: request.url()
        });
        await takeScreenshot(currentRoute, 'request-failed');
      }
    });

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
      window.localStorage.setItem('asa_user_id', 'monitor-test-user');
      window.localStorage.setItem('asa_user_name', 'Monitoring Scanner');
    });

    // Scan loop
    for (const module of modulesData) {
      currentRoute = module.url;
      // We navigate directly to the route URL
      await page.goto(`/${module.url}`);
      
      // Wait for network idle to ensure everything loaded (scripts, images, etc.)
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Simple verification that page rendered successfully
      await expect(page.locator('#breadcrumbs')).toBeVisible({ timeout: 10000 });
    }

    // Final global assertion to fail the test suite if any errors were detected
    expect(allErrors.length, `Detected ${allErrors.length} runtime errors across the curriculum! Check the reports for details.`).toBe(0);
  });
});
