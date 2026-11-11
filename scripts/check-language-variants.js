const express=require('express');
const cheerio=require('cheerio');
const {installProgrammePages}=require('../lib/programme-pages');
const {readCatalogue}=require('../lib/catalogue');
const {collect,dictionaries}=require('../lib/site-i18n');
async function check(){
 const data=readCatalogue(),routes=new Set();
 for(const audience of data.model.audiences){
  routes.add('/programmes?audience='+audience.id);
  for(const capability of data.model.capabilities)routes.add('/programmes?'+new URLSearchParams({audience:audience.id,capability:capability.id}));
  for(const programme of data.programmes)routes.add(programme.url+'?audience='+audience.id);
 }
 for(const programme of data.programmes)for(const capability of programme.capabilityIds)routes.add(programme.url+'?capability='+capability);
 for(const layer of data.model.layers)routes.add('/capability-model?layer='+layer.id);
 const app=express();installProgrammePages(app);const server=app.listen(0,'127.0.0.1');
 await new Promise(resolve=>server.once('listening',resolve));const missing=new Map();
 try{
  for(const route of routes){
   const response=await fetch(`http://127.0.0.1:${server.address().port}${route}`);
   if(!response.ok)throw Error(`${route}: ${response.status}`);
   for(const record of collect(cheerio.load(await response.text())))for(const {source}of record.values){
    if(!dictionaries.de[source]||!dictionaries.hi[source]){
     if(!missing.has(source))missing.set(source,[]);
     missing.get(source).push(route);
    }
   }
  }
 }finally{server.closeAllConnections();server.close();}
 return {routes:routes.size,missing:[...missing].map(([source,routes])=>({source,routes}))};
}
if(require.main===module)check().then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error(error);process.exitCode=1;});
module.exports={check};
