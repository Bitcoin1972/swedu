const {chromium}=require(process.env.PLAYWRIGHT_MODULE || '/Users/joergmolt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.PREVIEW_URL || 'http://localhost:4335';
 for(const lang of ['en','de','hi']){
  await page.goto(base+'/?skipIntro=1&lang='+lang+'&stage=2#contact');
  await page.waitForSelector('.sp-contact-open #contactForm');
  assert.equal(await page.locator('#sp-reader').getAttribute('role'),'dialog');
  await page.locator('#name').fill('Preview Test');await page.locator('#email').fill('preview@example.com');await page.locator('#message').fill('Local mocked test. No mail sent.');
  await page.route('**/contact',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({success:false})}));
  await page.locator('#contactForm [type=submit]').click();await page.locator('#formError').waitFor({state:'visible'});
  assert.equal(await page.locator('#message').inputValue(),'Local mocked test. No mail sent.');
  await page.unroute('**/contact');await page.route('**/contact',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true})}));
  await page.locator('#contactForm [type=submit]').click();await page.locator('#formSuccess').waitFor({state:'visible'});
  assert.equal(await page.locator('#message').inputValue(),'');await page.unroute('**/contact');
  await page.locator('#sp-reader').evaluate(e=>e.scrollTop=0);
  await page.screenshot({path:'docs/contact-preview-'+lang+'.png'});
  await page.keyboard.press('Escape');assert.equal(await page.locator('.sp-contact-open').count(),0);assert.equal(await page.locator('[data-contact-inert]').count(),0);
 }
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base+'/?skipIntro=1&lang=hi#contact');await page.waitForSelector('.sp-contact-open #contactForm');
  const sizes=await page.locator('#sp-reader').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth,fields:[...e.querySelectorAll('input,textarea,select')].map(x=>x.getBoundingClientRect().width)}));
  assert.ok(sizes.scroll<=sizes.client+1,JSON.stringify({width,sizes}));assert.ok(sizes.fields.every(x=>x>=150));
  if(width===390)await page.screenshot({path:'docs/contact-preview-mobile.png'});
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/network?lang=de&skipIntro=1');await page.waitForSelector('.pn-scene');
 assert.equal(await page.locator('.pn-organisations button').count(),13);
 for(const id of ['swex','roots2ai','srm-sonepat']){await page.locator('#pn-choice').selectOption(id);await page.waitForFunction(()=>document.querySelector('.pn-logo')?.naturalWidth>0);assert.ok((await page.locator('.pn-right').innerText()).length>200);}
 await page.screenshot({path:'docs/partner-expanded-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/partner-expanded-mobile.png'});
 assert.deepEqual(errors,[]);console.log('Contact DE/EN/HI, mocked delivery, Escape, 5 widths, and 13 ecosystem entries passed.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
