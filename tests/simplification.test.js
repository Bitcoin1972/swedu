const {test}=require('node:test');
const assert=require('node:assert/strict');
const {render}=require('../lib/swe-programme-view');
const {readCatalogue}=require('../lib/catalogue');
const data=require('../lib/education/catalogue');
test('all thirteen SWE programme explanations have six sections, imagery and one primary action',()=>{
  for(const p of [...readCatalogue().programmes,...data.products.filter(p=>p.portfolio==='SWE')]){
    const html=render(p);
    assert.equal((html.match(/<h2>/g)||[]).length,6,p.id);
    assert.equal((html.match(/class="btn-primary"/g)||[]).length,1,p.id);
    assert.match(html,/<img src="\/images\//);
    assert.doesNotMatch(html,/undefined|amountMinor|price-table|2,500|1,500|19,500|Priyanka|ISAC/);
    assert.doesNotMatch(html,/learning hours|contentVersion|curriculum-awaiting-review|<table/i);
  }
});
test('AIcademy explains independent learning and sends visitors to one authoritative destination',()=>{
  const html=render(readCatalogue().programmes.find(p=>p.id==='aicademy'));
  for(const phrase of ['Understand AI','Guide AI','Verify AI','Apply AI','AI tutor','interactive exercises','practical challenges','workbook','Multilingual','own pace','Explore AIcademy4you']) assert.ok(html.includes(phrase),phrase);
  assert.match(html,/href="https:\/\/academy.swex.ai"/);
  assert.doesNotMatch(html,/lifetime|guaranteed access|Choose your access path|country-form/i);
});
