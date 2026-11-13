const test=require('node:test');
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const shell=require('../lib/spatial-shell');
const content=require('../content/journey-panels');
const cases=require('../content/real-world-cases');
test('nine narrative stations separate the human story from evidence without promotional directories',()=>{
 for(const lang of ['en','de','hi']){
  assert.equal(content[lang].story.length,9);assert.equal(content[lang].reality.length,9);
  for(let stage=0;stage<9;stage++){
   const $=cheerio.load(shell.page({stage,lang,topic:'1'}));
   const left=$('#sp-offers-body'),right=$('#sp-reader');
   assert.equal(left.find('.sp-human-story').length,1);
   assert.equal(left.text().includes(content[lang].fiction),false);
   assert.equal(right.text().includes(require('../lib/spatial-copy')[lang].note),false);
   assert.equal(right.text().includes(require('../content/narrative-v3')[lang].example),false);
   assert.equal(left.find('.sp-programme,.sp-ecosystem').length,0);
   assert.equal(right.find('.sp-programme,.sp-ecosystem').length,0);
   assert.equal($('.sp-timeline a').length,10);
   for(const text of content[lang].story[stage])assert.ok(left.text().includes(text));
   if(stage){
    for(const text of content[lang].reality[stage])assert.ok(right.text().includes(text));
    assert.equal(right.find('.sp-source-card').length,1);
    assert.equal(right.find('[data-sp-assessment]').length,1);
    assert.ok(right.text().includes(cases[0].title));
    assert.equal(right.find('.sp-source-card a').length,2);
   }
  }
  const end=cheerio.load(shell.page({stage:9,lang}));
  assert.equal(end('[data-sp-pathway-panel]').length,8);
  assert.ok(end('.sp-programme').length>8);
 }
});
test('source records preserve provenance and distinguish facts, interpretation, response and limits',()=>{
 for(const c of cases){
  for(const field of ['id','title','publishedOn','publisher','author','originalUrl','primaryUrl','primaryTitle','verifiedOn'])assert.ok(c[field]);
  assert.equal(c.affectedAreas.length,6);
  for(const lang of ['en','de','hi'])for(const field of ['facts','interpretation','proposedResponse','evaluation','limitations'])assert.ok(c.locales[lang][field].length>80);
 }
 for(const lang of ['de','hi'])assert.deepEqual(Object.keys(content[lang]),Object.keys(content.en));
});
test('youth has its own scene and labels while governance retains connected case evidence',()=>{
 for(const lang of ['en','de','hi']){
  const school=cheerio.load(shell.page({stage:2,lang}));
  const youth=cheerio.load(shell.page({stage:3,lang}));
  assert.equal(school('.sp-environment').attr('data-scene'),'school');
  assert.equal(youth('.sp-environment').attr('data-scene'),'youth');
  assert.equal(content[lang].youthZones.length,4);
  const government=cheerio.load(shell.page({stage:8,room:'governance',lang}));
  for(const text of content[lang].governance)assert.ok(government('#sp-reader').text().includes(text));
  assert.equal(government('.sp-source-card').length,1);
 }
});
