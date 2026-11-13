const test=require('node:test');
const assert=require('node:assert/strict');
const {preview,confirmation}=require('../lib/partner-scene');
test('approved logos use public assets, without review routes',()=>{
 const data=preview();
 assert.ok(data.records.filter(r=>r.logo).every(r=>r.logo.startsWith('/images/partners/')));
 assert.ok(!JSON.stringify(data).includes('/partner-review-assets/'));
});
test('ecosystem preview includes confirmed entities and isolates representative to DRF',()=>{
 const data=preview();assert.equal(data.records.length,13);
 assert.equal(confirmation.agreementsConfirmed,true);
 assert.equal(confirmation.agreementDocumentsInspected,false);
 assert.equal(data.records.find(r=>r.id==='aigc').website,'https://aigovernancecorridor.org/');
 assert.match(data.records.find(r=>r.id==='ambedkar-sonepat').name,/National Law University, Sonepat/);
 assert.deepEqual(data.records.filter(r=>r.representative).map(r=>r.id),['drf-world']);
 for(const lang of ['en','de','hi'])for(const r of data.records){assert.ok(r.description[lang]);assert.ok(r.editorial.relationship[lang] && r.editorial.benefit[lang]);assert.ok(data.copy[lang].biography);}
 assert.equal(data.records.filter(r=>r.logo).length,13);
 for(const id of ['swex','roots2ai','srm-sonepat'])assert.ok(data.records.find(r=>r.id===id).logo);
 assert.ok(!JSON.stringify(data).includes('vinitasahay@gmail.com'));
 assert.ok(!JSON.stringify(data).includes('8826190336'));
});
test('approved ecosystem assets and data are included in production shell',()=>{
 const {page}=require('../lib/spatial-shell');const previous=process.env.NODE_ENV;
 try{process.env.NODE_ENV='production';const html=page({lang:'de'});assert.ok(html.includes('src="/js/partner-scene.js"'));assert.ok(!html.includes('"partners":null'));}
 finally{if(previous===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previous;}
});
