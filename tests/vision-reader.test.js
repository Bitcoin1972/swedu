const test = require('node:test');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const approved = require('../lib/approved-introduction');
const reader = require('../lib/vision-reader');
const metadata = require('../content/vision-reader');
const locales = require('../lib/global-languages');
const ui = require('../content/languages/v2/reader-ui.json');
const release = require('../content/public-experience-release.json');
test.beforeEach(t => { const published=release.visionReader; release.visionReader=false; t.after(()=>{release.visionReader=published;}); });
const local = {socket:{remoteAddress:'127.0.0.1'}};
const previewEnv = {NODE_ENV:'development',SWE_VISION_PREVIEW:'1',SWE_LANGUAGE_PREVIEW:'1'};
function enablePreview(t) {
  const previous = Object.fromEntries(Object.keys(previewEnv).map(key=>[key,process.env[key]]));
  Object.assign(process.env,previewEnv);
  t.after(()=>{for(const [key,value] of Object.entries(previous)) {
    if(value === undefined) delete process.env[key]; else process.env[key]=value;
  }});
}

test('all 13 reader UI locales are complete; missing, blank and unsafe labels fail closed', () => {
  const added = locales.languages.filter(l => !l.existing);
  assert.equal(added.length, 13);
  assert.deepEqual(Object.keys(ui.locales).sort(), added.map(l=>l.code).sort());
  for (const l of added) {
    assert.ok(reader.completeUI(l.code));
    for (const key of Object.keys(metadata.copy.en)) {
      const broken = structuredClone(ui);
      delete broken.locales[l.code][key];
      assert.equal(reader.completeUI(l.code, broken), false, l.code + ':' + key);
    }
  }
  for (const value of ['', ' ', '<script>']) {
    const broken = structuredClone(ui);
    broken.locales.es.layers[0] = value;
    assert.equal(reader.completeUI('es', broken), false);
  }
});

test('new reader choices require both local gates and complete main and UI packs', t => {
  t.mock.method(locales, 'inspect', code => ({available:code === 'es'}));
  const codes = env => reader.choices(local, env).map(l=>l.code);
  assert.deepEqual(codes(previewEnv), ['en','de','hi','es']);
  for (const env of [{...previewEnv,NODE_ENV:'production'}, {...previewEnv,SWE_LANGUAGE_PREVIEW:'0'}, {...previewEnv,SWE_VISION_PREVIEW:'0'}]) {
    assert.deepEqual(codes(env), ['en','de','hi']);
  }
  assert.deepEqual(reader.choices({socket:{remoteAddress:'192.0.2.1'}},previewEnv).map(l=>l.code), ['en','de','hi']);
  const original = ui.locales.es.current;
  try { ui.locales.es.current = ''; assert.deepEqual(codes(previewEnv), ['en','de','hi']); }
  finally { ui.locales.es.current = original; }
});

test('new versions translate English approved blocks without changing anchors, emphasis, layers or assets', () => {
  const english = reader.version('en');
  for (const entry of locales.languages.filter(l=>!l.existing)) {
    const pack = locales.inspect(entry.code);
    if (!pack.available) { assert.throws(()=>reader.version(entry.code)); continue; }
    const v = reader.version(entry.code);
    assert.equal(v.dir, entry.dir);
    assert.equal(v.title, pack.pack.translations[english.title]);
    assert.deepEqual(v.chapters.map(ch=>ch.layers), english.chapters.map(ch=>ch.layers));
    v.chapters.forEach((ch,i) => {
      assert.equal(ch.html, locales.html(english.chapters[i].html, text=>pack.pack.translations[locales.normalize(text)]));
      const a = cheerio.load(ch.html), b = cheerio.load(english.chapters[i].html);
      assert.deepEqual(a('[data-reading-anchor]').map((_,e)=>a(e).attr('id')).get(), b('[data-reading-anchor]').map((_,e)=>b(e).attr('id')).get());
      assert.equal(a('strong').length, b('strong').length);
    });
  }
});

