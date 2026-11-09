# Website 2.0 public implementation

Follow-up corrections and current release gates: release-readiness-2026-11-09.md.
That review supersedes the blanket proposed statuses and unresolved contact-security
notes below; this document retains the original implementation handoff history.

Date: 2026-11-08. Branch: codex/swe-india-pricing.
Local preview: http://localhost:3088/?skipIntro=1
No push, production deployment, checkout modification or secret change.

## Audit and design inventory

See website-audit.md for the original audit and base revision. Express 4 serves
plain HTML, CSS and JavaScript; the additional pages use server-rendered HTML.
No new runtime dependencies, database, CRM or identity provider were introduced.
The existing navy/gold palette, Cormorant Garamond / DM Sans / DM Mono fonts,
1280px content width, logo assets, portraits and profile styles are retained.
New two-column content collapses at 760px; legacy profile breakpoints are retained.
The accessible native disclosure menu works without JavaScript, closes on Escape
and exposes every destination on mobile and desktop. Partner Login is separate.

## Sitemap

| URL | Purpose |
| --- | --- |
| / | SWE positioning, mission, ecosystem, academy feature, programme overview, pathways, existing references and enquiry form |
| /approach | Human agency, practical capability and ecosystem contributions |
| /programmes | Eight programmes, statuses and approved country offers |
| /programmes/aicademy | Existing product, evidence, credentials and five original access paths |
| /programmes/labs | Proposed Applied Learning Labs |
| /programmes/bootcamp | Proposed Technology Bootcamps |
| /programmes/architecture | Proposed AI and Systems Architecture |
| /programmes/teachers | Proposed Teacher Development |
| /programmes/trainers | Proposed Train-the-Trainer |
| /programmes/local | Proposed Local Capability Programmes |
| /programmes/national | Proposed National Capability Programmes |
| /who-we-serve | Individual, university, business, family and public-institution entry points |
| /capability-careers | Potential pathways and explicit no-guarantee conditions |
| /national-capability | Seven-stage model, readiness and local independence |
| /network | Existing international references, ecosystem and network links |
| /about | Organisation and links to both complete founder profiles |
| /#contact | Existing contact form and endpoint |
| /partners | Server-protected read-only draft review; disabled without configuration |
| /privacy | Existing policy, unchanged |

## Migration

All original mission, fields, hubs, founder, cofounder, contact and imprint
anchors remain. The previously missing #partners target now resolves to the
public network introduction; /partners is a distinct protected route.
Existing founder biographies, photos and international references remain.
The former hero phrase is retained in the approach page and footer; the homepage
now uses the requested SWE name and independent-capability positioning.

The old hub paragraph promised a five-day programme, talent selection and
commercial structures without approval evidence. Its anchor and geographic
references remain, but those statements were replaced by a proposed pilot model
and separate-selection conditions. The original wording is recoverable from
the base git revision. No course availability is inferred from map locations.
The former exclusionary audience heading now reads "Different starting points.
Shared capability." Existing audience items remain.

The intro remains available, including ?intro=1. It now respects the already
stored session flag and reduced-motion preference, does not obstruct deep links,
pauses on dismissal and avoids video preloading when not needed. Storage denial
does not break navigation. Without JavaScript the overlay is hidden.

## Catalogue and commercial safeguards

data/catalogue.json holds public programme identities and source-backed offers.
data/programme-details.json holds topics, benefits, evidence, career applications
and verified credential information. lib/catalogue.js exposes the merged schema
and explicit pending defaults, shared by public routes and authorised consumers.
New countries/currencies and prices are editable centrally; public prices require
approval, source evidence and valid review dates. Institutional amounts remain
package totals. No checkout prices were changed.

