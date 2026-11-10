const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const { readCatalogue, approvedPrices } = require('../lib/catalogue');
const { installProgrammePages, escape } = require('../lib/programme-pages');
const { installPartnerCampus, canReadCountry } = require('../lib/partner-campus');

test('public prices require approval, evidence, freshness and matching country', () => {
  const data = readCatalogue();
  const now = new Date('2026-11-09');
  assert.equal(approvedPrices(data, 'IN', now).length, 8);
  assert.equal(approvedPrices(data, 'DE', now).length, 0);
  assert.equal(approvedPrices(data, 'IN', new Date('2026-12-08')).length, 0);
  for (const change of [{status:'draft'}, {source:''}, {verifiedOn:'2027-01-01'}, {amountMinor:null}, {amountMinor:-1}]) {
    assert.equal(approvedPrices({prices:[{...data.prices[0], ...change}]}, 'IN', now).length, 0);
  }
});

test('country and role permissions cannot be supplied by visitors', () => {
  assert.equal(canReadCountry({role:'national-coordinator',countries:['IN']}, 'IN'), true);
  assert.equal(canReadCountry({role:'national-coordinator',countries:['IN']}, 'DE'), false);
  assert.equal(canReadCountry({role:'sales-partner',countries:['IN']}, 'IN'), false);
  assert.equal(canReadCountry({role:'prospect',countries:['IN']}, 'IN'), false);
  assert.equal(canReadCountry({role:'management'}, '../IN'), false);
});

test('HTTP public pages preserve upstream registration and withhold private content', async t => {
  const app = express();
  installProgrammePages(app);
  installPartnerCampus(app);
  app.use(express.static(path.join(__dirname, '../public')));
  const server = app.listen(0, '127.0.0.1');
  t.after(() => { server.closeAllConnections(); server.close(); });
  await new Promise(resolve => server.once('listening', resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  for (const route of ['/programmes','/programmes/aicademy','/approach','/capability-careers','/national-capability','/who-we-serve','/network','/about']) {
    const response = await fetch(root + route);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Smart World Education/);
  }
  const html = await (await fetch(root + '/programmes/aicademy')).text();
  assert.match(html, /https:\/\/education.swex.ai\/#student/);
  assert.doesNotMatch(html, /deliveryCost|passwordHash|contingencyRate/);
  const other = await (await fetch(root + '/programmes/aicademy?country=DE')).text();
  assert.match(other, /No verified prices/);
  assert.doesNotMatch(other, /2,500/);
  for (const route of ['/data/catalogue.json','/data/programme-details.json','/IN/report.md','/partner-private/IN/pricing.json','/docs/partner-campus.md','/.env','/test-results/release-2026-11-09/pages.json','/lib/contact.js']) {
    assert.equal((await fetch(root + route)).status, 404);
  }
  assert.equal((await fetch(root + '/partners')).status, 503);
  for (const programme of readCatalogue().programmes) {
    const response = await fetch(root + programme.url);
    assert.equal(response.status, 200);
    const detail = await response.text();
    for (const heading of ['Why Choose This Programme?','Learning hours','Weeks or months','Credential type','Issuing organisation','External recognition','Evidence and portfolio','Career pathways','Fees &amp; registration']) {
      assert.ok(detail.includes(heading), `${programme.id}: missing ${heading}`);
    }
    assert.doesNotMatch(detail,/undefined|deliveryCost|contingencyRate|passwordHash/);
    assert.ok(detail.includes(escape(programme.availability)));
    if (programme.id !== 'aicademy') assert.ok(detail.includes(escape(programme.capability)));
    if (programme.status === 'proposed programme') assert.match(detail,/No upcoming pilot|no upcoming intake/);
  }
  assert.equal((await fetch(root + '/programmes/unknown')).status,404);
  for (const url of ['https://academy.swex.ai/individual','https://education.swex.ai/#student','https://education.swex.ai/#institution','https://business.swex.ai/','https://government.swex.ai/']) {
    assert.ok(html.includes(url));
  }
  const home = await (await fetch(root + '/')).text();
  for (const id of ['mission','fields','hubs','founder','cofounder','partners','contact','network-links','imprint','contactForm']) {
    assert.ok(home.includes(`id="${id}"`), `preserved anchor ${id}`);
  }
  const { links } = require('../lib/site-navigation');
  for (const [url] of links) {
    assert.ok(home.includes(`href="${url}"`), `homepage navigation ${url}`);
    assert.equal((await fetch(root+url)).status,200);
  }
});

test('campus authenticates, escapes content, scopes countries and throttles', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'swe-campus-test-'));
  const password = crypto.randomBytes(32).toString('hex');
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  const accountsPath = path.join(dir, 'accounts.json');
  fs.writeFileSync(accountsPath, JSON.stringify([{username:'test',active:true,role:'national-coordinator',countries:['IN'],salt,passwordHash:hash}]));
  fs.mkdirSync(path.join(dir,'IN'));
  fs.writeFileSync(path.join(dir,'IN','pricing.json'), JSON.stringify({country:'IN',status:'draft',researchDate:'2026-11-07',proposals:[{name:'Private test',range:[1,2],unit:'test'}]}));
  fs.writeFileSync(path.join(dir,'IN','report.md'), '<script>private sentinel</script>');
  const app = express();
  installPartnerCampus(app, {accountsPath,dataRoot:dir});
  const server = app.listen(0,'127.0.0.1');
  t.after(() => { server.closeAllConnections(); server.close(); fs.rmSync(dir,{recursive:true}); });
  await new Promise(resolve => server.once('listening',resolve));
  const root = `http://127.0.0.1:${server.address().port}`;
  const headers = {authorization:'Basic '+Buffer.from('test:'+password).toString('base64')};
  assert.equal((await fetch(root+'/partners')).status,401);
  assert.equal((await fetch(root+'/partners',{headers:{authorization:'Basic '+Buffer.from('test:wrong').toString('base64')}})).status,401);
  const response = await fetch(root+'/partners',{headers});
  assert.equal(response.status,200);
  assert.equal(response.headers.get('cache-control'),'private, no-store');
  const html = await response.text();
  assert.match(html,/private sentinel/);
  assert.doesNotMatch(html,/<script>/);
  assert.equal((await fetch(root+'/partners?country=DE&role=management',{headers})).status,403);
  assert.equal((await fetch(root+'/partners?country=../IN',{headers})).status,403);
  const oldEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    assert.equal((await fetch(root+'/partners',{headers})).status,503);
    assert.equal((await fetch(root+'/partners?country=IN',{headers:{...headers,'x-forwarded-proto':'https'}})).status,503);
  } finally {
    if (oldEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = oldEnv;
  }
  fs.writeFileSync(accountsPath,'[]');
  assert.equal((await fetch(root+'/partners',{headers})).status,401);
  for(let i=0;i<6;i++) await fetch(root+'/partners',{headers});
  assert.equal((await fetch(root+'/partners',{headers})).status,429);
});
