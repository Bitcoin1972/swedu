const test=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const cheerio=require('cheerio');
const locales=require('../lib/global-languages');
const reader=require('../lib/vision-reader');
const renderer=require('../lib/global-language-renderer');

test('owner-approved release serves all sixteen languages and vision without preview flags',async t=>{
 const old=process.env.NODE_ENV;process.env.NODE_ENV='production';
 t.after(()=>{if(old===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=old;});
 const remote={query:{lang:'sw'},socket:{remoteAddress:'198.51.100.10'}};
 assert.equal(reader.allowed(remote),true);
 assert.equal(reader.choices(remote).length,16);
 for(const l of locales.languages)assert.equal(renderer.permitted(locales.inspect(l.code),remote),true);
 assert.equal(renderer.permitted({available:true,status:'draft'},remote),false);
 const shell=cheerio.load(renderer.transform(require('../lib/spatial-shell').page({lang:'en'}),remote));
 assert.equal(shell('#sp-language option').length,16);
 assert.equal(shell('.sp-header [data-vr-link]').attr('href'),'/vision?lang=sw');
 const app=express();reader.install(app);require('../lib/partner-campus').installPartnerCampus(app);
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 t.after(()=>{server.closeAllConnections();server.close();});
 const base='http://127.0.0.1:'+server.address().port;
 for(const l of locales.languages){
  const response=await fetch(base+'/vision?lang='+l.code);
  assert.equal(response.status,200);
  const $=cheerio.load(await response.text());
  assert.equal($('html').attr('lang'),l.code);
  assert.equal($('.vr-chapter').length,9);
  assert.equal($('meta[name=robots]').length,0);
 }
 assert.equal((await fetch(base+'/vision-preview-assets/chapter-1.png')).status,200);
 assert.equal((await fetch(base+'/vision-preview/locale/sw')).status,200);
 assert.equal((await fetch(base+'/vision-preview/locale/unknown')).status,404);
 assert.notEqual((await fetch(base+'/partners')).status,200);
});
