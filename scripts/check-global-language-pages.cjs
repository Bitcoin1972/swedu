const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const locales=require('../lib/global-languages');
const inventory=require('../docs/SITE-LANGUAGE-COVERAGE.json');
const base=process.env.PREVIEW_URL||'http://localhost:4335';
(async()=>{
 const ready=locales.languages.filter(l=>!l.existing&&locales.inspect(l.code).available);
 assert.ok(ready.length,'No complete packs');
 let checked=0;
 for(const {route} of inventory.pages){
  const url=new URL(route,base);url.searchParams.set('worldDocument','1');url.searchParams.set('lang','en');
  const response=await fetch(url);assert.equal(response.status,200,route);
  const original=cheerio.load(await response.text());
  const names=$=>$('form:not(.site-language) [name]').map((_i,e)=>$(e).attr('name')).get().filter(n=>n!=='lang');
  const external=$=>$('a[href^="https://"]').map((_i,e)=>$(e).attr('href')).get();
  for(const l of ready){
   url.searchParams.set('lang',l.code);
   const translated=await fetch(url);assert.equal(translated.status,200,route+': '+l.code);
   const $=cheerio.load(await translated.text());
   assert.equal($('html').attr('lang'),l.code,route);
   assert.equal($('html').attr('data-swe-translation-complete'),'true',route+': '+l.code);
   assert.deepEqual(names($),names(original),route+': form contract');
   assert.deepEqual(external($),external(original),route+': external destinations');
   checked++;
  }
 }
 console.log(`${checked} translated public documents checked across ${ready.length} new languages.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
