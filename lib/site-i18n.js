const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const { previewAllowed } = require('./approved-introduction');
const released = require('./public-release');
const manifest = require('../content/site/v1/manifest.json');
const dictionaries = { en: {}, de: {...require('../content/site/v1/de.json'),...require('../content/site/v1/society.de.json')}, hi: {...require('../content/site/v1/hi.json'),...require('../content/site/v1/society.hi.json')} };
for (const lang of ['de','hi']) {
  for (let part=0;part<6;part++) {
    const filename=path.join(__dirname,`../content/site/v1/completion-${part}.${lang}.json`);
    if (fs.existsSync(filename)) Object.assign(dictionaries[lang],JSON.parse(fs.readFileSync(filename,'utf8')));
  }
  Object.assign(dictionaries[lang],require(`../content/site/v1/variants.${lang}.json`));
}
// Compose filter-result labels from the same catalogue relationships as discovery.
const catalogue=require('./catalogue').readCatalogue();
for(const audience of [null,...catalogue.model.audiences])for(const capability of [null,...catalogue.model.capabilities]){
 const count=catalogue.programmes.filter(p=>(!audience||p.audiences.includes(audience.id))&&(!capability||p.capabilityIds.includes(capability.id))).length;
 const source=`${count} programme ${count===1?'path':'paths'}${audience?' for '+audience.name:''}${capability?' / '+capability.name:''}`;
 for(const lang of ['de','hi']){
  const d=dictionaries[lang],a=audience&&(d[audience.name]||audience.name),c=capability&&(d[capability.name]||capability.name);
  d[source]=lang==='de'?`${count} ${count===1?'Programmweg':'Programmwege'}${a?' für '+a:''}${c?' / '+c:''}`:`${a?a+' के लिए ':''}${count} कार्यक्रम मार्ग${c?' / '+c:''}`;
 }
}
const normalize = value => value.replace(/\s+/g, ' ').trim();
const attributes = ['alt', 'title', 'placeholder', 'aria-label'];
const notices = {en:'Editorial preview: translations await editorial approval.',de:'Redaktionsvorschau: Die Übersetzungen warten auf die redaktionelle Freigabe.',hi:'संपादकीय पूर्वावलोकन: अनुवाद संपादकीय स्वीकृति की प्रतीक्षा में हैं।'};
const skip = 'script,style,code,pre,#approved-introduction,[translate="no"]';

function languageFor(req) {
  const requested = req.query.lang || req.query.introLang || 'en';
  const language = typeof requested === 'string' && Object.hasOwn(dictionaries, requested) ? requested : 'en';
  return language === 'en' || released() || previewAllowed(req) || manifest.languages[language].status === 'approved' ? language : 'en';
}

function collect($) {
  const records = [];
  $('*').each((_index, element) => {
    if ($(element).is(skip) || $(element).parents(skip).length) return;
    const id = String(records.length);
    const values = [];
    (element.children || []).forEach((child, index) => {
      if (child.type === 'text' && /[\p{L}]/u.test(child.data)) values.push({index,source:normalize(child.data),prefix:child.data.match(/^\s*/)[0],suffix:child.data.match(/\s*$/)[0]});
    });
    for (const attr of attributes) if (element.attribs?.[attr]) values.push({attr,source:normalize(element.attribs[attr])});
    if (values.length) { $(element).attr('data-swe-i18n', id); records.push({id,values}); }
  });
  return records;
}

function localHref(value, lang) {
  if (!value || !(value.startsWith('/') && !value.startsWith('//') || value.startsWith('#'))) return value;
  const url = new URL(value, 'https://www.swedu.me');
  if (/\.(?:jpg|jpeg|png|svg|webp|mp4|css|js|pdf)$/i.test(url.pathname)) return value;
  url.searchParams.set('lang',lang);
  return `${value.startsWith('#') ? '' : url.pathname}${url.search}${url.hash}`;
}

