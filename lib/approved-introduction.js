const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const MarkdownIt = require('markdown-it');
const root = path.join(__dirname, '../content/independent-capability/v1');
const manifest = require('../content/independent-capability/v1/manifest.json');
const markdown = new MarkdownIt({ html: false, typographer: false, linkify: false });
const escape = markdown.utils.escapeHtml;
const modelOrder = ['capability', 'governance', 'institutions', 'academy', 'economy', 'society'];

function load(lang) {
  if (!Object.hasOwn(manifest.languages, lang)) throw new Error('Unsupported introduction language');
  const source = fs.readFileSync(path.join(root, `${lang}.md`), 'utf8');
  if (lang === 'de' && crypto.createHash('sha256').update(source).digest('hex') !== manifest.masterSha256) {
    throw new Error('Approved German master integrity check failed');
  }
  return { source, journey: JSON.parse(fs.readFileSync(path.join(root, `journey.${lang}.json`), 'utf8')) };
}

function article(source) {
  const tokens = markdown.parse(source, {});
  let block = 0;
  for (const token of tokens) {
    if (token.level === 0 && (token.type === 'paragraph_open' || token.type === 'heading_open' || token.type === 'hr')) {
      token.attrSet('id', `intro-block-${block++}`);
      token.attrSet('data-reading-anchor', '');
    }
  }
  return markdown.renderer.render(tokens, markdown.options, {});
}

function journeyHtml(j) {
  return `<a class="intro-start" href="#capability-journey">${escape(j.start)} <span aria-hidden="true">&darr;</span></a>
    <section id="capability-journey" class="story-journey" aria-labelledby="journey-heading">
      <h2 id="journey-heading" tabindex="-1">${escape(j.title)}</h2><p class="story-disclaimer">${escape(j.disclaimer)}</p>
      <div id="capability-model" class="story-model"><h3>${escape(j.model)}</h3>
        <div class="story-directions"><p>&darr; ${escape(j.down)}</p><p>&uarr; ${escape(j.up)}</p></div>
        <ol>${modelOrder.map((id, i) => `<li><a href="#journey-${id}" data-story-select="${id}">${escape(j.layers[i])}</a></li>`).join('')}</ol>
      </div>
      <nav class="story-sequence" aria-label="${escape(j.title)}"><ol>${j.stages.map((s, i) => `<li><a href="#journey-${s.id}" data-story-select="${s.id}"><span>${i + 1}</span> ${escape(s.title.split(' – ')[0])}</a></li>`).join('')}</ol></nav>
      <div class="story-controls" hidden><button type="button" data-story-prev>${escape(j.previous)}</button><button type="button" data-story-all>${escape(j.all)}</button><button type="button" data-story-next>${escape(j.next)}</button></div>
      <div class="story-stages">${j.stages.map((s, i) => `<section class="story-stage" id="journey-${s.id}" data-reading-anchor data-story-stage="${s.id}"><span class="story-number" aria-hidden="true">0${i + 1}</span><div><h3 tabindex="-1">${escape(s.title)}</h3><p>${escape(s.body)}</p><dl><dt>${escape(j.outcome)}</dt><dd>${escape(s.outcome)}</dd><dt>${escape(j.feedback)}</dt><dd>${escape(s.feedback)}</dd></dl><a href="${escape(s.url)}">${escape(j.explore)} &rarr;</a></div></section>`).join('')}</div>
      <p class="story-feedback"><a href="#journey-society" data-story-select="society">&larr; ${escape(j.return)}</a></p>
    </section>`;
}

function previewAllowed(req, env = process.env) {
  return env.NODE_ENV !== 'production' && env.SWE_CONTENT_REVIEW === '1' && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
}

function render({ preview = false, language = 'de' } = {}) {
  // A preview flag cannot override the production publication gate.
  preview = preview && process.env.NODE_ENV !== 'production';
  const allowed = Object.keys(manifest.languages).filter(lang => lang === 'de' || preview || require('./public-release')() ||
    (manifest.languages[lang].articleStatus === 'approved' && manifest.languages[lang].journeyStatus === 'approved'));
  const lang = allowed.includes(language) ? language : 'de';
  const versions = Object.fromEntries(allowed.map(key => {
    const { source, journey } = load(key);
    return [key, { html: `<article class="approved-article">${article(source)}</article>${journeyHtml(journey)}`, ui: journey }];
  }));
  const j = versions[lang].ui;
  return `<div class="approved-introduction" id="approved-introduction" lang="${lang}">
    ${preview ? `<p class="intro-review" role="note">${escape(j.review)}</p>` : ''}
    <div id="introduction-content">${versions[lang].html}</div>
    <p class="intro-announcement sr-only" role="status" aria-live="polite"></p>
    <script type="application/json" id="introduction-versions">${JSON.stringify(versions).replace(/</g, '\\u003c')}</script>
    </div>`;
}

module.exports = { load, article, journeyHtml, render, previewAllowed, manifest, modelOrder };
