# Vision Reader Preview

Release approved by the site owner on 2026-11-13 ("deploy alles"). Public entry: /vision. The verification below records the original preview milestone; production availability is now tested separately in global-release.test.js.

URL: http://localhost:4335/vision-preview?lang=de

Start: `PORT=4335 SWE_PUBLIC_WORLD=1 SWE_VISION_PREVIEW=1 node server.js`

## Experience

- Existing SWE header and navy/gold typography; local "Our vision" navigation entry.
- Left: nine chapter links with the current chapter highlighted.
- Centre: complete approved article, with a newly generated cinematic image for every chapter.
- Right: passive six-layer model, maintaining Capability, Governance, Institutions, Academy, Economy, Society order. Relevant layers are highlighted as the visitor reads.
- Final journey link follows all nine chapters.
- Mobile: horizontal chapter navigation, central reading area and compact passive model.
- DE/EN/HI uses the existing versioned content unchanged. Locale switching preserves the source paragraph and relative reading position.

## Assets

Nine generated illustrative images are stored in `preview/vision/chapter-1.png` through `chapter-9.png`. They are not documentary photographs of SWE projects or partners. Themes follow the existing headings: introduction, systems architecture, education, human agency, work, national capability, sustainable development, integrated expertise, and the journey.

## Verification

- 90 automated tests passed, including exact paragraph/order/emphasis preservation in all three languages.
- Browser checks: all nine chapter links and images; focus handling; repeated DE/EN/HI paragraph preservation; 320, 390, 768, 1024 and 1600 px widths without horizontal page overflow; header navigation; no-JavaScript reading; no JavaScript errors.
- Production HTTP checks: preview page, script and chapter image all return 404 even with the preview flag set.
- Screenshots: `vision-reader-desktop.png`, `vision-reader-hindi.png`, `vision-reader-mobile.png`.
- Browser regression script: `scripts/check-vision-reader.cjs` (uses PLAYWRIGHT_MODULE and optional CHROME_PATH).

## Scope

Modified: `server.js`, `lib/spatial-shell.js`, `public/js/spatial-shell.js`.
Added: `content/vision-reader.js`, `lib/vision-reader.js`, `preview/vision/`, `tests/vision-reader.test.js`, browser regression script and this report.
The approved editorial source, existing Journey, Partner Campus, mail configuration and all external platforms remain unchanged.
