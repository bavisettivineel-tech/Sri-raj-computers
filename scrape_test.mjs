import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:8080');
  
  const triggers = [
    'button:has-text("Account")',
    'button:has-text("Login")',
    'button:has-text("Sign In")'
  ];
  
  for (const t of triggers) {
    try {
      if (await page.isVisible(t)) {
        await page.click(t);
        console.log('Clicked', t);
        break;
      }
    } catch(e) {}
  }
  
  await page.waitForTimeout(2000);
  
  const inputs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('input')).map(i => ({
      type: i.type,
      placeholder: i.placeholder,
      id: i.id,
      name: i.name,
      isVisible: i.offsetWidth > 0 || i.offsetHeight > 0
    }));
  });
  
  console.log('Inputs found:', inputs);
  await browser.close();
})();
