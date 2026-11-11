# Site-wide Multilingual Implementation Status

## Current update: 2026-11-12

This update supersedes the historical status below. Six translation agents supplied 702 additional German and 702 Hindi mappings in twelve separate versioned completion files. Two subsequent agent reviews checked meaning and terminology; confirmed fragment-grammar errors, the co-founder label and Open Citizen naming were corrected. No approved master text was edited.

- Coverage: 29 base pages, 890 distinct source fragments, zero missing German or Hindi mappings. Proper names can intentionally remain unchanged.
- Additional coverage: 143 audience/capability route variants, including generated result counts and empty results, with zero missing mappings.
- Verification: 63 automated tests pass, including translated page rendering, unchanged form contracts/external links, contact security, production gates and master integrity. `git diff --check` passes.
- Desktop German and 390px Hindi teacher-programme views were checked in the persistent spatial shell. Stage and room remain selected when switching language. The reader now preserves relative scroll position across language changes.
- Screenshots: `test-results/spatial-world-v3/teachers-de-translated.png` and `teachers-hi-mobile.png`.
- The German master SHA-256 remains `9050e075d3b43b43abe6f754134c83c9eb80d6cfcb701012568b05d947fa4739`.
- Translation status is pending editorial review, not approved. Agent review is not independent professional linguistic or legal review.
- Editorial glossary decisions remain: consistent Capability versus Kompetenz/Handlungsfaehigkeit wording; Human Agency terminology; transliterated versus translated Hindi System Architecture; Applied Bootcamps versus Technology Bootcamps source naming. These do not represent missing text, but should be resolved before editorial approval. Source claims and legal copy still require owner review.
- Coverage does not prove every conditional error response or every possible browser state has been reviewed. Full release regression remains separate.
- No commit, push, deployment, production configuration or external application changes. Partner Campus and publication gates remain unchanged.

## Historical status (2026-11-11)

2026-11-11. Local only. **Incomplete: not ready for release.**

## Implemented

- Shared English/German/Hindi selector on server-rendered public pages in the local review environment.
- Selection is carried in internal links and GET forms, preserving programme/audience filters. External applications, enrolment URLs, mail addresses and asset URLs are not changed.
- Server-rendered translations work without JavaScript. Client switching updates text and accessibility labels in place, without replacing forms or reloading the page. The introduction selector and global selector stay in sync.
- The immutable German article and its reviewed-content renderer remain separate from the site dictionary. Their source files are not modified.
- Full text mappings for Society and AIcademy detail, including the Society-to-AIcademy contextual route, common navigation, translated contact labels/status messages and intro playback messages.
- Separate German/Hindi versioned files under `content/site/v1`. Proper names remain unchanged intentionally where explicitly mapped.
- An explicit notice marks incomplete site translations in local preview. No language is approved for production merely because some strings have been translated.
- Production remains on the existing English site copy and locked-article publication rules. Draft language query parameters cannot expose the site dictionaries in production. Partner Campus remains disabled; no external project, account, hosting, SMTP or DNS changes.

## Remaining Content Work

The base-route inventory contains 29 public pages and 890 distinct source text fragments. Of these, 188 currently have both German and Hindi mappings; 702 still require translation or an explicit reviewed decision to retain a proper name. This count excludes the separately complete locked article and journey. It is a fragment count, not a word-count percentage or a linguistic quality score.

The remaining work includes homepage ecosystem/profile material, the other four audience pages, other programme details and catalogue filters, capability model explanations, career pathways, about/network content and the full privacy policy. Legal copy must preserve its meaning and receive appropriate editorial review; it must not be silently replaced with generic legal text.

The route inventory does not yet exhaust every filter combination, 404 message or conditional response. The contextual AIcademy route is additionally tested. Before release, extend the inventory to dynamic combinations and error responses, finish all translations, review terminology, and perform full-route visual/accessibility regression testing.

## Evidence

- 44 automated tests pass, including contact security and source-integrity tests.
- Production dependency audit reports zero vulnerabilities. Two existing moderate development-only findings remain.
- Local browser checks: Society switches German to Hindi without horizontal overflow at 390px; following its AIcademy link preserves Hindi and audience/country parameters. Keyboard/native selector remains available.
- Screenshots are local under `test-results/approved-content/`.
- Coverage inventory: `docs/SITE-LANGUAGE-COVERAGE.json`. Regenerate with `node scripts/site-language-coverage.js` in a non-review environment.
- Local preview: `http://localhost:4322/audiences/society?lang=de`.

## Changed Files

New: `lib/site-i18n.js`, `public/js/site-i18n.js`, `public/css/site-i18n.css`, `content/site/v1/{manifest.json,de.json,hi.json,society.de.json,society.hi.json}`, `scripts/site-language-coverage.js`, `tests/site-i18n.test.js`, this status report and the generated coverage inventory.

Updated: `lib/programme-pages.js`, `public/js/main.js`, `tests/intro.test.js`, `package.json`, `package-lock.json`. Added pinned `cheerio` 1.1.2 to parse HTML structurally rather than replace arbitrary HTML strings. Previous local introduction work and unrelated Partner Campus files are preserved.

No commit, push or deployment has been performed for this extension. The previous introduction-only review report describes its earlier scope; this file supersedes it for global language behaviour.
