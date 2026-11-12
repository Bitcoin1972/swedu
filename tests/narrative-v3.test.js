const test=require('node:test');
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const fs=require('node:fs');
const narrative=require('../content/narrative-v3');
const shell=require('../lib/spatial-shell');
test('three complete narratives connect all nine existing stations without changing the master',()=>{
 for(const lang of ['en','de','hi']){
  const n=narrative[lang];assert.equal(n.stages.length,9);assert.equal(n.headings.length,6);
  for(const stage of n.stages.slice(1)){assert.equal(stage.length,6);for(const text of stage)assert.ok(text.length>35);}
  const versions=shell.versions()[lang];
  const $=cheerio.load(versions.intro);
  assert.equal($('.sp-founders img').length,2);assert.equal($('.sp-full-vision .sp-approved').length,1);
  for(const field of ['identity','purpose','audiences','example'])assert.ok($.text().includes(n[field]));
  for(let i=1;i<9;i++){
   const s=cheerio.load(versions.stories[i]);assert.equal(s('.sp-connected-story>section').length,6);
   for(const paragraph of n.stages[i])assert.ok(s.text().includes(paragraph));
   assert.ok(s('.sp-programme').length>0);
  }
  assert.ok(versions.stories[8].includes('data-sp-model'));
  assert.ok(versions.stories[8].includes('/#contact'));
 }
});
test('film remains an explicitly ungenerated production draft with matching subtitle timelines',()=>{
 const film=require('../content/film-v3.json');assert.equal(film.status,'production-draft-not-generated');
 assert.equal(film.scenes.length,7);assert.equal(film.scenes[0].start,0);assert.equal(film.scenes.at(-1).end,84);
 for(let i=0;i<7;i++){const scene=film.scenes[i];if(i)assert.equal(scene.start,film.scenes[i-1].end);for(const lang of ['en','de','hi'])assert.ok(scene[lang].length>60);}
 for(const lang of ['en','de','hi'])assert.match(fs.readFileSync(require.resolve(`../docs/film-v3/narration.${lang}.vtt`),'utf8'),/^WEBVTT/);
 assert.ok(!fs.readFileSync(require.resolve('../public/index.html'),'utf8').includes('narration.hi.vtt'));
});
