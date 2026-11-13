const path = require('node:path');
const cheerio = require('cheerio');
const approved = require('./approved-introduction');
const metadata = require('../content/vision-reader');
const locales = require('./global-languages');
const languagePreview = require('./global-language-renderer').preview;
const readerUI = require('../content/languages/v2/reader-ui.json');
const spatialCopy = require('./spatial-copy');
const release = require('../content/public-experience-release.json');
const esc = require('markdown-it')().utils.escapeHtml;

function completeUI(lang, ui = readerUI) {
  const copy = ui.locales?.[lang];
  const text = value => typeof value === 'string' && value.trim().length > 0 && !/[<>]/.test(value);
  return !!copy && Object.keys(metadata.copy.en).every(key => key === 'layers'
    ? Array.isArray(copy.layers) && copy.layers.length === metadata.layers.length && copy.layers.every(text)
    : text(copy[key]));
}

function choices(req, env = process.env) {
  return locales.languages.filter(entry => entry.existing ||
    (completeUI(entry.code) && locales.inspect(entry.code).available &&
      ((release.visionReader && readerUI.status === 'approved' && locales.inspect(entry.code).status === 'approved') ||
       (allowed(req, env) && languagePreview(req, env)))));
}

function version(lang, entry = locales.inspect(lang)) {
  if (!entry.available || (!entry.existing && !completeUI(lang))) throw Error('Reader locale unavailable');
  const translate = text => {
    const value = entry.pack?.translations[locales.normalize(text)];
    if (typeof value !== 'string' || !value.trim()) throw Error('Reader translation missing: ' + text);
    return value;
  };
  const article = approved.article(approved.load(entry.existing ? lang : 'en').source);
  const $ = cheerio.load(entry.existing ? article : locales.html(article, translate), null, false);
  const chapters = [];
  let chapter;
  let title = '';
  $.root().children().each((_i, node) => {
    if (node.tagName === 'h1') { title = $(node).text(); return; }
    if (node.tagName === 'h2') {
      chapter = { title: $(node).text(), html: '', layers: metadata.chapters[chapters.length] };
      chapters.push(chapter);
    }
    if (chapter) chapter.html += $.html(node);
  });
  if (chapters.length !== metadata.chapters.length) throw Error('Vision chapter mapping needs review');
  const headerCopy = Object.fromEntries(['all', 'ecosystem', 'about', 'partners', 'language', 'loading', 'error'].map(key =>
    [key, entry.existing ? spatialCopy[lang][key] : translate(spatialCopy.en[key])]));
  headerCopy.brand = entry.existing ? null : translate('CONSULTING & DEVELOPMENT');
  const copy = entry.existing ? metadata.copy[lang] : readerUI.locales[lang];
  headerCopy.model = copy.model;
  return { title, chapters, copy, headerCopy, dir: entry.dir, lang };
}

function body(v, lang) {
  const c = v.copy;
  return `<aside class="vr-chapters"><p class="vr-eyebrow">${c.vision}</p><h2>${c.chapters}</h2><nav aria-label="${c.chapters}">${v.chapters.map((ch, i) => `<a href="#chapter-${i}" data-vr-chapter="${i}"${i === 0 ? ' aria-current="location"' : ''}><span>${String(i + 1).padStart(2, '0')}</span><span class="vr-chapter-label" dir="${v.dir}">${esc(ch.title)}</span></a>`).join('')}</nav><a class="vr-back" href="/?lang=${lang}&skipIntro=1">&#8592; ${c.back}</a></aside>
  <main class="vr-reader" id="vision-reader" tabindex="-1"><header class="vr-title"><p class="vr-eyebrow">SMART WORLD EDUCATION</p><h1>${esc(v.title)}</h1></header>${v.chapters.map((ch, i) => `<section class="vr-chapter" id="chapter-${i}" data-chapter="${i}"><figure><img src="/vision-preview-assets/chapter-${i + 1}.png" alt="" width="1536" height="1024" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></figure><div class="vr-prose">${ch.html}</div></section>`).join('')}<footer class="vr-end"><a class="vr-start" href="/?lang=${lang}&stage=1&skipIntro=1">${c.journey} &#8594;</a></footer></main>
  <aside class="vr-model" aria-labelledby="vr-model-heading"><p class="vr-eyebrow" id="vr-position">01 / ${String(v.chapters.length).padStart(2, '0')}</p><h2 id="vr-model-heading">${c.model}</h2><p>${c.top}</p><ol>${metadata.layers.map((layer, i) => `<li data-layer="${layer}" class="${v.chapters[0].layers.includes(layer) ? 'is-active' : ''}"><span>${esc(c.layers[i])}</span><span aria-hidden="true">&#8595;&#8593;</span></li>`).join('')}</ol><p>${c.bottom}</p><div class="vr-progress" aria-hidden="true"><span></span></div><p class="vr-current">${c.current}: <span id="vr-current-title">${esc(v.chapters[0].title)}</span></p></aside>`;
}

