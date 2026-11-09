# Pricing extension handoff

Date: 2026-11-07. Development only; no push/deployment, checkout edit or Render
configuration change. Existing fonts and legal pages were not modified.

## Implemented

- Central public data/catalogue.json: programmes, status, country/currency,
  dated source-verified AIcademy offers, approval and freshness gate.
- Public /programmes, /programmes/aicademy, /approach, /capability-careers and
  /national-capability, with existing brand assets and fonts.
- Homepage footer and mobile programme entry points; existing content retained.
- Server-side, read-only /partners authentication and country/role permissions.
  Unconfigured production access remains closed. It is not a complete partner
  CRM, SSO or multi-tenant business operations platform.
- Private India report and machine-readable recommendations are outside git
  and public/. No prices are activated by reading or editing those drafts.

## Verification

Run npm test: public approval/freshness/country filtering, unauthorized access,
invalid passwords, role/country isolation, report escaping, revocation,
no-store headers and throttling. HTTP checks cover new routes, missing private
static routes and original registration links. Real checkout and email
submissions were deliberately not performed.

Playwright desktop/mobile checks: /programmes at 390, 768 and 1440 pixels has
no page-level horizontal overflow; screenshots reviewed in test-results/.
Scenario arithmetic was recomputed from private pricing.json. Trainer and venue
costs remain assumptions, not validated supplier quotes.

npm audit --omit=dev flags the pre-existing nodemailer 6 dependency as high
severity. Do not treat this branch as a security-complete production release.
Upgrade/migration and regression testing of mail transport require a separate
change; no automatic major upgrade was made. See website-audit.md for existing
contact-form risks. Full production infrastructure testing remains outstanding.

## Before deployment

1. Obtain explicit deployment approval; review proposed programme copy.
2. Recheck live AIcademy pricing and confirm tax/access/payment terms.
3. Resolve dependency/mail risks before production security sign-off.
4. Provision private storage and named user hashes using partner-campus.md;
   confirm trusted proxy topology. Otherwise leave /partners disabled.
5. Run npm ci, npm test and mobile checks on the approved deployment build.
6. Deploy only the reviewed branch revision; check /privacy, contact delivery,
   existing profiles and intro video in the actual production environment.

Public homepage, navigation, audience pages and complete programme detail
structure were subsequently implemented on 2026-11-08. See website-2-handoff.md
for the current sitemap, migration, validation and remaining approval/security
gates. Approved curricula, credentials and full Partner Campus/CRM workflows
remain outstanding.
