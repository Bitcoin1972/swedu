const data=require('./catalogue');
const {validate}=require('./validate');
const allowedAddons=()=>data.partnerAddons.filter(a=>a.publicDisplayPermission===true && a.agreementStatus==='confirmed' && a.deliveryApproval===true);
function publicContract(){
  const errors=validate(data);if(errors.length) throw Error(errors.join('; '));
  return {schemaVersion:2,contentVersion:data.version,layers:data.layers,
    modules:data.modules.map(m=>({...m,specialistAddonIds:m.specialistAddonIds.filter(id=>allowedAddons().some(a=>a.id===id))})),
    products:data.products,pilot:data.pilot,
    specialistContributions:allowedAddons().map(a=>({id:a.id,name:a.name,organisation:a.provider,foundation:a.foundation,scope:a.proposedScope,responsibility:a.responsibility,assessment:a.assessmentResponsibility,credentialIssuer:a.credentialApproval?a.credentialIssuer:null,commercialStatus:a.commercialStatus})),
    existingProducts:data.existingProducts};
}
function completeness(){
  return data.products.map(p=>({id:p.id,portfolio:p.portfolio,status:p.contentStatus,
    missing:[...p.moduleIds.flatMap(id=>{
      const m=data.modules.find(m=>m.id===id);
      return [m.duration.contactHours===null?`${id}: duration/workload`:null,!m.expertAssignment.person?`${id}: named delivery owner`:null,m.approval!=='approved'?`${id}: syllabus and assessment approval`:null].filter(Boolean);
    }),...(p.price.status!=='approved'?['Product price approval']:[]),...(p.credential.includes('approval')?['Credential/issuer approval']:[])],
    partnerApprovals:data.partnerAddons.filter(a=>p.moduleIds.includes(a.foundation)).map(a=>({id:a.id,agreement:a.agreementStatus,publicDisplay:a.publicDisplayPermission}))}));
}
module.exports={publicContract,completeness,allowedAddons};
