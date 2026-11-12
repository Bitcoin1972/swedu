const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const knowledge=require('../content/world-knowledge');
const {readCatalogue}=require('../lib/catalogue');
test('knowledge windows contain complete narratives and authoritative navigation in all languages',()=>{
 const catalogue=readCatalogue();
 for(const lang of ['de','en','hi']){
  const k=knowledge[lang];assert.equal(k.issues.length,3);
  for(const issue of k.issues){
   for(const field of ['meaning','stage','actors','support'])assert.ok(issue[field].length>150,`${lang}: ${field}`);
   assert.equal(issue.effects.length,2);assert.ok(k.limit.length>100);
   for(const id of issue.programmes)assert.ok(catalogue.programmes.some(p=>p.id===id));
   for(const room of issue.rooms)assert.ok(require('../lib/spatial-shell').roomIds.includes(room));
  }
 }
});
test('explanations precede optional assumptions and preserve intro URL until interaction',()=>{
 const js=fs.readFileSync(require.resolve('../public/js/spatial-shell.js'),'utf8');
 assert.ok(js.indexOf('${issue.meaning}')<js.indexOf('${k.explore}'));
 assert.ok(js.includes('knowledge.showModal()'));
 assert.ok(js.includes("knowledge.addEventListener('close'"));
 assert.ok(js.includes("render();history.replaceState({...state,view,zoneOpen,documentURL},'',location.href)"));
 const opening=js.slice(js.indexOf('function openKnowledge'),js.indexOf('function model'));
 assert.ok(!/state\.(room|stage|zone)\s*=(?!=)/.test(opening));
});
