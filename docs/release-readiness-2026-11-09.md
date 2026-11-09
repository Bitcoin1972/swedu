# SWE 2.0 release-readiness review

9 November 2026. **Ready for owner review, not authorised for production.**
Branch: `codex/swe-india-pricing`. Nothing pushed, deployed or changed in Render.
This report supersedes the outstanding contact-security and blanket programme-status
notes in the 7/8 November audit/handoff documents.

## Programme status decisions

Existing capability describes experience, not automatic enrolment in a fixed
course. Available service means an enquiry can be scoped; it is not a promise of
an immediate delivery date. Proposed programme describes a formal format still
being developed. No approved, dated upcoming pilot was found.

| Programme | Corrected status | Evidence and boundary |
| --- | --- | --- |
| Applied Learning Labs | Existing capability | Supplied SWE workshop/practical education history; named lab syllabus and assessment still to be agreed. |
| Technology Bootcamps | Existing capability | Existing SWE bootcamp/hub concept and supplied training/event organisation experience; no fixed public intake inferred. |
| AI and Systems Architecture | Available service | Existing founder systems/advisory profile and consulting enquiry path; tailored scope, not a newly accredited course. |
| Teacher Development | Available service | Live Roots2AI Schools lists educator workshops, dialogue, project days and school-strategy support; separate SWE framework remains scoped. |
| Train-the-Trainer | Proposed programme | Builds on existing facilitation experience; formal selection, assessment and trainer authorisation are not yet established. |
| Local Capability Programmes | Existing capability | Supplied Kigali/Open Citizen and institutional education history; coordinated local programme requires agreement and does not certify hub operation. |
| National Capability Programmes | Proposed programme | Established strategic concept informed by institutional education/governance experience; no funded rollout or scheduled pilot asserted. |

