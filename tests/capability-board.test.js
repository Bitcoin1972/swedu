const test=require('node:test');
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const express=require('express');
const {stages,copy,render}=require('../lib/capability-board');
const {readCatalogue}=require('../lib/catalogue');

test('board has nine unique stages with real catalogue relationships and complete draft translations',()=>{
 const data=readCatalogue();
 assert.equal(stages.length,9);assert.equal(new Set(stages.map(s=>s.id)).size,9);
 assert.deepEqual(stages.map(s=>s.id),['start','family','school','youth','academy','profession','builder','institutions','national']);
 for(const s of stages){
  assert.ok(data.programmes.some(p=>p.id===s.programme));
  assert.ok(data.model.audiences.some(a=>a.id===s.audience));
  assert.ok(data.model.layers.some(l=>l.id===s.layer));
  for(const lang of ['en','de','hi'])assert.ok(s.text[lang].length===3&&s.text[lang].every(v=>v.length>10));
 }
 for(const lang of ['de','hi'])assert.deepEqual(Object.keys(copy[lang]),Object.keys(copy.en));
});

test('board fallback provides real semantic navigation and every stage without scripting',()=>{
 for(const lang of ['en','de','hi']){
  const $=cheerio.load(render(lang));
  assert.equal($('[data-board-stage]').length,9);
  assert.equal($('[data-board-stage][hidden]').length,0);
  $('[data-board-select]').each((_i,e)=>{const target=$(e).attr('href');if(target.startsWith('#'))assert.equal($(target).length,1);else assert.equal(new URL(target,'https://www.swedu.me').pathname,'/world/academy');});
  assert.equal($('a[href="/vision"]').length,1);
  assert.equal($('canvas[aria-hidden="true"]').length,1);
  assert.equal($('#site-language').length,0);
  assert.equal($('#world-perspective').length,1);
  assert.equal($('a[href="https://academy.swex.ai"]').length,1);
 }
});

test('board remains review-only and vendor endpoints expose only explicit browser libraries',async t=>{
 const old={NODE_ENV:process.env.NODE_ENV,SWE_CONTENT_REVIEW:process.env.SWE_CONTENT_REVIEW};
 const app=express();require('../lib/programme-pages').installProgrammePages(app);
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 t.after(()=>{server.closeAllConnections();server.close();for(const[k,v]of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
 const get=p=>fetch(`http://127.0.0.1:${server.address().port}${p}`);
 process.env.NODE_ENV='production';process.env.SWE_CONTENT_REVIEW='1';
 assert.doesNotMatch(await(await get('/?lang=hi')).text(),/data-spatial-shell/);
 process.env.NODE_ENV='development';
 assert.match(await(await get('/?lang=hi')).text(),/data-spatial-shell/);
 assert.match(await(await get('/vision?lang=de')).text(),/id="approved-introduction"/);
 for(const asset of ['three.module.js','three.core.js','lucide.js'])assert.equal((await get('/board-vendor/'+asset)).status,200);
 assert.equal((await get('/board-vendor/package.json')).status,404);
});