function page(query = {}, req = {}) {
  const enabled = choices(req);
  const lang = enabled.some(l => l.code === query.lang) ? query.lang : 'de';
  const versions = Object.fromEntries(['de', 'en', 'hi'].map(l => [l, version(l)]));
  if (!versions[lang]) versions[lang] = version(lang);
  for (const [l, v] of Object.entries(versions)) v.html = body(v, l);
  const current = versions[lang];
  // Reuse the existing brand/header without loading the Journey controller here.
  const shell = cheerio.load(require('./spatial-shell').page({ lang: metadata.copy[lang] ? lang : 'en', skipIntro: '1' }));
  const header = shell('.sp-header');
  header.find('[data-vr-link]').attr('aria-current', 'page');
  header.find('[data-sp-home],[data-vr-link]').not('.sp-brand').attr('href', (release.visionReader ? '/vision' : '/vision-preview') + '?lang=' + lang).text(current.copy.vision).attr('aria-current', 'page');
  header.find('[data-sp-model]').replaceWith(`<a data-vr-label="model" href="/?lang=${lang}&skipIntro=1">${esc(current.copy.model)}</a>`);
  for (const [route, key] of [['/programmes','all'],['/network','ecosystem'],['/about','about'],['/partners','partners']]) header.find(`a[href="${route}"]`).attr('data-vr-label', key);
  header.find('[data-sp-document]').each((_i, e) => { const href = shell(e).attr('href'); shell(e).attr('href', href + '?lang=' + lang); });
  header.find('[data-vr-label]').each((_i, e) => shell(e).text(current.headerCopy[shell(e).attr('data-vr-label')]));
  header.find('.sp-language .sp-sr').text(current.headerCopy.language);
  for (const [l, v] of Object.entries(versions)) {
    if (!v.headerCopy.brand) v.headerCopy.brand = cheerio.load(require('./spatial-shell').page({lang:l}))('.sp-brand small').text();
  }
  header.find('.sp-brand small').text(current.headerCopy.brand);
  header.find('a[href]').each((_i, e) => {
    const url = new URL(shell(e).attr('href'), 'http://localhost');
    if (url.origin !== 'http://localhost') return;
    url.searchParams.set('lang', lang);
    shell(e).attr('href', url.pathname + url.search + url.hash);
  });
  header.find('#sp-language').empty();
  for (const l of enabled) header.find('#sp-language').append(shell('<option>').attr({value:l.code, dir:l.dir}).text(l.label));
  header.find('#sp-language').val(lang);
  header.find('nav a,.sp-partner,.sp-language .sp-sr,.sp-brand small').attr('dir', current.dir);
  return `<!doctype html><html lang="${lang}" dir="${current.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(current.copy.vision)} | Smart World Education</title><meta name="robots" content="noindex,nofollow">${shell('head link').toArray().filter(e => shell(e).attr('href') !== '/css/partner-scene.css').map(e => shell.html(e)).join('')}<link rel="stylesheet" href="/vision-preview-assets/reader.css"><script src="/vision-preview-assets/reader.js" defer></script></head><body class="vr-page"><a class="vr-skip" href="#vision-reader">${esc(current.copy.vision)}</a>${shell.html(header)}<div class="vr-status" role="status" aria-live="polite"></div><div class="vr-layout" data-vr-dir="${current.dir}">${current.html}</div><script type="application/json" id="vr-data">${JSON.stringify(versions).replace(/</g, '\\u003c')}</script></body></html>`;
}

function allowed(req, env = process.env) {
  return release.visionReader === true || (env.NODE_ENV !== 'production' && env.SWE_VISION_PREVIEW === '1' && ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket?.remoteAddress));
}
function install(app) {
  const render = req => {
    const html = page(req.query, req);
    return release.visionReader ? html.replace('<meta name="robots" content="noindex,nofollow">', '') : html;
  };
  app.get('/vision', (req, res) => {
    if (!allowed(req)) return res.sendStatus(404);
    res.set('Cache-Control', 'no-store').send(render(req));
  });
  app.get('/vision-preview', (req, res) => {
    if (!allowed(req)) return res.sendStatus(404);
    res.set('Cache-Control', 'no-store').send(render(req));
  });
  app.get('/vision-preview/locale/:lang', (req, res) => {
    if (!allowed(req) || !choices(req).some(l => l.code === req.params.lang)) return res.sendStatus(404);
    try {
      const v = version(req.params.lang);
      v.html = body(v, req.params.lang);
      res.set('Cache-Control', 'no-store').json(v);
    } catch {
      res.sendStatus(404);
    }
  });
  app.get('/vision-preview-assets/:file', (req, res) => {
    if (!allowed(req)) return res.sendStatus(404);
    const name = req.params.file;
    if (!/^(reader\.(css|js)|chapter-[1-9]\.png)$/.test(name)) return res.sendStatus(404);
    res.set('Cache-Control', 'no-store').sendFile(path.join(__dirname, '../preview/vision', name));
  });
}
module.exports = { version, page, allowed, install, choices, completeUI };
