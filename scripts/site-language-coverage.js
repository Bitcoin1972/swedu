const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const cheerio = require('cheerio');
const {collect,dictionaries} = require('../lib/site-i18n');
const {installProgrammePages} = require('../lib/programme-pages');
const {readCatalogue} = require('../lib/catalogue');
const {products} = require('../lib/education/catalogue');

(async()=>{
  const app=express();
  installProgrammePages(app);
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const routes=['/','/capability-model','/approach','/programmes','/education','/who-we-serve','/capability-careers','/national-capability','/network','/about','/privacy',
    ...readCatalogue().model.audiences.map(a=>'/audiences/'+a.id),
    ...readCatalogue().programmes.map(p=>p.url),
    ...products.filter(p=>p.portfolio==='SWE').map(p=>'/education/'+p.id)];
  const entries=new Map();
  const pages=[];
  try {
    for(const route of [...new Set(routes)]) {
      const r=await fetch(`http://127.0.0.1:${server.address().port}${route}`);
      if(!r.ok)throw Error(`${route}: ${r.status}`);
      const records=collect(cheerio.load(await r.text()));
      const sources=[...new Set(records.flatMap(r=>r.values.map(v=>v.source)))];
      for(const source of sources){if(!entries.has(source))entries.set(source,{source,routes:[]});entries.get(source).routes.push(route);}
      pages.push({route,strings:sources.length,deMissing:sources.filter(s=>!dictionaries.de[s]).length,hiMissing:sources.filter(s=>!dictionaries.hi[s]).length});
    }
  } finally {server.closeAllConnections();server.close();}
  const report={version:1,pages,strings:[...entries.values()].map(e=>({...e,de:dictionaries.de[e.source]||null,hi:dictionaries.hi[e.source]||null}))};
  fs.writeFileSync(path.join(__dirname,'../docs/SITE-LANGUAGE-COVERAGE.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({pages:pages.length,strings:entries.size,deMissing:report.strings.filter(s=>!s.de).length,hiMissing:report.strings.filter(s=>!s.hi).length}));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
