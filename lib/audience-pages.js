const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = items => `<ul class="offer-topics">${items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
const route = (p, audience, country) => `${p.url}?${new URLSearchParams({audience:audience.id,country})}`;
function priceSummary(data, audience, country) {
  return '<p>Current offers, eligibility and enrolment terms are provided by the Academy platform.</p><a href="https://academy.swex.ai">Explore AIcademy4you</a>';
}

function practiceExample() {
  return `<figure class="practice-example"><figcaption>A practical learning path: your own AI use case</figcaption><ol>
    <li><strong>Understand</strong><span>Describe a task and its limits</span><small>Use-case brief</small></li>
    <li><strong>Guide</strong><span>Test instructions and context</span><small>Instruction system</small></li>
    <li><strong>Verify</strong><span>Check quality against evidence</span><small>Quality checklist</small></li>
    <li><strong>Apply</strong><span>Document a working approach</span><small>Workflow or prototype</small></li>
    </ol><p>An example of the existing learning structure, not a guarantee of a particular project result.</p></figure>`;
}

function offerView(data, audience, offer, country, index) {
  const p = data.programmes.find(p=>p.id===offer.id);
  const academy = p.id==='aicademy';
  const modules = offer.modules.map(id=>data.model.modules.find(m=>m.id===id));
  const topics = academy ? p.topics : modules.flatMap(m=>m.topics.slice(0,2));
  const direct = route(p,audience,country);
  const action = academy ? (audience.id==='business'?'https://business.swex.ai/':audience.id==='academia'?'https://education.swex.ai/':'https://academy.swex.ai/individual') : '/#contact';
  return `<article class="audience-offer${index===0?' featured-offer':''}" id="offer-${p.id}" data-programme="${p.id}">
    <header><p class="cap-kicker">${String(index+1).padStart(2,'0')} / ${esc(p.status)}</p><h2>${esc(p.name)}</h2><p class="offer-intro">${esc(offer.description)}</p></header>
    ${academy ? practiceExample() : ''}
    <div class="offer-columns"><div><h3>${academy?'What you will learn':'Topics to scope together'}</h3>${list(topics)}${academy?`<h3>Learning support</h3>${list(p.features)}`:'<p class="offer-note">A modular scoping outline, not a fixed approved syllabus. Depth and prerequisites are agreed before delivery.</p>'}
    <h3>Practical benefit</h3>${list(p.benefits)}</div>
    <div><h3>${academy?'What you can demonstrate':'Possible practical evidence'}</h3><p>${esc(p.evidence)}</p><dl><dt>Format</dt><dd>${esc(p.delivery)}</dd><dt>Duration</dt><dd>${esc(academy?p.weeks:p.hours)}</dd><dt>Assessment &amp; credentials</dt><dd>${esc(p.credentialType)}. ${esc(academy?p.assessment:p.recognition)}</dd></dl>${academy?`<p class="offer-note">${esc(p.recognition)}</p>`:`<p class="offer-note">${esc(p.availability)}</p>`}</div></div>
    <div class="offer-action"><div><h3>Pricing &amp; next step</h3>${academy?priceSummary(data,audience,country):'<p>No approved public price is listed. Request a scoped offer covering audience, delivery, resources and assessment. An enquiry does not book a course or confirm a pilot.</p>'}</div><div class="offer-buttons"><a class="btn-primary" href="${action}">${academy?'Continue to AIcademy':p.status==='proposed programme'?'Discuss this proposed programme':'Request a scoped offer'}</a><a href="${esc(direct)}">Full ${esc(p.name)} detail</a>${p.id==='teachers'?'<a href="https://roots2.ai/programs/schools/">Roots2AI Schools: formats &amp; enquiries</a>':''}</div></div>
  </article>`;
}

function rootsView() {
  return `<article class="audience-offer roots-offer" id="offer-roots2ai"><p class="cap-kicker">03 / Human-centred orientation</p><h2>Roots2AI</h2><div class="offer-columns"><div><p>Technology changes family life, education and everyday decisions. Roots2AI focuses on human agency: understanding change without handing over judgement, responsibility or learning to a tool.</p><h3>What to explore</h3>${list(['Human judgement and responsible AI use','Dialogue among families, educators and learning communities','A shared understanding of what technology should support'])}</div><div><h3>Practical benefit</h3><p>Develop a clearer basis for conversations and decisions about technology. Roots2AI's existing school work includes AI orientation, educator dialogue and responsible-use principles.</p><p>Current formats, availability and any fees are provided by Roots2AI. No fixed duration or accredited credential is advertised here.</p><a class="btn-primary" href="https://roots2ai.com">Explore Roots2AI</a></div></div></article>`;
}

