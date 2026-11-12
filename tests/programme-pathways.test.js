const test=require('node:test');
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const fs=require('node:fs');
const shell=require('../lib/spatial-shell');
const pathways=require('../content/programme-pathways');
const {readCatalogue}=require('../lib/catalogue');
test('station ten appends eight programme pathways without replacing the nine-stage story',()=>{
 assert.equal(require('../lib/capability-board').stages.length,9);
 assert.equal(shell.context({stage:'9'}).stage,9);
 assert.equal(shell.context({stage:'10'}).stage,0);
 for(const lang of ['en','de','hi']){
  const $=cheerio.load(shell.page({lang,stage:9}));
  assert.equal($('.sp-timeline a').length,10);
  assert.equal($('.sp-markers a').length,9);
  assert.equal($('.sp-pathway-spots a').length,8);
  assert.equal($('.sp-environment').attr('data-scene'),'programmes');
  assert.equal($('[data-sp-pathway-panel]').length,8);
  assert.equal($('[data-sp-pathway-choice] option').length,8);
  assert.ok($('.sp-pathways').text().includes(pathways[lang].intro));
  for(const e of pathways[lang].entries){
   assert.ok(e.body.length>200);assert.equal(e.contexts.length,3);
   assert.equal(new Set(e.contexts).size,3);
   for(const id of e.programmes)assert.ok(readCatalogue().programmes.some(p=>p.id===id));
   assert.ok($(`[data-sp-pathway-panel="${e.stage}"]`).text().includes(e.body));
  }
  for(let topic=0;topic<3;topic++)assert.equal(new Set(pathways[lang].entries.map(e=>e.contexts[topic])).size,8);
 }
 assert.ok(fs.existsSync(require('node:path').join(__dirname,'../public/images/programme-pathways.jpg')));
});
test('dependency windows use a topic-specific station context, not a repeated story preamble',()=>{
 const js=fs.readFileSync(require.resolve('../public/js/spatial-shell.js'),'utf8');
 assert.ok(js.includes('contexts[index]'));
 assert.ok(!js.includes("insertAdjacentHTML('afterbegin'"));
 assert.ok(js.includes('stageCount=data.stages.length'));
});
