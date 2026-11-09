# SWE extension audit

This is the original audit. Contact security and programme statuses were corrected
in the follow-up release-readiness-2026-11-09.md; use that report for current gates.

Reviewed 2026-11-07. Base: b495aaae7dc6224b6506fcc62109e7e313d9baa6.
Development branch: codex/swe-india-pricing. No production deployment authorized.

## Existing implementation

Express 4, Node >=18, plain HTML/CSS/JS, nodemailer; Render runs server.js.
Only public/ is served statically. Routes: /, /privacy, /contact, /intro.mp4.
No SWE identity provider, database, CRM integration or partner authorization exists.
Do not reuse unrelated AIcademy cookies or share its passwords across domains.

Existing design: Cormorant Garamond, DM Sans, DM Mono; navy #080e1f,
#0d1530 and gold #c9a84c; 1280px content width. Retain Google font links,
logo assets, portraits, intro, contact form, founder references and privacy page.
New pages reuse typography and tokens with responsive unframed content.

## Scope and migration

The public extension now includes programme detail routes, approach, audiences,
careers, national capability, network and organisation pages, plus the read-only
/partners gate. Existing homepage anchors and biographies remain. The detailed
2026-11-08 migration and sitemap are documented in website-2-handoff.md. Full
partner CRM workflows remain behind the documented infrastructure/security gate.

## Source conflict

Read-only inspection of Projects/swex-ai-landing at c8423bd found older
lib/academy-regional-pricing.js defaults (INR 1499 full, 599 single, 1799 bundle).
Runtime override data/academy-pricing-regions.json was absent. The current live
platform uses GLOBAL_2026_V1 and different audience-specific endpoints. Old
defaults are NOT used. Projects/Academy-Kurs-SWEX is primarily course content,
not the current public pricing authority. Neither related repository is modified.

## Existing risks outside this change

Contact route logs personal enquiry details and reports success without SMTP
credentials; HTML mail fields are not escaped. Resolve separately before a
privacy/compliance sign-off. No test email or real checkout will be submitted.

## Rollback

Changes stay on the development branch. Production/main remains untouched.
After a future approved deployment, revert the extension commit and redeploy
the prior revision if needed. Never reset unrelated work or .DS_Store.
