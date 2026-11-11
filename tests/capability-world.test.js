const test=require('node:test');
const assert=require('node:assert/strict');
const cheerio=require('cheerio');
const express=require('express');
const world=require('../lib/capability-world');
const {readCatalogue}=require('../lib/catalogue');

test('one shared story supports four perspectives and the unchanged six-layer model',()=>{
 assert.deepEqual(world.model.layers,['capability','governance','institutions','academy','economy','society']);
 assert.equal(world.model.perspectives.length,4);
 assert.equal(world.model.stagePhases.length,9);
 const source=require('../content/independent-capability/v1/journey.en.json');
 for(const phase of world.model.phaseOrder){
  const text=cheerio.load(world.story(phase,'en')).text();
  assert.ok(text.includes(source.stages.find(s=>s.id===phase).body));
  for(const perspective of world.model.perspectives){
   const html=world.panel(phase,perspective.id,world.context());
   for(const label of ['Decision point','Accountable people','Prerequisites','Top-down','Bottom-up','not verified evidence'])assert.ok(html.includes(label));
   assert.ok(html.includes(perspective.contributions[world.model.phaseOrder.indexOf(phase)]));
  }
 }
});

test('academy reuses real modules and programme status without inventing credentials or prices',()=>{
 const catalogue=readCatalogue();
 for(const zone of world.model.academyZones){
  for(const id of zone.modules)assert.ok(catalogue.model.modules.some(m=>m.id===id));
  for(const id of zone.programmes)assert.ok(catalogue.programmes.some(p=>p.id===id));
 }
 assert.deepEqual(world.model.rooms.filter(r=>r.status==='reference').map(r=>r.id),['academy']);
 const $=cheerio.load(world.room({stage:'4',perspective:'government',zone:'research',scenario:'010'}));
 assert.equal($('[data-room-panel]').length,4);
 assert.equal($('[data-room-panel][hidden]').length,0);
 assert.equal($('#world-perspective option:selected').val(),'government');
 const back=new URL($('a').filter((_i,e)=>$(e).text().includes('Back to Capability World')).attr('href'),'https://www.swedu.me');
 assert.equal(back.searchParams.get('stage'),'4');assert.equal(back.searchParams.get('scenario'),'010');
 assert.equal(back.searchParams.get('zone'),'research');
});

test('context is allowlisted and anchors retain parameters before their hash',()=>{
 const c=world.context({stage:'<script>',perspective:'__proto__',zone:'../private',scenario:'unsafe',lang:'../../secrets',focus:'unknown'});
 assert.deepEqual(c,{stage:0,perspective:'citizen',zone:'student',scenario:'111',lang:'en',focus:'society'});
 const url=new URL(world.href('/#contact',c),'https://www.swedu.me');
 assert.equal(url.hash,'#contact');assert.equal(url.searchParams.get('perspective'),'citizen');
});

test('local room and programme return paths preserve context; production and unbuilt rooms fail closed',async t=>{
 const old={NODE_ENV:process.env.NODE_ENV,SWE_CONTENT_REVIEW:process.env.SWE_CONTENT_REVIEW};
 const app=express();require('../lib/programme-pages').installProgrammePages(app);
 const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
 t.after(()=>{server.closeAllConnections();server.close();for(const[k,v]of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
 const get=p=>fetch(`http://127.0.0.1:${server.address().port}${p}`);
 process.env.NODE_ENV='production';process.env.SWE_CONTENT_REVIEW='1';
 assert.equal((await get('/world/academy')).status,404);
 process.env.NODE_ENV='development';
 const response=await get('/world/academy?stage=4&perspective=government&zone=research&scenario=010');
 assert.equal(response.status,200);assert.match(response.headers.get('x-robots-tag'),/noindex/);
 const $=cheerio.load(await(await get('/programmes/labs?stage=4&perspective=government&zone=research&scenario=010')).text());
 const back=$('.world-return-strip a').filter((_i,e)=>$(e).text().includes('Academy')).attr('href');
 assert.equal(new URL(back,'https://www.swedu.me').searchParams.get('zone'),'research');
 assert.equal((await get('/world/governance')).status,200);
 assert.equal((await get('/world/unapproved-room')).status,404);
});
