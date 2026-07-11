import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

interface NavigationEntry {
  moduleTitle: string;
  url: string;
  direction: 'Forward' | 'Backward';
  status: 'Success' | 'Failed';
  error?: string;
}

const reportEntries: NavigationEntry[] = [];
const consoleErrors: string[] = [];

test.describe('Curriculum Navigation Integrity Suite', () => {
  // Give this test a massive timeout since it traverses 236 pages sequentially
  test.describe.configure({ timeout: 400000 });

  test.beforeEach(async ({ page }) => {
    // Listen for any console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
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

    // Inject identity so the welcome modal doesn't intercept clicks
    await page.addInitScript(() => {
      window.localStorage.setItem('asa_user_id', 'nav-test-user');
      window.localStorage.setItem('asa_user_name', 'Navigation Tester');
    });
  });

  test.afterAll(async () => {
    const total = reportEntries.length;
    const successes = reportEntries.filter(e => e.status === 'Success').length;
    const fails = reportEntries.filter(e => e.status === 'Failed').length;

    let markdown = `# Curriculum Navigation Integrity Report\n\n`;
    markdown += `## Summary\n`;
    markdown += `- **Total Navigations Executed:** ${total}\n`;
    markdown += `- **Successful Jumps:** ${successes}\n`;
    markdown += `- **Failed Jumps (Dead Ends):** ${fails}\n`;
    markdown += `- **Console Errors Detected:** ${consoleErrors.length}\n\n`;

    if (consoleErrors.length > 0) {
      markdown += `### Console Errors:\n`;
      consoleErrors.forEach(err => markdown += `- ${err}\n`);
      markdown += `\n`;
    }

    markdown += `## Navigation Log\n\n`;
    markdown += `| Direction | Module | Expected URL | Status | Notes |\n`;
    markdown += `| --- | --- | --- | --- | --- |\n`;
    reportEntries.forEach(entry => {
      markdown += `| ${entry.direction} | ${entry.moduleTitle} | ${entry.url} | ${entry.status} | ${entry.error || ''} |\n`;
    });

    const reportPath = path.resolve(__dirname, '../../navigation-integrity-report.md');
    fs.writeFileSync(reportPath, markdown, 'utf8');
  });

  test('Full Linear Curriculum Traversal', async ({ page }) => {
    // 1. Initial Load: Go directly to the first module
    await page.goto(`/${modulesData[0].url}`);

    // --- FORWARD TRAVERSAL ---
    for (let i = 0; i < modulesData.length; i++) {
      const currentModule = modulesData[i];
      const isLastModule = i === modulesData.length - 1;

      try {
        // Verify URL is correct
        await expect(page).toHaveURL(new RegExp(currentModule.url), { timeout: 20000 });
        
        // Verify Breadcrumbs exist
        const breadcrumbs = page.locator('#breadcrumbs');
        await expect(breadcrumbs).toBeVisible();

        // Check for Previous Lesson button on all but the first module
        if (i > 0) {
          const prevButton = page.locator('button', { hasText: 'Previous Lesson' });
          await expect(prevButton).toBeVisible();
        }

        // If not the last module, click Next Lesson to continue
        if (!isLastModule) {
          const nextModule = modulesData[i + 1];
          const nextButton = page.locator('button', { hasText: 'Next Lesson' });
          
          await expect(nextButton).toBeVisible();
          
          // Verify the button contains the text of the next module
          await expect(nextButton).toContainText(nextModule.title);

          // Click it to proceed forward
          await nextButton.click();
        }

        reportEntries.push({
          moduleTitle: currentModule.title,
          url: currentModule.url,
          direction: 'Forward',
          status: 'Success'
        });
      } catch (error: any) {
        reportEntries.push({
          moduleTitle: currentModule.title,
          url: currentModule.url,
          direction: 'Forward',
          status: 'Failed',
          error: error.message.split('\n')[0]
        });
        throw error; // Fail the test immediately if traversal breaks
      }
    }

    // --- BACKWARD TRAVERSAL ---
    // Start from the last module (we are already there) and go backwards
    for (let i = modulesData.length - 1; i > 0; i--) {
      const currentModule = modulesData[i];
      const prevModule = modulesData[i - 1];

      try {
        // We are currently on `currentModule`
        const prevButton = page.locator('button', { hasText: 'Previous Lesson' });
        await expect(prevButton).toBeVisible();
        
        // Verify the button contains the text of the previous module
        await expect(prevButton).toContainText(prevModule.title);

        // Click to proceed backward
        await prevButton.click();

        // Verify URL changed to the previous module
        await expect(page).toHaveURL(new RegExp(prevModule.url), { timeout: 20000 });

        reportEntries.push({
          moduleTitle: prevModule.title,
          url: prevModule.url,
          direction: 'Backward',
          status: 'Success'
        });
      } catch (error: any) {
        reportEntries.push({
          moduleTitle: currentModule.title,
          url: currentModule.url,
          direction: 'Backward',
          status: 'Failed',
          error: error.message.split('\n')[0]
        });
        throw error; // Break the test if traversal fails
      }
    }
  });
});
