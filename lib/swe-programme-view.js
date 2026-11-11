// Public SWE explanations only. Curriculum, commercial data and external platforms stay separate.
const curriculum = require('./education/catalogue');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = items => `<ul class="programme-list">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const section = (heading, body) => `<section${heading === 'How can they start?' ? ' id="start"' : ''}><h2>${heading}</h2>${body}</section>`;
const photo = (name, alt) => `<figure class="learning-image"><img src="/images/${name}.jpg" alt="${alt}" width="1200" height="700" loading="lazy"><figcaption>Illustrative learning environment</figcaption></figure>`;
const academyAreas = [
  ['Understand AI', 'Learn what AI can do, where it makes mistakes and how to choose a useful case from your own life or work.'],
  ['Guide AI', 'Give clear instructions, add useful context and improve the answers through practice.'],
  ['Verify AI', 'Check answers against reliable information and decide when human judgement is needed.'],
  ['Apply AI', 'Bring these skills together in a practical workflow or prototype that you can explain and review.']
];
const publicNotes = {
  labs: ['Start with a real question, try an approach and review what happened. SWE learning labs bring guided experimentation into a workshop.', 'A tailored lab draws on existing SWE workshop experience. Topic, delivery format and schedule are agreed with your group.'],
  bootcamp: ['Combine focused technology learning with collaborative project work and feedback.', 'SWE has bootcamp and training experience. A tailored cohort is arranged by enquiry; no fixed intake or duration is advertised here.'],
  architecture: ['Understand how the parts of a digital system fit together, from AI and data to security, reliability and the people who operate it.', 'Training or advisory work starts with your organisation\'s requirements. Scope, prerequisites and delivery are agreed together.'],
  teachers: ['Use AI thoughtfully in teaching while keeping learner understanding, safety and teacher judgement central.', 'Explore existing Roots2AI educator workshops and school support. Agree the format and schedule directly with the delivery team.'],
  trainers: ['Build the ability to teach technology clearly, support learners and help knowledge stay within a community.', 'This proposed structured programme builds on existing training experience. Discuss a pilot; a formal trainer qualification or intake is not yet offered.'],
  local: ['Help a community connect useful learning, practical projects and local teaching capacity.', 'Start with local needs and available people and resources. Agree a pilot, review the results and plan continuing local delivery.'],
  national: ['Connect education, institutions and governance so that capability can be developed and sustained locally.', 'Begin with a readiness discussion and a scoped pilot. A wider rollout requires agreed partners, responsibilities and funding.']
};
function blocks(items) {
  return `<div class="learning-topics">${items.map(([name, text]) => `<article><h3>${esc(name)}</h3><p>${esc(text)}</p></article>`).join('')}</div>`;
}
function render(p) {
  const academy = p.id === 'aicademy';
  const integrated = p.portfolio === 'SWE';
  const modules = integrated ? p.moduleIds.map(id => curriculum.modules.find(m => m.id === id)) : [];
  const notes = publicNotes[p.id];
  const intro = academy ? 'Flexible online learning to help you understand, guide, verify and apply AI. Learn independently, alongside work, education or other commitments.' : integrated ? `${p.need} ${p.outcomes[0]}` : notes?.[0] || p.description;
  const audience = academy ? 'People who want to use AI with more confidence in everyday life, study or work. You can progress at your own pace rather than follow a fixed course timetable.' : p.audience;
  const topics = academy ? academyAreas : integrated ? modules.map(m => [m.topic, m.lessons[0].content]) : p.topics.map(topic => [topic, topicDescriptions[topic] || 'Connect this topic to a practical task, discuss your choices and review the result.']);
  const method = academy ? 'Work through the four learning areas with an AI tutor, interactive exercises and practical challenges. Use the digital workbook to develop your own case and record what you learn. Multilingual learning helps you work in a supported language. The platform confirms available features and access terms before enrolment.' : integrated ? 'SWE works with your organisation to choose the relevant modules, delivery format and schedule. Start with local needs, build shared understanding, practise on a useful project and review what your team can sustain independently. These integrated programmes are scoped by enquiry, not fixed courses with an open intake.' : notes?.[1] || p.delivery;
  const outcomes = academy ? [p.outcome, 'Use AI more thoughtfully in your current role and recognise when an answer needs checking.'] : integrated ? p.outcomes : p.benefits;
  const image = academy ? ['independent-learning','Learners exploring a task on a laptop'] : /academic|teachers|trainers/.test(p.id) ? ['learning-space','Shared learning space for education and discussion'] : ['collaboration','People working together around a table'];
  const target = academy ? 'https://academy.swex.ai' : p.id === 'teachers' ? 'https://roots2.ai/programs/schools/' : '/#contact';
  const label = academy ? 'Explore AIcademy4you' : p.id === 'teachers' ? 'Explore Roots2AI Schools' : 'Discuss your programme';
  return `<div class="swe-learning">
    ${section('What is this programme?', `<p class="programme-lead">${esc(intro)}</p>${photo(...image)}`)}
    ${section('Who is it for?', `<p>${esc(audience)}</p>`)}
    ${section('What will participants learn?', blocks(topics))}
    ${section('How does the programme work?', `<p>${esc(method)}</p>${!academy ? `<ol class="learning-progression">${(integrated ? p.phases : ['Choose a useful task','Learn and practise','Review and improve']).map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}`)}
    ${section('What can participants do afterwards?', list(outcomes) + (integrated ? '<p>Qualified participants may later support teaching, mentoring, projects or local coordination with SWE, SWEX.AI or Roots2AI, where suitable opportunities exist.</p>' : '') + '<p class="learning-note">Participation does not guarantee employment or a professional qualification.</p>')}
    ${section('How can they start?', `<p>${academy ? 'Continue to AIcademy for current offers, enrolment, learning access and detailed terms. SWE explains the course; the Academy delivers your online learning.' : 'Tell the delivery team about your goals, participants and preferred format. For institutional programmes, request a scoped proposal before making a commitment.'}</p><a class="btn-primary" href="${target}">${label}</a>${!academy ? `<p class="learning-note">${p.id === 'teachers' ? 'For a wider institutional programme, contact SWE.' : 'For specialist technology learning, explore'} ${p.id === 'teachers' ? '<a href="/#contact">Contact SWE</a>' : '<a href="https://www.swex.ai">SWEX.AI</a>'}${integrated ? ' or start with <a href="/programmes/aicademy">AIcademy4you</a>. Human-centred educator support is available through <a href="https://roots2ai.com">Roots2AI</a>.' : '.'}</p>` : ''}`)}
    <details class="learning-details"><summary>Participation and credentials</summary><p>${academy ? 'Current completion requirements, course certificate conditions, supported languages and access terms are set by AIcademy. No external accreditation is claimed here. Review the enrolment terms on the Academy platform.' : 'Learning scope, prerequisites, scheduling and any assessment are agreed before delivery. No accredited qualification or guaranteed placement is advertised. Proposed formats require a separate delivery agreement.'}</p></details>
  </div>`;
}
const topicDescriptions = {
  'Use-case definition':'Choose a problem that is useful, realistic and safe to explore.',
  'Guided experimentation':'Try different approaches with support and compare what works.',
  'Output evaluation':'Check the result, record limitations and decide what to improve.',
  'Project demonstration':'Explain your practical output and what you learned from testing it.',
  'Requirements':'Turn organisational needs into clear system requirements.',
  'AI system design':'Map data, components and human decision points.',
  'Evaluation':'Define how you will test quality, reliability and useful outcomes.',
  'Security and governance':'Consider access, accountability and risks before implementation.',
  'Deployment trade-offs':'Compare operating cost, maintenance and reliability needs.',
  'Critical thinking':'Question confident answers and examine the evidence behind them.',
  'Human-centred pedagogy':'Design learning around understanding, agency and inclusion.',
  'Classroom AI applications':'Build a useful classroom activity while protecting learner data.',
  'Responsible use':'Set clear boundaries for when and how technology should be used.',
  'Facilitation':'Help learners explore ideas and work through misunderstandings.',
  'Learning assessment':'Check understanding through practical tasks and feedback.',
  'Supervised teaching':'Practise a short session and improve it with observation and feedback.',
  'Training quality':'Create repeatable learning activities and a local review process.',
  'Technology foundations':'Understand the essential ideas before choosing tools or building a solution.',
  'Collaborative implementation':'Build a small project with clear responsibilities and peer feedback.',
  'Testing':'Try normal and unexpected inputs and record where the solution needs work.',
  'Project review':'Demonstrate your work and discuss its usefulness and limitations.',
  'Local readiness':'Identify community needs, available resources and barriers to participation.',
  'Practical learning':'Apply a new skill to a task that matters in the local context.',
  'Trainer development':'Help experienced participants practise sharing knowledge with others.',
  'Sustainable delivery':'Plan local ownership, learning support and ongoing review.',
  'Readiness assessment':'Agree a starting point with institutions and the people they serve.',
  'Pilot design':'Choose a small, measurable project before considering wider adoption.',
  'Qualification':'Agree how practical competence will be demonstrated; no credential is assumed.',
  'Local trainers':'Develop teaching capacity through practice, observation and feedback.',
  'Independent capability':'Work towards locally owned teaching, implementation and support.'
};
function overview() {
  return `<div class="swe-learning"><p class="programme-lead">Connect learning with the people, projects and institutions that make it useful.</p><p>Choose a starting point. SWE brings relevant learning together into a programme shaped around your needs.</p>${curriculum.products.filter(p=>p.portfolio==='SWE').map(p=>section(esc(p.name),`<p>${esc(p.audience)}. ${esc(p.outcomes[0])}</p><a href="/education/${p.id}">Explore ${esc(p.name)}</a>`)).join('')}<p>For independent online learning, explore <a href="/programmes/aicademy">AIcademy4you</a>. For a tailored programme, <a href="/#contact">talk to SWE</a>.</p></div>`;
}
module.exports = {render,overview};
