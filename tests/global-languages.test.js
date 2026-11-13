const test = require('node:test');
const assert = require('node:assert/strict');
const locales = require('../lib/global-languages');
const renderer = require('../lib/global-language-renderer');

test('all Academy languages and Kiswahili have canonical locale metadata', () => {
 assert.equal(locales.languages.length, 16);
 assert.equal(locales.canonical('sw-KE'), 'sw');
 assert.equal(locales.canonical('hi-IN'), 'hi');
 assert.equal(locales.canonical('zh-CN'), 'zh-CN');
 assert.deepEqual(locales.languages.filter(l=>l.dir==='rtl').map(l=>l.code), ['ar','ur']);
});
test('draft languages require explicit local review, never a production release flag', () => {
 const draft = {available:true,status:'draft-awaiting-editorial-review'};
 const req = {socket:{remoteAddress:'127.0.0.1'}};
 assert.equal(renderer.permitted(draft,req,{NODE_ENV:'production',SWE_LANGUAGE_PREVIEW:'1',SWE_PUBLIC_WORLD:'1'}),false);
 assert.equal(renderer.permitted(draft,req,{SWE_LANGUAGE_PREVIEW:'1'}),true);
 assert.equal(renderer.permitted(draft,{socket:{remoteAddress:'8.8.8.8'}},{SWE_LANGUAGE_PREVIEW:'1'}),false);
 assert.equal(renderer.permitted({...draft,available:false},req,{SWE_LANGUAGE_PREVIEW:'1'}),false);
});
test('translation preserves markup, routing IDs and scripts while handling whitespace', () => {
 const t=s=>s==='Hello world'?'Bonjour le monde':s;
 const result=locales.walk({id:'Hello world',href:'/Hello world',body:'<section><p>Hello\n world</p><script>Hello world</script></section>'},t);
 assert.equal(result.id,'Hello world');assert.equal(result.href,'/Hello world');
 assert.match(result.body,/<p>Bonjour le monde<\/p>/);
 assert.match(result.body,/<script>Hello world<\/script>/);
});
test('source inventory remains versioned and immutable', () => {
 const s=locales.source();
 assert.equal(s.sourceHash,locales.hash(JSON.stringify(s.strings)));
 assert.equal(s.strings.length,1633);
});

test('inventory covers the current English spatial content and programme dictionary', () => {
 const cheerio=require('cheerio'),known=new Set(locales.source().strings),missing=new Set();
 const check=text=>{if(typeof text==='string'&&/\p{L}/u.test(text)&&!/^https?:|^\/|^[\w.-]+@[\w.-]+$/.test(text)&&!known.has(locales.normalize(text)))missing.add(locales.normalize(text));return text;};
 Object.keys(require('../lib/site-i18n').dictionaries.de).forEach(check);
 const $=cheerio.load(require('../lib/spatial-shell').page({lang:'en'}));
 const data=JSON.parse($('#sp-data').text());
 locales.walk(data.versions.en,check);
 if(data.partners){locales.walk(data.partners.copy.en,check);for(const r of data.partners.records){check(r.name);check(r.description.en);for(const k of ['type','relationship','benefit'])check(r.editorial[k].en);}}
 $('#sp-data').remove();locales.html($.html(),check);
 assert.deepEqual([...missing],[],'New public content needs an inventory/translation update');
});

test('new locale rendering preserves the spatial contract and source attribution', () => {
 const cheerio=require('cheerio');
 const original=locales.inspect;
 try {
  locales.inspect=code=>code==='fr'?{code,label:'Français',dir:'ltr',available:true,status:'approved',pack:{translations:Object.fromEntries(locales.source().strings.map(s=>[s,'Traduction '+s]))}}:original(code);
  const body=require('../lib/spatial-shell').page({lang:'en',stage:4});
  const $=cheerio.load(renderer.transform(body,{query:{lang:'fr'},socket:{remoteAddress:'127.0.0.1'}}));
  const payload=JSON.parse($('#sp-data').text());
  assert.equal($('html').attr('lang'),'fr');
  assert.equal($('body').hasClass('spatial-shell'),true);
  assert.equal(payload.state.stage,4);
  assert.equal(payload.state.lang,'fr');
  assert.equal($('.sp-header a[href="/programmes"]').length,1);
  assert.match(payload.versions.fr.labels[4],/^Traduction /);
  assert.match(payload.versions.fr.intro,/class="sp-approved" lang="fr"/);
  assert.equal(payload.versions.fr.caseRecord.originalUrl,payload.versions.en.caseRecord.originalUrl);
  assert.equal(payload.versions.fr.caseRecord.title,payload.versions.en.caseRecord.title);
  assert.ok(payload.versions.fr.caseRecord.locales.fr);
 } finally {locales.inspect=original;}
});
