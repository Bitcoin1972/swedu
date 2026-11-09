# Read-only Partner Campus

**9 November release gate:** NODE_ENV=production unconditionally returns 503
before reading any private files. Configuring the paths below cannot enable
production access. These instructions describe local testing/future provisioning;
activation requires a separately reviewed release and formal infrastructure/access
approval. See release-readiness-2026-11-09.md.

The existing SWE app has no reusable login, CRM or database. This extension
provides a small server-authenticated pricing review area, not a complete CRM.
It uses HTTP Basic over HTTPS with per-user scrypt hashes, no browser storage
tokens, and no public draft files. Account creation is an operator task.
MFA/SSO, invitation, account recovery, partner sales workflows and persistent
audit logging remain prerequisites for a full partner rollout.

## Storage and deployment gates

The GitHub repository may be public. NEVER commit pricing recommendations,
internal reports or credentials to it, even outside public/. Private research
is held outside the repository under a separately permissioned directory.
Configure PARTNER_DATA_DIR to that directory, containing IN/pricing.json and
IN/report.md. Configure PARTNER_ACCOUNTS_FILE to an operator-only JSON file.
Missing settings fail closed with HTTP 503; no demo accounts are built in.
Do not place either path inside public/ or a public repository. Use chmod 700
for the directory and 600 for private files; deploy via private secret/storage
provisioning, never git. No Render settings were changed by this implementation.

Account shape:

    [{"username":"unique-account","active":true,"role":"national-coordinator",
      "countries":["IN"],"salt":"random-per-user-salt","passwordHash":"scrypt-64-byte-hex"}]

Generate salts with crypto.randomBytes(32).toString('hex'); use
crypto.scrypt(password, salt, 64) and store only its hex output. Distribute
unique strong passwords through an approved private channel. Never use the
historical test passwords from chat. Removing/deactivating the account revokes
access on the next request. Browser Basic credentials remain cached until the
browser session is closed; no misleading logout button is provided.

Management can read any configured country's research. National coordinators
can read only their configured country list. Prospects and sales partners have
no internal-pricing permission. Request query parameters cannot assign roles
or country permissions. Report/data files have no static/download routes.

For any future approved activation, TLS must be mandatory. trust proxy=1 assumes exactly one trusted
Render ingress; do not expose the origin directly or use this setting with an
untrusted/variable proxy chain. Requests with credentials are limited to 10 per
IP per ten minutes, including successful requests, to bound password hashing.
This is single-instance throttling. Before multi-instance rollout, replace it
with shared rate limiting and an identity provider with MFA and audit logs.

## Central pricing maintenance

data/catalogue.json contains public programme metadata and existing approved
offers only. Price rows use ISO country/currency, minor units, source, version,
verification date, review deadline and approval state. Server-side selection
requires all of these; drafts, expired and other-country records are excluded.
The currency formatter uses Intl currency metadata for the minor-unit exponent,
including zero/three-decimal currencies. Validate each new currency's source units.

Existing AIcademy offers were confirmed on its live public pricing endpoints,
not inferred from old defaults. Recheck before reviewBy and update the central
file through code review. Do not refresh by inventing a new review date; verify
the source. A source change requires review, not automatic checkout edits.
SWE does not host or alter checkout. Taxes, duration of access and billing
eligibility remain confirmed by the existing AIcademy flow.

New programme recommendations stay in private pricing.json with status=draft.
To publish any, obtain explicit management approval, confirmed programme scope,
tax treatment, refund/payment terms and dated evidence; only then add a reviewed
public price row. No approval or write endpoint exists in this phase.
