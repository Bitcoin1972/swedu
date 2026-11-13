# SWE public-site language expansion

## Scope

The language list was checked against `https://academy.swex.ai/individual` on 13 November 2026. SWE adds Kiswahili, explicitly confirmed by the author, to the fifteen Academy languages:

English, German, Hindi, French, Spanish, Arabic, Japanese, Simplified Chinese, Russian, Indonesian, Greek, Turkish, Urdu, Thai, Kinyarwanda and Kiswahili.

The existing DE/EN/HI content files and approved German master are not rewritten. New packs translate the existing English public content, including the full vision within the Capability World, programme descriptions, narrative panels, knowledge windows, partner descriptions and contact form. External applications and the disabled Partner Campus are not modified. Existing film/audio tracks are not regenerated.

## Publication boundary

The site owner approved all complete packs for release on 2026-11-13 ("deploy alles"). Approval metadata is stored in each pack. Structural completeness is not independent native-language review; none is claimed.

Local review requires `SWE_LANGUAGE_PREVIEW=1`, a non-production process and a loopback request. A pack is selectable only when all source strings are present, its source hash matches and it introduces no markup. `SWE_PUBLIC_WORLD=1` does not bypass this language-specific release gate.

The illustrated Vision Reader supports the same languages when both its UI pack and the full content pack are complete. Its release is approved at /vision. Language changes preserve the current reading anchor and do not mirror the spatial layout for Arabic or Urdu.

## Implementation

- `lib/global-languages.js`: canonical locales, aliases, direction, inventory and pack validation.
- `lib/global-language-renderer.js`: server-side translation and production/local review gating.
- `public/js/spatial-shell.js`: lazy language loading, station and reading-position retention, localized mail responses and partner content.
- `public/css/global-languages.css`: readable RTL and CJK/Thai fallback typography while retaining the spatial layout.
- `content/languages/v2/source.json`: immutable source snapshot, 1,633 text units and SHA-256 identifier.
- `content/languages/v2/<locale>.json`: separate versioned translation drafts.

The three raw `<style>` keys in the original source snapshot are technical inventory artifacts, retained unchanged for hash compatibility. They are not used as translated markup. No form names, route IDs, external destinations or source citations are translated.

## Verification

Run `node scripts/check-global-languages.cjs --require-complete` for structural coverage and unchanged-prose checks. The detailed output is `docs/GLOBAL-LANGUAGE-COVERAGE.json`; it distinguishes missing content from complete drafts.

Run `npm test` for existing and new regression tests. Run `node scripts/check-global-language-ui.cjs` against the local review server for language switching, station retention, desktop layout, partner content and mobile contact layout. Mail tests use mocked responses and do not send messages.

Native-language editorial review remains required, especially for professional terminology, legal/privacy phrasing, institutional roles and the author's conceptual argument. Automated coverage and browser tests cannot certify translation quality.

## Review results: 13 November 2026

- All 13 new packs contain all 1,633 source entries, with matching source hashes, no blank entries, no unsafe markup and no unchanged long English prose. Publication is owner-approved.
- Final serial suite: 111 tests passed, zero failures or skips, including the illustrated reader in all 16 languages at 320, 390, 768 and 1600 pixels.
- 377 translated public documents (29 routes across 13 languages) passed checks for translation coverage, form-field contracts and unchanged external destinations.
- Browser checks passed for all 13 new languages at desktop and mobile/tablet widths, including partner content, stage retention, header fit, title fit and no-script content.
- Targeted regressions cover stale language requests after navigation, mobile panel reading position, semantic document anchors and preservation of contact form input.
- Arabic and Urdu text flows right-to-left without mirroring the environment, narrative panel or partner arrangement. CJK and Thai use available system glyph fallbacks where the existing brand fonts lack coverage.
- Source and translation caches invalidate when files change; invalid or partially written files fail closed.
- Existing DE/EN/HI master files, SMTP, hosting, external applications and production release settings were not changed. No emails were sent by the tests.

For the resource-intensive browser suite, run the tests serially with `SWE_BROWSER_TESTS=1`, `PLAYWRIGHT_MODULE` and `CHROME_PATH` set, using `node --test --test-concurrency=1 tests/*.test.js`. A concurrent all-tests run hit a browser page-load timeout; the complete serial rerun passed.
