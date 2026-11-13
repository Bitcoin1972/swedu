# Knowledge window editorial review

Review date: 2026-11-13. Local implementation only; no push or deployment.

## Coverage

- 32 room selections across Society, School, Youth, Academy, Economy, Institutions, Governance and National Capability.
- 31 distinct subject records; teacher capability is deliberately shared between School and Academy.
- Three dependency windows: teacher capability, maintenance/practical capability and oversight.
- AI assessment case: new interpretation, proposed SWE response and evaluation narrative. Existing source findings, provenance and audience perspectives retained.
- English, German and Hindi have matching paragraph coverage in the new content source.
- All ten stations receive the same complete localized window inventory. Stations 1-9 remain explanatory; programme discovery remains at station 10.

## Editorial changes

Replaced generic room introductions, module lists, repeated sidebar excerpts and administrative delivery instructions with subject-specific paragraphs. Each topic connects a concrete need with its wider relationships and SWE's professional contribution. Systems Architecture includes integration examples and the relationship between people, technology, processes, infrastructure and governance.

The main text of dependency windows now comes from the same maintained subject records. Existing optional assumptions and related-room controls remain available. Evidence scope and distinctions between proposed evaluation dimensions and demonstrated results remain intact; these are not fictional-story badges.

The locked vision master, programme specifications, prices and approval states were not edited. No new certification, institutional commitment or demonstrated outcome is claimed. The new translations are implementation drafts for editorial approval, not independently certified translations.

## Verification

- `npm test`: 80 passed, 0 failed.
- Automated coverage checks all 32 room selections and three dependency explanations for every language and every station.
- Tests preserve original assessment facts, prevent sidebar duplication in the proposed response, and verify that room explanations contain no course directories or repeated headings.
- Desktop 1440 x 1000: German Systems Architecture dialog, English maintenance and assessment dialogs checked.
- Mobile 390 x 844: Hindi Systems Architecture dialog checked, no horizontal dialog overflow; independent vertical scrolling retained.
- Escape restores focus to the originating hotspot without changing stage or room.
- Optional maintenance assumption updates its explanation while preserving stage, room and topic.
- Existing navy/gold styling, typography and ten-stage navigation retained.

Screenshots: `knowledge-editorial-desktop-de.png`, `knowledge-editorial-mobile-hi.png`.

## Files changed for this correction

- `content/knowledge-editorial.js` (new central topic source)
- `content/real-world-cases.js` (deeper assessment commentary)
- `lib/spatial-shell.js` (localized window payloads)
- `public/js/spatial-shell.js` (render explanations instead of placeholders/catalogue excerpts)
- `tests/knowledge-editorial.test.js` (new coverage and content tests)
- `tests/world-knowledge.test.js`
- `tests/programme-pathways.test.js`
- This report and the two screenshots.

Earlier local narrative and contrast corrections remain preserved. SWEX.AI, Roots2AI, AIcademy and production settings were not modified.

## Release status

Ready for editorial review in the local preview. Publication requires explicit approval. No deployment performed.
