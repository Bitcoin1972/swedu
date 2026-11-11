function validate(data) {
  const errors = [];
  const unique = (rows,label)=> { if(new Set(rows.map(r=>r.id)).size!==rows.length) errors.push(`Duplicate ${label} ID`); };
  unique(data.modules,'module'); unique(data.products,'product'); unique(data.partnerAddons,'addon');
  const ids = new Set(data.modules.map(m=>m.id));
  for (const m of data.modules) {
    for (const field of ['id','topic','category','audiences','prerequisites','objectives','lessons','duration','format','trainer','equipment','exercises','assessment','outcomes','credential','sourceIds','contentVersion','availability','approval','reusedBy']) {
      if(m[field]===undefined || m[field]===null) errors.push(`${m.id}: missing ${field}`);
    }
    if(m.lessons.length<3 || m.lessons.some(l=>l.content.length<40)) errors.push(`${m.id}: insufficient lesson content`);
    if(m.duration.status==='unconfirmed' && ['contactHours','practiceHours','assessmentHours'].some(k=>m.duration[k]!==null)) errors.push(`${m.id}: unsupported duration`);
    for(const id of m.reusedBy) if(!data.products.some(p=>p.id===id && p.moduleIds.includes(m.id))) errors.push(`${m.id}: broken reuse`);
  }
  for(const p of data.products) for(const id of p.moduleIds) if(!ids.has(id)) errors.push(`${p.id}: unknown module ${id}`);
  for(const m of data.modules){
    if(!data.products.some(p=>p.portfolio==='SWE' && p.moduleIds.includes(m.id))) errors.push(`${m.id}: no SWE application`);
    for(const id of m.prerequisiteModuleIds || []) if(!ids.has(id) || id===m.id) errors.push(`${m.id}: invalid prerequisite`);
  }
  const visiting=new Set(),visited=new Set();
  function walk(id){
    if(visiting.has(id)){errors.push(`${id}: prerequisite cycle`);return;}
    if(visited.has(id))return;
    visiting.add(id);
    for(const next of data.modules.find(m=>m.id===id)?.prerequisiteModuleIds || []) walk(next);
    visiting.delete(id);visited.add(id);
  }
  for(const m of data.modules)walk(m.id);
  if(data.products.filter(p=>p.kind==='specialist-bootcamp').length!==6) errors.push('Expected six bootcamps');
  if(data.products.filter(p=>p.kind==='integrated-capability').length!==5) errors.push('Expected five SWE frameworks');
  if(data.layers.join('|')!=='Capability|Governance|Institutions|Academy|Economy|Society') errors.push('Layer order');
  const months=data.pilot.flatMap(p=>Array.from({length:p.endMonth-p.startMonth+1},(_,i)=>p.startMonth+i));
  if(months.join(',')!==Array.from({length:12},(_,i)=>i+1).join(',')) errors.push('Pilot must cover each month once');
  for(const p of data.partnerAddons) if(p.deliveryApproval || p.priceApproval || p.credentialApproval || p.brandingApproval) errors.push(`${p.id}: unsupported partner approval`);
  return errors;
}
module.exports = {validate};
