const fs=require('node:fs');
const path=require('node:path');
const d=require('../lib/education/catalogue');
const {validate}=require('../lib/education/validate');
const errors=validate(d);if(errors.length) throw Error(errors.join('\n'));
const lines=['# Education Curriculum and Programme Inventory', '', `Version: ${d.version}. Review date: ${d.date}. All new specifications below are drafts.`,
  '', 'Generated from lib/education/catalogue.js. Edit the source, not this export.',
  '', '## Existing Offers', ...d.existingProducts.map(p=>`- **${p.name}** (${p.status}): ${p.scope} ${p.url}`),
  '', '## Reusable Modules'];
for(const m of d.modules){
  lines.push('',`### ${m.topic} (${m.id})`, '', `Category: ${m.category}. Version: ${m.contentVersion}. Status: ${m.approval}.`,
    `Audience: ${m.audiences.join(', ')}. Prerequisites: ${m.prerequisites}.`, '', '**Learning objectives**',...m.objectives.map(x=>`- ${x}`),
    '', '**Lesson sequence**',...m.lessons.map((l,i)=>`${i+1}. ${l.title}: ${l.content}`), '', '**Practical work**',...m.exercises.map(x=>`- ${x}`),
    '', `Assessment: ${m.assessment}`, `Trainer: ${m.trainer}`,`Equipment: ${m.equipment.join('; ')}.`,
    `Formats: ${m.format.join('; ')}.`, 'Duration: contact, practice and assessment hours pending review.',
    `Credential: ${m.credential.description}`,`Reused by: ${m.reusedBy.join(', ')}.`, `Source IDs: ${m.sourceIds.join(', ')}.`);
}
lines.push('', '## Product Specifications');
for(const p of d.products){
  lines.push('',`### ${p.name} (${p.id})`, '', `${p.portfolio} / ${p.kind} / ${p.approval}`, `Audience: ${p.audience}.`,
    `Modules: ${p.moduleIds.join(', ')}.`, ...p.outcomes.map(x=>`- Outcome: ${x}`),
    `Format: ${p.format}`, `Responsibility: ${p.responsibility}`,`Assessment: ${p.assessment}`,`Credential: ${p.credential}`,
    `Next step: ${p.nextStep}`,`Duration: unconfirmed; ${d.workload(p.moduleIds).moduleCount} unique modules. No hours invented.`,
    'Pricing: no approved price. Enquiry only; existing checkout prices are untouched.');
  if(p.phases) lines.push(`Phases: ${p.phases.join(' -> ')}.`,p.feedback,`Ecosystem: ${p.ecosystem.join('; ')}.`);
}
lines.push('', '## Twelve-Month National Pilot');
for(const s of d.pilot) lines.push('', `### Months ${s.startMonth}-${s.endMonth}: ${s.name}`,s.activity,`Evidence gate: ${s.gate}.`,`Recurring safeguards: ${s.safeguards.join('; ')}.`);
lines.push('', '## Proposed Specialist Add-ons');
for(const a of d.partnerAddons) lines.push('',`### ${a.name} (${a.id})`,`Provider: ${a.provider}; status: ${a.status}.`,
  `Scope: ${a.proposedScope}.`,`Exercise: ${a.exercise}.`,`Assessment: ${a.assessment}.`,
  `Prerequisites: ${a.prerequisites}`,`Equipment: ${a.equipment}`,`Responsibility: ${a.responsibility}`,
  'Duration, price, branding, delivery and credentials require separate agreement.',`Required evidence: ${a.required.join('; ')}.`);
fs.writeFileSync(path.join(__dirname,'../docs/EDUCATION-CATALOGUE.generated.md'),lines.join('\n')+'\n');
console.log(`Exported ${d.modules.length} modules, ${d.products.length} specifications and ${d.partnerAddons.length} proposed add-ons.`);
