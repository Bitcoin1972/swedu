const fs = require('node:fs');
const path = require('node:path');
const { navigation } = require('./site-navigation');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = (url, text) => `<a href="${esc(url)}">${esc(text)} <span aria-hidden="true">&rarr;</span></a>`;
const programmes = (data, ids) => ids.map(id => data.programmes.find(p => p.id === id)).filter(Boolean);
const query = values => new URLSearchParams(Object.entries(values).filter(([,v]) => v)).toString();

function modelView(data, selected = '') {
  const { layers, audiences, capabilities } = data.model;
  const active = layers.find(layer => layer.id === selected);
  return `<section class="cap-model" id="capability-model" aria-labelledby="model-title">
    <div class="cap-heading"><p class="cap-kicker">01 / The SWE Capability Model</p><h2 id="model-title">One system.<br><em>Two directions of change.</em></h2><p>Strategic objectives shape education and opportunity. People's needs, experience and ideas shape the strategy in return.</p></div>
    <div class="model-layout" data-model>
      <div class="model-system"><div class="direction-legend"><span class="direction-down">&darr; Objectives into practice</span><span class="direction-up">Needs into direction &uarr;</span></div>
      <ol class="layer-stack" aria-label="Six connected capability layers">${layers.map((l,i) => `<li><a class="layer-link" href="/capability-model?layer=${l.id}#capability-model" data-layer="${l.id}" aria-controls="layer-${l.id}"${active?.id === l.id ? ' aria-current="true"' : ''}><span class="layer-index">0${i+1}</span><span>${esc(l.name)}</span><span class="layer-symbol" aria-hidden="true">&nearr;</span></a></li>`).join('')}</ol>
      <p class="model-loop">Societal experience returns to future capability objectives.</p></div>
      <div class="model-reading" aria-label="Capability model explanations">
        <div class="model-overview"${active ? ' hidden' : ''}><p class="cap-kicker">Reciprocal development</p><h3>Education connects<br>people and systems.</h3><p>Capability is the ability to apply, adapt, teach and sustain knowledge. Governance establishes responsibility; institutions organise delivery; Academy includes schools, universities and lifelong learning.</p><p>The economy applies that learning. Society supplies the needs and experience that keep every layer relevant.</p><p class="model-note">The layers are connected responsibilities, not a ranking of people or a one-way administrative hierarchy.</p>${link('/#audience-pathways','Find your starting point')}</div>
        ${layers.map(l => `<details id="layer-${l.id}" class="layer-detail"${active?.id === l.id ? ' open' : ''}><summary>${esc(l.name)}: role and connections</summary><div><p class="cap-kicker">${esc(l.name)}</p><h3>${esc(l.role)}</h3><dl class="reciprocal-copy"><dt>&darr; Top-down</dt><dd>${esc(l.down)}</dd><dt>&uarr; Bottom-up</dt><dd>${esc(l.up)}</dd></dl><h4>People &amp; organisations</h4><ul class="inline-links">${l.audiences.map(id => `<li>${link('/audiences/'+id,audiences.find(a=>a.id===id).name)}</li>`).join('')}</ul><h4>Connected capabilities</h4><ul class="inline-links">${l.capabilities.map(id => `<li>${link('/programmes?capability='+id,capabilities.find(c=>c.id===id).name)}</li>`).join('')}</ul><h4>Programme paths</h4><ul class="inline-links">${programmes(data,l.programmes).map(p=>`<li>${link(p.url,p.name)}</li>`).join('')}</ul><a href="?#capability-model" data-model-reset>Back to the complete model</a></div></details>`).join('')}
      </div>
    </div>
  </section>`;
}