Evidence sources: existing founder/co-founder profiles and the user's supplied
activity history; [Roots2AI Schools](https://roots2.ai/programs/schools/) inspected
live on 9 November. Historical SWE claims are owner-supplied evidence, not an
independent audit of delivery or outcomes. The text distinguishes the experience
from the still-unapproved standard course packaging. Both central data files now
carry the corrected statuses; each detail displays its basis and availability.

## AIcademy verification

[Current individual product](https://academy.swex.ai/individual) reviewed in the
browser. Four sequential areas, AI tutor, voice/avatar, practical tasks, artifact
challenges, agent simulation and governance are present. Outcomes now identify a
documented use case, tested instruction system, quality checklist and workflow or
prototype. The certificate requires all four parts, governance and competence;
it is not a professional qualification or automatic Knowledge Camp admission.
The legal certificate issuer remains to be confirmed in the enrolment terms.
No unsupported 36-book, 1,600-resource, three-level or lifetime-access claims added.

Live public pricing endpoints rechecked on 9 November:
- [Individual India](https://academy.swex.ai/api/payments/individual-pricing?country=IN): INR 2,500.
- [Student India](https://education.swex.ai/api/audiences/pricing?customerType=STUDENT&country=IN): INR 1,500, verification required.
- [Institution India](https://education.swex.ai/api/audiences/pricing?customerType=EDUCATION_INSTITUTION&country=IN&seats=500): package totals INR 19,500 / 30,500 / 49,500 / 77,500 / 110,500 / 221,000 for 1-50 / 51-100 / 101-250 / 251-500 / 501-1,000 / 1,001-5,000 seats; larger packages by quote.

Prices remain GLOBAL_2026_V1. Verification dates refreshed, no amounts changed.
Individual, student, education, business and government registration paths remain
on their original sites. Taxes, eligibility and contractual terms stay with that
checkout. Business/government conditional quotes were not republished as universal
rates. No purchase or production enquiry was submitted.

## Content and navigation

All 17 public page routes were inspected; one H1 per page. Collected internal
links and anchor targets showed no broken destinations. The legacy 15+ years,
40+ countries and infinity hub counters lacked supporting evidence in this
review and were replaced with the supplied speaking-history start year and
non-numeric global/local descriptions. Existing biographies, portraits and
references remain; GBA wording now describes experience rather than a current
appointment. Contact location now aligns with the Karlsruhe imprint.

Career copy explicitly says qualified participants may contribute to SWE,
SWEX.AI or Roots2AI as trainers, mentors, project contributors and local
coordinators, subject to real openings, competence and selection, without income,
employment or contract guarantees.

External checks: core academy, education, business, government, Roots2AI, SWEX,
EST-FAB, GALTER, Coin News Extra and YouTube URLs returned 200. Roots2AI redirects
to roots2.ai. The legacy Teen Girls in Blockchain domain failed DNS resolution;
both footer links now use its identifiable [organisation profile](https://ng.linkedin.com/company/teen-girls-in-blockchain-tgib).
LinkedIn restricts automated HTTP access (403), so browser/session access can vary;
this is not evidence of a missing organisation page. No related site was edited.

## Contact security corrections

`lib/contact.js` replaces the old inline handler. No submission data or raw SMTP
errors are logged. HTML is escaped, plain-text email is included, reply-to and
field types/lengths are validated, newline/header injection is rejected, and
request bodies are bounded. Client-supplied attachment/raw options are not used.
Transport requires TLS and certificate validation, with logging/debug disabled.
Success requires SMTP acceptance of the configured recipient; this does not
promise inbox delivery. Missing configuration returns 503; rejected/failed mail
returns 502. Invalid/oversized requests return 400/413. Ten attempts per ten-minute
window return 429 thereafter; transient keyed IP hashes are used, not IP logs.

Frontend feedback uses textContent, checks HTTP success, preserves failed enquiries
and exposes accessible status/error messages. A real browser submission to an
isolated local server with `env: {}` confirmed the 503 message, no success UI and
retained enquiry. No real SMTP transmission occurred.

Nodemailer updated to 10.4.0; package runtime minimum is now Node 20. Production
dependencies: `npm audit --omit=dev` reports zero vulnerabilities. Full audit still
reports two moderate development-only entries (nodemon/minimatch); not loaded by
the production start command. Supported production Node version must be confirmed
before release. SMTP provider/recipient settings were not inspected or changed.
Transport configuration follows [Nodemailer SMTP documentation](https://nodemailer.com/smtp).

## Partner isolation

With NODE_ENV=production the entire /partners subtree unconditionally returns
503 before reading account files or private reports, even if paths and valid
credentials are configured or forwarded HTTPS headers are supplied. There is no
enable-by-environment flag in this release. Activation requires a separately
reviewed change after infrastructure and access approval. Development-only
role/country tests remain in place. No private report or recommendation is in
public/, public HTML, or a public API. Static probes for data, docs, source,
.env and test artefacts return 404. Private India recommendations remain outside git.

## Tests and visual evidence

`npm test`: nine passing test groups. Coverage includes escaped/plain email,
actual Nodemailer MIME compilation without delivery, missing credentials, SMTP
failure/rejection, input/header injection, malformed/oversized JSON, request
throttling, price approval/freshness/country gates, all programme fields/routes,
upstream links, missing private paths, authentication, revocation, country/role
isolation and unconditional production disablement.

Screenshots: `test-results/release-2026-11-09/index.html` is a local gallery of all
five requested pages at 1440x1000 desktop and 390x844 mobile. Full-page captures
also accompany the four detail/catalogue pages. Each viewport was visually
reviewed; no horizontal document overflow or missing image was found. Computed
brand tokens remain navy #080e1f and gold #c9a84c; heading font remains Cormorant
Garamond, with the existing DM Sans and DM Mono assets unchanged. Logos and
portraits are unchanged. Evidence is local/ignored, not publicly served.

## Approval gates

1. Owner approval of status distinctions, biographies/titles, historical references and service availability. Exact course hours, credentials and new prices still require approval, not invention.
2. Confirm a supported Node 20+ runtime and test real World4You mail acceptance/inbox delivery in approved staging; no credentials should be pasted into source.
3. Verify Render proxy topology and edge abuse limits. The in-process rate limiter is a baseline, not distributed DDoS protection.
4. Partner Campus stays closed; identity/MFA, permissions, storage, retention and CRM need separate approval.
5. Legal/privacy review and explicit deployment authorisation remain required. This technical review is not legal certification or a penetration test.

No push, deployment or production configuration change was made.
