# SWE 3.0 inventory and implementation scope

2026-11-12. Baseline: public release 0872084. Development branch:
codex/swe-3-narrative-experience. No deployment authorised for this task.

## Existing experience

Nine stations from lib/capability-board.js, in order:
1. Start with potential
2. Family & Early Life
3. School & Learning
4. Youth & Exploration
5. Academy & Study
6. Professional Entry
7. Specialist & Builder
8. Contribution & Institutions
9. Society & National Capability

The live release was visually checked in the preceding deployment. It uses the
same spatial shell as the local source: left ecosystem, centre landscape/room,
right reader, manual bottom timeline. School/youth share one room; professional
entry/builder share economy. Governance is separately reachable through the
model and knowledge windows. Do not add a tenth timeline station.

## Content and assets

- Immutable German vision: content/independent-capability/v1/de.md;
  SHA-256 9050e075d3b43b43abe6f754134c83c9eb80d6cfcb701012568b05d947fa4739.
  Separate en/hi article and journey files exist. Preserve all three.
- Programme sources: lib/catalogue.js, data/catalogue.json and
  lib/education/catalogue.js. Existing/available/proposed distinctions must
  remain data-driven. Never infer credentials or operational status.
- Biography sources: public/index.html and /about route; authorised portraits:
  public/joerg-founder.jpg and public/angelika-founder.jpg. Short profiles can
  describe founder/co-founder work without adding qualifications or history.
- Logo: public/logo_transparent.png. Navy/gold, Cormorant Garamond, DM Sans,
  DM Mono; Hindi uses Noto Sans Devanagari.
- Scene assets: public/images/capability-landscape.png, academy-room.jpg,
  world-environments.jpg. Ecosystem imagery already exists.
- Current movie: public/intro.mp4 (~11 MB). Current player supports skip,
  muted playback, manual fallback, replay query, reduced motion and session
  state. No subtitle tracks or multilingual finished movies are present.
- Ecosystem destinations already in source: academy.swex.ai, roots2ai.com,
  roots2.ai/programs/schools, swex.ai. Keep external apps unchanged.
- Translation inventory: 29 pages, 890 strings and 143 filter variants have
  mappings. This is coverage, not professional linguistic certification.

## Narrative gaps

START currently opens the long article without first establishing people and
purpose. Several stations reuse the same six-phase story paragraphs, making
school/youth/academy and profession/builder feel repetitive. Stage transitions
do not explicitly say what was learned, what remains missing or why the next
stage is necessary. New connective narration must be a separate draft, not an
edit of the approved article.

## Preserve

Manual navigation, deep links/history, language/location retention, readable
knowledge dialogs, optional assumptions, contact delivery/security semantics,
programme status, original master, external links and production-disabled
Partner Campus. Do not restore automatic progression or the removed perspective
selector without a specific instruction resolving the earlier removal request.

## Video access

No Tonebee/ToonBee session appears in the available Chrome, Edge or IAB tabs.
Exact authorised platform URL requested from owner. No account, purchase,
credential retrieval or video generation has been attempted. Existing intro
must remain until a reviewed, licensed replacement exists.