test('page embeds only existing versions and the requested new locale', t => {
  enablePreview(t);
  const $ = cheerio.load(reader.page({lang:'ar'},local));
  const data = JSON.parse($('#vr-data').text());
  assert.deepEqual(Object.keys(data).sort(), ['ar','de','en','hi']);
  assert.equal($('html').attr('dir'),'rtl');
  assert.equal($('.vr-layout').attr('data-vr-dir'),'rtl');
  assert.equal($('.sp-header [aria-current=page]').text(),ui.locales.ar.vision);
  assert.deepEqual($('.vr-chapter img').map((_,e)=>$(e).attr('src')).get(),Array.from({length:9},(_,i)=>`/vision-preview-assets/chapter-${i+1}.png`));
  for (const entry of locales.languages) assert.equal($(`#sp-language option[value="${entry.code}"]`).length, Number(entry.existing || (locales.inspect(entry.code).available && reader.completeUI(entry.code))));
});

test('locale endpoint uses both gates, no-store, and rejects unknown or incomplete locales', async t => {
  enablePreview(t);
  const routes = {};
  reader.install({get:(route,handler)=>{routes[route]=handler;}});
  function call(lang, req = local) {
    const response = {status:200, headers:{}, sendStatus(n){this.status=n;return this;}, set(k,v){this.headers[k]=v;return this;}, json(v){this.value=v;return this;}};
    routes['/vision-preview/locale/:lang']({...req,params:{lang}},response);
    return response;
  }
  const result = call('es');
  assert.equal(result.status,200);
  assert.equal(result.headers['Cache-Control'],'no-store');
  assert.equal(result.value.lang,'es');
  assert.ok(result.value.html.includes('chapter-8'));
  assert.equal(call('unknown').status,404);
  assert.equal(call('es',{socket:{remoteAddress:'192.0.2.2'}}).status,404);
  t.mock.method(locales,'inspect',()=>({available:false}));
  assert.equal(call('es').status,404);
  process.env.NODE_ENV='production';
  assert.equal(call('en').status,404);
});

test('vision reader preserves every approved paragraph, heading and emphasis in all languages', () => {
  for (const lang of ['de', 'en', 'hi']) {
    const v = reader.version(lang);
    assert.equal(v.chapters.length, 9);
    const original = cheerio.load(approved.article(approved.load(lang).source));
    const rendered = cheerio.load('<h1 data-reading-anchor>' + v.title + '</h1>' + v.chapters.map(c => c.html).join(''));
    for (const selector of ['h1,h2,p,hr', 'strong', '[data-reading-anchor]']) {
      assert.deepEqual(rendered(selector).map((_, e) => rendered(e).text()).get(), original(selector).map((_, e) => original(e).text()).get());
    }
    for (const ch of v.chapters) assert.ok(ch.layers.every(l => metadata.layers.includes(l)));
  }
});

test('reader renders nine images, semantic chapter links, passive model and one language selector', () => {
  const $ = cheerio.load(reader.page({lang:'hi'}));
  assert.equal($('.vr-chapter img').length, 9);
  assert.equal($('.vr-chapters nav a').length, 9);
  assert.equal($('.vr-model li').length, 6);
  assert.equal($('.vr-model a,.vr-model button').length, 0);
  assert.equal($('#sp-language').length, 1);
  assert.equal($('.vr-start').length, 1);
  assert.ok($('.vr-end').prev().is('#chapter-8'));
  assert.equal($('html').attr('lang'), 'hi');
});

test('vision preview and generated artwork cannot be enabled in production or remotely', () => {
  const local = {socket:{remoteAddress:'127.0.0.1'}};
  assert.equal(reader.allowed(local,{NODE_ENV:'production',SWE_VISION_PREVIEW:'1'}), false);
  assert.equal(reader.allowed(local,{NODE_ENV:'development'}), false);
  assert.equal(reader.allowed(local,{NODE_ENV:'development',SWE_VISION_PREVIEW:'1'}), true);
  assert.equal(reader.allowed({socket:{remoteAddress:'198.51.100.5'}},{NODE_ENV:'development',SWE_VISION_PREVIEW:'1'}), false);
});