function audienceView(data) {
  return `<section class="audience-pathways" id="audience-pathways"><p class="cap-kicker">02 / Start with people</p><h2>Where do you fit?</h2><p>Begin with your needs. Each pathway connects audiences, capabilities and relevant programmes.</p><ol class="audience-list">${data.model.audiences.map((a,i)=>`<li><a href="/audiences/${a.id}"><span class="audience-number">0${i+1}</span><span><strong>${esc(a.name)}</strong><small>${esc(a.people)}</small></span><span class="audience-need">${esc(a.need)}</span><span aria-hidden="true">&nearr;</span></a></li>`).join('')}</ol></section>`;
}

function progressionView(data) {
  return `<section class="progression-section" id="progression"><p class="cap-kicker">03 / Capability grows through practice</p><h2>From understanding<br>to independent capability.</h2><p>A possible development pathway, not a mandatory course sequence. Experience, assessment and actual opportunities determine the next step.</p><ol class="progression-list">${data.model.progression.map((s,i)=>`<li id="stage-${s.id}"><span class="stage-number">0${i+1}</span><h3>${esc(s.name)}</h3><p>${esc(s.evidence)}</p><details><summary>Contributors &amp; programme paths</summary><p>${esc(s.contributors)}</p><ul>${programmes(data,s.programmes).map(p=>`<li>${link(p.url,p.name)}</li>`).join('')}</ul></details></li>`).join('')}</ol><p class="pathway-caveat">Qualified participants may contribute to SWE, SWEX.AI or Roots2AI as trainers, mentors, project contributors or local coordinators when suitable opportunities exist. Learning does not guarantee employment, income, contracts or trainer authorisation.</p>${link('/national-capability','Connect local pathways at national level')}</section>`;
}

function discovery(data, filters = {}) {
  const audience = data.model.audiences.find(a=>a.id===filters.audience);
  const capability = data.model.capabilities.find(c=>c.id===filters.capability);
  const matches = data.programmes.filter(p=>(!audience || p.audiences.includes(audience.id)) && (!capability || p.capabilityIds.includes(capability.id)));
  return `<div class="discovery" id="discovery"><ol class="journey-breadcrumb" aria-label="Programme discovery steps"><li>Audience</li><li>Capability</li><li>Programme</li><li>Format</li><li>Outcomes</li><li>Pricing / enquiry</li></ol>
    <p class="programme-lead">${audience ? esc(audience.need) : 'Find a programme through the capability you need to develop.'}</p>
    <form class="discovery-form" method="get" action="/programmes"><div><label for="audience-filter">Your audience</label><select name="audience" id="audience-filter"><option value="">All audiences</option>${data.model.audiences.map(a=>`<option value="${a.id}"${a.id===audience?.id?' selected':''}>${esc(a.name)}</option>`).join('')}</select></div><div><label for="capability-filter">Capability</label><select name="capability" id="capability-filter"><option value="">All capabilities</option>${data.model.capabilities.map(c=>`<option value="${c.id}"${c.id===capability?.id?' selected':''}>${esc(c.name)}</option>`).join('')}</select></div><button type="submit">Find programmes</button><a href="/programmes">Reset</a></form>
    ${capability?`<p class="selected-need">${esc(capability.question)}</p>`:''}<p class="result-count" role="status">${matches.length} programme ${matches.length===1?'path':'paths'}${audience?' for '+esc(audience.name):''}${capability?' / '+esc(capability.name):''}</p>
    ${!matches.length?'<p>No programme matches this combination. Choose another capability or <a href="/#contact">discuss a tailored scope</a>.</p>':''}
    <div class="programme-results">${matches.map(p=>`<article class="programme-result"><div><p class="programme-status">${esc(p.status)}</p><h2>${link(p.url+'?'+query({audience:audience?.id,capability:capability?.id}),p.name)}</h2><p>${esc(p.need)}</p><ul class="capability-tags">${p.capabilityIds.map(id=>`<li>${link('/programmes?'+query({audience:audience?.id,capability:id}),data.model.capabilities.find(c=>c.id===id).name)}</li>`).join('')}</ul></div><dl><dt>Format</dt><dd>${esc(p.delivery)}</dd><dt>Demonstrable outcome</dt><dd>${esc(p.outcome)}</dd><dt>Next step</dt><dd>${link(p.url+'#pricing',p.id==='aicademy'?'Verified country offers & enrolment':'Scope, fees & enquiry')}</dd></dl></article>`).join('')}</div>
    <details class="status-key"><summary>Availability and programme status</summary><p>Existing capability describes demonstrated experience. Available services can be scoped now by enquiry. Proposed programmes are structured formats still in development; no upcoming pilot is confirmed. These are distinct from AIcademy's existing online learning product.</p></details></div>`;
}

