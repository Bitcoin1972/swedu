const test=require('node:test');
const assert=require('node:assert/strict');
const content=require('../content/assessment-case');
const shell=require('../lib/spatial-shell');
test('assessment case has equivalent complete editorial drafts and primary evidence',()=>{
 assert.equal(content.status,'release-approved');
 assert.ok(content.sources.some(([,url])=>url.startsWith('https://www.officeforstudents.org.uk/')));
 for(const lang of ['en','de','hi']){
  const c=content[lang];assert.equal(c.names.length,4);assert.equal(c.views.length,4);assert.equal(c.labels.length,5);
  for(const text of [c.facts,c.meaning,c.response,c.evaluation,...c.views])assert.ok(text.length>180);
 }
});
test('approved assessment case is released but unapproved drafts remain blocked in production',()=>{
 const keys=['NODE_ENV','SWE_CONTENT_REVIEW','SWE_PUBLIC_WORLD'],saved=keys.map(k=>process.env[k]);
 try{
  process.env.SWE_CONTENT_REVIEW='1';process.env.SWE_PUBLIC_WORLD='0';process.env.NODE_ENV='development';
  assert.ok(shell.page({lang:'de',stage:4}).includes('KI und der Nachweis echten Lernens'));
  process.env.NODE_ENV='production';
  assert.ok(shell.page({lang:'de',stage:4}).includes('KI und der Nachweis echten Lernens'));
  content.status='editorial-review';
  assert.ok(!shell.page({lang:'de',stage:4}).includes('KI und der Nachweis echten Lernens'));
 }finally{content.status='release-approved';keys.forEach((k,i)=>saved[i]===undefined?delete process.env[k]:process.env[k]=saved[i]);}
});
