const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const cheerio = require('cheerio');
const {transform,collect,dictionaries,languageFor,localHref} = require('../lib/site-i18n');
const {installProgrammePages} = require('../lib/programme-pages');
const req = lang => ({query:{lang},socket:{remoteAddress:'127.0.0.1'}});

test('global language routes cannot expose drafts in production or from a remote review request',()=>{
  const old={NODE_ENV:process.env.NODE_ENV,SWE_CONTENT_REVIEW:process.env.SWE_CONTENT_REVIEW};
  try {
    process.env.NODE_ENV='production';process.env.SWE_CONTENT_REVIEW='1';
    for(const lang of ['de','hi','unknown'])assert.equal(languageFor(req(lang)),'en');
    process.env.NODE_ENV='development';
    assert.equal(languageFor({...req('hi'),socket:{remoteAddress:'10.0.0.1'}}),'en');
    assert.equal(languageFor(req('hi')),'hi');
  } finally {for(const [k,v]of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});

test('server translation preserves inline spacing, user input names, external links and the locked introduction',()=>{
  const old={NODE_ENV:process.env.NODE_ENV,SWE_CONTENT_REVIEW:process.env.SWE_CONTENT_REVIEW};
  try {
    process.env.NODE_ENV='development';process.env.SWE_CONTENT_REVIEW='1';
    const html='<!doctype html><html lang="en"><head><title>Home</title></head><body><header class="programme-header"></header><main><p> Contact <a href="/#contact">Home</a> Contact </p><input name="name" value="Joerg"><a href="https://academy.swex.ai">AIcademy4you</a><div id="approved-introduction" lang="de"><p>Home</p></div></main></body></html>';
    const $=cheerio.load(transform(html,req('de')));
    assert.equal($('html').attr('lang'),'de');
    assert.equal($('main > p[data-swe-i18n]').text(),' Kontakt Startseite Kontakt ');
    assert.equal($('[name="name"]').val(),'Joerg');
    assert.equal($('#approved-introduction p').text(),'Home');
    assert.equal($('a[href="https://academy.swex.ai"]').length,1);
    assert.equal($('main > p a').attr('href'),'/?lang=de#contact');
    assert.deepEqual(Object.keys(dictionaries.de).sort(),Object.keys(dictionaries.hi).sort());
  } finally {for(const [k,v]of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});

test('Society and AIcademy have complete full-text mappings, not summaries',async t=>{
  const app=express();installProgrammePages(app);
  const server=app.listen(0,'127.0.0.1');
  t.after(()=>{server.closeAllConnections();server.close();});
  await new Promise(resolve=>server.once('listening',resolve));
  for(const route of ['/audiences/society','/programmes/aicademy','/programmes/aicademy?audience=society&country=IN']){
    const html=await(await fetch(`http://127.0.0.1:${server.address().port}${route}`)).text();
    for(const {values}of collect(cheerio.load(html)))for(const v of values)for(const lang of ['de','hi']){
      assert.ok(dictionaries[lang][v.source],`${route}/${lang}: ${v.source}`);
    }
  }
});

test('language links preserve audience filters and external applications',()=>{
  assert.equal(localHref('/programmes?audience=society#start','hi'),'/programmes?audience=society&lang=hi#start');
  assert.equal(localHref('https://swex.ai/','hi'),'https://swex.ai/');
  assert.equal(localHref('/intro.mp4','de'),'/intro.mp4');
  assert.equal(localHref('mailto:info@swedu.info','de'),'mailto:info@swedu.info');
});

test('homepage has one language selector, inside the header navigation',()=>{
  const old={NODE_ENV:process.env.NODE_ENV,SWE_CONTENT_REVIEW:process.env.SWE_CONTENT_REVIEW};
  try {
    process.env.NODE_ENV='development';process.env.SWE_CONTENT_REVIEW='1';
    const html=require('../lib/capability-views').home(require('../lib/catalogue').readCatalogue(),'',{preview:true,language:'de'});
    const $=cheerio.load(transform(html,req('de')));
    assert.equal($('#site-language').length,1);
    assert.equal($('#nav .nav-inner #site-language').length,1);
    assert.equal($('#intro-language,.intro-language').length,0);
    assert.equal($('#approved-introduction select').length,0);
  } finally {for(const [k,v]of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
