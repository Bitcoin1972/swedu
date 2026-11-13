const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const registry = require('../content/partner-registry.json');
const root = path.resolve(__dirname, '..');

test('partner review has eleven distinct identities and complete localized descriptions', () => {
  assert.equal(registry.records.length, 11);
  assert.equal(new Set(registry.records.map(record => record.id)).size, 11);
  for (const record of registry.records) {
    assert.equal(new URL(record.website).protocol, 'https:');
    for (const locale of ['de', 'en', 'hi']) {
      assert.ok(record.description[locale].length > 40);
      assert.ok(record.relationship.summary[locale].length > 40);
    }
    assert.match(record.description.hi, /[\u0900-\u097f]/);
    assert.equal(record.publicationApproved, true);
    assert.equal(record.relationship.formalAgreementVerified, false);
    if(record.id !== 'drf-world') assert.equal(record.representative, null);
  }
});

test('only user-authorised logos are stored in the public asset directory', () => {
  for (const record of registry.records) {
    const asset = record.logo.assetPath;
    if (!asset) continue;
    assert.ok(fs.existsSync(path.join(root, asset)));
    assert.ok(record.logo.sourceUrl.startsWith('https://'));
    if (asset.startsWith('public/')) assert.equal(record.logo.permissionStatus, 'user-authorised');
    else assert.ok(asset.startsWith('docs/partner-review-assets/'));
  }
});

test('identity conflicts and personal affiliations remain explicit', () => {
  const find = id => registry.records.find(record => record.id === id);
  assert.equal(find('aigc').identityStatus, 'user-confirmed');
  assert.equal(find('ambedkar-sonepat').identityStatus, 'user-confirmed');
  assert.equal(find('est-fab').relationship.previousResearch.type, 'personal-professional-affiliation');
  assert.equal(find('srm-sonepat').relationship.previousResearch.type, 'academic-invitation');
  assert.ok(registry.records.every(r=>r.relationship.evidenceStatus==='public-sources-and-user-context'));
});