All seven SWE concepts are proposed; only AIcademy is marked existing. Every
detail has Why Choose This Programme, eligibility, duration, delivery, fees,
issuer, assessment, recognition, renewal, outcomes, evidence and career pathways.
Unknown values are explicitly pending. No book counts, lifetime access,
accreditation, job guarantees or unverified course durations were invented.
Business/government paths link to their original audience-specific sites rather
than treating conditional offers as universal public prices.

Private India recommendations remain outside the repository and public root in
the restricted local Partner Campus data directory. No draft prices are included
in generated public HTML. Existing source-verified prices and recommendations
remain distinct.

## Partner Campus status and gates

See partner-campus.md. The tested implementation is a read-only, named-account,
role/country-scoped draft report viewer, not a completed partner CRM or SSO system.
Production configuration is absent and the route returns 503 rather than a fake
login. Prospects and sales partners are denied confidential recommendation access.
Management and authorised national coordinators can read only permitted data.
Full prospect/customer views, sales materials, project management, approval UI,
CRM integration, scoped expiring share links, identity lifecycle and MFA require
an approved infrastructure/permissions design. Keep this gate closed until then.

## Verification and limits

npm test passes four test groups covering all public routes and programme fields,
all navigation destinations, preserved homepage anchors, five academy entry links,
unknown-programme 404, price approval/freshness/country filters, missing private
static routes, unconfigured campus, authentication, role/country isolation,
escaping, revocation, HTTP protection, no-store and throttling.

Browser QA uses the real local server. Checked new page layouts at 320, 768 and
1440px and academy at 390px; all observed images loaded. A legacy audience-grid
overflow at 320px was repaired and rechecked. The contact anchor no longer opens
the intro overlay. Original form IDs, names and submission handler are retained.
No real enquiry or purchase was submitted; SMTP delivery remains untested here.
Intro checks confirmed explicit playback entry, Skip dismissal with paused video,
and no repeated overlay on return from About. Desktop evidence is stored locally
in test-results/website-2-desktop.png (ignored by git).

Read-only external checks on 2026-11-08 returned HTTP 200 for academy, education,
business, government, SWEX.AI, EST-FAB and GALTER. Roots2AI returned 200 after
redirecting roots2ai.com to roots2.ai. Availability checks do not verify legal
claims or approve external terms. No external website was modified.

Journeys: individual -> catalogue -> academy -> existing access links;
university -> audience page -> proposed teacher programme -> contact;
national partner -> capability stages -> scoped enquiry / protected campus.
Automated checks verify destination routes; browser checks cover navigation and
responsive content. These do not substitute for partner usability acceptance.

## Missing business approvals

- Programme operational status, curriculum, hours, dates, prerequisites and delivery owner.
- Credential issuer, assessment rubric, recognition evidence and renewal policy.
- Academy contractual access duration, tax/payment terms and legal certificate issuer.
- Proposed India fees, supplier-cost estimates, margins and any new country offers.
- Current hub operation and institutional relationship evidence.
- Partner accounts, role grants, storage/backup, retention and production security review.

The pre-existing nodemailer advisory and contact-route risks documented in the
audit remain release blockers: PII logging, HTML interpolation and success without
SMTP configuration. They were not silently bundled into this content redesign.

## Changed files and deployment

Public: public/index.html, public/css/programmes.css, public/js/main.js,
public/js/site-menu.js. Server: server.js, lib/programme-pages.js,
lib/site-navigation.js, lib/catalogue.js, lib/partner-campus.js. Data: both
catalogue JSON files. Tests: tests/pricing.test.js. Supporting changes: README,
package test script/lockfile, .gitignore and docs.

After explicit approval, review all changes, resolve release blockers, verify
live academy prices, run npm ci and npm test, and review desktop/mobile staging.
Commit only reviewed source changes, never private country reports or credentials.
Deploy the approved revision through the existing Render service with its existing
start command. Provision Partner Campus only after its separate security gate.
Check production HTTPS, privacy, profile images, video, mail delivery and route
access. Roll back by redeploying the previous approved revision, not by resetting
the user's local changes. No production change has been performed.
