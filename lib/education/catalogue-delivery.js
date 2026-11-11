const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

// Deliberately unmounted. Production identity, storage, mail and document approval
// must be reviewed separately before a route can collect visitor data.
function createCatalogueDelivery({documents,privateRoot,publicRoots,origin,sendLink,saveLead,verifyCatalogue=()=>false,now=()=>Date.now()}) {
  const tokens = new Map();
  const digest = token=>crypto.createHash('sha256').update(token).digest('hex');
  const expired = ()=> { for(const [key,value] of tokens) if(value.expires<=now()) tokens.delete(key); };
  const eligible = (d,country)=>d && d.status==='approved' && d.visibility==='public'
    && d.country===country && d.approvalReference && d.version && d.reviewedOn
    && /^\d{4}-\d{2}-\d{2}$/.test(d.validFrom) && /^\d{4}-\d{2}-\d{2}$/.test(d.validUntil)
    && d.validFrom<=new Date(now()).toISOString().slice(0,10)
    && d.validUntil>=new Date(now()).toISOString().slice(0,10) && verifyCatalogue(d)===true;
  async function readDocument(d) {
    const root=await fs.realpath(privateRoot);
    const file=await fs.realpath(path.resolve(root,d.file));
    if(!file.startsWith(root+path.sep)) throw Error('Document unavailable');
    for(const publicRoot of publicRoots) {
      const publicPath=await fs.realpath(publicRoot).catch(error=>{
        if(error.code==='ENOENT') return path.resolve(publicRoot);
        throw error;
      });
      if(file===publicPath || file.startsWith(publicPath+path.sep)) throw Error('Document unavailable');
    }
    const bytes=await fs.readFile(file);
    if(bytes.subarray(0,5).toString()!=='%PDF-' || !/^[a-f0-9]{64}$/.test(d.sha256)
      || crypto.createHash('sha256').update(bytes).digest('hex')!==d.sha256) throw Error('Document unavailable');
    return bytes;
  }
  return {
    async request({name,email,country,documentId,marketingConsent=false}) {
      if(typeof name!=='string' || name.trim().length<1 || name.length>120 || /[\r\n]/.test(name)
        || typeof email!=='string' || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || typeof country!=='string' || !/^[A-Z]{2}$/.test(country) || typeof marketingConsent!=='boolean') throw Error('Invalid request');
      const d=documents.find(d=>d.id===documentId);
      if(!eligible(d,country)) throw Error('Catalogue not released');
      if(!sendLink || !saveLead || !Array.isArray(publicRoots) || !publicRoots.length || !/^https:\/\//.test(origin)) throw Error('Delivery unavailable');
      await readDocument(d);
      expired();
      if(tokens.size>=1000) throw Error('Please try again later');
      const token=crypto.randomBytes(32).toString('base64url');
      const key=digest(token);
      tokens.set(key,{documentId:d.id,country,expires:now()+30*60*1000});
      try {
        await saveLead({name:name.trim(),email,country,documentId,documentVersion:d.version,marketingConsent,consentRecordedAt:new Date(now()).toISOString()});
        const result=await sendLink({to:email,url:`${new URL(origin).origin}/catalogue-access/${token}`,version:d.version});
        if(result?.accepted!==true) throw Error('Delivery unavailable');
        return {status:'sent'};
      } catch {
        tokens.delete(key);
        throw Error('Delivery unavailable');
      }
    },
    async retrieve(token) {
      expired();
      if(typeof token!=='string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw Error('Link unavailable');
      const grant=tokens.get(digest(token));
      if(!grant) throw Error('Link unavailable');
      const d=documents.find(d=>d.id===grant.documentId);
      if(!eligible(d,grant.country)) throw Error('Link unavailable');
      const bytes=await readDocument(d);
      return {bytes,filename:`catalogue-${d.country}.pdf`,headers:{'Content-Type':'application/pdf','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; frame-ancestors 'self'"}};
    }
  };
}
module.exports={createCatalogueDelivery};
