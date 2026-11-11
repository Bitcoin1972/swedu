const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {dictionaries}=require('../lib/site-i18n');
const inventory=require('../docs/SITE-LANGUAGE-COVERAGE.json');

test('all inventoried public strings have German and Hindi translations',()=>{
 for(const lang of ['de','hi']) {
  const missing=inventory.strings.filter(entry=>!dictionaries[lang][entry.source]);
  assert.deepEqual(missing.map(entry=>entry.source),[]);
  for(const entry of inventory.strings) {
   const value=dictionaries[lang][entry.source];
   assert.equal(typeof value,'string');
   assert.ok(value.trim().length>0);
   assert.ok(!/<\/?(?:script|iframe)\b/i.test(value));
  }
 }
});

test('parallel translation parts have matching keys without overlaps',()=>{
 const seen=new Set();
 for(let part=0;part<6;part++) {
  const read=lang=>JSON.parse(fs.readFileSync(path.join(__dirname,`../content/site/v1/completion-${part}.${lang}.json`),'utf8'));
  const de=read('de'),hi=read('hi');
  assert.deepEqual(Object.keys(de).sort(),Object.keys(hi).sort());
  for(const source of Object.keys(de)) {
   assert.ok(!seen.has(source),`Duplicate assignment: ${source}`);
   seen.add(source);
   if(source.length>80){
    assert.notEqual(de[source],source,`Untranslated German prose: ${source}`);
    assert.notEqual(hi[source],source,`Untranslated Hindi prose: ${source}`);
    assert.match(hi[source],/[\u0900-\u097f]/,`Hindi script missing: ${source}`);
   }
   const numbers=value=>(value.match(/\d+/g)||[]).sort();
   assert.deepEqual(numbers(de[source]),numbers(source),`German numbers changed: ${source}`);
   assert.deepEqual(numbers(hi[source]),numbers(source),`Hindi numbers changed: ${source}`);
  }
 }
 assert.equal(seen.size,702);
});

test('audience and capability filter combinations are fully translated',async()=>{
 const result=await require('../scripts/check-language-variants').check();
 assert.ok(result.routes>100);
 assert.deepEqual(result.missing.map(entry=>entry.source),[]);
});

test('all inventoried public pages render complete translated documents without changing form contracts',async t=>{
 const express=require('express'),cheerio=require('cheerio');
 const {installProgrammePages}=require('../lib/programme-pages');
 const {transform}=require('../lib/site-i18n');
 const app=express();installProgrammePages(app);const server=app.listen(0,'127.0.0.1');
 t.after(()=>{server.closeAllConnections();server.close();});
 await new Promise(resolve=>server.once('listening',resolve));
 const old={NODE_ENV:process.env.NODE_ENV,SWE_CONTENT_REVIEW:process.env.SWE_CONTENT_REVIEW};
 try{
  for(const {route}of inventory.pages){
   // Fetch the unmodified English source, then exercise the same review translator.
   process.env.NODE_ENV='test';delete process.env.SWE_CONTENT_REVIEW;
   const html=await(await fetch(`http://127.0.0.1:${server.address().port}${route}`)).text();
   const original=cheerio.load(html);
   process.env.NODE_ENV='development';process.env.SWE_CONTENT_REVIEW='1';
   for(const lang of ['de','hi']){
    const translated=cheerio.load(transform(html,{query:{lang,worldDocument:'1'},path:route,socket:{remoteAddress:'127.0.0.1'}}));
    assert.equal(translated('html').attr('lang'),lang);
    assert.equal(translated('html').attr('data-swe-translation-complete'),'true',`${route}: ${lang}`);
    const inputNames=$=>$('form:not(.site-language) [name]').map((_i,e)=>$(e).attr('name')).get().filter(n=>n!=='lang');
    assert.deepEqual(inputNames(translated),inputNames(original));
    const external=$=>$('a[href^="https://"]').map((_i,e)=>$(e).attr('href')).get();
    assert.deepEqual(external(translated),external(original));
   }
  }
 }finally{for(const[k,v]of Object.entries(old))if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
