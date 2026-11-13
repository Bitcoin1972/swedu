const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const locales=require('../lib/global-languages');

test('programmes labels translate while programme and room IDs remain opaque',()=>{
 const input={copy:{programmes:'Relevant programmes'},entries:[{programmes:['academy','local'],rooms:['society']}]};
 const result=locales.walk(input,text=>'translated: '+text);
 assert.equal(result.copy.programmes,'translated: Relevant programmes');
 assert.deepEqual(result.entries,input.entries);
 assert.notEqual(result.entries[0].programmes,input.entries[0].programmes);
});

test('source and pack caches invalidate on metadata and source changes, failing closed on partial writes',t=>{
 const sourceFile=path.join(locales.root,'source.json'),packFile=path.join(locales.root,'fr.json');
 const originalRead=fs.readFileSync,originalStat=fs.statSync;
 let revision=1000000n,reads=0,changeDuringRead=false;
 const files=new Map();
 function write(file,value,mtime){files.set(file,{text:typeof value==='string'?value:JSON.stringify(value),revision:++revision,mtime:mtime??revision});}
 function source(hash,strings=['Hello']){return {sourceHash:hash,strings};}
 function pack(hash,text='Bonjour'){return {sourceHash:hash,status:'approved',translations:{Hello:text}};}
 write(sourceFile,source('first'));write(packFile,pack('first'));
 t.mock.method(fs,'statSync',function(file,...args){
  const entry=files.get(file);if(!entry)return originalStat.call(fs,file,...args);
  return {dev:1n,ino:1n,size:BigInt(Buffer.byteLength(entry.text)),mtimeNs:entry.mtime,ctimeNs:entry.revision};
 });
 t.mock.method(fs,'readFileSync',function(file,...args){
  const entry=files.get(file);if(!entry)return originalRead.call(fs,file,...args);
  reads++;const text=entry.text;
  if(file===packFile&&changeDuringRead){changeDuringRead=false;write(packFile,pack('second','Salut'));}
  return text;
 });
 assert.equal(locales.inspect('fr').available,true);
 const initialReads=reads;
 assert.equal(locales.inspect('fr').available,true);locales.source();
 assert.equal(reads,initialReads,'unchanged source and pack must not be reparsed');
 write(packFile,pack('first','Bonsoir'));
 assert.equal(locales.inspect('fr').pack.translations.Hello,'Bonsoir');
 const mtime=files.get(packFile).mtime;
 write(packFile,pack('first','Une traduction plus longue'),mtime);
 assert.equal(locales.inspect('fr').pack.translations.Hello,'Une traduction plus longue');
 write(packFile,'{"sourceHash":');
 assert.equal(locales.inspect('fr').available,false,'partial pack must not reuse cached approval');
 write(packFile,pack('first'));
 assert.equal(locales.inspect('fr').available,true);
 write(sourceFile,source('second'));
 assert.equal(locales.inspect('fr').available,false,'a new source hash invalidates pack validation');
 write(packFile,pack('second'));changeDuringRead=true;
 assert.equal(locales.inspect('fr').available,false,'a file changing during read must fail closed');
 assert.equal(locales.inspect('fr').pack.translations.Hello,'Salut');
 write(sourceFile,'{');
 assert.equal(locales.inspect('fr').available,false,'partial source must not reuse cached source');
 write(sourceFile,source('second',['Hello','New text']));
 assert.equal(locales.inspect('fr').missing,1,'source contents also invalidate validation');
});

