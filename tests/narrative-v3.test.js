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
  assert.equal($('.sp-full-vision').next().is('[data-sp-start]'),true);
  for(const field of ['identity','purpose','audiences'])assert.ok($.text().includes(n[field]));
  for(let i=1;i<9;i++){
   const s=cheerio.load(versions.stories[i]);assert.equal(s('.sp-real-world').length,1);
   const left=cheerio.load(versions.ecosystems[i]);
   for(const paragraph of require('../content/journey-panels')[lang].story[i])assert.ok(left.text().includes(paragraph));
   assert.equal(s('.sp-programme').length,0);
  }
  assert.ok(versions.ecosystems[8].includes('data-sp-next'));
  assert.ok(versions.stories[9].includes('/#contact'));
 }
});
test('English film is rendered for local review; multilingual subtitle timelines remain drafts',()=>{
 const film=require('../content/film-v3.json');assert.equal(film.status,'english-rendered-local-review');
 assert.equal(film.export.language,'en');assert.equal(film.export.publicationApproved,false);
 assert.ok(fs.existsSync(require('node:path').join(__dirname,'../public',film.export.path)));
 assert.equal(film.scenes.length,7);assert.equal(film.scenes[0].start,0);assert.equal(film.scenes.at(-1).end,84);
 for(let i=0;i<7;i++){const scene=film.scenes[i];if(i)assert.equal(scene.start,film.scenes[i-1].end);for(const lang of ['en','de','hi'])assert.ok(scene[lang].length>60);}
 for(const lang of ['en','de','hi'])assert.match(fs.readFileSync(require.resolve(`../docs/film-v3/narration.${lang}.vtt`),'utf8'),/^WEBVTT/);
 assert.ok(!fs.readFileSync(require.resolve('../public/index.html'),'utf8').includes('narration.hi.vtt'));
});
test('station zero offers manual mission playback independently of the opener in every locale',()=>{
 for(const lang of ['en','de','hi']){
  const $=cheerio.load(shell.page({lang,stage:0}));
  assert.equal($('#introOverlay').attr('data-mission-src'),undefined);
  assert.equal($('#sp-mission-video').length,1);
  assert.equal($('#sp-mission-video').attr('autoplay'),undefined);
  assert.equal($('#sp-mission-video').attr('preload'),'none');
  assert.equal($('[data-mission-replay]').attr('href'),'#sp-mission-video');
 }
});