test('browser: lazy locales retain anchors, recover from failures, and keep RTL layout stable', {
  skip: !process.env.PLAYWRIGHT_MODULE, timeout: 300000
}, async t => {
  enablePreview(t);
  const express = require('express');
  const app = express();
  reader.install(app);
  app.use(express.static(require('node:path').join(__dirname,'../public')));
  const server = await new Promise(resolve => { const s = app.listen(0,'127.0.0.1',()=>resolve(s)); });
  let browser;
  try {
    browser = await require(process.env.PLAYWRIGHT_MODULE).chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
    const page = await browser.newPage({viewport:{width:1600,height:1000}});
    await page.route('https://**/*', route=>route.abort());
    const errors = [], requests = [];
    page.on('pageerror', e=>errors.push(e.message));
    page.on('request', r=>{if(r.url().includes('/locale/')) requests.push(r.url());});
    const base = `http://127.0.0.1:${server.address().port}`;
    await page.goto(base+'/vision-preview?lang=en');
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(requests.length,0);
    await page.locator('#chapter-3 p').nth(2).evaluate(e=>e.scrollIntoView({block:'start'}));
    const anchor = await page.evaluate(()=>{
      const top=document.querySelector('.vr-reader').getBoundingClientRect().top;
      return [...document.querySelectorAll('[data-reading-anchor]')].find(e=>e.getBoundingClientRect().bottom>=top+20).id;
    });
    const relativeOffset = () => page.locator('#'+anchor).evaluate(e=>(e.getBoundingClientRect().top-document.querySelector('.vr-reader').getBoundingClientRect().top)/e.offsetHeight);
    const initialOffset = await relativeOffset();
    for(const lang of ['es','ar','ur','id','de','en']) {
      await page.selectOption('#sp-language',lang);
      await page.waitForFunction(l=>document.documentElement.lang===l,lang);
      const offset=await relativeOffset();
      assert.ok(Math.abs(offset-initialOffset)<.03,`${lang} relative anchor offset ${offset}, expected ${initialOffset}`);
      assert.equal(new URL(page.url()).searchParams.get('lang'),lang);
      assert.equal(await page.locator('.vr-prose').first().evaluate(e=>getComputedStyle(e).direction),['ar','ur'].includes(lang)?'rtl':'ltr');
      const boxes=await page.locator('.vr-chapters,.vr-reader,.vr-model').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().left));
      assert.ok(boxes[0]<boxes[1]&&boxes[1]<boxes[2],'columns never mirror');
    }
    assert.equal(requests.length,4);
    await page.route('**/vision-preview/locale/fr', route=>route.fulfill({status:404,body:'Unavailable'}));
    await page.selectOption('#sp-language','fr');
    await page.waitForFunction(()=>document.querySelector('#sp-language').value==='en');
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.ok(await page.locator('.vr-status').textContent());
    await page.unroute('**/vision-preview/locale/fr');
    let release;
    const blocked = new Promise(resolve=>{release=resolve;});
    await page.route('**/vision-preview/locale/fr',async route=>{await blocked;await route.continue().catch(()=>{});});
    await page.selectOption('#sp-language','fr');
    await page.selectOption('#sp-language','es');
    release();
    await page.waitForFunction(()=>document.documentElement.lang==='es');
    await page.unroute('**/vision-preview/locale/fr');
    let finish;
    const delayed = new Promise(resolve=>{finish=resolve;});
    await page.route('**/vision-preview/locale/fr',async route=>{await delayed;await route.continue();});
    await page.selectOption('#sp-language','fr');
    const moved = await page.locator('#chapter-5 p').nth(1).evaluate(e=>{e.scrollIntoView({block:'start'});return e.id;});
    finish();
    await page.waitForFunction(()=>document.documentElement.lang==='fr');
    const movedOffset = await page.locator('#'+moved).evaluate(e=>e.getBoundingClientRect().top-document.querySelector('.vr-reader').getBoundingClientRect().top);
    assert.ok(Math.abs(movedOffset)<40,'scroll during fetch is retained');
    await page.unroute('**/vision-preview/locale/fr');
    for(const {code:lang} of locales.languages.filter(l=>locales.inspect(l.code).available)) for(const width of [320,390,768,1600]) {
      await page.setViewportSize({width,height:844});
      await page.goto(base+'/vision-preview?lang='+lang);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${lang} overflow at ${width}`);
      assert.equal(await page.locator('.vr-chapter').count(),9);
      await page.locator('.vr-chapter img').first().evaluate(img=>img.decode());
      assert.ok((await page.screenshot()).length>10000);
    }
    const noJS = await browser.newPage({javaScriptEnabled:false});
    await noJS.route('https://**/*', route=>route.abort());
    await noJS.goto(base+'/vision-preview?lang=ar');
    assert.equal(await noJS.locator('.vr-chapter').count(),9);
    assert.equal(await noJS.locator('html').getAttribute('dir'),'rtl');
    assert.deepEqual(errors,[]);
  } finally {
    await browser?.close();
    await new Promise(resolve=>server.close(resolve));
  }
});
