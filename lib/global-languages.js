const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cheerio = require('cheerio');

const languages = [
 ['en','English','ltr','en'], ['de','Deutsch','ltr','de-DE'], ['hi','हिन्दी','ltr','hi-IN'],
 ['fr','Français','ltr','fr'], ['es','Español','ltr','es'], ['ar','العربية','rtl','ar'],
 ['ja','日本語','ltr','ja-JP'], ['zh-CN','简体中文','ltr','zh-CN'], ['ru','Русский','ltr','ru'],
 ['id','Bahasa Indonesia','ltr','id-ID'], ['el','Ελληνικά','ltr','el-GR'], ['tr','Türkçe','ltr','tr-TR'],
 ['ur','اردو','rtl','ur-PK'], ['th','ไทย','ltr','th-TH'], ['rw','Ikinyarwanda','ltr','rw-RW'],
 ['sw','Kiswahili','ltr','sw-KE']
].map(([code,label,dir,academyCode])=>({code,label,dir,academyCode,existing:['en','de','hi'].includes(code)}));
const root=path.join(__dirname,'../content/languages/v2');
const normalize=s=>s.replace(/\s+/g,' ').trim();
const canonical=value=>languages.find(l=>l.code===value||l.academyCode===value)?.code;
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const opaque=new Set(['id','url','href','external','website','logo','portrait','icon','status','date','verifiedOn','programmes','rooms','sources','references']);

// Translate text, never routing IDs, form contracts, URLs, scripts or markup.
function html(fragment,translate){
 const $=cheerio.load(fragment,{scriptingEnabled:false},/^\s*<!doctype html>/i.test(fragment));
 $('*').each((_i,e)=>{
  if($(e).is('script,style,code,pre')||$(e).parents('script,style,code,pre').length)return;
  for(const node of e.children||[])if(node.type==='text'&&/\p{L}/u.test(node.data)){
   const text=normalize(node.data);node.data=(node.data.match(/^\s*/)?.[0]||'')+translate(text)+(node.data.match(/\s*$/)?.[0]||'');
  }
  for(const key of ['alt','title','placeholder','aria-label'])if(e.attribs?.[key])$(e).attr(key,translate(normalize(e.attribs[key])));
 });
 return $.html();
}
function walk(value,translate,key=''){
 if(opaque.has(key)&&!(key==='programmes'&&typeof value==='string'))return structuredClone(value);
 if(typeof value==='string')return /<\/?[a-z][\w:-]*[\s>]/i.test(value)?html(value,translate):translate(value);
 if(Array.isArray(value))return value.map(v=>walk(v,translate,key));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,walk(v,translate,k)]));
 return value;
}
let sourceCache;
const packCache=new Map();
function stamp(file){
 const stat=fs.statSync(file,{bigint:true});
 return [stat.dev,stat.ino,stat.size,stat.mtimeNs,stat.ctimeNs].join(':');
}
function readStable(file,version){
 const text=fs.readFileSync(file,'utf8');
 // Never publish or cache a snapshot taken across an editor's in-place write.
 if(stamp(file)!==version)throw Error('Language file changed while reading');
 return JSON.parse(text);
}
function source(){
 const file=path.join(root,'source.json'),version=stamp(file);
 if(sourceCache?.version===version)return sourceCache.value;
 const value=readStable(file,version);
 if(typeof value.sourceHash!=='string'||!Array.isArray(value.strings)||!value.strings.every(s=>typeof s==='string'))throw Error('Invalid language source');
 sourceCache={version,value};
 return value;
}
function inspect(code){
 const entry=languages.find(l=>l.code===canonical(code));
 if(!entry)return {available:false,reason:'unknown-language'};
 if(entry.existing)return {...entry,available:true,status:'existing'};
 let s;
 try {s=source();}catch{return {...entry,available:false,status:'invalid-source'};}
 const file=path.join(root,entry.code+'.json');
 let version;
 try {version=stamp(file);}catch{return {...entry,available:false,status:'not-translated',missing:s.strings.length};}
 const cached=packCache.get(entry.code);
 if(cached?.version===version&&cached.source===s&&cached.sourceHash===s.sourceHash)return cached.result;
 let pack;
 try { pack=readStable(file,version);if(!pack||typeof pack!=='object')throw Error('Invalid language package'); }
 catch { return {...entry,available:false,status:'invalid-package',missing:s.strings.length}; }
 const missing=s.strings.filter(text=>typeof pack.translations?.[text]!=='string'||!pack.translations[text].trim());
 const current=pack.sourceHash===s.sourceHash;
 const unsafe=s.strings.filter(text=>typeof pack.translations?.[text]==='string' &&
  (text.startsWith('<style>') ? pack.translations[text]!==text : /<\/?[a-z][\w:-]*[\s>]|javascript:/i.test(pack.translations[text])));
 const result={...entry,available:current&&!missing.length&&!unsafe.length,status:pack.status||'draft',missing:missing.length,unsafe:unsafe.length,current,pack};
 packCache.set(entry.code,{version,source:s,sourceHash:s.sourceHash,result});
 return result;
}
module.exports={languages,canonical,normalize,hash,html,walk,source,inspect,root};
