import { test, expect } from '@playwright/test';

test('capture console errors on load', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(`CONSOLE ERROR: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      // maybe ignore warnings out of thousands
    } else {
      logs.push(`CONSOLE: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    logs.push(`PAGE ERROR: ${error.message}\n${error.stack}`);
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.waitForTimeout(3000); // wait for execution

  console.log('--- CAPTURED ERRORS START ---');
  console.log(logs.join('\n'));
  console.log('--- CAPTURED ERRORS END ---');

  const rootHtml = await page.locator('#root').innerHTML();
  console.log('ROOT HTML LENGTH: ', rootHtml.length);
  if (rootHtml.length < 100) {
    console.log('ROOT HTML IS: ', rootHtml);
  }
});
