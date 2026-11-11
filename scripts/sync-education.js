const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {validate} = require('../lib/education/validate');
const data = require('../lib/education/catalogue');
const errors=validate(data);
if(errors.length) throw Error(errors.join('\n'));
if(require('../lib/education/locales').sourceVersion!==data.version)throw Error('Translation source version mismatch');
const target=process.argv[2];
if(!target || !fs.existsSync(path.join(target,'package.json'))) throw Error('Supply the SWEX repository path');
if(JSON.parse(fs.readFileSync(path.join(target,'package.json'),'utf8')).name!=='swex-landing') throw Error('Target is not the SWEX repository');
const files=['catalogue.js','views.js','validate.js','pricing.js','contract.js','journeys.js','locales.js','presentation.js'];
const destination=path.join(target,'lib','education');
fs.mkdirSync(destination,{recursive:true});
const hashes={};
for(const name of files){
  const bytes=fs.readFileSync(path.join(__dirname,'..','lib','education',name));
  hashes[name]=crypto.createHash('sha256').update(bytes).digest('hex');
  fs.writeFileSync(path.join(destination,name),bytes);
}
const contract=require('../lib/education/contract').publicContract();
const contractBytes=JSON.stringify(contract,null,2)+'\n';
fs.writeFileSync(path.join(destination,'public-contract.json'),contractBytes);
hashes['public-contract.json']=crypto.createHash('sha256').update(contractBytes).digest('hex');
fs.writeFileSync(path.join(destination,'release.json'),JSON.stringify({version:data.version,canonicalRepository:'Bitcoin1972/swedu',canonicalPath:'lib/education',generated:true,files:hashes},null,2)+'\n');
console.log(`Synchronized ${files.length} education files, ${data.version}. No prices or checkout code changed.`);
