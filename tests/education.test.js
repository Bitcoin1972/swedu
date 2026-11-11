const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const express=require('express');
const data=require('../lib/education/catalogue');
const {validate}=require('../lib/education/validate');
const {publicPrices,importAcademyPrices}=require('../lib/education/pricing');
const {createCatalogueDelivery}=require('../lib/education/catalogue-delivery');

test('education graph is complete and proposals are not approvals',()=>{
  assert.deepEqual(validate(data),[]);
  assert.equal(data.modules.length,17);
  assert.equal(data.products.filter(p=>p.kind==='specialist-bootcamp').length,6);
  assert.equal(data.products.filter(p=>p.portfolio==='SWE').length,5);
  assert.ok(data.products.every(p=>p.price.amountMinor===null && p.approval==='draft'));
  assert.equal(data.partnerAddons.filter(p=>p.provider==='ISAC').length,8);
});
test('validator rejects broken relationships and unsupported durations',()=>{
  const altered=JSON.parse(JSON.stringify(data)); altered.products[0].moduleIds.push('missing');
  altered.modules[0].duration.contactHours=30;
  assert.ok(validate(altered).some(x=>x.includes('unknown module')));
  assert.ok(validate(altered).some(x=>x.includes('unsupported duration')));
});
test('workload does not double count reused modules or invent missing hours',()=>{
  const result=data.workload(['ai','ai','agents']);
  assert.equal(result.moduleCount,2); assert.equal(result.totalHours,null);
  assert.deepEqual(result.unconfirmedModules,['ai','agents']);
  assert.throws(()=>data.workload(['missing']));
});
test('AIcademy adapter preserves all authoritative amounts, terms and links',()=>{
  const original=require('../data/catalogue.json');
  const rows=importAcademyPrices(original);
  assert.deepEqual(rows.map(p=>p.amountMinor),original.prices.map(p=>p.amountMinor));
  assert.deepEqual(rows.map(p=>p.registrationUrl),original.prices.map(p=>p.url));
  assert.equal(publicPrices(rows,'IN','individual','2026-11-10')[0].amountMinor,250000);
  assert.equal(publicPrices(rows,'IN','student','2026-11-10')[0].amountMinor,150000);
  assert.equal(publicPrices(rows,'IN','institution','2026-11-10').length,6);
  assert.equal(publicPrices(rows,'DE','individual','2026-11-10').length,0);
  assert.equal(publicPrices(rows,'IN','individual','2027-01-01').length,0);
  const privateRow={...rows[0],visibility:'partner-confidential'};
  assert.equal(publicPrices([privateRow],'IN','individual','2026-11-10').length,0);
  const projected=publicPrices([{...rows[0],margin:100,trainingCosts:100,leadAssignment:'private',discountApproval:'private'}],'IN','individual','2026-11-10')[0];
  for(const k of ['margin','trainingCosts','leadAssignment','discountApproval']) assert.equal(projected[k],undefined);
});
test('all programme pages render direct content and invalid IDs fail closed',async t=>{
  const app=express();
  require('../lib/education/views').install(app,{portfolio:'SWE',page:(title,body)=>`<h1>${title}</h1>${body}`});
  const server=app.listen(0);t.after(()=>server.close());
  const base=`http://127.0.0.1:${server.address().port}`;
  for(const p of data.products.filter(p=>p.portfolio==='SWE')){
    const response=await fetch(base+'/education/'+p.id);assert.equal(response.status,200);
    const html=await response.text();
    for(const needle of ['What is this programme?','What will participants learn?','How can they start?','Participation and credentials']) assert.ok(html.includes(needle));
    assert.ok(!html.includes('undefined'));
  }
  assert.equal((await fetch(base+'/education/bootcamp-applied-ai')).status,404);
  assert.equal((await fetch(base+'/education/not-real')).status,404);
  const unavailable=await (await fetch(base+'/education/catalogues')).text();
  assert.ok(!unavailable.includes('<form'));
});
test('secure catalogue delivery: approvals, country, expiry, integrity, confinement and mail failure',async t=>{
  const root=await fs.mkdtemp(path.join(os.tmpdir(),'swe-catalogue-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  const bytes=Buffer.from('%PDF-1.4\nunit-test fixture, not a released catalogue');
  await fs.writeFile(path.join(root,'approved.pdf'),bytes);
  const d={id:'example',country:'IN',status:'approved',visibility:'public',approvalReference:'test-only',version:'test',reviewedOn:'2026-11-10',validFrom:'2026-11-01',validUntil:'2026-11-30',file:'approved.pdf',sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
  let clock=Date.parse('2026-11-10T12:00:00Z'),sent,lead;
  const opts={documents:[d],privateRoot:root,publicRoots:[path.join(root,'public')],origin:'https://example.test',verifyCatalogue:()=>true,now:()=>clock,sendLink:async msg=>{sent=msg;return {accepted:true};},saveLead:async row=>{lead=row;}};
  const delivery=createCatalogueDelivery(opts);
  const request={name:'Test learner',email:'learner@example.test',country:'IN',documentId:'example'};
  await assert.rejects(createCatalogueDelivery({...opts,verifyCatalogue:undefined}).request(request),/not released/);
  await assert.rejects(delivery.request({...request,country:'DE'}),/not released/);
  d.status='draft';await assert.rejects(delivery.request(request),/not released/);d.status='approved';
  d.visibility='partner-confidential';await assert.rejects(delivery.request(request),/not released/);d.visibility='public';
  await assert.rejects(delivery.request({...request,email:'a\r\nb@example.test'}),/Invalid/);
  assert.deepEqual(await delivery.request(request),{status:'sent'});
  assert.equal(lead.marketingConsent,false);
  assert.ok(!sent.url.includes('learner'));
  const token=sent.url.split('/').pop();
  assert.deepEqual((await delivery.retrieve(token)).bytes,bytes);
  d.status='withdrawn';await assert.rejects(delivery.retrieve(token),/unavailable/);d.status='approved';
  clock+=31*60*1000;await assert.rejects(delivery.retrieve(token),/unavailable/);
  await assert.rejects(delivery.retrieve('not-a-token'),/unavailable/);
  const failed=createCatalogueDelivery({...opts,sendLink:async()=>({accepted:false})});
  await assert.rejects(failed.request(request),/Delivery unavailable/);
  const absent=createCatalogueDelivery({...opts,sendLink:null});
  await assert.rejects(absent.request(request),/Delivery unavailable/);
  d.file='../outside.pdf';await assert.rejects(delivery.request(request));d.file='approved.pdf';
  const staticRoot=createCatalogueDelivery({...opts,publicRoots:[root]});
  await assert.rejects(staticRoot.request(request),/unavailable/);
  await fs.writeFile(path.join(root,'approved.pdf'),Buffer.from('%PDF-changed'));
  await assert.rejects(delivery.request(request),/unavailable/);
});