function audienceDetail(data, audience) {
  const feature = data.programmes.find(p=>p.id===audience.featured);
  return `<a href="/#capability-model">The complete capability model</a><p class="cap-kicker">${esc(audience.people)}</p><p class="programme-lead">${esc(audience.need)}</p>
    <section class="audience-feature"><p class="cap-kicker">A relevant starting point / ${esc(feature.status)}</p><h2>${esc(feature.name)}</h2><p>${esc(feature.description)}</p>${link(feature.url+'?audience='+audience.id,'Benefits, outcomes & next steps')}${audience.id==='society'?'<p>For family learning and human-centred orientation, also explore <a href="https://roots2ai.com">Roots2AI</a>.</p>':''}</section>
    <section><h2>What capability do you need?</h2><ul class="capability-map">${audience.capabilities.map(id=>{const c=data.model.capabilities.find(c=>c.id===id);return `<li><a href="/programmes?${esc(query({audience:audience.id,capability:id}))}"><strong>${esc(c.name)}</strong><span>${esc(c.question)}</span><span aria-hidden="true">&rarr;</span></a></li>`;}).join('')}</ul></section>
    ${audience.id!=='society'?`<section><h2>AIcademy across audiences</h2><p>The existing AIcademy product also supports relevant individual, student, institutional, business and government access paths. Eligibility and commercial terms are confirmed on the original platform.</p>${link('/programmes/aicademy?audience='+audience.id,'Explore AIcademy4you')}</section>`:''}
    ${audience.id==='governments'?`<section><h2>From public objectives to local capability</h2><p>Governance sets decision rights and accountability; institutions provide delivery capacity; Academy develops learning; the economy provides practical application; society provides needs and feedback. A national programme coordinates these relationships, rather than treating education as a standalone intervention.</p>${link('/national-capability','Explore the institutional development model')}</section>`:''}
    <p>${link('/programmes?audience='+audience.id,'All programmes for this audience')}</p>${progressionView(data)}`;
}

function programmeConnections(p, data) {
  return `<section class="programme-context"><h2>The need this programme addresses</h2><p>${esc(p.need)}</p><h3>Who is this for?</h3><ul class="inline-links">${p.audiences.map(id=>`<li>${link('/audiences/'+id,data.model.audiences.find(a=>a.id===id).name)}</li>`).join('')}</ul><h3>Capabilities developed</h3><ul class="inline-links">${p.capabilityIds.map(id=>`<li>${link('/programmes?capability='+id,data.model.capabilities.find(c=>c.id===id).name)}</li>`).join('')}</ul></section>
    <section id="curriculum"><h2>Topics, modules &amp; practical work</h2><p>${p.id==='aicademy'?'The four existing AIcademy learning areas are summarised below; its own platform determines the current course content.':'The following modular outline is a basis for scoping, not an approved fixed syllabus. SWE agrees depth, prerequisites, delivery resources and assessment with each cohort. Modules can contribute to more than one programme.'}</p><div class="module-list">${p.modules.map(id=>{const m=data.model.modules.find(m=>m.id===id);return `<details><summary>${esc(m.title)}</summary><ul>${m.topics.map(t=>`<li>${esc(t)}</li>`).join('')}</ul><p><strong>Possible evidence:</strong> ${esc(m.evidence)}</p><p class="module-reuse">Also connects to: ${programmes(data,data.programmes.filter(other=>other.id!==p.id&&other.modules.includes(id)).map(other=>other.id)).map(other=>link(other.url,other.name)).join(' &middot; ')||'a programme-specific scope'}</p></details>`;}).join('')}</div></section>
    <section><h2>Expertise &amp; delivery basis</h2><p>${esc(p.capability)}. ${esc(p.availability)}</p>${link(p.evidenceSource,'Existing experience or product source')}</section>`;
}