function transform(html, req) {
  if (html.includes('data-spatial-shell')) return html;
  const lang = languageFor(req);
  const preview = previewAllowed(req);
  if (!released() && !preview && lang === 'en' && !Object.values(manifest.languages).some(l=>l.status==='approved')) return html;
  const $ = cheerio.load(html);
  if (preview) {
    $('body').addClass('board-preview-page');
    $('head').append('<link rel="stylesheet" href="/css/capability-board.css">');
    if (req.query.perspective && req.query.stage && !$('.capability-room,.capability-board').length) {
      const world=require('./capability-world'),c=world.context(req.query);
      const strip=$('<nav>').addClass('world-return-strip').attr('aria-label','Return to your capability context');
      strip.append($('<a>').attr('href',world.href('/',c,{skipIntro:'1'})+'#hero').text('Back to Capability World'));
      strip.append($('<a>').attr('href',world.href('/world/academy',c)).text('Return to Academy room'));
      $('main').first().prepend(strip);
      $('head').append('<link rel="stylesheet" href="/css/capability-world.css">');
    }
  }
  const records = collect($);
  const dictionary = dictionaries[lang];
  const complete=lang==='en'||records.every(record=>record.values.every(value=>dictionary[value.source]));
  $('html').attr('data-swe-translation-complete',String(complete));
  for (const record of records) {
    const element = $(`[data-swe-i18n="${record.id}"]`)[0];
    for (const v of record.values) {
      const value = dictionary[v.source];
      if (!value) continue;
      if (v.attr) $(element).attr(v.attr,value);
      else element.children[v.index].data = v.prefix + value + v.suffix;
    }
  }
  $('html').attr('lang',lang);
  $('a[href]').each((_i,e)=>$(e).attr('href',localHref($(e).attr('href'),lang)));
  $('form[method="get"]').each((_i,e)=>$(e).append(`<input type="hidden" name="lang" value="${lang}">`));
  const languageLabel = {en:'Website language',de:'Sprache der Website',hi:'वेबसाइट की भाषा'};
  const allowed = Object.keys(dictionaries).filter(l=>l==='en'||released()||preview||manifest.languages[l].status==='approved');
  const options = Object.entries(manifest.languages).map(([l,m])=>`<option value="${l}"${l===lang?' selected':''}${allowed.includes(l)?'':' disabled'}>${m.label}</option>`).join('');
  const toolbar = `<form class="site-language" method="get"><label for="site-language">${languageLabel[lang]}</label><select id="site-language" name="lang">${options}</select><button type="submit">OK</button></form>`;
  const header = $('#nav,.programme-header').first();
  if (header.length) {
    header.addClass('has-site-language');
    const inner = header.find('.nav-inner').first();
    (inner.length ? inner : header).append(toolbar);
  } else $('body').prepend(toolbar);
  for (const [name,value] of Object.entries(req.query)) {
    if (!['lang','introLang'].includes(name) && typeof value === 'string') $('.site-language').append($('<input>').attr({type:'hidden',name,value}));
  }
  if (preview) {
    const n = `<p class="site-translation-notice" role="note">${notices[lang]}</p>`;
    const main = $('main').first();
    if (main.length) main.prepend(n); else $('body').append(n);
  }
  // Draft dictionaries are never sent by a production response.
  const payload = {lang,records,dictionaries:Object.fromEntries(allowed.map(l=>[l,dictionaries[l]])),labels:languageLabel,notices};
  $('head').append('<link rel="stylesheet" href="/css/site-i18n.css"><script src="/js/site-i18n.js" defer></script>');
  $('script[src="/js/main.js"]').attr('defer','');
  $('body').append(`<script id="site-i18n-data" type="application/json">${JSON.stringify(payload).replace(/</g,'\\u003c')}</script>`);
  if((preview || released()) && req.query.worldDocument!=='1' && /^\/(vision|programmes|audiences|education|national-capability|capability-model|who-we-serve|approach|capability-careers|network|about|privacy)(\/|$|\.)/.test(req.path||'')){
    return require('./spatial-shell').page(req.query,$('main').first().html()||$('body').html(),req.originalUrl);
  }
  return $.html();
}

function install(app) {
  if (app.locals.siteI18nInstalled) return;
  app.locals.siteI18nInstalled = true;
  app.use((req,res,next)=>{
    const send = res.send.bind(res);
    res.send = body => {
      if (typeof body === 'string' && /^<!doctype html>/i.test(body.trim())) {
        if (previewAllowed(req)) res.set('Cache-Control','private, no-store').set('X-Robots-Tag','noindex, nofollow');
        return send(transform(body,req));
      }
      return send(body);
    };
    next();
  });
  app.get(['/privacy','/privacy.html'],(_req,res)=>res.send(fs.readFileSync(path.join(__dirname,'../public/privacy.html'),'utf8')));
}

module.exports = {install,transform,collect,normalize,localHref,languageFor,manifest,dictionaries};
