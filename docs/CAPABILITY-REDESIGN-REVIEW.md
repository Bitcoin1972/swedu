# SWE Capability Architecture: Review Build

Review date: 2026-11-09. Baseline: `f6c2942`.
Branch: `codex/swe-capability-journeys`.
Local preview: http://localhost:4317

## Release Decision

**GO for local stakeholder review. NO-GO for production deployment without explicit approval.**

No push, merge, deployment, SMTP, DNS, Render or external application changes were made. The Partner Campus remains disabled with HTTP 503 in the local production-mode configuration. Its implementation and the contact handler are unchanged from the reviewed baseline.

The redesign is implemented, not just a diagram added to the former homepage. The first journey now follows system understanding, audience identification, capability discovery and programme detail. Original founder profiles, contact form, imprint, privacy, brand assets and legacy anchor destinations remain available.

## Revised Sitemap and Information Architecture

| Route | Purpose |
| --- | --- |
| `/`, `/index.html` | SWE identity, reciprocal model, five audience paths, progression, ecosystem, people and contact |
| `/capability-model` | Six-layer interactive explanation with shareable layer selection |
| `/who-we-serve` | Five audience entry points |
| `/audiences/society` | Individuals, families and communities; AIcademy prominently featured |
| `/audiences/academia` | Schools, universities, educators, students and research |
| `/audiences/business` | Applied AI, cyber resilience and systems needs |
| `/audiences/institutions` | Delivery capacity, governance and local development |
| `/audiences/governments` | Public objectives and institutional capability development |
| `/programmes?audience=...&capability=...` | Intersection-based discovery, not unrelated programme cards |
| `/programmes/:id` | Need, audience, modules, evidence, delivery, credentials, fees and next steps |
| `/capability-careers` | Six-stage possible progression and conditional opportunities |
| `/national-capability` | Reciprocal model plus institutional development pathway |
| `/approach`, `/network`, `/about`, `/privacy` | Retained supporting routes |
| `/partners` | Disabled; separate security and identity workstream |

The conceptual order is Capability, Governance, Institutions, Academy, Economy, Society. Academy explicitly includes school, higher and lifelong education. Governance and Institutions remain distinct. Five audience paths are not treated as alternative model layers.

## Data and Maintenance

`data/capability-model.json` holds six layers, five audiences, eleven capabilities, eleven reusable modules, six progression stages and relationships for the eight existing catalogue entries. `lib/catalogue.js` joins these relationships to the existing catalogue and programme details. Capability membership is derived from modules rather than copied into separate page lists.

Existing programme descriptions, status and authoritative pricing stay in their original data files. No duplicate price source was added. Country approval, source evidence, freshness and publication checks remain in `approvedPrices`. Prices are shown in programme details, not on the homepage or as a disconnected catalogue table.

Edit shared module topics once to update all associated programmes. New relationships must use valid IDs; tests reject unknown links and audience capability paths without a matching programme. New proposed curricula must remain explicitly labelled until approved.

## Programme Status and Content Completeness

| Programme | Preserved status | Remaining approval/data requirement |
| --- | --- | --- |
| AIcademy4you | Existing product | Upstream platform confirms eligibility, taxes, terms and current content |
| Applied Learning Labs | Existing capability | Cohort scope, resources, schedule, assessment and price |
| Bootcamps | Existing capability | Specific cohort syllabus, duration, assessment and price |
| Systems Architecture | Available service | Client scope, prerequisites, technical environment and fees |
| Teacher Development | Available service | Educator cohort plan and delivery/assessment arrangements |
| Train-the-Trainer | Proposed programme | Formal authorisation, assessment, supervision and delivery model |
| Local Capability | Existing capability | Location-specific partners, delivery plan and resources |
| National Capability | Proposed programme | Institutional mandate, governance, funding and rollout approval |

Every detail page now answers audience, need, capabilities, topics, practical evidence, expertise basis, delivery, duration status, credential status, fees and next step. Cybersecurity, architecture, governance, AI, infrastructure, ledgers and educator pathways have concrete modular topics and possible evidence. These newly authored outlines are **scoping proposals**, not independently verified approved syllabi. No learning hours, certification, prices, government endorsements or pilot dates were invented.

No confirmed upcoming pilot is asserted. Existing capability is not relabelled as purely conceptual. Historical profiles are retained as supplied evidence, not newly independently authenticated claims. Management should review the module-to-programme associations and teaching scope before publication.

