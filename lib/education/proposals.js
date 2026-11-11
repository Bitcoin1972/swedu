const catalogue=require('./catalogue');
const {relationships}=require('./partner-planning');
function prepareProposal(user,{country,programmeIds},priceRows=[]){
  // The caller must supply a server-authenticated identity, never request JSON.
  if(!user || user.active!==true || !/^[A-Z]{2}$/.test(country)
    || !(user.role==='management' || (user.role==='national-coordinator' && user.countries?.includes(country)))) throw Error('Forbidden');
  if(!Array.isArray(programmeIds) || !programmeIds.length || programmeIds.length>20) throw Error('Invalid selection');
  const programmes=[...new Set(programmeIds)].map(id=>catalogue.products.find(p=>p.id===id));
  if(programmes.some(p=>!p))throw Error('Unknown programme');
  const moduleIds=[...new Set(programmes.flatMap(p=>p.moduleIds))];
  const modules=moduleIds.map(id=>catalogue.modules.find(m=>m.id===id));
  return {version:catalogue.version,country,status:'draft-requires-human-approval',programmeIds:programmes.map(p=>p.id),
    modules:modules.map(m=>({id:m.id,topic:m.topic,expert:m.expertAssignment,workload:m.duration,assessment:m.assessment})),
    partners:relationships.filter(p=>p.moduleIds.some(id=>moduleIds.includes(id))),
    commercial:programmes.map(p=>({programmeId:p.id,rows:priceRows.filter(r=>r.country===country && r.productId===p.id),status:'human-review-required'})),
    total:null,reason:'No automatic quotation: missing scope, assignments, terms or commercial approval must be resolved.',
    publicationAllowed:false};
}
module.exports={prepareProposal};
