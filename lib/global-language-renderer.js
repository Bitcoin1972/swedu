const cheerio = require('cheerio');
const locales = require('./global-languages');
const release = require('../content/public-experience-release.json');

function preview(req, env = process.env) {
  return env.NODE_ENV !== 'production' && env.SWE_LANGUAGE_PREVIEW === '1' &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket?.remoteAddress);
}
function permitted(entry, req, env = process.env) {
  return entry.available && (entry.existing || entry.status === 'approved' || preview(req, env));
}
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');

// Apply only complete, source-matched packs. Existing editorial masters are untouched.
function transform(body, req) {
  // The separate illustrated reader owns its locale loading and local-only gate.
  if (body.includes('id="vr-data"')) return body;
  const requested = locales.canonical(req.query.lang || req.query.introLang);
  const entries = locales.languages.map(l => locales.inspect(l.code));
  const selected = entries.find(l => l.code === requested);
  const enabled = entries.filter(l => permitted(l, req));
  const usePack = selected && !selected.existing && permitted(selected, req);
  const translate = text => usePack ? selected.pack.translations[locales.normalize(text)] || text : text;
  let $ = cheerio.load(body,{scriptingEnabled:false});
  if (usePack) {
    const documentData = $('#site-i18n-data').length ? JSON.parse($('#site-i18n-data').text()) : null;
    const complete = !documentData || documentData.records.every(record => record.values.every(value =>
      /^[\w.-]+@[\w.-]+$/.test(value.source) ||
      typeof selected.pack.translations[locales.normalize(value.source)] === 'string'));
    $ = cheerio.load(locales.html(body, translate),{scriptingEnabled:false});
    $('html').attr({lang: selected.code, dir: selected.dir, 'data-swe-translation-complete': String(complete)});
    $('.sp-approved,#approved-introduction').attr('lang',selected.code);
    $('input[name="lang"]').val(selected.code);
    const documentLinks = $('#sp-data').length ? $('noscript a[href]') : $('a[href]');
    documentLinks.each((_i, link) => {
      const href = $(link).attr('href');
      if (!href?.startsWith('/') || href.startsWith('//') || /\.[a-z0-9]+(?:[?#]|$)/i.test(href)) return;
      const url = new URL(href, 'https://swedu.me');
      url.searchParams.set('lang', selected.code);
      $(link).attr('href', url.pathname + url.search + url.hash);
    });
  }
  const spatial = $('#sp-data');
  if (spatial.length) {
    const data = JSON.parse(spatial.text());
    if (release.visionReader) {
      data.visionPath = '/vision';
      $('.sp-header nav a[data-sp-home],.sp-header nav [data-vr-link]').removeAttr('data-sp-home').attr({'data-vr-link':'',href:'/vision?lang='+(usePack ? selected.code : data.state.lang)});
    }
    data.languages = enabled.map(({code,label,dir}) => ({code,label,dir}));
    if (usePack) {
      const version = locales.walk(data.versions.en, translate);
      const intro = cheerio.load(version.intro,null,false);
      intro('.sp-approved,#approved-introduction').attr('lang',selected.code);
      version.intro = intro.html();
      if (version.caseRecord?.locales?.en) version.caseRecord = {
        ...data.versions.en.caseRecord,
        locales: {...data.versions.en.caseRecord.locales, [selected.code]: version.caseRecord.locales.en}
      };
      data.versions[selected.code] = version;
      data.state.lang = selected.code;
      data.translations = {[selected.code]: selected.pack.translations};
      if (data.partners) data.partners.copy[selected.code] = locales.walk(data.partners.copy.en, translate);
      for (const record of data.partners?.records || []) {
        record.description[selected.code] = translate(record.description.en);
        for (const field of ['type','relationship','benefit']) {
          if (record.editorial?.[field]?.en) record.editorial[field][selected.code] = translate(record.editorial[field].en);
        }
      }
    }
    spatial.text(json(data));
    $('#sp-language').empty();
    for (const l of enabled) $('#sp-language').append($('<option>').attr({value:l.code,lang:l.code,dir:l.dir}).text(l.label));
    $('#sp-language').val(data.state.lang);
    const fallback=$('#sp-reader > noscript > p').empty();
    for (const [index,l] of enabled.entries()) {
      const url=new URL(req.originalUrl||req.path||'/', 'https://swedu.me');
      for(const [key,value]of Object.entries(req.query))if(typeof value==='string')url.searchParams.set(key,value);
      url.searchParams.set('lang',l.code);
      if(index)fallback.append(' · ');
      fallback.append($('<a>').attr({href:url.pathname+url.search+url.hash,lang:l.code}).text(l.label));
    }
  } else if (usePack) {
    // Document fragments are translated server-side, without a second client translator.
    $('#site-i18n-data,script[src="/js/site-i18n.js"],.site-language').remove();
  }
  if (enabled.some(l=>!l.existing) || preview(req)) $('head').append('<link rel="stylesheet" href="/css/global-languages.css">');
  return $.html();
}
module.exports = {preview, permitted, transform};
