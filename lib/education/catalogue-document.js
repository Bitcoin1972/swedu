const crypto=require('node:crypto');
const data=require('./catalogue');
const {publicPrices}=require('./pricing');
function documentModel(rows,{country,segment,now=new Date().toISOString().slice(0,10)}){
  const prices=publicPrices(rows,country,segment,now);
  if(!prices.length)return null;
  const model={schemaVersion:1,curriculumVersion:data.version,country,segment,
    status:'draft-document-requires-approval',
    validFrom:prices.map(p=>p.validFrom).sort().at(-1),validUntil:prices.map(p=>p.validUntil).sort()[0],
    prices,products:prices.map(p=>({id:p.productId,name:data.products.find(x=>x.id===p.productId)?.name || data.existingProducts.find(x=>x.id===p.productId)?.name || p.productId}))};
  return {...model,sourceFingerprint:crypto.createHash('sha256').update(JSON.stringify(model)).digest('hex')};
}
function currentDocument(manifest,rows,now){
  const model=documentModel(rows,{country:manifest.country,segment:manifest.segment,now});
  return !!model && manifest.sourceFingerprint===model.sourceFingerprint && manifest.status==='approved';
}
module.exports={documentModel,currentDocument};
