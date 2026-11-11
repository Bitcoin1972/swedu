const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { readCatalogue } = require('../lib/catalogue');
const { installProgrammePages } = require('../lib/programme-pages');
const { audienceDetail } = require('../lib/audience-pages');

async function site(t) {
  const app=express();
  installProgrammePages(app);
  const server=app.listen(0,'127.0.0.1');
  t.after(()=>{server.closeAllConnections();server.close();});
  await new Promise(resolve=>server.once('listening',resolve));
  return `http://127.0.0.1:${server.address().port}`;
}

test('five complete audience pages reuse valid programme and module relationships', () => {
  const data=readCatalogue();
  assert.equal(Object.keys(data.audiencePages).length,5);
  for(const a of data.model.audiences) {
    const c=data.audiencePages[a.id];
    const count=c.offers.length+Number(c.roots);
    assert.ok(count>=2&&count<=4,a.id);
    assert.equal(new Set(c.offers.map(p=>p.id)).size,c.offers.length);
    for(const o of c.offers) {
      const p=data.programmes.find(p=>p.id===o.id);
      assert.ok(p.audiences.includes(a.id),`${a.id}/${p.id}`);
      assert.ok(o.description.length>100);
      for(const id of o.modules) assert.ok(p.modules.includes(id),`${p.id}/${id}`);
    }
    const html=audienceDetail(data,a,'IN');
    for(const answer of ['What SWE provides','Practical benefit','Format','Duration','Assessment &amp; credentials','Pricing &amp; next step','Where this can lead','Expertise behind the approach.','Contact Smart World Education']) assert.ok(html.includes(answer),`${a.id}: ${answer}`);
    assert.doesNotMatch(html,/What capability do you need\?|class="capability-map"|undefined/);
    assert.ok(html.indexOf('id="offers"')<html.indexOf('class="advanced-exploration"'));
    assert.match(html,/<details class="advanced-exploration"><summary>/);
    assert.match(html,/href="\/who-we-serve"/);
    assert.match(html,/href="\/#capability-model"/);
    assert.match(html,/does not guarantee employment/);
  }
});

test('audience pages delegate all commercial offers to the authoritative platform', () => {
  const data=readCatalogue();
  const society=data.model.audiences.find(a=>a.id==='society');
  const school=data.model.audiences.find(a=>a.id==='academia');
  const business=data.model.audiences.find(a=>a.id==='business');
  const normal=audienceDetail(data,society,'IN');
  assert.doesNotMatch(normal,/2,500|1,500|audience-prices/);
  assert.match(normal,/https:\/\/academy.swex.ai\/individual/);
  assert.match(normal,/https:\/\/roots2ai.com/);
  assert.match(normal,/AI tutor and contextual guidance/);
  assert.match(normal,/KI-Experte course certificate/);
  const institutional=audienceDetail(data,school,'IN');
  assert.doesNotMatch(institutional,/19,500|Institution package: 1-50 seats/);
  assert.match(institutional,/Academy platform/);
  const corporate=audienceDetail(data,business,'IN');
  assert.doesNotMatch(corporate,/2,500|1,500|19,500/);
  assert.match(corporate,/https:\/\/business.swex.ai\//);
  assert.doesNotMatch(audienceDetail(data,society,'DE'),/2,500|1,500/);
  const expired=structuredClone(data);
  expired.prices.forEach(p=>{p.reviewBy='2000-01-01';});
  assert.doesNotMatch(audienceDetail(expired,society,'IN'),/2,500|1,500/);
  const draft=structuredClone(data);
  draft.prices.forEach(p=>{p.status='draft';});
  assert.doesNotMatch(audienceDetail(draft,society,'IN'),/2,500|1,500/);
});

test('direct audience journeys and optional finder preserve return context safely', async t => {
  const base=await site(t);
  for(const [a,p] of [['society','aicademy'],['academia','teachers'],['business','architecture'],['institutions','local'],['governments','national']]) {
    const page=await (await fetch(base+'/audiences/'+a)).text();
    assert.ok(page.includes(`/programmes/${p}?audience=${a}&amp;country=IN`));
    const detail=await (await fetch(base+`/programmes/${p}?audience=${a}&country=IN`)).text();
    assert.ok(detail.includes(`/audiences/${a}?country=IN`));
    assert.match(detail,/SWE Capability Model/);
    assert.match(detail,/All programmes/);
  }
  const ai=await (await fetch(base+'/programmes/aicademy?audience=society&capability=ai&country=IN')).text();
  assert.doesNotMatch(ai, /name="audience"|name="capability"|country-form/);
  assert.match(ai, /\/programmes\?audience=society&amp;capability=ai/);
  const progression=await (await fetch(base+'/programmes/bootcamp?audience=society')).text();
  assert.match(progression,/Back to Society/);
  const invalid=await (await fetch(base+'/programmes/aicademy?audience=%22%3E%3Cscript%3E&capability[0]=ai')).text();
  assert.doesNotMatch(invalid,/name="audience"|name="capability"|<script>alert/);
  const other=await (await fetch(base+'/audiences/society?country=DE')).text();
  assert.doesNotMatch(other,/2,500|1,500/);
  const finder=await (await fetch(base+'/programmes?audience=business&capability=cybersecurity')).text();
  assert.match(finder,/Optional programme finder/);
  assert.match(finder,/href="\/audiences\/business"/);
  assert.match(finder,/Demonstrable outcome/);
  assert.match(finder,/\/programmes\/architecture\?audience=business&amp;capability=cybersecurity/);
});
