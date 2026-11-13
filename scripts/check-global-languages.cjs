const fs = require('node:fs');
const path = require('node:path');
const languages = require('../lib/global-languages');
const source = languages.source();
const report = {
  sourceHash: source.sourceHash,
  sourceStrings: source.strings.length,
  academySource: source.academySource,
  additionalLanguage: 'Kiswahili (sw), confirmed by the author',
  publication: 'Site owner approved all complete language packs for release on 2026-11-13 (deploy alles). No independent native-language review is claimed.',
  languages: []
};
for (const language of languages.languages) {
  const entry = languages.inspect(language.code);
  if (entry.existing) {
    report.languages.push({code:language.code,label:language.label,status:'existing',changed:false});
    continue;
  }
  const translations = entry.pack?.translations || {};
  const missing = source.strings.filter(s=>typeof translations[s]!=='string'||!translations[s].trim());
  const unchangedProse = source.strings.filter(s=>s.length>80&&!s.startsWith('<style>')&&!s.startsWith('Coinsbank Blockchain Cruise ·')&&translations[s]===s);
  const unsafe = Object.entries(translations).filter(([s,t])=>!s.startsWith('<style>')&&/<\/?(?:script|iframe)\b|javascript:/i.test(t)).map(([s])=>s);
  report.languages.push({code:language.code,label:language.label,status:entry.status,
    translated:source.strings.length-missing.length,total:source.strings.length,
    sourceMatches:entry.current||false,missing,unchangedProse,unsafe,
    structurallyComplete:entry.available&&!unchangedProse.length&&!unsafe.length});
}
const target=path.join(__dirname,'../docs/GLOBAL-LANGUAGE-COVERAGE.json');
fs.writeFileSync(target,JSON.stringify(report,null,2)+'\n');
for (const l of report.languages) console.log(`${l.code}: ${l.status}${l.total?` ${l.translated}/${l.total}; unchanged prose ${l.unchangedProse.length}`:''}`);
if (process.argv.includes('--require-complete') && report.languages.some(l=>l.total&&!l.structurallyComplete)) process.exitCode=1;
