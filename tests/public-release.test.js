const test=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
test('explicit public release serves three languages while keeping campus closed',async t=>{
 const old={NODE_ENV:process.env.NODE_ENV,SWE_PUBLIC_WORLD:process.env.SWE_PUBLIC_WORLD};
 process.env.NODE_ENV='production';process.env.SWE_PUBLIC_WORLD='1';
 const app=express();require('../lib/programme-pages').installProgrammePages(app);require('../lib/partner-campus').installPartnerCampus(app);
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 t.after(()=>{server.closeAllConnections();server.close();for(const[k,v]of Object.entries(old)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
 const get=p=>fetch(`http://127.0.0.1:${server.address().port}${p}`);
 for(const lang of ['en','de','hi']){
  const home=await get('/?lang='+lang);const html=await home.text();
  assert.equal(home.status,200);assert.equal(home.headers.get('x-robots-tag'),null);
  assert.ok(html.includes('data-spatial-shell'));assert.ok(html.includes(`lang="${lang}"`));
  const page=await get('/programmes/teachers?worldDocument=1&lang='+lang);
  assert.match(await page.text(),/data-swe-translation-complete="true"/);
 }
 assert.equal((await get('/world/academy')).status,200);
 assert.equal((await get('/world/not-a-room')).status,404);
 assert.notEqual((await get('/partners')).status,200);
});
