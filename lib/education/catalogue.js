// Canonical authoring source. SWEX receives a checksum-verified release copy.
const version = '0.2.0-draft';
const date = '2026-11-10';
const layers = ['Capability', 'Governance', 'Institutions', 'Academy', 'Economy', 'Society'];
const duration = { status: 'unconfirmed', contactHours: null, practiceHours: null, assessmentHours: null, source: 'Curriculum duration concept not supplied; no hours inferred from Knowledge Camp.' };
const safeguards = ['Human judgement and escalation', 'Digital safety and data minimisation', 'Accountable decisions and authority boundaries', 'Evidence review and quality assurance'];
const seeds = [
  ['ai', 'Artificial Intelligence', 'AI', ['society','academia','business','institutions'], 'Everyday digital literacy',
    ['Distinguish model capability from confident language', 'Compare AI outputs against evidence'],
    [['Models and limits','Compare predictive, generative and rule-based systems; identify uncertainty, hallucination and context limits.'],['Instructions and context','Define a task, constraints and evidence; compare two instructions without using confidential data.'],['Evaluation','Create a small reference set; record factual errors, omissions and escalation decisions.']],
    'Produce a use-case brief and tested instruction set with a verification checklist.', 'An assessor can reproduce the comparison and identify when a human must decide.'],
  ['agents','AI Agents','AI',['business','academia','institutions'],'AI foundations and basic workflow reasoning',
    ['Separate tool execution from model reasoning','Design bounded autonomy with human approval'],
    [['Agent loop','Map state, planning, tool invocation, observation and stop conditions.'],['Tool contracts','Define input validation, least privilege, timeouts, budgets and approval boundaries.'],['Failure recovery','Test injection attempts, incorrect tool output and retries in an isolated simulation.']],
    'Build a simulated agent workflow with approval before any external action.', 'Demonstrate refusal, timeout, audit trace and recovery without live credentials.'],
  ['ai-development','AI-assisted Development','AI',['business','academia'],'Basic programming and version control',
    ['Turn requirements into testable software','Review AI-generated changes before release'],
    [['Specification','Write acceptance criteria, data boundaries and threat assumptions before generating code.'],['Implementation','Work through a small change, dependency review, tests and peer-reviewed diff.'],['Release','Evaluate failure cases, secret handling, rollback and operating ownership.']],
    'Submit a small application change with tests, review notes and rollback instructions.', 'A reviewer reproduces tests and explains design choices and remaining risks.'],
  ['architecture','Systems Architecture','Systems',['business','institutions','governments'],'Technical foundations or relevant delivery experience',
    ['Translate needs into system boundaries','Defend trade-offs across security, reliability and cost'],
    [['Requirements','Identify stakeholders, quality attributes, constraints and measurable acceptance criteria.'],['Interfaces and data','Draw context and component models; specify contracts, identity boundaries and data ownership.'],['Operation','Compare failure modes, observability, recovery, deployment and lifecycle cost.']],
    'Create an architecture decision record, interface contract and operational handover.', 'Defend alternatives and demonstrate how the design is tested and maintained.'],
  ['cybersecurity','Cybersecurity Foundations','Security',['society','academia','business','institutions'],'Basic digital literacy',
    ['Identify assets and realistic threats','Apply proportionate defensive controls'],
    [['Threats and assets','Map devices, identities and sensitive information; prioritise likely harm.'],['Defensive controls','Practise MFA, least privilege, patching, backup and phishing recognition in a sandbox.'],['Response','Triage a simulated suspicious message and record escalation without investigating real people.']],
    'Produce a baseline protection checklist and demonstrate account recovery in a test environment.', 'Explain residual risks and apply the agreed escalation process.'],
  ['resilience','Cyber Resilience & AI Security','Security',['business','institutions','governments'],'Cybersecurity foundations',
    ['Plan continuity under disruption','Evaluate AI-specific trust boundaries'],
    [['AI attack surface','Examine untrusted inputs, prompt injection, data leakage and excessive tool permissions.'],['Continuity','Map critical dependencies and agree recovery priorities and communication responsibilities.'],['Exercise','Run a defensive tabletop covering service failure, backups, incident triage and lessons learned.']],
    'Write a threat model and recovery playbook; run an authorised tabletop.', 'Demonstrate restoration decisions and document evidence, gaps and accountable owners.'],
  ['bitcoin','Bitcoin & Blockchain','Distributed systems',['business','academia','institutions'],'Digital systems foundations',
    ['Explain UTXO, signatures and consensus','Distinguish integrity guarantees from trust assumptions'],
    [['Transactions','Trace UTXOs, keys, signatures, fees and confirmation using synthetic transactions.'],['Consensus','Compare replication, validation and settlement; discuss forks and incentives.'],['Custody and limits','Evaluate key loss, custody, privacy, scalability and non-blockchain alternatives.']],
    'Trace a test transaction and create a custody risk assessment; use no real funds.', 'Explain who can change data, who holds keys and which claims are not guaranteed.'],
  ['web3','Web3 & Digital Identity','Distributed systems',['business','academia'],'Blockchain foundations and basic web concepts',
    ['Evaluate identity and smart-contract trust','Recognise when decentralisation is unnecessary'],
    [['Identity','Compare accounts, wallets, attestations and revocation models.'],['Contracts','Inspect a toy contract lifecycle and its administrative permissions.'],['Integration','Map off-chain dependencies, privacy, upgrades and recovery.']],
    'Compare a conventional and a distributed identity design using synthetic records.', 'Document attack surfaces, governance and a justified architecture choice.'],
  ['iot','IoT & Smart Infrastructure','Connected systems',['business','academia','institutions'],'Basic networks and systems concepts',
    ['Design a sensor-to-service data flow','Account for device lifecycle and unreliable connectivity'],
    [['Devices','Map sensors, calibration, gateways, protocols and device identities.'],['Data flows','Compare edge and cloud processing, retention and unreliable-network behaviour.'],['Lifecycle','Plan secure updates, inventory, maintenance and end-of-life ownership.']],
    'Build a simulated sensor pipeline and inspect behaviour when readings or connectivity fail.', 'Show validation, device ownership and a safe maintenance plan.'],
  ['robotics','Robotics & Automation','Connected systems',['academia','business'],'Basic programming and safety induction',
    ['Explain sensing, control and actuation','Bound automated behaviour safely'],
    [['Control','Explore feedback, state and actuator limits with a simulator.'],['Safety','Define exclusion zones, manual override and emergency stops.'],['Testing','Test sensor failure and boundary conditions before any physical demonstration.']],
    'Implement a simulated control task with observable stop conditions.', 'Demonstrate safe failure; physical equipment requires separate supervision approval.'],
  ['smart-cities','Smart Cities & Security by Design','Connected systems',['institutions','governments','academia'],'Systems and IoT foundations',
    ['Connect service outcomes with infrastructure design','Evaluate privacy, inclusion and public accountability'],
    [['Needs','Compare citizen needs with infrastructure measures; identify who may be excluded.'],['Services','Map transport, water or energy dependencies and responsible operators.'],['Safeguards','Assess data minimisation, resilience, procurement and public feedback.']],
    'Develop a municipal service blueprint with public feedback and safety review.', 'Show measurable benefit, maintenance ownership and an alternative without intrusive monitoring.'],
  ['governance','AI Governance & Accountability','Governance',['business','institutions','governments','academia'],'Experience with the intended organisational context',
    ['Allocate decision rights and accountability','Build review gates into design and operation'],
    [['Authority','Map who may propose, approve, operate, challenge and stop a system.'],['Assurance','Define risk review, evidence requirements, human oversight and incident escalation.'],['Monitoring','Design change control, periodic review, supplier checks and public complaints handling.']],
    'Produce a decision-rights matrix and an assurance case for an example system.', 'Demonstrate traceability from objectives to accountable decisions and measurable evidence.'],
  ['law','Law, Ethics & Technology','Governance',['academia','institutions','governments','business'],'Relevant professional or academic context',
    ['Identify legal questions requiring qualified advice','Separate ethical judgement from technical feasibility'],
    [['Issue spotting','Map personal data, intellectual property, automated decisions and jurisdiction questions.'],['Institutional review','Work through a fictional procurement or research scenario with competing rights.'],['Escalation','Document unresolved questions for qualified local counsel and independent review.']],
    'Prepare an issue register and evidence brief, not legal advice.', 'Identify jurisdictional uncertainty without inventing compliance or professional authorisation.'],
  ['human-agency','Human Agency & Digital Safety','Education',['society','academia','institutions'],'No technical prerequisite',
    ['Keep meaningful human choice in digital environments','Recognise manipulation, uncertainty and unsafe disclosure'],
    [['Understanding','Compare assistance with persuasion; discuss dependency and appropriate refusal.'],['Safety','Practise privacy choices, age-appropriate boundaries and trusted-adult escalation using fictional examples.'],['Reflection','Evaluate usefulness, accessibility and the impact on relationships and learning.']],
    'Create a family or classroom digital-use agreement and review an AI-assisted decision.', 'Explain when not to use a tool, how to ask for help and how to preserve learner agency.'],
  ['teacher-development','Teacher Development','Education',['academia'],'Teaching experience or supervised educator role',
    ['Adapt learning for learner needs','Assess understanding rather than tool fluency'],
    [['Learning design','Translate a learning objective into an accessible activity and evidence rubric.'],['Facilitation','Plan feedback, accommodations and responsible AI use without exposing pupil data.'],['Review','Observe a micro-lesson and revise it using peer and learner feedback.']],
    'Design and demonstrate an inclusive lesson with a rubric and safeguarding checklist.', 'Explain adaptation decisions and demonstrate feedback-led improvement.'],
  ['trainers','Train-the-Trainer','Education',['academia','institutions','governments'],'Demonstrated subject competence and facilitation experience',
    ['Deliver and evaluate a repeatable learning session','Develop local training ownership'],
    [['Preparation','Set prerequisites, equipment checks, lesson plans and accessibility arrangements.'],['Observed teaching','Practise facilitation, misconception handling and feedback under supervision.'],['Handover','Calibrate assessments, review safeguarding incidents and agree local quality ownership.']],
    'Deliver a supervised micro-session and assemble a reusable trainer pack.', 'Observed competence is evidence for review, not automatic trainer certification or employment.'],
  ['sdgs','AI for SDGs & Local Capability','Development',['society','academia','institutions','governments'],'Local context knowledge',
    ['Turn a local need into a measurable pilot','Evaluate benefit, harm and sustainability'],
    [['Baseline','Identify a local problem, affected groups, existing practice and realistic measurement.'],['Intervention','Compare a technical intervention with a low-tech alternative and lifecycle resource needs.'],['Evaluation','Collect proportionate evidence, invite community feedback and plan local maintenance.']],
    'Build a pilot charter with baseline, indicators, consent boundaries and handover responsibilities.', 'Defend the value and sustainability claim using evidence rather than an SDG label alone.']
];
const modules = seeds.map(([id,topic,category,audiences,prerequisites,objectives,lessons,exercise,outcome]) => ({
  id, topic, category, audiences, prerequisites, objectives,
  lessons: lessons.map(([title,content],i)=>({id:`${id}-${i+1}`,title,content})),
  duration: {...duration}, format: ['Facilitated workshop','Supervised lab','Blended cohort by agreement'],
  trainer: 'SWEX subject specialist for technical foundations; SWE coordinates integration. Named trainer and subject review required before delivery.',
  equipment: ['Learner computer or accessible alternative','Isolated sandbox and synthetic data','Facilitator-reviewed exercise pack'],
  exercises: [exercise], assessment: outcome, outcomes: [outcome],
  credential: {status:'not-approved',description:'No new qualification or accredited certificate is promised.'},
  sourceIds: ['master-brief','swe-capability-outlines'], contentVersion: version,
  availability: 'proposed-module', approval: 'draft', safeguards
}));
const bootcampSeeds = [
  ['applied-ai','Applied AI & Agents',['ai','agents','ai-development','governance'],'An evaluated AI workflow with bounded tool use.'],
  ['defensive-cyber','Cybersecurity & Resilience',['cybersecurity','resilience','governance'],'A threat model, defensive baseline and exercised recovery plan.'],
  ['distributed-systems','Bitcoin, Blockchain & Web3',['bitcoin','web3','architecture','governance'],'A test-network case study with an explicit trust and custody model.'],
  ['smart-infrastructure','IoT, Robotics & Smart Cities',['iot','robotics','smart-cities','cybersecurity'],'A simulated connected service with safety constraints and operational ownership.'],
  ['accountable-ai','AI Governance & Institutional Assurance',['ai','governance','law','architecture'],'A decision-rights model, assurance case and review process.'],
  ['sustainable-innovation','AI for Sustainable Development',['ai','sdgs','human-agency','architecture'],'A locally grounded pilot with baseline, impact indicators and handover plan.']
];
const product = (id,name,portfolio,kind,moduleIds,outcome,audience) => ({id,name,portfolio,kind,moduleIds,outcomes:[outcome],audience,
  approval:'draft', availability:'proposed-programme', duration:{...duration},
  format:'Facilitated cohort combining instruction, supervised application and evidence review; venue and schedule by agreement.',
  responsibility:portfolio==='SWE'?'SWE programme coordination with separately scoped specialist teaching.':'SWEX subject specialists; individual trainer assignment pending.',
  assessment:'Review a practical portfolio against agreed objectives, demonstrate the work and revise it after feedback.',
  credential:'Assessment design and issuer require approval. No new accredited qualification is asserted.',
  nextStep:'Extend the project or consider supervised teaching after competence review and where opportunities exist.',
  price:{status:'unapproved',amountMinor:null}, sourceIds:['master-brief'],contentVersion:version,safeguards});
