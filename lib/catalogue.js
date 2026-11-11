const fs = require('node:fs');
const path = require('node:path');

function readCatalogue() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/catalogue.json'), 'utf8'));
  const details = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/programme-details.json'), 'utf8'));
  const model = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/capability-model.json'), 'utf8'));
  data.model = model;
  data.audiencePages = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/audience-pages.json'), 'utf8'));
  data.programmes = data.programmes.map(programme => ({
    hours: 'Agreed for the scoped engagement; no fixed learning hours published', weeks: 'Scheduled with the cohort or institution; no fixed course length published',
    assessment: 'Review criteria and assessed work are agreed before delivery; a formal qualification is not implied', issuer: 'No formal credential issuer confirmed for this programme',
    credentialType: 'No approved course credential is currently offered for this programme',
    recognition: 'No external recognition or accreditation claimed', renewal: 'Not applicable until a credential scheme is approved',
    additionalQualifications: 'Selection, prior competence and role-specific qualifications must be confirmed.',
    paymentTerms: 'Fees and payment terms pending approval',
    ...programme, ...details[programme.id], ...model.programmeRelationships[programme.id],
    capabilityIds: [...new Set((model.programmeRelationships[programme.id]?.modules || [])
      .flatMap(id => model.modules.find(module => module.id === id)?.capabilities || []))],
    url: `/programmes/${programme.id}`
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
