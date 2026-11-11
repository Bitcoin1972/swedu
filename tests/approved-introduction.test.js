const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const MarkdownIt = require('markdown-it');
const content = require('../lib/approved-introduction');
const markdown = new MarkdownIt({typographer:false});

function structure(source) {
  return markdown.parse(source, {}).map(t => [t.type, t.tag, t.level,
    t.children?.filter(c=>c.type !== 'text').map(c=>c.type)]);
}

test('approved master is byte-locked; translations preserve every block and emphasis boundary', () => {
  const master = content.load('de').source;
  assert.equal(crypto.createHash('sha256').update(master).digest('hex'), '9050e075d3b43b43abe6f754134c83c9eb80d6cfcb701012568b05d947fa4739');
  for (const lang of ['en','hi']) assert.deepEqual(structure(content.load(lang).source), structure(master), lang);
  const inline = markdown.parse(master,{}).filter(t=>t.type==='inline').map(t=>t.content);
  const rendered = content.article(master);
  for (const text of inline) assert.ok(rendered.includes(markdown.renderInline(text)), text);
  assert.ok(!rendered.includes('<script'));
  assert.equal((rendered.match(/data-reading-anchor/g)||[]).length, inline.length + 1);
});

test('all journey versions contain the full story, navigation, outcomes and reciprocal model', () => {
  const de = content.load('de').journey;
  for (const lang of ['de','en','hi']) {
    const j = content.load(lang).journey;
    assert.deepEqual(Object.keys(j),Object.keys(de));
    assert.deepEqual(j.stages.map(s=>s.id), ['society','academy','economy','institutions','governance','capability']);
    assert.equal(j.layers.length,6);
    for (const stage of j.stages) {
      for (const key of ['title','body','outcome','feedback','url']) assert.ok(stage[key]?.length, `${lang}/${stage.id}/${key}`);
    }
    const html = content.journeyHtml(j);
    assert.ok(html.indexOf('data-story-select="capability"') < html.indexOf('data-story-select="governance"'));
    assert.ok(html.includes('data-story-select="society"'));
    assert.ok(html.includes(j.return));
    if (lang === 'hi') for (const key of ['title','start','previous','next','outcome','feedback']) assert.match(j[key], /[\u0900-\u097f]/);
  }
});

test('production cannot expose unapproved translations even with a preview flag', () => {
  const old = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const html = content.render({ preview:true, language:'hi' });
    assert.match(html,/id="approved-introduction" lang="de"/);
    const payload = JSON.parse(html.match(/id="introduction-versions">([\s\S]*?)<\/script>/)[1]);
    assert.deepEqual(Object.keys(payload), ['de']);
    assert.doesNotMatch(html,/A child from an economically|आर्थिक रूप से वंचित परिवार का एक बच्चा समझना/);
    assert.equal(content.previewAllowed({socket:{remoteAddress:'127.0.0.1'}},{NODE_ENV:'production',SWE_CONTENT_REVIEW:'1'}),false);
  } finally { if (old === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = old; }
  assert.equal(content.previewAllowed({socket:{remoteAddress:'10.0.0.2'}},{NODE_ENV:'development',SWE_CONTENT_REVIEW:'1'}),false);
  assert.equal(content.previewAllowed({socket:{remoteAddress:'127.0.0.1'}},{NODE_ENV:'development',SWE_CONTENT_REVIEW:'1'}),true);
});

test('local review exposes complete translations, never before the full article', () => {
  const old = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';
  try {
    for (const lang of ['de','en','hi']) {
      const html = content.render({ preview:true, language:lang });
      assert.match(html,new RegExp(`id="approved-introduction" lang="${lang}"`));
      assert.ok(html.indexOf('</article>') < html.indexOf('class="intro-start"'));
      assert.ok(html.indexOf('class="intro-start"') < html.indexOf('id="capability-journey"'));
      const payload = JSON.parse(html.match(/id="introduction-versions">([\s\S]*?)<\/script>/)[1]);
      assert.deepEqual(Object.keys(payload),['de','en','hi']);
    }
  } finally { if (old === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = old; }
});

test('source drafts stay outside the static directory and generated HTML is escaped', () => {
  assert.equal(fs.existsSync(path.join(__dirname,'../public/content/independent-capability')),false);
  assert.ok(content.article('<script>alert(1)</script>').includes('&lt;script&gt;'));
  const j = structuredClone(content.load('de').journey);
  j.stages[0].body = '<img src=x onerror=alert(1)>';
  assert.ok(content.journeyHtml(j).includes('&lt;img'));
});
