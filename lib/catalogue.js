const fs = require('node:fs');
const path = require('node:path');

function readCatalogue() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/catalogue.json'), 'utf8'));
  const details = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/programme-details.json'), 'utf8'));
  data.programmes = data.programmes.map(programme => ({
    hours: 'Pending internal verification', weeks: 'Pending internal verification',
    assessment: 'Assessment requirements pending approval', issuer: 'Pending internal verification',
    credentialType: 'Pending approval; no credential is promised',
    recognition: 'No external recognition or accreditation claimed', renewal: 'Pending internal verification',
    additionalQualifications: 'Selection, prior competence and role-specific qualifications must be confirmed.',
    paymentTerms: 'Fees and payment terms pending approval',
    ...programme, ...details[programme.id], url: `/programmes/${programme.id}`
  }));
  return data;
}

function approvedPrices(data, country, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return data.prices.filter(p => p.country === country && p.status === 'approved'
    && p.verifiedOn && p.verifiedOn <= today && p.reviewBy >= today && p.source
    && Number.isSafeInteger(p.amountMinor) && p.amountMinor > 0
    && /^[A-Z]{3}$/.test(p.currency));
}

module.exports = { readCatalogue, approvedPrices };
