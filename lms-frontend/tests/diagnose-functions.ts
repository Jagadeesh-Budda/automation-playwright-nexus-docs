import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error('[PAGE ERROR]', err);
  });

  console.log('Navigating to http://localhost:3000/courses/playwright/02-js-ts-functions ...');
  try {
    const response = await page.goto('http://localhost:3000/courses/playwright/02-js-ts-functions', {
      timeout: 25000,
      waitUntil: 'load'
    });
    console.log('Navigation response status:', response?.status());
    
    // Wait an additional 5 seconds to let scripts run
    await page.waitForTimeout(5000);
    
    const title = await page.title();
    console.log('Page Title:', title);
    
    const h1 = await page.locator('h1').first().textContent();
    console.log('First H1 Text:', h1);
    
  } catch (error) {
    console.error('Navigation or test failed:', error);
    try {
      await page.screenshot({ path: 'd:/UIAutomation/ui-automation/docs/lms-frontend/tests/debug-error.png' });
      console.log('Saved screenshot to debug-error.png');
    } catch (ssErr) {
      console.error('Failed to capture screenshot:', ssErr);
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
