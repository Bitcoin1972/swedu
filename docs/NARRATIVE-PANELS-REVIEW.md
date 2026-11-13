# Narrative panels review

Date: 2026-11-13. Local implementation only; no deployment, push or production configuration change.

## Structure

The second supplied brief determines panel placement: the human story is on the left; real-world relevance and SWE's approach are on the right. The centre and ten-station navigation remain. Station 10 retains the existing programme/pathway discovery, catalogue statuses, contextual detail views and external platform links.

Stations 1-9 no longer render ecosystem cards or programme directories in either permanent panel. The water story is presented as consecutive paragraphs rather than six repeated headings. Station 9 leads into the programme gateway without implying a mandatory curriculum. Start retains the manual mission film, founder profiles, full vision and subsequent journey button. The original opener is unchanged.

Youth uses the existing landscape as its exploration environment, distinct from the school scene, with its own four translated object labels. No replacement visual asset or general redesign was introduced. Institutional and governance explanations examine the same assessment case while retaining the current personal journey position.

## Evidence

Verified directly on 2026-11-13:

- [The Guardian, Richard Adams, 11 November 2026](https://www.theguardian.com/education/2026/nov/11/ai-close-to-impossible-assess-university-coursework-regulator)
- [Office for Students / Advance HE, OfS 2026.56](https://www.officeforstudents.org.uk/publications/making-ai-work-for-students-reflections-on-institutional-practice/)

The source card includes the original headline, publisher, author, publication date, a localized summary and both links. It opens a contextual dialog. No publisher photography, screenshot or full article was copied. The reusable case record separates sourced findings, SWE interpretation, proposed response, evaluation and limitations. Extending the university case to families, schools, work and the water story is expressly identified as interpretation, not research into those settings. No SWE outcome or regulator endorsement is claimed.

## Verification

- Automated suite: 77 passing tests, including three new narrative/source/alignment tests.
- Browser: all 10 stations in DE, EN and HI; one active station each, correct scene identifiers, no horizontal document overflow, no ecosystem listings before station 10.
- Desktop 1440 x 1000: narrative/evidence panels, visible source card, source dialog, close restores trigger focus and unchanged Academy location.
- Mobile 390 x 844: separate story/evidence drawers, readable German and Hindi, Hindi source dialog without horizontal overflow, unchanged scene and no programme directory in the dialog.
- Youth hotspot: localized explanation opens over the exploration scene and closes without resetting the station.
- Keyboard Escape closes a room explanation and restores focus to the same object; station and scene stay unchanged. Programme pathway selection still updates station 10. Browser console: no captured warnings or errors during the checks.
- Existing tests still verify the immutable vision, manual intro/mission behaviour, programme catalogue, secure contact processing and production-disabled Partner Campus.
- JavaScript-free content is server-rendered; mobile fallback stacks the existing regions instead of hiding the new left narrative.

## Screenshots

- [Before desktop](narrative-before-desktop.png)
- [After desktop](narrative-after-desktop.png)
- [Before mobile](narrative-before-mobile.png)
- [After mobile](narrative-after-mobile.png)
- [Evidence dialog desktop](narrative-case-desktop.png)
- [Evidence dialog mobile Hindi](narrative-case-mobile-hi.png)
- [Human story mobile Hindi](narrative-story-mobile-hi.png)
- [Youth exploration desktop](narrative-youth-desktop.png)

## Review boundary

All new narrative, explanation and control text has DE/EN/HI coverage. Original source titles and proper names remain in their original language. A separate human editorial/native-language review has not been performed; this is a review-ready local implementation, not a claim of external translation approval. Production publication still requires the owner's explicit approval.

No hosting, SMTP, DNS, Partner Campus, SWEX.AI, Roots2AI or AIcademy application changes. Catalogue and approved vision source files are unchanged.

## Changed implementation files

- `content/journey-panels.js`: new DE/EN/HI connected stories and corresponding real-world explanations.
- `content/real-world-cases.js`: reusable source-backed case record.
- `lib/narrative-panels.js`: narrative and evidence/source-card renderer.
- `lib/spatial-shell.js`: server-rendered panel integration and accessible fallback.
- `public/js/spatial-shell.js`: panel updates, room dialogs, source metadata, youth alignment and localized drawer controls.
- `public/css/spatial-shell.css`: typography, source card, exploration scene and responsive refinements.
- `tests/narrative-panels.test.js`, `tests/narrative-v3.test.js`, `tests/spatial-shell.test.js`: new assertions and updated structural expectations.

This report and the eight linked screenshots are review artifacts. Pre-existing unrelated untracked files were not changed.
