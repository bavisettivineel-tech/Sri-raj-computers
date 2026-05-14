import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      logs.push(`CONSOLE ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    logs.push(`PAGE ERROR: ${error.message}\n${error.stack}`);
  });

  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.waitForTimeout(3000); 

  console.log('--- CAPTURED ERRORS START ---');
  console.log(logs.join('\n'));
  console.log('--- CAPTURED ERRORS END ---');

  const rootHtml = await page.locator('#root').innerHTML();
  console.log('ROOT HTML LENGTH: ', rootHtml.length);
  if (rootHtml.length < 100) {
    console.log('ROOT HTML IS: ', rootHtml);
  }

  await browser.close();
})();
