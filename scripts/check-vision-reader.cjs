const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.VISION_PREVIEW_URL || 'http://localhost:4335';

(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:1600,height:1000}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/vision-preview?lang=de');
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.vr-reader').evaluate(e => e.scrollTop), 0);
    await page.screenshot({path:'docs/vision-reader-desktop.png'});
    for (let i = 0; i < 9; i++) {
      await page.locator(`[data-vr-chapter="${i}"]`).click();
      await page.waitForFunction(index => document.querySelector('.vr-chapters [aria-current]').dataset.vrChapter === String(index), i);
      await page.locator(`#chapter-${i} img`).evaluate(img => img.decode());
      assert.ok(await page.locator('.vr-model .is-active').count());
      assert.equal(await page.locator(`#chapter-${i} h2`).evaluate(e => e === document.activeElement), true);
    }
    await page.locator('[data-vr-chapter="3"]').click();
    await page.locator('#chapter-3 p').nth(2).evaluate(e => e.scrollIntoView({block:'start'}));
    const anchor = await page.evaluate(() => {
      const top = document.querySelector('.vr-reader').getBoundingClientRect().top;
      return [...document.querySelectorAll('.vr-reader [data-reading-anchor]')].find(e => e.getBoundingClientRect().bottom >= top + 20).id;
    });
    for (const locale of ['en', 'hi', 'de']) {
      await page.selectOption('#sp-language', locale);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('html').getAttribute('lang'), locale);
      assert.equal(await page.locator('.vr-chapters [aria-current]').getAttribute('data-vr-chapter'), '3');
      const offset = await page.locator('#' + anchor).evaluate(e => e.getBoundingClientRect().top - document.querySelector('.vr-reader').getBoundingClientRect().top);
      assert.ok(Math.abs(offset) < 20, 'Language change preserves paragraph: ' + offset);
    }
    await page.selectOption('#sp-language', 'hi');
    await page.screenshot({path:'docs/vision-reader-hindi.png'});
    for (const width of [320,390,768,1024,1600]) {
      await page.setViewportSize({width,height:844});
      await page.goto(base + '/vision-preview?lang=hi');
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'No horizontal overflow at ' + width);
      if (width === 390) await page.screenshot({path:'docs/vision-reader-mobile.png'});
    }
    await page.setViewportSize({width:1600,height:1000});
    await page.goto(base + '/?lang=de&skipIntro=1');
    await page.locator('[data-vr-link]').click();
    assert.ok(page.url().includes('/vision-preview'));
    const noScript = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});
    await noScript.goto(base + '/vision-preview?lang=de');
    assert.equal(await noScript.locator('.vr-chapter').count(),9);
    await noScript.locator('[data-vr-chapter="4"]').click();
    assert.ok(noScript.url().endsWith('#chapter-4'));
    assert.deepEqual(errors, []);
    console.log('PASS: nine chapters/images, keyboard focus, DE/EN/HI paragraph preservation, five viewport widths, navigation, no-JS reading, no browser errors');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
