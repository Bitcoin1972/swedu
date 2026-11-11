const {test}=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const data=require('../lib/education/catalogue');
const {publicContract,completeness}=require('../lib/education/contract');
const {validate}=require('../lib/education/validate');
const {programmeUrl,language,categories}=require('../lib/education/journeys');
const {prepareProposal}=require('../lib/education/proposals');
const views=require('../lib/education/presentation');
const {documentModel,currentDocument}=require('../lib/education/catalogue-document');
const {importAcademyPrices}=require('../lib/education/pricing');

test('pricing document is derived from approved source and invalidated by price changes',()=>{
  const rows=importAcademyPrices(require('../data/catalogue.json'));
  const model=documentModel(rows,{country:'IN',segment:'student',now:'2026-11-10'});
  assert.equal(model.status,'draft-document-requires-approval');assert.equal(model.prices[0].amountMinor,150000);
  const manifest={...model,status:'approved'};
  assert.ok(currentDocument(manifest,rows,'2026-11-10'));
  assert.equal(currentDocument(model,rows,'2026-11-10'),false);
  assert.equal(currentDocument(manifest,rows,'2027-01-01'),false);
  const changed=rows.map(r=>({...r,amountMinor:r.amountMinor+1}));
  assert.equal(currentDocument(manifest,changed,'2026-11-10'),false);
  assert.equal(documentModel(rows,{country:'DE',segment:'student',now:'2026-11-10'}),null);
});

test('Phase 2 contract maps every specialist module to SWE without cycles',()=>{
  assert.deepEqual(validate(data),[]);
  assert.equal(categories.length,8);
  const c=publicContract();
  assert.equal(c.schemaVersion,2);assert.equal(c.specialistContributions.length,0);
  assert.ok(c.modules.every(m=>m.specialistAddonIds.length===0));
  const json=JSON.stringify(c);
  assert.ok(!json.includes('Priyanka'));assert.ok(!json.includes('partnerSettlement'));
  const bad=JSON.parse(JSON.stringify(data));
  bad.modules.find(m=>m.id==='ai').prerequisiteModuleIds=['agents'];
  assert.ok(validate(bad).some(e=>e.includes('cycle')));
});
test('completeness reports every product and does not silently approve missing evidence',()=>{
  const rows=completeness();assert.equal(rows.length,36);
  assert.ok(rows.every(r=>r.missing.some(m=>m.includes('duration')) && r.missing.some(m=>m.includes('owner'))));
  assert.ok(rows.every(r=>r.missing.includes('Product price approval')));
});
test('cross-platform URLs are fixed-origin and preserve valid context',()=>{
  const url=new URL(programmeUrl('systems-architecture',{lang:'hi',from:'swe-economic',absolute:true}));
  assert.equal(url.origin,'https://www.swex.ai');assert.equal(url.searchParams.get('from'),'swe-economic');
  assert.equal(url.searchParams.get('lang'),'hi');
  assert.ok(!programmeUrl('session-ai',{from:'https://evil.test'}).includes('evil'));
  assert.equal(language('<script>'),'en');
  assert.throws(()=>programmeUrl('../../private'));
});
test('eight visitor scenarios have direct programme paths, no speculative partner offers',()=>{
  const p=id=>data.products.find(p=>p.id===id);
  const society=views.detail(p('swe-society'));
  assert.ok(society.includes('/programmes/aicademy'));assert.ok(society.includes('https://education.swex.ai/#student'));
  assert.ok(views.overview('SWEX',{category:'sessions'}).includes('/education/session-iot'));
  assert.ok(views.overview('SWEX',{category:'security'}).includes('/education/session-cybersecurity'));
  const architecture=views.detail(p('systems-architecture'));assert.ok(architecture.includes('operational handover'));assert.ok(architecture.includes('Assessment'));
  const academic=views.detail(p('swe-academic'));assert.ok(academic.includes('roots2ai.com'));assert.ok(academic.includes('Digital Safety'));
  const economic=views.detail(p('swe-economic'));assert.ok(economic.includes('https://www.swex.ai/education/systems-architecture?lang=en&amp;from=swe-economic'));
  const national=views.detail(p('swe-national'));assert.ok(national.includes('12-month'));assert.ok(national.includes('/#contact'));
  for(const product of data.products){
    for(const lang of ['en','de','hi']){
      const html=views.detail(product,{lang,from:'swe-economic'});
      assert.ok(!/Priyanka|ISAC|GALTER|Curious Labs/.test(html));
      assert.ok(!html.includes('undefined'));assert.ok(html.includes(`lang="${lang}"`));
    }
  }
  assert.ok(views.overview('SWEX',{category:'partners'}).includes('No specialist partner offering'));
  const user={active:true,role:'national-coordinator',countries:['IN']};
  const proposal=prepareProposal(user,{country:'IN',programmeIds:['swe-institutional']});
  assert.ok(proposal.modules.length);assert.ok(proposal.partners.length);assert.equal(proposal.total,null);assert.equal(proposal.publicationAllowed,false);
  assert.throws(()=>prepareProposal(null,{country:'IN',programmeIds:['swe-institutional']}),/Forbidden/);
  assert.throws(()=>prepareProposal(user,{country:'DE',programmeIds:['swe-institutional']}),/Forbidden/);
});
test('HTTP contract preserves language and handles malformed query types safely',async t=>{
  const app=express();views.install(app,{portfolio:'SWEX',page:(title,body,opts)=>`<html lang="${opts?.lang || 'en'}"><h1>${title}</h1>${body}</html>`});
  const server=app.listen(0);t.after(()=>server.close());const base=`http://localhost:${server.address().port}`;
  for(const suffix of ['?category=security&lang=de','?category=partners&lang=hi','/session-iot?lang=hi&from=swe-economic','?lang[x]=de&from[]=bad','?category=../partners']){
    const r=await fetch(base+'/education'+suffix);assert.equal(r.status,200);
    assert.ok(!(await r.text()).includes('undefined'));
  }
  assert.equal((await fetch(base+'/education/no-product')).status,404);
});
