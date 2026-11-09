# Smart World Education — swedu.me

International Education, Innovation & Transformation Platform

## Stack
- Node.js + Express
- Vanilla HTML/CSS/JS
- Deployed on Render

## Local Development
Requires Node 20 or newer; use a supported Node release. No production runtime
configuration is changed by this branch.
```bash
npm install
npm run dev
```

## Programme Catalogue and India Pricing

New development routes: `/programmes`, `/programmes/aicademy`, `/approach`,
`/capability-careers`, `/national-capability`. Public prices are maintained in
`data/catalogue.json`; expired, unverified and draft rows are not displayed.
Run `npm test` for pricing and access-control checks.

`/partners` is unconditionally disabled when NODE_ENV=production, even when
accounts and storage are configured. Its read-only review implementation is for
development verification only. Never commit internal
research or credentials to this repository. See `docs/partner-campus.md`,
`docs/website-audit.md` and `docs/validation-and-handoff.md`.

This development branch is not approved for production deployment.
Latest review: `docs/release-readiness-2026-11-09.md`. Local screenshot gallery:
`test-results/release-2026-11-09/index.html` (ignored and not publicly served).

## Environment Variables (Render)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`: existing provider settings (465 uses TLS; 587 uses required STARTTLS).
- `SMTP_USER`, `SMTP_PASS`: provider mailbox credentials, never committed.
- `EMAIL_TO`: recipient, defaults to the configured mailbox.
- Legacy `EMAIL_USER` / `EMAIL_PASS` remain supported with the Gmail service fallback when no SMTP host is set.

Missing mail configuration returns 503, failed/rejected SMTP returns 502, and
success requires provider acceptance. No submitted PII or SMTP payloads are logged.
Do not edit production settings without approval; real delivery needs staging verification.

## Structure
```
swedu/
├── server.js          # Express server
├── package.json
├── render.yaml        # Render deployment config
└── public/
    ├── index.html     # Main page
    ├── favicon.svg
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```
