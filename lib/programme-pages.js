const { readCatalogue } = require('./catalogue');
const { navigation } = require('./site-navigation');
const capabilityViews = require('./capability-views');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const list = items => `<ul class="programme-list">${items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
const section = (title, body) => `<section><h2>${title}</h2>${body}</section>`;
const enquire = '<p><a href="/#contact">Discuss your programme with SWE</a></p>';

function page(title, body, options = {}) {
  const data = readCatalogue();
  if (title === 'Who We Serve') body = capabilityViews.audienceView(data);
  if (title === 'Our Approach') body = capabilityViews.modelView(data) + body;
  if (title === 'Capability & Careers') body = capabilityViews.progressionView(data) + body;
  if (title === 'Local & National Capability') body = capabilityViews.modelView(data) + body;
  const lang = ['en','de','hi'].includes(options.lang) ? options.lang : 'en';
  return basePage(title, body).replace('<html lang="en">', `<html lang="${lang}">`).replace('</head>', '<link rel="stylesheet" href="/css/capability.css"><link rel="stylesheet" href="/css/audience.css"><link rel="stylesheet" href="/css/learning.css"><script src="/js/capability-model.js" defer></script></head>');
}

function basePage(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escape(title)}: education, practical learning and independent capability with Smart World Education."><title>${escape(title)} | Smart World Education</title><link rel="icon" href="/favicon.svg"><link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet"><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="/css/programmes.css"></head><body><a class="skip-content" href="#main">Skip to content</a><header class="programme-header"><a class="nav-logo" href="/"><img src="/logo.png" alt="" width="48" height="48"><span>Smart World Education</span></a>${navigation()}</header><main id="main" class="programme-main"><h1>${escape(title)}</h1>${body}</main><footer class="programme-footer"><a href="/">Smart World Education</a><a href="/partners">Partner Login</a><a href="/privacy">Privacy Policy</a><a href="/#imprint">Imprint</a><a href="mailto:info@swedu.info">info@swedu.info</a></footer><script src="/js/site-menu.js" defer></script></body></html>`;
}

const ecosystem = `<div class="ecosystem-list"><article><h3>Roots2AI</h3><p>Human agency, critical thinking, pedagogy and responsible AI use for educators, families and learning environments.</p><a href="https://roots2ai.com">Explore Roots2AI</a></article><article><h3>AIcademy4you</h3><p>A standalone learning product: understand, guide, verify and apply AI through practical activities.</p><a href="/programmes/aicademy">Explore AIcademy4you</a></article><article><h3>SWEX.AI</h3><p>The technology contribution: applied AI, software, digital systems, blockchain, IoT, cybersecurity and governance.</p><a href="https://www.swex.ai">Explore SWEX.AI</a></article></div>`;
const stages = [
  ['Readiness','Agree local needs, languages, infrastructure, partners and a baseline.'],
  ['Education','Develop technological understanding alongside critical judgement and human agency.'],
  ['Practical Application','Apply learning in locally relevant, reviewable projects.'],
  ['Qualification','Assess demonstrated competence against agreed programme requirements.'],
  ['Local Trainers','Develop supervised teaching and local assessment capacity.'],
  ['Professional Opportunities','Connect qualified people with potential projects and delivery needs.'],
  ['Independent Local Capability','Enable people and institutions to apply, develop, teach and sustain capability locally.']
];