AIcademy India source endpoints were checked read-only during this work: individual INR 2,500, verified student INR 1,500; institution packages INR 19,500 / 30,500 / 49,500 / 77,500 / 110,500 / 221,000 for the existing seat bands. Above 5,000 seats remains quote-based. These matched the existing approved catalogue; checkout prices were not changed.

Sources: https://academy.swex.ai/api/payments/individual-pricing?country=IN and https://education.swex.ai/api/audiences/pricing?customerType=STUDENT&country=IN, plus the existing institution pricing endpoint and catalogue evidence. The original catalogue retains full offer-specific source metadata. Current public review expiry is 2026-12-07; later releases must reverify expired offers.

## Usability Scenarios

| Scenario | Verified route |
| --- | --- |
| A Individual | Society -> AI -> AIcademy -> benefits/evidence -> India offers -> original registration |
| B Education | Schools & Academia -> Teacher Development -> shared modules -> progression/institutional capability |
| C Business | Business -> Cybersecurity -> Systems Architecture -> resilience/system-design scope -> enquiry |
| D Government | Governments -> Local & National Capability -> six-layer relationships -> institutional readiness enquiry |
| E New partner | Institutions -> Train-the-Trainer; shared modules, related programmes, status and credential/price boundaries visible |

A-E are automated navigation/content acceptance tests, not a substitute for an observed session with Sanjay. Scenario A and layer selection/reset were also exercised through actual browser controls. A short partner comprehension test remains recommended before release.

## Verification

- Clean dependency installation completed; tests run with Node 24.22.2: **12 passed, 0 failed**.
- Production dependency audit: **0 vulnerabilities**. No dependency or lockfile changes.
- Contact tests cover escaping, TLS, SMTP acceptance, missing configuration, rejection, rate limits and no PII logging.
- Campus/public-data tests retain production disablement and withheld private material.
- Desktop 1440x1000 and mobile 390x844: homepage, catalogue, AIcademy, National Capability and Careers screenshots captured.
- Additional 320px and 768px checks on homepage, catalogue, Business and Architecture: no document horizontal overflow.
- 23 public pages inspected: one H1 per page, no empty links. Checked image pages have alt attributes.
- 88 distinct internal URL/query targets checked: no unexpected HTTP errors or missing target fragments. `/partners` returns the expected 503.
- External root, school, academy, individual, education, business, government, GALTER, EST-FAB, Coin News Extra and YouTube destinations returned HTTP 200. The two existing LinkedIn links returned HTTP 403 to automated requests; their availability requires a normal signed-in browser check. They were not removed or altered.
- Keyboard Enter selects a layer, moves focus to its explanation, and reset restores overview/focus. Native links, selects and details remain keyboard-operable.
- Reduced-motion emulation reports diagram animation `none`.
- With script execution disabled, the selected layer is server-rendered open and the model is not enhanced. Native disclosure and GET navigation do not require JavaScript. The browser automation click API itself timed out while scripts were disabled, so this fallback was verified by direct navigation and rendered state instead.
- Existing Cormorant Garamond, DM Sans, DM Mono, navy/gold tokens, logo and portraits remain. A restrained teal accent differentiates upward feedback.
- This is targeted accessibility testing, not a WCAG conformance certification or a full screen-reader audit.

## Evidence

Evidence lives in `test-results/capability-redesign/` (gitignored, not served publicly):

- `home-1440.jpg`, `home-390.jpg`
- `catalogue-1440.jpg`, `catalogue-390.jpg`
- `aicademy-1440.jpg`, `aicademy-390.jpg`
- `national-1440.jpg`, `national-390.jpg`
- `careers-1440.jpg`, `careers-390.jpg`
- `model-no-js-mobile.jpg`
- `layout-checks.json`, `link-audit.json`
- `recording/index.html`: sampled browser screencast replay, with original JPEG frames and timestamps. Playback is deliberately slowed; it is not a real-time video. The installed ffmpeg binary could not run on this CPU, so no MP4 is claimed.

## Remaining Release Gates

1. SWE content owner approves the new module outlines, associations and capability progression wording.
2. Stakeholder review of the desktop/mobile design and the five audience journeys.
3. Resolve or accept external-link availability limitations noted during review; external applications remain outside this change.
4. Reverify time-sensitive pricing before release, especially after 2026-12-07.
5. Explicit deployment authorisation, reviewed commit, rollback checkpoint and normal production smoke tests. No live contact email was sent in this local-only redesign task.

The visual reference site was not reliably retrievable during this run; the implementation follows the user's stated clarity and reciprocal-navigation requirements, not a claimed pixel comparison with that site.
