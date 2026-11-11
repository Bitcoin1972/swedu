const currencyCode = /^[A-Z]{3}$/;
const dateCode = /^\d{4}-\d{2}-\d{2}$/;

function validatePrice(p) {
  if (!p || !/^[A-Z]{2}$/.test(p.country) || !currencyCode.test(p.currency)
      || !p.productId || !p.segment || !p.version || !p.source
      || !['draft','approved','withdrawn'].includes(p.status)
      || !['public','partner-confidential'].includes(p.visibility)) return false;
  if (p.amountMinor !== null && (!Number.isSafeInteger(p.amountMinor) || p.amountMinor < 0)) return false;
  if (p.status === 'approved' && (!Number.isSafeInteger(p.amountMinor) || !p.approvalReference
      || !dateCode.test(p.validFrom) || !dateCode.test(p.validUntil) || p.validUntil < p.validFrom)) return false;
  return true;
}

// Only these fields may leave the commercial domain. Costs and margins never do.
function publicPrices(rows, country, segment, now = new Date().toISOString().slice(0,10)) {
  return rows.filter(p=>validatePrice(p) && p.status==='approved' && p.visibility==='public'
    && p.country===country && p.segment===segment && p.validFrom<=now && p.validUntil>=now)
    .map(p=>Object.fromEntries(['id','productId','country','currency','segment','amountMinor','unit','version','validFrom','validUntil','source','taxTreatment','registrationUrl'].map(k=>[k,p[k]])));
}

function importAcademyPrices(catalogue) {
  return catalogue.prices.map((p,i)=>({id:`academy-${p.country}-${p.rule || i}`,productId:p.programme,
    country:p.country,currency:p.currency,segment:p.audience,amountMinor:p.amountMinor,unit:p.unit,
    version:p.version,source:p.source,status:p.status,visibility:'public',validFrom:p.verifiedOn,
    validUntil:p.reviewBy,approvalReference:`Existing source verification ${p.verifiedOn}`,
    registrationUrl:p.url,taxTreatment:'Confirm final taxes and payable amount in the original checkout.',
    package:{type:p.audience==='institution'?'institution':'individual',description:p.unit},
    partnerAddonIds:[],discount:{status:'not-authorised'},proposalVersion:null}));
}

const commercialFields = {
  schemaVersion:1,
  public:['productId','country','currency','segment','amountMinor','unit','package','version','validFrom','validUntil','taxTreatment','approvalReference','source','registrationUrl'],
  restricted:['trainingCosts','examinationFees','partnerSettlement','margin','discountApproval','leadAssignment','proposalVersion','partnerId','countryAccess'],
  rules:['Each product requires its own discount and commercial approval.','Institution packages are not per-person prices.','Approved upstream checkout remains authoritative.','Private proposal versions must not enter the public projection.']
};
module.exports = {validatePrice,publicPrices,importAcademyPrices,commercialFields};