// Opt in with SWE_BROWSER_TESTS=1; all requests are intercepted, with no live server.
test('browser language-switch regressions',{skip:process.env.SWE_BROWSER_TESTS!=='1'},async t=>{
 const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'/Users/joergmolt/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
 const cheerio=require('cheerio'),shell=require('../lib/spatial-shell'),renderer=require('../lib/global-language-renderer');
 const originalInspect=locales.inspect;
 let pages;
 try {
  locales.inspect=code=>code==='ar'?{code,label:'Arabic',dir:'rtl',available:true,status:'approved',pack:{translations:{'Relevant programmes':'Localized programmes'}}}:originalInspect(code);
  pages=Object.fromEntries(['en','ar'].map(lang=>{
   const $=cheerio.load(renderer.transform(shell.page({lang:'en',stage:4}),{query:{lang},socket:{remoteAddress:'127.0.0.1'}}));
   $('#introOverlay,script[src]').remove();
   $('body').append('<script src="/js/spatial-shell.js"></script>');
   return [lang,$.html()];
  }));
 }finally{locales.inspect=originalInspect;}
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 t.after(()=>browser.close());
 async function setup(viewport={width:1440,height:1000}){
  const page=await browser.newPage({viewport}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  t.after(async()=>{assert.deepEqual(errors,[]);await page.close();});
  await page.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin!=='http://127.0.0.1')return route.abort();
   if(url.pathname==='/js/spatial-shell.js'||['/css/style.css','/css/spatial-shell.css','/css/global-languages.css'].includes(url.pathname))return route.fulfill({path:path.join(__dirname,'../public',url.pathname),contentType:url.pathname.endsWith('.js')?'application/javascript':'text/css'});
   if(url.searchParams.has('worldDocument'))return route.fulfill({contentType:'text/html',body:`<!doctype html><html data-swe-translation-complete="true"><body><main><h1>${url.searchParams.get('lang')}</h1>${Array.from({length:35},(_,i)=>`<p id="reading-${i}" data-reading-anchor style="height:80px">Paragraph ${i}</p>`).join('')}<section id="contact"><form id="contactForm"><input name="lang" value="${url.searchParams.get('lang')}"><input name="name"><textarea name="message"></textarea></form></section></main></body></html>`});
   if(url.pathname==='/'||url.pathname.startsWith('/world/'))return route.fulfill({contentType:'text/html',body:pages[url.searchParams.get('lang')]||pages.en});
   return route.fulfill({status:204,body:''});
  });
  await page.addInitScript(()=>{
   const nativeFetch=window.fetch;
   window.fetch=async(input,options)=>{
    const url=new URL(input,location.href),kind=url.searchParams.has('worldDocument')?'document':'locale';
    if(url.searchParams.get('lang')!=='ar'||!window['hold_'+kind])return nativeFetch(input,options);
    // Simulate a response that completes despite cancellation, to test the generation guard too.
    const response=await nativeFetch(input),body=await response.text();
    window['waiting_'+kind]=true;
    await new Promise(resolve=>window['release_'+kind]=resolve);
    return new Response(body,{status:200,headers:{'Content-Type':'text/html'}});
   };
  });
  await page.goto('http://127.0.0.1/?lang=en&stage=4&skipIntro=1');
  return page;
 }
 async function release(page,kind){
  await page.evaluate(kind=>window['release_'+kind](),kind);
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 }
 await t.test('back navigation rejects a late locale without restoring old state or adding history',async()=>{
  const page=await setup();
  await page.locator('[data-sp-next]').first().click();
  await page.evaluate(()=>window.hold_locale=true);
  await page.selectOption('#sp-language','ar');
  await page.waitForFunction(()=>window.waiting_locale);
  await page.goBack();
  const before=await page.evaluate(()=>({url:location.href,length:history.length,state:history.state}));
  await release(page,'locale');
  assert.deepEqual(await page.evaluate(()=>({url:location.href,length:history.length,state:history.state})),before);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  assert.equal(await page.locator('#sp-language').isEnabled(),true);
 });
 await t.test('stage navigation cancels an in-flight locale',async()=>{
  const page=await setup();await page.evaluate(()=>window.hold_locale=true);
  await page.selectOption('#sp-language','ar');await page.waitForFunction(()=>window.waiting_locale);
  await page.locator('[data-sp-next]').first().click();await release(page,'locale');
  assert.equal(await page.evaluate(()=>history.state.stage),5);
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
 });
 await t.test('mobile offers restores the scrolling body rather than the outer panel',async()=>{
  const page=await setup({width:390,height:650});
  await page.locator('[data-sp-drawer="offers"]').click();
  const before=await page.locator('#sp-offers-body').evaluate(el=>{el.scrollTop=(el.scrollHeight-el.clientHeight)*0.6;return el.scrollTop/(el.scrollHeight-el.clientHeight);});
  assert.ok(before>0.5,'fixture must overflow');
  await page.selectOption('#sp-language','ar');await page.waitForFunction(()=>!document.querySelector('#sp-language').disabled);
  const after=await page.locator('#sp-offers-body').evaluate(el=>el.scrollTop/(el.scrollHeight-el.clientHeight));
  assert.ok(Math.abs(after-before)<0.02,`${before} -> ${after}`);
  assert.equal(await page.evaluate(()=>history.state.stage),4);
 });
 await t.test('own document rebuild finishes and restores the reading anchor',async()=>{
  const page=await setup();await page.locator('.sp-header a[href="/about"]').click();
  await page.waitForSelector('#reading-12');
  const before=await page.evaluate(()=>{const reader=document.querySelector('#sp-reader'),anchor=document.querySelector('#reading-12');reader.scrollTop+=anchor.getBoundingClientRect().top-reader.getBoundingClientRect().top+25;return anchor.getBoundingClientRect().top-reader.getBoundingClientRect().top;});
  await page.selectOption('#sp-language','ar');
  await page.waitForFunction(()=>!document.querySelector('#sp-language').disabled);
  assert.equal(await page.locator('.sp-loaded h1').innerText(),'ar');
  const after=await page.evaluate(()=>document.querySelector('#reading-12').getBoundingClientRect().top-document.querySelector('#sp-reader').getBoundingClientRect().top);
  assert.ok(Math.abs(after-before)<2,`${before} -> ${after}`);
  assert.equal(await page.evaluate(()=>history.state.lang),'ar');
 });
 await t.test('navigation during the document rebuild prevents stale restoration and history writes',async()=>{
  const page=await setup();await page.locator('.sp-header a[href="/about"]').click();await page.waitForSelector('#reading-12');
  await page.evaluate(()=>window.hold_document=true);await page.selectOption('#sp-language','ar');
  await page.waitForFunction(()=>window.waiting_document);
  await page.locator('[data-sp-next]').first().click();
  const before=await page.evaluate(()=>({url:location.href,length:history.length,state:history.state,html:document.querySelector('#sp-reader').innerHTML}));
  await release(page,'document');
  assert.deepEqual(await page.evaluate(()=>({url:location.href,length:history.length,state:history.state,html:document.querySelector('#sp-reader').innerHTML})),before);
 });
 await t.test('contact rebuild preserves entered values without restoring the old locale',async()=>{
  const page=await setup();await page.locator('.sp-utilities a').first().click();
  await page.waitForSelector('.sp-contact-open #contactForm');
  await page.locator('[name="name"]').fill('Test Person');
  await page.locator('[name="message"]').fill('Keep this unsent message.');
  // The modal makes the header inert; exercise the switch handler without submitting mail.
  await page.evaluate(()=>{const select=document.querySelector('#sp-language');select.value='ar';select.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.waitForFunction(()=>!document.querySelector('#sp-language').disabled);
  assert.equal(await page.locator('[name="name"]').inputValue(),'Test Person');
  assert.equal(await page.locator('[name="message"]').inputValue(),'Keep this unsent message.');
  assert.equal(await page.locator('[name="lang"]').inputValue(),'ar');
  assert.equal(await page.evaluate(()=>history.state.lang),'ar');
 });
});