function governmentOverview() {
  const roles = [['Capability','Agree the outcomes people and institutions need to sustain.'],['Governance','Set responsibility, decision rights and accountability.'],['Institutions','Organise delivery, resources and internal knowledge.'],['Academy','Connect schools, universities and continuing education.'],['Economy','Apply capability in useful work and innovation.'],['Society','Identify needs and evaluate effects on people.']];
  return `<section class="audience-system"><h2>A national programme connects six responsibilities.</h2><p>Objectives shape delivery from the top down. Local needs and experience inform decisions from the bottom up. Education connects the two; it is not an isolated training purchase.</p><ol>${roles.map(([name,text])=>`<li><strong>${name}</strong><span>${text}</span></li>`).join('')}</ol><p>Societal feedback informs the next set of capability objectives. <a href="/capability-model">Explore the complete reciprocal model</a>.</p></section>`;
}

function audienceDetail(data, audience, country = 'IN') {
  const c = data.audiencePages[audience.id];
  const framework = {society:'society',academia:'academic',business:'economic',institutions:'institutional',governments:'national'}[audience.id];
  return `<div class="audience-page">
    <p><a href="/education/swe-${framework}">Explore the integrated ${framework} capability framework: phases, curriculum and outcomes</a></p>
    <nav class="audience-return" aria-label="Audience return paths"><a href="/who-we-serve">All audiences</a><a href="/#capability-model">SWE Capability Model</a></nav>
    <section class="audience-introduction"><p class="cap-kicker">${esc(audience.people)}</p><h2>${esc(c.headline)}</h2><p class="programme-lead">${esc(c.problem)}</p><h3>What SWE provides</h3><p>${esc(c.provides)}</p><div class="audience-actions"><a class="btn-primary" href="${esc(c.action.url)}">${esc(c.action.label)}</a><a href="#offers">Explore the offers below</a></div></section>
    ${audience.id==='governments'?governmentOverview():''}
    <section class="audience-offers" id="offers" aria-label="Relevant programmes and services"><p class="cap-kicker">Your options / ${c.offers.length+(c.roots?1:0)} relevant starting points</p>${c.offers.map((offer,i)=>offerView(data,audience,offer,country,i)).join('')}${c.roots?rootsView():''}</section>
    <section class="audience-progression"><h2>Where this can lead</h2><ol>${c.progression.map((stage,i)=>`<li><span class="stage-number">0${i+1}</span><h3>${esc(stage.title)}</h3><p>${esc(stage.text)}</p>${stage.programme?`<a href="/programmes/${stage.programme}?audience=${audience.id}">${esc(data.programmes.find(p=>p.id===stage.programme).name)}: scope and availability</a>`:''}</li>`).join('')}</ol><p class="pathway-caveat">This is an optional development path, not a mandatory course sequence. Qualified participants may later contribute to SWE, SWEX.AI or Roots2AI as trainers, mentors, project contributors or local coordinators when suitable opportunities exist. Participation does not guarantee employment, income or authorisation.</p><a href="/capability-careers">Capability and professional development pathways</a></section>
    <section class="audience-expertise"><div><p class="cap-kicker">People &amp; delivery experience</p><h2>Expertise behind the approach.</h2><p>${esc(c.expertise)}</p><a href="/#founder">Joerg Molt's experience</a> &middot; <a href="/#cofounder">Angelika Riefling's experience</a></div><figure><div class="expertise-portraits"><img src="/joerg-founder.jpg" alt="Joerg Molt" width="180" height="225" loading="lazy"><img src="/angelika-founder.jpg" alt="Angelika Riefling" width="180" height="225" loading="lazy"></div><figcaption>Joerg Molt / Angelika Riefling<br>Technology education, human agency and programme coordination</figcaption></figure></section>
    <section class="audience-contact"><h2>Start with your own needs.</h2><p>${esc(c.contact)}</p><a class="btn-primary" href="/#contact">Contact Smart World Education</a></section>
    <details class="advanced-exploration"><summary>Explore all programmes or compare capabilities</summary><p>The finder is an optional way to compare programmes. You can also open any programme above directly.</p><nav aria-label="Further programme exploration"><a href="/programmes?audience=${audience.id}">Programme finder for ${esc(audience.name)}</a><a href="/programmes">Complete programme overview</a><a href="/who-we-serve">All audiences</a><a href="/capability-model">Complete capability model</a></nav></details></div>`;
}

module.exports = { audienceDetail };
