const test=require('node:test');
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const fs=require('node:fs');
const shell=require('../lib/spatial-shell');
const approved=require('../lib/approved-introduction');

test('START contains every approved article block without a second welcome dialog',()=>{
 for(const lang of ['de','en','hi']){
  const $=cheerio.load(shell.page({lang,stage:0}));
  const actual=$('.sp-reader .sp-approved').html();
  const expected=cheerio.load('<article>'+approved.article(approved.load(lang).source)+'</article>')('article').html();
  assert.equal(actual,expected);
  assert.equal($('dialog').length,0);assert.equal($('#introOverlay').length,1);
  assert.equal($('.sp-left').length,1);assert.equal($('.sp-right').length,1);assert.equal($('.sp-bottom').length,1);
 }
});
test('all room routes use one shell and localized knowledge zones with real catalogue links',()=>{
 for(const room of shell.roomIds)for(const lang of ['en','de','hi']){
  const $=cheerio.load(shell.page({room,lang,stage:4}));
  assert.equal($('.sp-environment').attr('data-scene'),room);
  assert.equal($('#sp-perspective,.sp-perspective-form,[data-sp-guide],[data-sp-exit]').length,0);
  assert.equal($('select#sp-language').length,1);
  assert.equal($('.sp-timeline a').length,9);
  assert.equal($('.room-heading,.world-toolbar,.board-introduction').length,0);
  assert.equal(shell.versions()[lang].zones[room].length,4);
 }
});
test('spatial state is allowlisted and programme status stays authoritative',()=>{
 const c=shell.context({room:'../../private',lang:'ru',stage:'99',zone:'oops',perspective:'admin'});
 assert.equal(c.room,'world');assert.equal(c.lang,'en');assert.equal(c.stage,0);assert.equal(c.zone,0);assert.equal(c.perspective,'citizen');
 const $=cheerio.load(shell.page({lang:'de'}));
 assert.ok($('.sp-left').text().includes('Bestehendes Angebot'));
 assert.ok($('.sp-left').text().includes('Programmentwurf'));
 assert.equal($('.sp-left').text().includes('existing'),false);
});
test('shared controller uses history, cancels stale document requests and retains mail checks',()=>{
 const js=fs.readFileSync(require.resolve('../public/js/spatial-shell.js'),'utf8');
 for(const token of ['popstate','pushState','replaceState','AbortController','r.ok','j.success','prefers-reduced-motion'])assert.ok(js.includes(token));
 assert.ok(!js.includes("location.assign('/world"));
 const css=fs.readFileSync(require.resolve('../public/css/spatial-shell.css'),'utf8');
 assert.ok(css.includes('100dvh'));assert.ok(css.includes('.sp-panel.sp-open'));assert.ok(css.includes('prefers-reduced-motion'));
});

test('journey progresses only through manual navigation',()=>{
 const js=fs.readFileSync(require.resolve('../public/js/spatial-shell.js'),'utf8');
 assert.ok(!js.includes('setInterval'));
 assert.ok(!js.includes('guideStart'));
 assert.ok(!js.includes("getElementById('sp-perspective')"));
 assert.ok(js.includes("if(el.matches('[data-sp-start]')){select(1);return;}"));
 const $=cheerio.load(shell.page({lang:'de',stage:2}));
 assert.equal($('.sp-controls button').length,3);
 assert.equal($('.sp-timeline a').length,9);
});