const products = [
  ...bootcampSeeds.map(([id,name,ids,outcome])=>product(`bootcamp-${id}`,name,'SWEX','specialist-bootcamp',ids,outcome,'Practitioners and institutions with the prerequisites listed for each module')),
  product('systems-architecture','Comprehensive Systems Architecture Programme','SWEX','standalone-programme',['architecture','ai','agents','ai-development','cybersecurity','resilience','bitcoin','web3','iot','governance','law'],
    'A defended system design with interface contracts, tested prototype, security analysis, governance gates and operational handover.','Technical practitioners, systems leads and institutional technology teams'),
  ...modules.map(m=>product(`session-${m.id}`,m.topic,'SWEX','topic-session',[m.id],m.outcomes[0],m.audiences.join(', '))),
  ...['agents','ai-development','architecture','resilience','bitcoin','iot','robotics'].map(id=>{
    const m=modules.find(m=>m.id===id); return product(`lab-${id}`,`${m.topic} Lab`,'SWEX','applied-lab',[id],m.exercises[0],m.audiences.join(', '));
  })
];
const capabilitySeeds = [
  ['society','Society Capability',['human-agency','ai','cybersecurity','sdgs'],'Individuals, families and communities','Make informed digital choices and apply learning to a locally useful task.','Digital change can reduce confidence and agency without accessible learning and support.'],
  ['academic','Academic Capability',['human-agency','teacher-development','ai','governance','trainers','sdgs'],'Schools, universities, educators and researchers','Develop inclusive teaching practice, assessment evidence and local educator capacity.','Institutions need educational practice and accountable adoption, not only access to AI tools.'],
  ['economic','Economic Capability',['ai','agents','ai-development','architecture','cybersecurity','resilience','governance'],'Professionals, enterprises and industry','Develop a tested workflow or system proposal with accountable operating ownership.','Technology adoption needs demonstrable value, security and maintainable integration.'],
  ['institutional','Institutional Capability',['governance','law','architecture','resilience','human-agency','trainers','sdgs'],'Public organisations, NGOs and development institutions','Create an institutional delivery plan with assurance, trained people and service continuity.','One-off training does not establish sustainable institutional decision-making and delivery.'],
  ['national','National Capability',['sdgs','human-agency','ai','governance','law','architecture','iot','smart-cities','resilience','teacher-development','trainers'],'Ministries, public authorities and national development partners','Demonstrate locally operated capability through a reviewed pilot before wider expansion.','National objectives need connected governance, institutional capacity, education and societal feedback.']
];
for (const [id,name,ids,audience,outcome,need] of capabilitySeeds) products.push({
  ...product(`swe-${id}`,name,'SWE','integrated-capability',ids,outcome,audience),need,layers,
  existingFoundation:'Built on the existing SWE education, workshop and institutional engagement capabilities. This integrated specification is a new framework, not a claim that a cohort is already available.',
  phases:['Readiness and local needs','Shared foundations and safeguards','Applied project and review','Local delivery and evaluation'],
  feedback:'Capability objectives and governance shape delivery; learner and community feedback changes institutional practice and future objectives.',
  ecosystem:['SWEX specialist technology modules','AIcademy existing learning, enrolment unchanged','Roots2AI human agency and digital safety','Specialist partners only under separate approval']
});
const pilot = [
  [1,1,'Readiness','Agree needs, baseline, delivery owners, languages, access, safeguarding and feasibility.','Signed pilot charter and go/no-go review'],
  [2,3,'Foundational education','Build AI, digital safety, human agency and accountable decision-making foundations.','Reviewed learner evidence and adapted support plan'],
  [4,5,'Hands-on application','Test selected local use cases in controlled environments with community feedback.','Demonstrated projects and documented limitations'],
  [6,7,'Systems integration','Connect selected prototypes to institutional requirements without bypassing security and governance review.','Architecture, data and operational assurance review'],
  [8,9,'Local trainer development','Observe teaching, calibrate assessment and establish local quality ownership.','Supervised teaching evidence and handover readiness'],
  [10,11,'Independent operations','Exercise local delivery, support, incident escalation and maintenance responsibilities.','Local operating demonstration and unresolved-gap register'],
  [12,12,'Evaluation','Compare outcomes to baseline, involve affected communities and decide whether to adapt, stop or scale.','Independent review and explicitly authorised next-stage decision']
].map(([startMonth,endMonth,name,activity,gate])=>({startMonth,endMonth,name,activity,gate,safeguards}));
const partnerSeeds = [
  ['child-safety','Child Online Safety and Digital Well-being','ISAC','human-agency'],
  ['parent-teacher-safety','Parent and Teacher Safety Workshops','ISAC','teacher-development'],
  ['ccio','Cyber Crime Intervention Officer qualification','ISAC','cybersecurity'],
  ['cyber-foundation','Cybersecurity Foundation','ISAC','cybersecurity'],
  ['ai-security','AI Security and Cyber Resilience','ISAC','resilience'],
  ['cyber-range','Cyber Range and Advanced Defensive Practice','ISAC','resilience'],
  ['ot-security','IoT/OT and Critical Infrastructure Security','ISAC','iot'],
  ['safer-cities','Safer Cities and Security by Design','ISAC','smart-cities'],
  ['curious-labs','Curious Labs contribution','Curious Labs','human-agency'],
  ['academic-governance','Academic Law and Governance','GALTER','law']
];
const partnerAddons = partnerSeeds.map(([id,name,provider,foundation])=>({id,name,provider,foundation,
  status:'proposed-collaboration', deliveryApproval:false, brandingApproval:false, credentialApproval:false,
  priceApproval:false, source:'User master brief; no transcript or delivery agreement supplied.',
  role:`Potential specialist contribution after the ${foundation} foundation; not included in a booking.`,
  required:['Provider syllabus','Prerequisites and duration','Named delivery responsibility','Safeguarding and access controls','Assessment and credential terms','Country-specific commercial approval']
}));
const specialistScope = {
  'child-safety':['Age-appropriate privacy, unwanted contact and reporting boundaries','Practise a fictional help-seeking scenario; no child data collection','A safeguarding lead reviews the escalation and support map'],
  'parent-teacher-safety':['Family and classroom agreements, harmful content and trusted support','Role-play a parent-teacher response using an invented incident','Review a usable family or school safety plan'],
  'ccio':['Provider-defined eligibility, incident intake, lawful reporting and professional boundaries','Use only provider-authorised case simulations after syllabus approval','ISAC must confirm qualification requirements, assessment, issuer and jurisdictional scope'],
  'cyber-foundation':['Provider baseline for identity, networks, secure configuration and incident recognition','Compare a specialist diagnostic exercise with the SWEX foundation baseline','Provider confirms prerequisites and evaluates gaps without duplicating foundation teaching'],
  'ai-security':['Untrusted inputs, tool permissions, data leakage and continuity of AI services','Run approved defensive failure scenarios in an isolated AI application','Demonstrate containment, documented evidence and human escalation'],
  'cyber-range':['Isolated defensive environments, detection, incident triage and recovery','Respond to a synthetic event in an explicitly authorised range','Provider defines range access, supervision, scope and assessment evidence'],
  'ot-security':['IT/OT boundaries, asset dependencies, safe maintenance and critical-service continuity','Tabletop a fictional infrastructure disruption; no access to operational systems','Review a safety-first response with the responsible domain specialist'],
  'safer-cities':['Public-service threats, privacy, inclusion and resilient infrastructure','Review a fictional city service design and its community feedback process','Document security decisions, public accountability and maintenance responsibilities'],
  'curious-labs':['Exploratory learning and age-appropriate human agency','Co-design a supervised discovery activity after provider agreement','Confirm educational aims, safeguarding and facilitation responsibilities'],
  'academic-governance':['Institutional authority, law, ethics and accountable technology adoption','Review a fictional procurement or academic case with qualified contributors','Confirm teaching remit, jurisdiction and assessment; no assumed academic credit']
};
for(const addon of partnerAddons){
  const [scope,exercise,assessment]=specialistScope[addon.id];
  Object.assign(addon,{proposedScope:scope,exercise,assessment,duration:{...duration},
    prerequisites:`Relevant ${addon.foundation} foundation; provider-specific eligibility pending.`,
    equipment:'Provider-approved teaching materials and isolated environment; requirements pending.',
    responsibility:`${addon.provider} specialist delivery only after explicit agreement; SWE integration and coordination.`,
    contentVersion:version});
}
products.find(p=>p.id==='swe-economic').moduleIds.push('bitcoin','web3');
products.find(p=>p.id==='swe-academic').moduleIds.push('robotics');
const prerequisiteIds = {agents:['ai'],'ai-development':['ai'],resilience:['cybersecurity'],web3:['bitcoin'],robotics:['iot'],'smart-cities':['iot','architecture'],'teacher-development':['human-agency'],trainers:['teacher-development']};
for (const m of modules) {
  m.reusedBy = products.filter(p=>p.moduleIds.includes(m.id)).map(p=>p.id);
  m.prerequisiteModuleIds = prerequisiteIds[m.id] || [];
  m.level = ['ai','cybersecurity','human-agency','bitcoin'].includes(m.id)?'foundation':['agents','resilience','architecture','trainers'].includes(m.id)?'advanced':'applied';
  m.expertAssignment = {role:m.category==='Education'?'Human agency / pedagogy specialist':'Subject specialist',person:null,status:'assignment-required'};
  m.specialistAddonIds = partnerAddons.filter(a=>a.foundation===m.id).map(a=>a.id);
}
for(const addon of partnerAddons) {
  addon.publicDisplayPermission=false;
  addon.agreementStatus='pending';
  addon.assessmentResponsibility='Provider scope to be agreed';
  addon.credentialIssuer=null;
  addon.commercialStatus='not-approved';
}
for(const p of products) {
  p.relatedSweIds=products.filter(s=>s.portfolio==='SWE' && s.id!==p.id && p.moduleIds.some(id=>s.moduleIds.includes(id))).map(s=>s.id);
  p.nextProductIds=p.portfolio==='SWE'?[]:p.kind==='topic-session'?[`lab-${p.moduleIds[0]}`].filter(id=>products.some(x=>x.id===id)):p.id==='systems-architecture'?[]:['systems-architecture'];
  p.contentStatus='curriculum-awaiting-review';
}
const sources = [
  {id:'master-brief',kind:'user-instruction',date,authority:'Authorises drafting and proposed scope, not commercial or partner delivery approval.'},
  {id:'swe-capability-outlines',kind:'repository',path:'data/capability-model.json',authority:'Existing scoping outlines, not approved fixed syllabi.'},
  {id:'aicademy',kind:'existing-product',url:'https://academy.swex.ai',authority:'Existing learning and checkout remain authoritative.'}
];
const existingProducts = [
  {id:'aicademy',name:'AIcademy4you',status:'existing-product',url:'https://academy.swex.ai',priceSource:'data/catalogue.json',scope:'Understand, Guide, Verify, Apply; existing learner progress and credential conditions remain authoritative.'},
  {id:'knowledge-camp',name:'SWEX Knowledge Camp',status:'existing-offer',url:'https://www.swex.ai/#bootcamp',duration:{hours:30,status:'existing-site-description',source:'SWEX index.html'},priceSource:'SWEX lib/pricing.js',scope:'Existing booking, cohort, deposit and payment flow; no prices inherited by new specialist bootcamps.'}
];
function workload(moduleIds){
  const selected=[...new Set(moduleIds)].map(id=>modules.find(m=>m.id===id));
  if(selected.some(m=>!m)) throw Error('Unknown module');
  const missing=selected.filter(m=>['contactHours','practiceHours','assessmentHours'].some(k=>m.duration[k]===null)).map(m=>m.id);
  return {moduleCount:selected.length,unconfirmedModules:missing,
    totalHours:missing.length?null:selected.reduce((sum,m)=>sum+m.duration.contactHours+m.duration.practiceHours+m.duration.assessmentHours,0),
    note:'Unique modules only; prerequisites, adaptation and delivery overhead are scoped separately. Calendar months are not learning hours.'};
}
module.exports = {version,date,layers,modules,products,pilot,partnerAddons,sources,safeguards,existingProducts,workload};
