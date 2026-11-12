# SWE 3.0 local preview review

2026-11-12. Branch codex/swe-3-narrative-experience. Preview:
http://localhost:4330/?lang=de&skipIntro=1

## Delivered locally

- Inventory: SWE-3-INVENTORY.md.
- START introduces organisation, mission, audiences and both founders using
  existing authorised photographs and existing role descriptions. Full biography
  links stay inside the spatial reader. No additional credentials invented.
- Complete approved vision remains in an expandable, chapter-organised section.
  Earlier requirement to put the only journey button after the entire article
  is superseded here by the new brief's compact START and immediate action;
  the complete article and its existing end action are retained.
- Eight successive story stations after START explain previous development,
  dependency, change, possibility, system feedback and the transition. Separate
  original DE/EN/HI narrative drafts; no changes to approved master files.
- Programme links/status use the existing catalogue. Final station links the
  complete model with a contact action. Existing detailed knowledge dialogs and
  optional assumptions remain; repetitive audience boilerplate was removed from
  the primary station narrative. Automatic progression/perspective selector have
  not been reintroduced.
- Existing intro gains native playback/audio controls; replay is accessible in
  the ecosystem panel. Muted autoplay, skip, focus restoration and reduced-motion
  fallback preserved. Timeout increased from 30 to 120 seconds to accommodate
  the proposed longer film. No draft captions attached to unrelated old footage.
- Film production source: content/film-v3.json, seven scenes targeting 84s.
  DE/EN/HI scripts and draft VTT tracks: docs/film-v3. Final timings require voice.

## Verification

66 automated tests pass, including content integrity, complete narrative arrays,
programme links/status, contact security and production-disabled Partner Campus.
Browser checks: 1280x720 German START, 390x844 Hindi school narrative,
820x1180 English tablet narrative. Text wraps inside the reader and room remains
visible. START action advances to family; next advances to school; language
switch retains station. Intro plays muted with controls; skip returns to START.
Browser metadata: existing movie 10.041667 seconds, 1280x1280, readyState 4.

Screenshots: test-results/swe-3/start-desktop.png, school-hi-mobile.png,
school-en-tablet.png. These are local, not public exports.

## Nontechnical reading walkthrough

Who/mission/audiences are explicit at START. The water question first requires
family support, then teacher capacity, exploration, methods, professional review,
integration and operational institutions. Governance and national decisions are
connected to the return of experience to society, not an inevitable hierarchy.
Relevant programmes retain status and link to detail; final station offers model
and contact. This is a structured author-side walkthrough, not a study with real
citizens or policymakers. Such user validation remains outstanding.

## Remaining blockers / not delivered

- Tonebee/ToonBee exact URL and authorised account are not yet identified. Owner
  asked to supply URL or open session; no secrets requested, no credits bought.
- New cinematic film, three recorded voices, licensed soundtrack, rendered
  exports, synchronized subtitles and production project reference do not exist
  yet. Production handoff documents are not a substitute for the movie.
- Final-frame-to-board visual continuity cannot be verified until the film exists.
- New narrative and narration translations are editorial drafts awaiting review.
- Full cross-browser/accessibility and real nontechnical visitor testing remain.
- Existing external ecosystem destinations reused, not newly certified; no
  external website or operational infrastructure changed.

No commit, push, Render update, mail change or production deployment this task.
The currently published site remains the prior approved release.
