# Contact and ecosystem preview

Date: 2026-11-13. Local only; no commit, push, deployment or infrastructure changes.

## Changes

- Contact uses a centred, independently scrolling dialog over a generated collaboration-room background. The journey station is retained. Escape and the return button restore the story. Keyboard focus stays within the dialog and the background is inert.
- Existing translated form fields and `/contact` processing remain unchanged. Failed delivery preserves the message; only confirmed acceptance resets it.
- SRM Delhi-NCR, Sonepat now has its official logo. SWEX.AI and Roots2AI have their own ecosystem profiles in German, English and Hindi, describing their complementary contributions without claiming new measured results or certifications.
- The original observatory image and two-dimensional partner navigation remain. The logo layout accommodates 13 entries and scrolls when necessary.

## Asset provenance

- SRM: https://www.srmuniversity.ac.in/uploads/51ba570fe68fc088e0a942bdf8700cdce7eb8b1d/1661160054srm-logo-white.webp
- SWEX: https://swex.ai/public/campus/assets/swex-logo.webp
- Roots2AI: https://roots2.ai/assets/roots2ai-header-logo.png
- Roots2AI's official website publicly links SWE and SWEX among its partners. Ecosystem descriptions also use the owner's supplied context. External sites were read, not modified.
- Contact artwork: generated specifically for this preview, stored in `public/images/contact-room.png`.

## Verification

- 90 Node tests pass; `git diff --check` passes.
- `node scripts/check-contact-ecosystem.cjs`: DE/EN/HI contact views, mocked success and SMTP-unavailable responses, retained failed submissions, reset accepted submissions, Escape, five viewport widths (320 to 1440), 13 partner entries and the three new logo loads pass.
- Desktop and Hindi mobile screenshots inspected; no horizontal form overflow. No real email sent.
- Existing vision preview and immutable editorial sources are preserved.

## Preview

- http://localhost:4335/?skipIntro=1&lang=de#contact
- http://localhost:4335/network?lang=de&skipIntro=1
- http://localhost:4335/vision-preview?lang=de

The previous vision-preview server flags remain enabled locally. No production settings were changed.