function installProgrammePages(app) {
  require('./education/views').install(app, {portfolio:'SWE',page});
  app.get(['/', '/index.html'], (req,res) => res.send(capabilityViews.home(readCatalogue(),req.query.layer)));
  app.get('/capability-model', (req,res) => {
    const data = readCatalogue();
    res.send(page('The SWE Capability Model', capabilityViews.modelView(data,req.query.layer)+capabilityViews.audienceView(data)));
  });
  app.get('/audiences/:id', (req,res) => {
    const data = readCatalogue();
    const audience = data.model.audiences.find(a=>a.id===req.params.id);
    if (!audience) return res.status(404).send(page('Audience not found','<a href="/who-we-serve">Explore audience pathways</a>'));
    const country = typeof req.query.country === 'string' ? req.query.country.toUpperCase() : 'IN';
    res.set('Cache-Control','no-cache').send(page(audience.name,capabilityViews.audienceDetail(data,audience,country)));
  });
  app.get('/programmes', (req,res) => {
    const data = readCatalogue();
    res.set('Cache-Control','no-cache').send(page('Find Your Programme',capabilityViews.discovery(data,req.query)));
  });
  app.get('/programmes/:id', (req,res) => {
    const data = readCatalogue();
    const programme = data.programmes.find(p => p.id === req.params.id);
    if (!programme) return res.status(404).send(page('Programme not found','<p><a href="/programmes">View all programmes</a></p>'));
    const country = typeof req.query.country === 'string' ? req.query.country.toUpperCase() : 'IN';
    const audience = data.model.audiences.find(a=>a.id===req.query.audience);
    const capability = data.model.capabilities.find(c=>c.id===req.query.capability && programme.capabilityIds.includes(c.id));
    const context = {...(audience?{audience:audience.id}:{}),...(capability?{capability:capability.id}:{})};
    const returns = `<nav class="audience-return" aria-label="Programme return paths">${audience?`<a href="/audiences/${audience.id}?country=${encodeURIComponent(country)}">Back to ${escape(audience.name)}</a>`:''}<a href="/capability-model">SWE Capability Model</a>${Object.keys(context).length?`<a href="/programmes?${escape(new URLSearchParams(context).toString())}">Back to your programme selection</a>`:''}</nav>`;
    res.set('Cache-Control','no-cache').send(page(programme.name,returns+'<a href="/programmes">All programmes</a>'+require('./swe-programme-view').render(programme)));
  });
  app.get('/approach', (_req,res) => res.send(page('Our Approach',`<p class="programme-lead">From Education to Independent Capability.</p>${section('Human agency. Practical capability.', '<p>Smart World Education brings education, human judgement and technological understanding together. The aim is not simply to use a tool, but to make informed decisions, build useful outcomes and develop the ability to teach and sustain that knowledge locally.</p><p>Building human infrastructure for the digital age means connecting learning with people, institutions and practical opportunities.</p>')}${section('One ecosystem, distinct contributions',ecosystem)}${section('Learn. Build. Teach. Work. Lead.',list(['Learn the foundations and question assumptions.','Build practical evidence through projects and evaluation.','Teach others through supervised practice and local knowledge transfer.','Work towards potential professional applications, subject to competence and opportunity.','Lead responsible, locally sustainable capability development.']))}${enquire}`)));
  app.get('/who-we-serve', (_req,res) => res.send(page('Who We Serve',`<p class="programme-lead">Different starting points. A shared path towards capability.</p>${[
    ['Individuals & students','Explore AIcademy learning and its individual or verified-student access paths.','/programmes/aicademy','Explore AIcademy4you'],
    ['Universities & schools','Explore existing educator support through Roots2AI or discuss a tailored SWE pilot. Agree learner needs, teaching capacity, safeguarding, assessment and resources before delivery.','/programmes/teachers','Explore teacher development'],
    ['Businesses & professionals','Connect learning to workplace use cases, technical projects and responsible implementation.','/programmes/architecture','Explore systems architecture'],
    ['Families & educators','Develop critical judgement and a human-centred understanding of digital change.','https://roots2ai.com','Explore Roots2AI'],
    ['Public institutions & national partners','Start with readiness and local needs, then consider measurable pilots and trainer capacity.','/national-capability','Explore the capability model']
  ].map(([title,text,url,label]) => section(title,`<p>${text}</p><a href="${url}">${label}</a>`)).join('')}${section('Explore an institutional pilot','<p>Tell us your country, audience, learning goals, preferred delivery format and approximate cohort size. SWE will discuss feasibility, prerequisites and the next scoping step. No pilot is confirmed by submitting an enquiry.</p>'+enquire)}`)));
  app.get('/capability-careers', (_req,res) => res.send(page('Capability & Careers',`<p class="programme-lead">Make capability demonstrable.</p>${section('From learning to evidence','<p>A useful portfolio shows what someone can do, how they evaluated the result and where limitations remain. Programme-specific projects, assessment and supervised teaching can support that evidence.</p>')}${section('Potential professional pathways',list(['Local trainers and mentors: assessed subject competence and facilitation skills.','Educational coordinators and hub managers: delivery, participant support and organisational experience.','Technology project contributors: evidence of implementation, testing and responsible practice.','Software and AI project roles: appropriate technical qualifications and project experience.','Regional programme coordinators and local implementation partners: local knowledge, governance and delivery capacity.','Independent service providers: suitable professional competence, business arrangements and legal permissions.']))}${section('Opportunity is not a guarantee','<p>Qualified participants may later contribute to Smart World Education, SWEX.AI or Roots2AI as trainers, mentors, project contributors or local coordinators. Practical work, subject competence and role-specific qualifications inform selection; actual opportunities must exist. This is not a list of current vacancies. Participation does not guarantee employment, income, contracts or professional authorisation.</p><p>Selection depends on qualifications, assessed competence, business needs, available projects, funding and applicable law. Additional qualifications, supervised experience or separate agreements may be required.</p>')}${section('Build your next step','<p>Choose a programme aligned with your experience, document your work and discuss relevant opportunities after the required competence has been demonstrated.</p><a href="/programmes">Explore programmes</a>')}`)));
  app.get('/national-capability', (_req,res) => res.send(page('National Capability', '<p><a href="/#audience-pathways">Audience pathways</a> · <a href="/education">All capability programmes</a></p>'+require('./swe-programme-view').render(require('./education/catalogue').products.find(p=>p.id==='swe-national')))));
  app.get('/network', (_req,res) => res.send(page('Global Initiatives & Network',`<p class="programme-lead">Connect education, institutions and local capability.</p>${section('Our ecosystem',ecosystem)}${section('International work & references','<p>The existing SWE profiles document international speaking, education and conference activity. Historical participation does not imply a current formal partnership, endorsement or accreditation.</p><p><a href="/#founder">Joerg Molt: international work and conference history</a></p><p><a href="/#cofounder">Angelika Riefling: education and operational coordination</a></p><p><a href="/#hubs">Global hub concept</a></p>')}${section('Network links','<ul class="programme-list"><li><a href="https://galterprofmkb.org">GALTER</a></li><li><a href="https://www.estfab.com">EST-FAB</a></li><li><a href="/#network-links">Further existing network and social links</a></li></ul><p>Links provide access to independent organisations; their own terms apply.</p>')}${enquire}`)));
  app.get('/about', (_req,res) => res.send(page('About Smart World Education',`<p class="programme-lead">Education, technology and responsibility belong together.</p>${section('Our purpose','<p>Smart World Education is the public entry point to a connected education and capability ecosystem. It brings together human-centred learning, technical understanding, practical application and local knowledge transfer.</p><a href="/approach">Our Approach</a>')}<section class="people-list"><article><img src="/joerg-founder.jpg?v=20261111" alt="Joerg Molt" width="300" height="400" loading="lazy"><h2>Joerg Molt</h2><p>Founder</p><p>Systems architecture, technology education and international speaking.</p><a href="/#founder">Full founder profile</a></article><article><img src="/angelika-founder.jpg?v=20261111" alt="Angelika Riefling" width="300" height="300" loading="lazy"><h2>Angelika Riefling</h2><p>Co-Founder</p><p>Roots2AI, human-centred education, project coordination and international event support.</p><a href="/#cofounder">Full co-founder profile</a></article></section>${section('Contact','<address>Smart World Education / Swex.AI<br>Tennesseeallee 92<br>76149 Karlsruhe<br><a href="mailto:info@swedu.info">info@swedu.info</a></address>')}`)));
}

module.exports = { installProgrammePages, page, escape };
