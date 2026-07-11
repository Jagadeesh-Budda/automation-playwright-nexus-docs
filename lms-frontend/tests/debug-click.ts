/**
 * Debug script - run standalone to diagnose what's blocking clicks on /elite-test-bed
 * Run with: npx tsx tests/debug-click.ts
 */
import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('1. Registering addInitScript to inject user before React loads...');
  // addInitScript runs before ANY page script on every navigation
  await page.addInitScript(() => {
    window.localStorage.setItem('asa_user_id', 'test-user-playwright');
    window.localStorage.setItem('asa_user_name', 'Playwright Test');
  });

  console.log('2. Navigating to /elite-test-bed...');
  await page.goto('http://localhost:3000/elite-test-bed');
  await page.waitForLoadState('networkidle');

  console.log('3. Checking for setup modal...');
  const modal = await page.locator('text=Playwright Mastery Setup').count();
  console.log(`   Modal visible: ${modal > 0}`);

  console.log('4. Checking for pr-review-challenge div...');
  const prDiv = await page.locator('[data-testid="pr-review-challenge"]').count();
  console.log(`   PR Review div count: ${prDiv}`);

  console.log('5. Checking for tr[data-line="2"]...');
  const row = await page.locator('[data-testid="pr-review-challenge"] table tr[data-line="2"]').count();
  console.log(`   Row data-line=2 count: ${row}`);

  console.log('6. Checking element boundingBox...');
  const rowEl = page.locator('[data-testid="pr-review-challenge"] table tr[data-line="2"]');
  const box = await rowEl.boundingBox();
  console.log(`   Bounding box: ${JSON.stringify(box)}`);

  console.log('7. Checking if element is visible...');
  const visible = await rowEl.isVisible();
  console.log(`   Is visible: ${visible}`);

  console.log('8. Checking if element is enabled...');
  const enabled = await rowEl.isEnabled();
  console.log(`   Is enabled: ${enabled}`);

  console.log('9. Check overlapping elements at row position...');
  if (box) {
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const el = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      return el ? el.outerHTML.substring(0, 200) : 'null';
    }, { x, y });
    console.log(`   Element at click point: ${el}`);
  }

  console.log('10. Attempting click...');
  try {
    await rowEl.click({ timeout: 5000 });
    console.log('    Click succeeded!');
    
    const popover = await page.locator('text=Flag Issue as:').count();
    console.log(`    Popover visible after click: ${popover > 0}`);
  } catch (e) {
    console.log(`    Click failed: ${(e as Error).message.split('\n')[0]}`);
    
    // Screenshot the page
    await page.screenshot({ path: 'test-results/debug-screenshot.png', fullPage: true });
    console.log('    Screenshot saved to test-results/debug-screenshot.png');
  }

  await browser.close();
}

main().catch(console.error);