function nextSteps(p, data) {
  return `<section id="next-step"><h2>Your next possible step</h2><p>${esc(p.careers)}</p><ul class="inline-links">${programmes(data,p.next).map(other=>`<li>${link(other.url,other.name)}</li>`).join('')}</ul><p>${link('/capability-careers','See the complete capability progression')}</p></section>`;
}

function home(data, selected) {
  const template = fs.readFileSync(path.join(__dirname,'../public/index.html'),'utf8');
  const start = template.indexOf('  <!-- HERO -->');
  const end = template.indexOf('  <!-- FOUNDER -->');
  if(start<0||end<start) throw new Error('Homepage section boundaries missing');
  const opening = `<section class="cap-intro" id="hero"><div class="cap-wrap"><img src="/logo_transparent.png" alt="" width="100" height="100"><p class="cap-kicker">Education / Technology / Human agency</p><h1>Smart World Education</h1><p class="intro-statement">From education to independent capability.</p><p>We connect learning, practical technology and local teaching capacity with the institutions and governance that help people shape their future.</p></div></section><div class="cap-wrap">${modelView(data,selected)}${audienceView(data)}${progressionView(data)}<section id="mission" class="ecosystem-band"><p class="cap-kicker">Different contributions. Shared purpose.</p><h2>One connected education ecosystem.</h2><div class="ecosystem-list"><article><h3>Roots2AI</h3><p>Human agency, families and educator practice.</p>${link('https://roots2ai.com','Roots2AI')}${link('https://roots2.ai/programs/schools/','Schools')}</article><article><h3>AIcademy4you</h3><p>Accessible digital AI learning with practical evidence.</p>${link('/programmes/aicademy','Learning & enrolment')}</article><article><h3>SWEX.AI</h3><p>Applied technology and systems expertise.</p>${link('https://swex.ai','SWEX.AI')}</article></div></section><section class="legacy-connections"><div id="fields"><h2>Capabilities, connected.</h2><p>AI, security, systems, governance and educator development are shared across audiences.</p>${link('/programmes','Explore capabilities & programmes')}</div><div id="hubs"><h2>Local ownership. Wider reach.</h2><p>National Capability brings locally grounded education and trainer pathways into an institutional development programme.</p>${link('/national-capability','Local & National Capability')}</div><div id="partners"><h2>Experience &amp; people.</h2><p>SWE's international work and the people behind the initiative.</p>${link('/network','Global network')}</div></section></div>`;
  let html = template.slice(0,start)+opening+template.slice(end);
  html = html.replace('<link rel="stylesheet" href="/css/programmes.css">','<link rel="stylesheet" href="/css/programmes.css"><link rel="stylesheet" href="/css/capability.css"><script src="/js/capability-model.js" defer></script>');
  html = html.replace(/<a class="partner-access"[\s\S]*?<\/details>/,navigation());
  html = html.replace('<body>','<body class="capability-home">');
  // Keep the intro available on demand without delaying the visitor's first journey.
  html = html.replace('<div id="introOverlay">','<div id="introOverlay" hidden>');
  html = html.replace(/  <!-- FOR WHOM -->[\s\S]*?  <!-- CONTACT -->/,'  <!-- CONTACT -->');
  return html;
}

module.exports = { modelView, audienceView, progressionView, discovery, audienceDetail, programmeConnections, nextSteps, home };
