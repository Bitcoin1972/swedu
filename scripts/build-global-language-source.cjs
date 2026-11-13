const fs=require('node:fs');
const path=require('node:path');
const cheerio=require('cheerio');
const global=require('../lib/global-languages');
const strings=new Set();
const add=text=>{if(typeof text==='string'&&/\p{L}/u.test(text)&&!/^https?:|^\/|^[\w.-]+@[\w.-]+$/.test(text))strings.add(global.normalize(text));return text;};
Object.keys(require('../lib/site-i18n').dictionaries.de).forEach(add);
const $=cheerio.load(require('../lib/spatial-shell').page({lang:'en'}));
const payload=JSON.parse($('#sp-data').text());
global.walk(payload.versions.en,add);
global.walk(payload.partners.copy.en,add);
for(const r of payload.partners.records){add(r.name);add(r.description.en);for(const k of ['type','relationship','benefit'])add(r.editorial[k].en);}
$('#sp-data').remove();global.html($.html(),add);
for(const s of ['Play Intro','Tap to start the video','Privacy','Replay intro','Your message was accepted by our mail service.','Delivery could not be confirmed. Please email info@swedu.info.','Contact Smart World Education'])add(s);
const destination=path.join(global.root,'source.json');
const previous=fs.existsSync(destination)?JSON.parse(fs.readFileSync(destination,'utf8')):null;
// Retain legacy technical keys so a parser improvement does not invalidate completed packs.
for(const s of previous?.strings||[])if(s.startsWith('<style>'))strings.add(s);
const list=[...strings].sort(),sourceHash=global.hash(JSON.stringify(list));
if(previous&&previous.sourceHash!==sourceHash&&!process.argv.includes('--replace-source'))throw Error('Public source changed. Review the delta and use --replace-source only when updating all locale packs.');
fs.mkdirSync(global.root,{recursive:true});
if(!previous||previous.sourceHash!==sourceHash)fs.writeFileSync(destination,JSON.stringify({version:2,sourceHash,sourceLanguage:'en',academySource:'https://academy.swex.ai/individual',verifiedOn:'2026-11-13',languages:global.languages,strings:list},null,2)+'\n');
console.log(JSON.stringify({strings:list.length,words:list.join(' ').split(/\s+/).length,sourceHash}));
