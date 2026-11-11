const fs=require('node:fs');
const path=require('node:path');
const data=require('../lib/education/catalogue');
const {publicContract,completeness}=require('../lib/education/contract');
const rows=completeness();
const folder=path.join(__dirname,'../docs');
fs.writeFileSync(path.join(folder,'EDUCATION-COMPLETENESS.generated.json'),JSON.stringify({version:data.version,products:rows},null,2)+'\n');
fs.writeFileSync(path.join(folder,'EDUCATION-CONTRACT.generated.json'),JSON.stringify(publicContract(),null,2)+'\n');
const lines=['# Programme Completeness', '', `Version ${data.version}. Generated from canonical source. Not an approval.`, '',
  '| Programme | Content state | Open items |', '| --- | --- | --- |',
  ...rows.map(r=>`| ${r.id} | ${r.status} | ${r.missing.length} |`), '',
  'All 36 new specifications have meaningful lesson outlines and practical evidence proposals. None is represented as an already approved qualification. Missing numerical durations, named assignments, syllabus/assessment approvals, prices and credential decisions are reported individually below.',
  '', 'AIcademy and Knowledge Camp remain existing offers under their original enrolment, price and credential rules.',
  '', '## Per-Programme Gaps'];
for(const row of rows)lines.push('',`### ${row.id}`, ...row.missing.map(x=>`- ${x}`), ...row.partnerApprovals.map(p=>`- Specialist ${p.id}: ${p.agreement}; public display ${p.publicDisplay?'approved':'not approved'}.`));
fs.writeFileSync(path.join(folder,'EDUCATION-COMPLETENESS.generated.md'),lines.join('\n')+'\n');
console.log(`Exported schema 2 contract and ${rows.length} completeness records.`);
