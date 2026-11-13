const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Users/joergmolt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
const locales=require('../lib/global-languages');
const base=process.env.PREVIEW_URL||'http://localhost:4335';
(async()=>{
 const requested=process.env.LANGUAGE_CODES?.split(',');
 const ready=locales.languages.filter(l=>!l.existing&&locales.inspect(l.code).available&&(!requested||requested.includes(l.code)));
 assert.ok(ready.length,'No complete new packs available for browser review');
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?lang=en&stage=4&skipIntro=1');
  for(const l of ready){
   await page.locator('#sp-language').selectOption(l.code);
   await page.waitForFunction(code=>document.documentElement.lang===code,l.code);
   await page.waitForFunction(()=>!document.querySelector('#sp-language').disabled);
   assert.equal(await page.evaluate(()=>history.state.stage),4);
   assert.equal(await page.locator('html').getAttribute('dir'),l.dir);
   assert.equal(await page.locator('.sp-main').evaluate(e=>getComputedStyle(e).display),'grid');
   const positions=await page.evaluate(()=>['.sp-left','.sp-scene','.sp-right'].map(s=>document.querySelector(s).getBoundingClientRect().x));
   assert.ok(positions[0]<positions[1]&&positions[1]<positions[2],l.code+': spatial layout must not mirror');
   const header=await page.locator('.sp-header').evaluate(e=>({width:e.clientWidth,scroll:e.scrollWidth}));
   assert.ok(header.scroll<=header.width+1,l.code+': header overflow '+JSON.stringify(header));
   const titleFits=await page.evaluate(()=>document.querySelector('.sp-title').getBoundingClientRect().bottom<=document.querySelector('.sp-scene').getBoundingClientRect().top+2);
   assert.ok(titleFits,l.code+': title overlaps the environment');
   assert.ok((await page.locator('#sp-reader').innerText()).length>80);
   assert.equal(await page.locator('#sp-reader').innerText().then(t=>t.includes('undefined')),false);
   await page.locator('[data-sp-next]').first().click();
   assert.equal(await page.evaluate(()=>history.state.stage),5);
   await page.locator('[data-sp-prev]').first().click();
   await page.locator('.sp-header a[href="/network"]').click();
   await page.waitForSelector('.pn-scene');
   await page.locator('#pn-choice').selectOption('srm-sonepat');
   assert.ok((await page.locator('.pn-right').innerText()).length>100);
   assert.equal(await page.locator('.pn-right').evaluate(e=>getComputedStyle(e).direction),l.dir);
   const partnerPositions=await page.evaluate(()=>['.pn-left','.pn-world','.pn-right'].map(s=>document.querySelector(s).getBoundingClientRect().x));
   assert.ok(partnerPositions[0]<partnerPositions[1]&&partnerPositions[1]<partnerPositions[2],l.code+': partner layout must not mirror');
   await page.goto(base+'/?lang='+l.code+'&skipIntro=1&stage=4');
   if(['sw','ar','ja','el','th','rw'].includes(l.code))await page.screenshot({path:'docs/language-'+l.code+'-desktop.png'});
   for(const width of [390,768]){
    await page.setViewportSize({width,height:900});
    await page.goto(base+'/?lang='+l.code+'&skipIntro=1#contact');
    await page.waitForSelector('.sp-contact-open #contactForm');
    const sizes=await page.locator('#sp-reader').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));
    assert.ok(sizes.scroll<=sizes.client+1,JSON.stringify({locale:l.code,width,sizes}));
    if(width===390&&['sw','ar','ja','el','th','rw'].includes(l.code))await page.screenshot({path:'docs/language-'+l.code+'-mobile.png'});
   }
   await page.setViewportSize({width:1440,height:1000});
   await page.goto(base+'/?lang='+l.code+'&stage=4&skipIntro=1');
  }
  const fallback=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:900}});
  await fallback.goto(base+'/?lang=sw&skipIntro=1');
  assert.equal(await fallback.locator('html').getAttribute('lang'),'sw');
  assert.ok(await fallback.locator('#sp-reader noscript a[lang="sw"]').count());
  assert.ok((await fallback.locator('#sp-reader').innerText()).length>200,'No-script reading content remains available');
  await fallback.close();
  assert.deepEqual(errors,[]);console.log('Browser checks passed: '+ready.map(l=>l.code).join(', '));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
