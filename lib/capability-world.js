const model=require('../data/capability-world.json');
const {readCatalogue}=require('./catalogue');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=name=>`<i data-lucide="${name}" aria-hidden="true"></i>`;

function context(query={}){
 const stage=/^[0-8]$/.test(String(query.stage))?Number(query.stage):0;
 return {stage,perspective:model.perspectives.some(p=>p.id===query.perspective)?query.perspective:'citizen',zone:model.academyZones.some(z=>z.id===query.zone)?query.zone:'student',scenario:/^[01]{3}$/.test(query.scenario)?query.scenario:'111',lang:['en','de','hi'].includes(query.lang)?query.lang:'en',focus:model.phaseOrder.includes(query.focus)?query.focus:model.stagePhases[stage]};
}
function href(path,c,extra={}){const url=new URL(path,'https://www.swedu.me');url.search=new URLSearchParams({...c,...extra}).toString();return url.pathname+url.search+url.hash;}
function programmeLinks(ids,c){
 const catalogue=readCatalogue();
 return ids.map(id=>{const p=catalogue.programmes.find(p=>p.id===id);if(!p)throw Error('Unknown world programme: '+id);return `<li><a data-world-context href="${esc(href(p.url,c))}">${esc(p.name)}</a><small>${esc(p.status)}</small></li>`;}).join('');
}
function panel(phase,perspective,c){
 const p=model.perspectives.find(p=>p.id===perspective),d=model.phases[phase],i=model.phaseOrder.indexOf(phase);
 const ids=[...new Set([...p.programmes.filter(id=>d.programmes.includes(id)),...d.programmes])].slice(0,3);
 return `<div class="world-lens-copy" lang="en"><p class="world-eyebrow">${esc(p.name)}</p><h3>Your part in this same story</h3><p>${esc(p.contributions[i])}</p><p class="world-role">${esc(p.role)}</p><details${perspective==='government'?' open':''}><summary>Decision, responsibility & prerequisites</summary><dl><dt>Decision point</dt><dd>${esc(d.decision)}</dd><dt>Accountable people</dt><dd>${esc(d.owner)}</dd><dt>What you need</dt><dd>${esc(p.needs)}</dd><dt>Prerequisites</dt><dd>${esc(d.prerequisites)}</dd></dl></details><details open><summary>How the levels depend on each other</summary><p>${esc(d.depends)}</p><dl><dt>Top-down: support & responsibility</dt><dd>${esc(d.down)}</dd><dt>Bottom-up: experience & correction</dt><dd>${esc(d.up)}</dd></dl></details><details><summary>Intended result, not verified evidence</summary><p>${esc(d.evidence)}</p><p>This case has no measured project results. No water savings, jobs, certification or funding are promised.</p></details><h3>Relevant programme paths</h3><ul class="world-programmes">${programmeLinks(ids,c)}</ul><a data-world-context class="world-next" href="${esc(href('/audiences/'+p.audience,c))}">${esc(p.action)} ${icon('arrow-right')}</a></div>`;
}
function story(phase,lang){const source=require(`../content/independent-capability/v1/journey.${lang}.json`);const s=source.stages.find(s=>s.id===phase);const label={en:'Read this part of the shared story',de:'Diesen Teil der gemeinsamen Geschichte lesen',hi:'साझा कहानी का यह भाग पढ़ें'};return `<div class="world-story-copy" lang="${lang}"><h3>${esc(s.title)}</h3><details><summary>${label[lang]}</summary><p>${esc(s.body)}</p><h4>${esc(source.outcome)}</h4><p>${esc(s.outcome)}</p><p>${esc(s.feedback)}</p></details></div>`;}
function toolbar(c,room=false){
 return `<div class="world-toolbar" translate="no" lang="en"><form method="get" class="world-perspective-form"><label for="world-perspective">Change perspective</label><select id="world-perspective" name="perspective">${model.perspectives.map(p=>`<option value="${p.id}"${p.id===c.perspective?' selected':''}>${esc(p.name)}</option>`).join('')}</select>${Object.entries(c).filter(([k])=>k!=='perspective'&&k!=='lang').map(([k,v])=>`<input type="hidden" name="${k}" value="${esc(v)}">`).join('')}<button class="world-apply" type="submit">Apply</button></form><span class="world-case-label">Illustrative case · Water & local learning</span><button type="button" data-world-present hidden>${icon('presentation')}<span>Presentation view</span></button>${room?`<a data-world-context href="${esc(href('/',c,{skipIntro:'1'}))}#hero">${icon('map')}Back to Capability World</a>`:`<a data-world-room href="${esc(href('/world/academy',c))}">${icon('door-open')}Enter Academy</a>`}</div>`;
}
function perspectivePanel(c){return `<section class="world-perspective-panel" translate="no" aria-label="Shared case and selected perspective"><p class="world-evidence-label" lang="en">Illustrative scenario · Not a verified project</p><div id="world-story">${story(c.focus,c.lang)}</div><div id="world-lens">${panel(c.focus,c.perspective,c)}</div></section>`;}
function dependencies(c){return `<section class="world-dependencies" translate="no" lang="en" aria-labelledby="world-dependency-title"><div><p class="world-eyebrow">Same case · Different conditions</p><h2 id="world-dependency-title">What changes elsewhere?</h2><p>Change an illustrative assumption. The consequences are qualitative teaching examples, not predictions or measured results.</p></div><div class="world-assumptions">${model.assumptions.map((a,i)=>`<label><input type="checkbox" data-world-assumption="${i}"${c.scenario[i]==='1'?' checked':''}>${esc(a.label)}</label>`).join('')}<button type="button" data-world-reset hidden>Reset assumptions</button></div><div class="world-effects" aria-live="polite">${model.assumptions.map((a,i)=>`<article data-world-effect="${i}"><h3>${esc(a.label)}</h3><p>${esc(a[c.scenario[i]==='1'?'yes':'no'])}</p><nav aria-label="Affected levels">${a.affects.map(phase=>`<a href="${esc(href('/capability-model',c,{layer:phase}))}" data-world-focus="${phase}">${esc(phase)}</a>`).join('')}</nav></article>`).join('')}</div><div class="world-phase-nav" aria-label="Follow the shared case">${model.phaseOrder.map((phase,i)=>`<a href="${esc(href('/vision',c))}#story-${phase}" data-world-focus="${phase}">${String(i+1).padStart(2,'0')} ${esc(phase)}</a>`).join('')}</div></section>`;}
function payload(c,room){
 const panels=Object.fromEntries(model.phaseOrder.map(phase=>[phase,Object.fromEntries(model.perspectives.map(p=>[p.id,panel(phase,p.id,c)]))]));
 const stories=Object.fromEntries(['en','de','hi'].map(lang=>[lang,Object.fromEntries(model.phaseOrder.map(phase=>[phase,story(phase,lang)]))]));
 return `<script type="application/json" id="world-data">${JSON.stringify({context:c,room,stagePhases:model.stagePhases,phaseOrder:model.phaseOrder,panels,stories,assumptions:model.assumptions}).replace(/</g,'\\u003c')}</script>`;
}
function zonePanel(z,c){
 const catalogue=readCatalogue();
 return `<article id="zone-${z.id}" data-room-panel="${z.id}"><p class="world-eyebrow">Academy · Knowledge zone</p><h2>${esc(z.name)}</h2><p>${esc(z.meaning)}</p><h3>Why it matters here</h3><p>${esc(z.why)}</p><h3>Topics from the SWE catalogue</h3>${z.modules.map(id=>{const m=catalogue.model.modules.find(m=>m.id===id);return `<details><summary>${esc(m.title)}</summary><ul>${m.topics.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></details>`;}).join('')}<h3>Possible evidence of learning</h3><p>${esc(z.outcome)}</p><p class="world-evidence-label">Intended output, not a verified result or an accreditation claim.</p><h3>Open programme details</h3><ul class="world-programmes">${programmeLinks(z.programmes,c)}</ul><a href="${esc(z.external)}">${esc(z.externalName)} ${icon('arrow-up-right')}</a><p>${esc(z.next)}</p><a data-world-context href="${esc(href('/#contact',c))}">Discuss this learning need</a></article>`;
}
function room(query){
 const c=context(query);
 return spatialRoom({id:'academy',name:'Academy',headline:'Where curiosity becomes capability.',description:'One learning environment. Four connected knowledge zones.',image:'/images/academy-room.jpg',alt:'Illustrated academy library with a study desk, teaching circle, curriculum wall and water-project research bench.',zones:model.academyZones},c);
}
function spatialRoom(definition,c){
 return `<section class="capability-room" id="room-top" data-room="${esc(definition.id)}" translate="no" lang="en">
 ${toolbar(c,true)}
 <header class="room-heading"><p class="world-eyebrow">SWE Capability World / ${esc(definition.name)}</p><h1>${esc(definition.headline)}</h1><p>${esc(definition.description)}</p></header>
 <div class="room-layout"><div class="room-environment">
 <img src="${esc(definition.image)}" alt="${esc(definition.alt)}" width="1672" height="941"><canvas class="room-canvas" aria-hidden="true"></canvas>
 <nav class="room-zones" aria-label="${esc(definition.name)} learning zones">${definition.zones.map(z=>`<a href="#zone-${z.id}" data-room-zone="${z.id}" style="--x:${z.x}%;--y:${z.y}%">${icon(z.icon)}<span>${esc(z.name)}</span></a>`).join('')}</nav></div>
 <aside class="room-information" aria-label="Selected learning zone">${definition.zones.map(z=>zonePanel(z,c)).join('')}<a href="#room-top" data-room-return>${icon('arrow-left')}Return to current room</a></aside></div>
 <section class="room-case" id="room-case"><h2>The same learner, seen from your perspective</h2><p>The board location stays at stage <span data-world-stage-label>${c.stage+1}</span> / 9. Exploring a room does not rewrite the learner's story.</p>${perspectivePanel(c)}</section>
 ${dependencies(c)}${payload(c,true)}</section>`;
}
function assets(){return '<link rel="stylesheet" href="/css/capability-world.css"><script src="/board-vendor/lucide.js" defer></script><script src="/js/capability-world.js" defer></script><script type="module" src="/js/spatial-room.js"></script>';}
module.exports={model,context,href,toolbar,perspectivePanel,dependencies,payload,room,assets,panel,story};
