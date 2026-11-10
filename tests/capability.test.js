const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const path = require('node:path');
const { readCatalogue } = require('../lib/catalogue');
const { installProgrammePages } = require('../lib/programme-pages');
const { installPartnerCampus } = require('../lib/partner-campus');

test('model has six distinct ordered layers, five audiences and valid shared relationships', () => {
  const d = readCatalogue();
  const m = d.model;
  assert.deepEqual(m.layers.map(l=>l.id), ['capability','governance','institutions','academy','economy','society']);
  assert.deepEqual(m.audiences.map(a=>a.id), ['society','academia','business','institutions','governments']);
  const sets = Object.fromEntries(['layers','audiences','capabilities','modules','progression'].map(key=>[key,new Set(m[key].map(x=>x.id))]));
  for (const key of Object.keys(sets)) assert.equal(sets[key].size,m[key].length,`${key} IDs unique`);
  for (const l of m.layers) {
    assert.ok(l.down && l.up && l.role);
    for (const id of l.audiences) assert.ok(sets.audiences.has(id));
    for (const id of l.capabilities) assert.ok(sets.capabilities.has(id));
    for (const id of l.programmes) assert.ok(d.programmes.some(p=>p.id===id));
  }
  for (const p of d.programmes) {
    for (const id of p.modules) assert.ok(sets.modules.has(id));
    for (const id of p.stages) assert.ok(sets.progression.has(id));
    for (const id of p.audiences) assert.ok(sets.audiences.has(id));
    for (const id of p.next) assert.ok(d.programmes.some(p=>p.id===id));
    assert.ok(p.need && p.modules.length && p.next.length && p.capabilityIds.length);
  }
  for (const a of m.audiences) for(const id of a.capabilities) {
    assert.ok(sets.capabilities.has(id));
    assert.ok(d.programmes.some(p=>p.audiences.includes(a.id)&&p.capabilityIds.includes(id)),`${a.id}/${id} has a programme`);
  }
  assert.equal(d.programmes.find(p=>p.id==='aicademy').audiences.length,5);
  assert.ok(d.programmes.filter(p=>p.modules.includes('accountability')).length>1);
});

async function site(t) {
  const app=express();
  installProgrammePages(app);
  installPartnerCampus(app);
  app.use(express.static(path.join(__dirname,'../public')));
  const server=app.listen(0,'127.0.0.1');
  t.after(()=>{server.closeAllConnections();server.close();});
  await new Promise(resolve=>server.once('listening',resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

test('server-rendered model and discovery work without JavaScript; content remains escaped', async t => {
  const root=await site(t);
  const html=await (await fetch(root+'/?layer=society')).text();
  assert.match(html, /id="layer-society" class="layer-detail" open/);
  assert.match(html, /Top-down/);
  assert.match(html, /Bottom-up/);
  assert.match(html, /<form[\s\S]*id="contactForm"/);
  assert.ok(html.indexOf('id="capability-model"')<html.indexOf('id="audience-pathways"'));
  assert.ok(html.indexOf('id="audience-pathways"')<html.indexOf('id="progression"'));
  assert.doesNotMatch(html, /AIcademy4you India offers in INR|2,500|1,500/);
  for (const topic of ['Artificial Intelligence','System Architecture','AI Governance &amp; Accountability','Cybersecurity &amp; Resilience','Blockchain, Bitcoin &amp; Web3','IoT &amp; Smart Cities','Digital Sovereignty','National Capability Development','Human Agency &amp; Education','Institutional Transformation']) {
    assert.ok(html.includes(`<span>${topic}</span>`), `Founder expertise tag: ${topic}`);
  }
  assert.doesNotMatch(html, /<span>AI as a logical technology<\/span>|<span>Systems thinking<\/span>/);
  for (const input of ['?layer=%22%3E%3Cscript%3E','?audience[0]=business&capability[0]=ai','?audience=unknown&capability=unknown']) {
    const response=await fetch(root+'/programmes'+input);
    assert.equal(response.status,200);
    assert.doesNotMatch(await response.text(), /<script>alert|undefined/);
  }
  const noMatch=await (await fetch(root+'/programmes?audience=society&capability=cybersecurity')).text();
  assert.match(noMatch,/No programme matches/);
  assert.match(noMatch,/discuss a tailored scope/);
  assert.equal((await fetch(root+'/audiences/unknown')).status,404);
  for (const route of ['/approach','/national-capability']) {
    const body=await (await fetch(root+route)).text();
    assert.match(body, /href="\/#audience-pathways"/);
    assert.doesNotMatch(body, /href="#audience-pathways"/);
  }
});

test('A-E visitor journeys reach capabilities, detail, evidence and appropriate next steps', async t => {
  const root=await site(t);
  for(const [audience,capability,programme] of [['society','ai','aicademy'],['academia','teachers','teachers'],['business','cybersecurity','architecture'],['governments','local-national','national'],['institutions','trainers','trainers']]) {
    const entry=await (await fetch(root+'/audiences/'+audience)).text();
    assert.ok(entry.includes(`audience=${audience}&amp;capability=${capability}`));
    const discovery=await (await fetch(root+`/programmes?audience=${audience}&capability=${capability}`)).text();
    assert.ok(discovery.includes(`/programmes/${programme}?`));
    const detail=await (await fetch(root+'/programmes/'+programme)).text();
    for(const heading of ['The need this programme addresses','Who is this for?','Capabilities developed','Topics, modules &amp; practical work','Expertise &amp; delivery basis','Duration &amp; delivery','Demonstrable outcomes','Credentials','Fees &amp; registration','Your next possible step']) assert.ok(detail.includes(heading),`${programme}: ${heading}`);
    assert.match(detail,/does not guarantee/);
  }
  const ai=await (await fetch(root+'/programmes/aicademy?country=IN')).text();
  assert.match(ai,/2,500/);
  assert.match(ai,/1,500/);
  assert.match(ai,/https:\/\/academy.swex.ai\/individual/);
  assert.match(ai,/No external accreditation/);
  assert.equal((await fetch(root+'/data/capability-model.json')).status,404);
  assert.equal((await fetch(root+'/partners')).status,503);
});
