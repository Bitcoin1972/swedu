# Knowledge windows review

2026-11-12. Local implementation only. Overall release: NO-GO.

## Implemented

- Replaced the primary assumption matrix with three explanatory entry points: teacher capacity, maintenance, and accountable decisions.
- Separate authored German, English and Hindi narratives in `content/world-knowledge.js`. Each explains meaning, cross-system dependencies, possible missing-prerequisite consequences, actors, SWE contribution and limitations.
- The selected station's existing continuous water-learning story is included. Programme links and statuses reuse the catalogue, not invented offers.
- User-opened native modal with focus containment, Escape, focus return, independent scrolling, navy/gold styling and no background blur.
- Optional assumption control changes explanatory prose and retains scenario state without a new history entry. Room and station do not change when opening or closing.
- Related rooms open in the shared shell with the same station. Programme links open the existing document reader.
- Fixed initial URL replacement suppressing explicit intro playback. Initial language-switch accessibility labels now update with the visible language.

## Verification

- 58 automated tests pass, including existing contact-security, production-gating and immutable-master tests, plus two knowledge-window tests.
- Desktop browser: German teacher-capacity window; optional assumption change; Escape returns focus to its trigger, retaining school and station 03/09.
- English maintenance explanation and Economy room link tested; station retained and modal closed.
- Hindi teacher-capacity window checked at 390x844. Text wraps and the content scrolls independently.
- Forced intro is visible and subsequently returns to START.
- Screenshots: `test-results/spatial-world-v3/knowledge-de-desktop.png` and `knowledge-hi-mobile.png`.
- German master SHA-256 remains `9050e075d3b43b43abe6f754134c83c9eb80d6cfcb701012568b05d947fa4739`.

## Release blockers

The user explicitly chose to complete and check the site before publishing, rather than accept older translation gaps. The existing local-only production gate remains unchanged.

The refreshed legacy public-route inventory contains 29 pages and 890 distinct source fragments, with 702 missing German mappings and 702 missing Hindi mappings. These counts concern older route dictionaries, not the separately complete introductory article or new knowledge-window narratives. Some proper names may legitimately remain unchanged after review. Dynamic filter combinations and conditional responses still need exhaustive coverage.

Complete those translations, review terminology and legal copy, perform whole-site responsive/navigation regression, and only then prepare the production-enabled release. Passing the current tests does not establish whole-site language completeness.

Render SWEDU was inspected read-only in the previously confirmed workspace. It deploys `Bitcoin1972/swedu` branch `main` automatically on commits. No push, merge, deployment or production configuration change was made. Partner Campus and all other services remain untouched.
# Translation follow-up: 2026-11-12

The earlier 702-string translation blocker is resolved in local review: six agents supplied all missing German/Hindi mappings. Coverage now finds zero missing mappings across 29 pages and 143 route variants; all 63 tests pass. See SITE-MULTILINGUAL-STATUS.md for evidence and remaining editorial glossary decisions. This does not approve translations or enable production publication. No deployment has taken place.

