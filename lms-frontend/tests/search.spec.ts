import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const modulesPath = path.resolve(__dirname, '../src/data/modules.json');
const modulesData = JSON.parse(fs.readFileSync(modulesPath, 'utf8'));

interface ReportEntry {
  query: string;
  type: 'Full Title' | 'Partial Keyword' | 'Invalid' | 'Empty';
  status: 'Success' | 'Failed' | 'Incorrect';
  expectedMatch: string | null;
  actualMatch: string | null;
  error?: string;
}

const reportEntries: ReportEntry[] = [];
const consoleErrors: string[] = [];

test.describe('Curriculum Search Validation Suite', () => {
  test.describe.configure({ timeout: 60000 }); // Increase overall suite timeout to 60s for Next.js compiling
  
  test.beforeEach(async ({ page }) => {
    // Listen for any console errors during the test
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Inject identity so the welcome modal doesn't intercept clicks
    await page.addInitScript(() => {
      window.localStorage.setItem('asa_user_id', 'search-test-user');
      window.localStorage.setItem('asa_user_name', 'Search Tester');
    });

    await page.goto('/');
  });

  test.afterAll(async () => {
    // Generate the Coverage Report
    const total = reportEntries.length;
    const successes = reportEntries.filter(e => e.status === 'Success').length;
    const fails = reportEntries.filter(e => e.status === 'Failed').length;
    const incorrect = reportEntries.filter(e => e.status === 'Incorrect').length;

    let markdown = `# Curriculum Search Coverage Report\n\n`;
    markdown += `## Summary\n`;
    markdown += `- **Total Queries Executed:** ${total}\n`;
    markdown += `- **Successful Matches:** ${successes}\n`;
    markdown += `- **Failed Matches:** ${fails}\n`;
    markdown += `- **Incorrect Results:** ${incorrect}\n`;
    markdown += `- **Console Errors Detected:** ${consoleErrors.length}\n\n`;

    if (consoleErrors.length > 0) {
      markdown += `### Console Errors:\n`;
      consoleErrors.forEach(err => markdown += `- ${err}\n`);
      markdown += `\n`;
    }

    markdown += `## Detailed Queries\n\n`;
    markdown += `| Query | Type | Status | Expected | Actual | Notes |\n`;
    markdown += `| --- | --- | --- | --- | --- | --- |\n`;
    reportEntries.forEach(entry => {
      markdown += `| "${entry.query}" | ${entry.type} | ${entry.status} | ${entry.expectedMatch || 'N/A'} | ${entry.actualMatch || 'N/A'} | ${entry.error || ''} |\n`;
    });

    const reportPath = path.resolve(__dirname, '../../search-coverage-report.md');
    fs.writeFileSync(reportPath, markdown, 'utf8');
  });

  test('Search functionality and navigation validations', async ({ page }) => {
    // We will select 5 random modules for testing
    const shuffledModules = [...modulesData].sort(() => 0.5 - Math.random());
    const sampleModules = shuffledModules.slice(0, 5);
    
    // Test: Empty state (click without typing)
    // Click the trigger in the header to open the Command Palette modal
    await page.locator('text=Search resources...').click();
    
    // Locate the search input inside the modal
    const searchInput = page.getByPlaceholder('Search lessons, quizzes, Playwright APIs, exercises...');
    await expect(searchInput).toBeVisible();
    
    // The modal overlay container
    const dropdown = page.locator('div.fixed');
    await expect(dropdown).toBeVisible();
    
    // Verify default state contains text "Quick Actions"
    const startTypingText = page.getByText(/Quick Actions/i);
    await expect(startTypingText).toBeVisible();

    reportEntries.push({
      query: '',
      type: 'Empty',
      status: 'Success',
      expectedMatch: null,
      actualMatch: null
    });

    // Test: Nonexistent search term
    const invalidQuery = "asdfasdfasdfxyz123";
    await searchInput.fill(invalidQuery);
    const noResultsText = page.getByText(`No matching resources found for`);
    await expect(noResultsText).toBeVisible();

    reportEntries.push({
      query: invalidQuery,
      type: 'Invalid',
      status: 'Success',
      expectedMatch: null,
      actualMatch: null
    });

    // Valid Searches Loop
    for (let i = 0; i < sampleModules.length; i++) {
      const module = sampleModules[i];
      const fullTitle = module.title;
      
      // Clear input
      await searchInput.click(); // focus
      await searchInput.fill('');
      
      // Execute Full Title search
      await searchInput.fill(fullTitle);
      
      // Wait for results to update (the dropdown should list the lesson)
      // The search uses fuse.js and highlights the title in the button
      const firstResultTitle = dropdown.locator('button').first().locator('div').nth(1); 
      // Actually, looking at SearchBar.tsx, the title is inside a div with line-height 1.3
      // We can just look for the text of the title inside the dropdown
      const resultLocator = dropdown.locator('button', { hasText: fullTitle }).first();
      
      try {
        await expect(resultLocator).toBeVisible({ timeout: 5000 });
        reportEntries.push({
          query: fullTitle,
          type: 'Full Title',
          status: 'Success',
          expectedMatch: fullTitle,
          actualMatch: fullTitle
        });
      } catch (error) {
        reportEntries.push({
          query: fullTitle,
          type: 'Full Title',
          status: 'Failed',
          expectedMatch: fullTitle,
          actualMatch: null,
          error: 'Result not visible'
        });
      }

      // Execute Partial Keyword search
      // Extract a word from the title that's at least 4 characters
      const words = fullTitle.split(/[\s-]+/).filter((w: string) => w.length > 3);
      if (words.length > 0) {
        const keyword = words[0];
        await searchInput.fill('');
        await searchInput.fill(keyword);

        const partialResultLocator = dropdown.locator('button', { hasText: fullTitle }).first();
        try {
          await expect(partialResultLocator).toBeVisible({ timeout: 5000 });
          reportEntries.push({
            query: keyword,
            type: 'Partial Keyword',
            status: 'Success',
            expectedMatch: fullTitle,
            actualMatch: fullTitle
          });
        } catch (error) {
           reportEntries.push({
            query: keyword,
            type: 'Partial Keyword',
            status: 'Failed',
            expectedMatch: fullTitle,
            actualMatch: null,
            error: 'Result not visible'
          });
        }
      }

      // For the first sample module, test the navigation click
      if (i === 0) {
        await searchInput.fill(fullTitle);
        const navResultLocator = dropdown.locator('button', { hasText: fullTitle }).first();
        await expect(navResultLocator).toBeVisible();
        await navResultLocator.click();

        // Verify URL changes to the expected lesson
        await expect(page).toHaveURL(new RegExp(module.url), { timeout: 20000 });
        
        // Go back to dashboard to continue testing
        await page.goto('/');
      }
    }
    
    // Verify no console errors occurred
    expect(consoleErrors.length).toBe(0);
  });
});
