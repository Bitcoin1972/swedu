const data=require('./catalogue');
const {allowedAddons}=require('./contract');
const j=require('./journeys');
const i18n=require('./locales');
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const styles=`<style>.ecosystem{max-width:1160px;margin:auto;line-height:1.65;overflow-wrap:anywhere}.ecosystem *{box-sizing:border-box;min-width:0;letter-spacing:0}.ecosystem a{color:inherit;text-underline-offset:4px}.ecosystem a:focus-visible,.ecosystem summary:focus-visible{outline:3px solid #bda55d;outline-offset:5px}.ecosystem h2{font-size:30px}.ecosystem h3{font-size:23px}.ecosystem section{padding:24px 0;border-bottom:1px solid #bda55d55}.edu-languages,.edu-categories,.edu-context{display:flex;gap:16px;flex-wrap:wrap;padding:16px 0}.edu-categories a[aria-current=page],.edu-languages a[aria-current=page]{font-weight:bold;border-bottom:3px solid #bda55d}.edu-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:28px;padding:24px 0;border-top:1px solid #bda55d55}.edu-row h3{margin:0}.edu-lead{font-size:21px;max-width:850px}.edu-status{font-size:14px}.edu-source>summary{padding:16px 0;cursor:pointer}.edu-crosslinks{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;list-style:none;padding:0}.edu-crosslinks li{padding:10px 0;border-bottom:1px solid #bda55d55}@media(max-width:680px){.edu-row,.edu-crosslinks{grid-template-columns:1fr}.ecosystem h2{font-size:27px}.edu-row{gap:8px}}</style>`;
function languages(path,lang,context={}){
  return `<nav class="edu-languages" aria-label="Language">${[['en','English'],['de','Deutsch'],['hi','हिन्दी']].map(([id,label])=>`<a lang="${id}" hreflang="${id}" ${lang===id?'aria-current="page"':''} href="${path}?${esc(new URLSearchParams({...context,lang:id}).toString())}">${label}</a>`).join('')}</nav>`;
}
const productUrl=(p,lang,from)=>j.programmeUrl(p.id,{lang,from});
const categoryName=(c,lang)=>lang==='en'?c.name:i18n.categoryNames[c.id][lang==='de'?0:1];
function productSummary(p,lang){
  return lang==='en'?esc(p.outcomes[0]):p.moduleIds.slice(0,2).map(id=>esc(i18n.summary(data.modules.find(m=>m.id===id),lang))).join(' ');
}
function row(p,lang,from){
  const t=i18n.ui[lang];
  return `<article class="edu-row"><div><h3><a href="${esc(productUrl(p,lang,from))}">${esc(i18n.name(p,lang))}</a></h3><p class="edu-status">${esc(t.draft)}</p></div><div><p>${productSummary(p,lang)}</p><p>${p.moduleIds.map(id=>esc(i18n.topic(data.modules.find(m=>m.id===id),lang))).join(' · ')}</p><a href="${esc(productUrl(p,lang,from))}">${esc(t.curriculum)}</a></div></article>`;
}
function overview(portfolio,{lang='en',category,from}={}){
  lang=j.language(lang);from=j.sweContext(from);const t=i18n.ui[lang],swe=portfolio==='SWE';
  const c=j.categories.find(c=>c.id===category);
  const selected=swe?data.products.filter(p=>p.portfolio==='SWE'):j.categoryProducts(c?.id || 'bootcamps');
  const label=swe?t.sweRole:t.role;
  return `${styles}<div class="ecosystem" lang="${lang}">${languages('/education',lang,{...(c?{category:c.id}:{}),...(from?{from}:{})})}<p class="edu-lead">${esc(label)}</p><p class="edu-status">${esc(t.draft)} · ${data.version}</p>${lang!=='en'?`<p>${esc(t.languageNote)}</p>`:''}
  ${swe?`<section><h2>${lang==='de'?'Ein verbundenes Entwicklungsmodell':lang==='hi'?'एक जुड़ा हुआ विकास मॉडल':'One connected development model'}</h2><p>Capability ↔ Governance ↔ Institutions ↔ Academy ↔ Economy ↔ Society</p><p>${lang==='de'?'Ziele prägen die Umsetzung. Gesellschaftlicher Bedarf und praktische Erfahrungen verändern Institutionen, Governance und zukünftige Ziele.':lang==='hi'?'लक्ष्य क्रियान्वयन को दिशा देते हैं। सामाजिक जरूरतें और व्यावहारिक अनुभव संस्थानों, शासन और भविष्य के लक्ष्यों को बदलते हैं।':'Objectives shape delivery. Societal needs and practical evidence reshape institutions, governance and future capability objectives.'}</p></section>`:
  `<nav class="edu-categories" aria-label="Specialist categories">${j.categories.map(x=>`<a ${x.id===(c?.id || 'bootcamps')?'aria-current="page"':''} href="/education?${esc(new URLSearchParams({category:x.id,lang,...(from?{from}:{})}).toString())}">${esc(categoryName(x,lang))}</a>`).join('')}</nav>`}
  ${from?`<p><a href="${esc(j.programmeUrl(from,{lang,absolute:true}))}">${esc(t.return)}: ${esc(i18n.name(data.products.find(p=>p.id===from),lang))}</a></p>`:''}
  <section><h2>${swe?t.catalogue:categoryName(c || j.categories.find(c=>c.id==='bootcamps'),lang)}</h2>${c?.partner?`<p>${esc(t.partners)}</p>${allowedAddons().map(a=>`<article><h3>${esc(a.name)}</h3><p>${esc(a.proposedScope)}</p></article>`).join('')}`:selected.map(p=>row(p,lang,from)).join('')}</section>
  <section><h2>${esc(t.available)}</h2><p><a href="https://academy.swex.ai/individual">AIcademy4you</a> · <a href="https://education.swex.ai/#student">AIcademy Student</a> · <a href="https://roots2ai.com">Roots2AI</a>${swe?'':` · <a href="/#bootcamp">Knowledge Camp</a>`}</p><a href="/education/catalogues?lang=${lang}">${esc(t.pdf)}</a></section></div>`;
}
function relationships(p,lang,from){
  const t=i18n.ui[lang],swe=p.portfolio==='SWE';
  const moduleProducts=swe?p.moduleIds.map(id=>data.products.find(x=>x.id===`session-${id}`)):[];
  const related=swe?moduleProducts:p.relatedSweIds.map(id=>data.products.find(x=>x.id===id));
  const links=related.map(r=>`<li><a href="${esc(j.programmeUrl(r.id,{lang,from:swe?p.id:undefined,absolute:true}))}">${esc(i18n.name(r,lang))}</a></li>`).join('');
  const roots=p.moduleIds.some(id=>['human-agency','teacher-development','trainers'].includes(id));
  return `<section><h2>${esc(swe?t.modules:t.related)}</h2><ul class="edu-crosslinks">${links}</ul>
    ${p.id==='swe-economic'?`<p><a href="${esc(j.programmeUrl('systems-architecture',{lang,from:p.id,absolute:true}))}">${esc(i18n.name(data.products.find(x=>x.id==='systems-architecture'),lang))}</a></p>`:''}
    ${roots?'<p><a href="https://roots2ai.com">Roots2AI: Human Agency &amp; Education</a></p>':''}
    ${swe?`<h3>AIcademy4you</h3><p>${lang==='de'?'KI verstehen, anleiten, prüfen und anwenden: adaptive Online-Lernaufgaben, praktische Projekte und Feedback. Bestehende Zugangs-, Prüfungs- und Preisbedingungen gelten unverändert.':lang==='hi'?'AI को समझें, निर्देश दें, जाँचें और लागू करें: अनुकूलित ऑनलाइन अभ्यास, व्यावहारिक परियोजनाएँ और प्रतिक्रिया। मौजूदा प्रवेश, मूल्यांकन और मूल्य की शर्तें अपरिवर्तित हैं।':'Understand, guide, verify and apply AI through adaptive online learning, practical activities and feedback. Existing eligibility, assessment and pricing terms remain unchanged.'}</p><p><a href="/programmes/aicademy">AIcademy: ${esc(t.curriculum)} / ${esc(t.assessment)}</a></p><p><a href="https://academy.swex.ai/individual">AIcademy4you: individual learning</a> · <a href="https://education.swex.ai/#student">Student enrolment</a> · <a href="https://education.swex.ai/#institution">Institutional access</a></p>`:''}
    ${!swe && p.nextProductIds.length?`<h3>${esc(t.next)}</h3>${p.nextProductIds.map(id=>`<p><a href="${esc(j.programmeUrl(id,{lang,from}))}">${esc(i18n.name(data.products.find(x=>x.id===id),lang))}</a></p>`).join('')}`:''}</section>`;
}
function detail(p,{lang='en',from}={}){
  lang=j.language(lang);from=j.sweContext(from);const t=i18n.ui[lang];
  const source=require('./views').detail(p);
  const sourceBody=lang==='en'?source:`<p>${esc(t.languageNote)}</p><section><h2>${esc(t.curriculum)}</h2>${p.moduleIds.map(id=>{
    const m=data.modules.find(m=>m.id===id);
    return `<article class="edu-row"><h3>${esc(i18n.topic(m,lang))}</h3><div><p>${esc(i18n.summary(m,lang))}</p><p>${esc(t[m.level])}</p>${m.prerequisiteModuleIds.length?`<p>${esc(t.prerequisites)}: ${m.prerequisiteModuleIds.map(id=>esc(i18n.topic(data.modules.find(m=>m.id===id),lang))).join(', ')}</p>`:''}</div></article>`;
  }).join('')}</section><section><h2>${esc(t.delivery)}</h2><p>${esc(t.pending)}</p><p>${esc(t.safeguards)}</p><h3>${esc(t.assessment)}</h3><p>${esc(t.qualification)}</p></section><details class="edu-source"><summary>${esc(t.source)}</summary><div lang="en">${source}</div></details>`;
  return `${styles}<div class="ecosystem" lang="${lang}">${languages(`/education/${p.id}`,lang,from?{from}:{})}
    <nav class="edu-context" aria-label="Programme context"><a href="/education?${esc(new URLSearchParams({lang,...(from?{from}:{})}).toString())}">${esc(t.catalogue)}</a>${from?`<a href="${esc(j.programmeUrl(from,{lang,absolute:true}))}">${esc(t.return)}</a>`:''}</nav>
    ${lang==='en'?'':`<p class="edu-lead">${productSummary(p,lang)}</p>`}${sourceBody}${relationships(p,lang,from)}
    <p><a href="${p.portfolio==='SWE'?'/#contact':'/#kontakt'}">${esc(t.enquire)}</a></p></div>`;
}
function install(app,{portfolio,page}){
  app.get('/education',(req,res)=>{
    if (portfolio === 'SWE') return res.send(page('Capability Programmes', require('../swe-programme-view').overview(), {lang:'en'}));
    const lang=j.language(req.query.lang),t=i18n.ui[lang];
    res.send(page(portfolio==='SWE'?t.sweTitle:t.swexTitle,overview(portfolio,{lang,category:req.query.category,from:req.query.from}),{lang}));
  });
  app.get('/education/catalogues',(req,res)=>{
    const lang=j.language(req.query.lang),t=i18n.ui[lang];
    res.send(page(t.pdf,`${styles}<div class="ecosystem" lang="${lang}">${languages('/education/catalogues',lang)}<p>${esc(t.noPdf)}</p><a href="https://academy.swex.ai">AIcademy4you</a> · <a href="/education?lang=${lang}">${esc(t.catalogue)}</a></div>`,{lang}));
  });
  app.get('/education/:id',(req,res)=>{
    const p=data.products.find(p=>p.id===req.params.id && p.portfolio===portfolio),lang=j.language(req.query.lang);
    if(!p)return res.status(404).send(page('Programme not found','<a href="/education">Programme catalogue</a>',{lang}));
    if (portfolio === 'SWE') {
      return res.send(page(p.name, '<a href="/education">All capability programmes</a>'+require('../swe-programme-view').render(p), {lang:'en'}));
    }
    res.send(page(i18n.name(p,lang),detail(p,{lang,from:req.query.from}),{lang}));
  });
}
module.exports={install,overview,detail};
