const test=require('node:test');
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const editorial=require('../content/knowledge-editorial');
const shell=require('../lib/spatial-shell');
const cases=require('../content/real-world-cases');

test('every room topic has substantive equivalent language coverage without instructional boilerplate',()=>{
 const ids=new Set([...Object.values(editorial.rooms).flat(),...editorial.dependencies]);
 assert.equal(Object.values(editorial.rooms).flat().length,32);
 assert.deepEqual([...ids].sort(),Object.keys(editorial.topics).sort());
 for(const id of ids){
  const topic=editorial.topics[id];
  assert.deepEqual(Object.keys(topic).sort(),['de','en','hi']);
  for(const lang of ['en','de','hi']){
   assert.equal(topic[lang].length,topic.en.length);
   assert.ok(topic[lang].length>=2);
   for(const p of topic[lang])assert.ok(p.length>130,`${id}/${lang}`);
   assert.ok(topic[lang].join(' ').includes('SWE'),`${id}/${lang} SWE contribution`);
   assert.doesNotMatch(topic[lang].join(' '),/Explore this|Agree scope|fictional scenario|beispielhafter Entwicklungsweg|<details/i);
  }
  assert.match(topic.hi.join(' '),/[\u0900-\u097F]/);
 }
});

test('all ten stages expose complete room and dependency explanations without course directories',()=>{
 for(const lang of ['en','de','hi'])for(let stage=0;stage<10;stage++){
  const $=cheerio.load(shell.page({stage,lang}));
  const v=JSON.parse($('#sp-data').text()).versions[lang];
  for(const [room,ids] of Object.entries(editorial.rooms)){
   assert.equal(v.zones[room].length,4);
   ids.forEach((id,index)=>{
    const body=cheerio.load(v.zones[room][index]);
    assert.equal(body('p').length,editorial.topics[id][lang].length);
    assert.equal(body('h2,h3,details,.sp-programme').length,0);
    assert.deepEqual(body('p').toArray().map(p=>body(p).text()),editorial.topics[id][lang]);
   });
  }
  v.knowledge.issues.forEach((issue,index)=>{
   const body=cheerio.load(issue.explanation);
   assert.deepEqual(body('p').toArray().map(p=>body(p).text()),editorial.topics[editorial.dependencies[index]][lang]);
  });
 }
});

test('assessment analysis deepens sidebar copy while preserving source facts',()=>{
 for(const lang of ['en','de','hi']){
  const c=cases[0].locales[lang];
  assert.equal(c.facts,require('../content/assessment-case')[lang].facts);
  assert.notEqual(c.proposedResponse,require('../content/journey-panels')[lang].reality[4][1]);
  assert.doesNotMatch(c.interpretation+c.evaluation,/Before use, agree|fictional water journey|fiktive Wasser-Geschichte|तय करें/);
 }
 assert.equal(editorial.topics.architecture.en.length,3);
 assert.notDeepEqual(editorial.topics.teachers.en,editorial.topics.maintenance.en);
});
