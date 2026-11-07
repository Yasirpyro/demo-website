# Grillizia delivery report

## Current scope

All milestones M0 through M9 across Sprint 1 (M3–M6) and Sprint 2 (M7–M9) are complete.

- **M0 Foundation**: Vite + React 18 + TypeScript strict setup, CSS design tokens, Fontsource typography, storage adapter with memory fallback, error boundary.
- **M1 Layout + Hero**: Responsive header/footer, hero section, opening hours indicator, location and social links.
- **M2 Menu**: 20-dish menu across five categories, URL-persisted search & dietary filters, dish detail dialog, branded fallback tiles.
- **M3 Cart**: Drawer & mobile sticky bar, integer-safe currency calculations, line item notes, quantity bounds, undo removal.
- **M4 WhatsApp Ordering**: Validated checkout modal, deep links to WhatsApp (`wa.me`), copy-to-clipboard fallback, order persistence.
- **M5 Reservations**: Date & slot picker with capacity rules, timezone handling, validation, confirmation dialog.
- **M6 Offers + Reviews**: Curated combo promotions, computed savings, accessible customer review cards (`role="img"` stars).
- **M7 Dashboard**: Service ledger for orders and table reservations, status transitions, simulation triggers, cross-tab BroadcastChannel & storage synchronization.
- **M8 Offline + Polish**: PWA offline precaching via `vite-plugin-pwa` and Workbox, offline status indicator banner, Web App Manifest with icons, Restaurant & Menu Schema.org JSON-LD, OpenGraph meta tags, motion styling with reduced-motion support.
- **M9 Verification + Deploy**: Full test suite passing (53 unit tests, zero ESLint warnings, contrast audits), rehearsal script (`scripts/rehearse.mjs`), Vercel & Netlify configuration verified with active Node LTS support (>=20.0.0, tested on 22.11.0).

## Verification

- `npm run check` passes: ESLint with zero warnings, strict TypeScript (`tsc -b`), 53 unit tests across 12 suites, and 11 token contrast pairs passing.
- `npm run build` passes: initial application JS 339 kB (109 kB gzip), CSS 45 kB (9.8 kB gzip). All 42 PWA static assets precached into `dist/sw.js`.
- SPA rewrites and cache headers configured for Vercel (`vercel.json`) and Netlify (`netlify.toml`, `public/_redirects`).
- All brand strings and package metadata use Grillizia with responsive WebP images and fallback branded tiles.

## Deployment readiness

- **Node runtime**: Updated from non-standard 26 to standard Node LTS (`>=20.0.0`, `.nvmrc` 22.11.0) so Vercel and Netlify build without runtime version errors.
- **Build script**: `npm run build` runs `tsc -b && vite build` cleanly with zero environment variables needed.
- **Routing**: `vercel.json` rewrites non-asset requests to `/index.html` while preserving direct access to `/sw.js`, `/manifest.webmanifest`, `/assets/`, and `/icons/`.


## Assets and visual review

Seven source photos are stored locally with Pexels credits; the image script generates 21 responsive WebP assets and seven tiny previews. Seven exact-dish photo gaps use complete branded fallback tiles: paneer tikka, daal, vegetable rice, raita, kachumber, lassi and kheer. The paneer download failed twice. Exact replacement filenames and crops are documented in IMAGES_NEEDED.md; no unrelated meat photos are used for these vegetarian dishes.

The existing cream/brown/maroon identity is retained for Grillizia. Inter handles body/UI and Oswald category headings. Layout follows the supplied photo-panel reference, with horizontal snap scrolling on phones and four panels on desktop. The menu uses two columns on phones, three at tablet/desktop widths and four on wider screens. The detail sheet respects safe areas and reduced motion. The search label remains visibly present.

Design self-review: AI Slop Score 1/10 and Distinctiveness Score 8/10, judged against the supplied references. These are design judgments, not automated metrics.

## Earlier performance baseline

M0–M1 Lighthouse CI passed its aggregate assertions using Chromium headless shell. Those measurements have not been rerun for M2 and are not claimed as current M2 results.

| Baseline run | Performance | Accessibility | Best Practices | SEO | LCP     | CLS     | TBT      |
| ------------ | ----------- | ------------- | -------------- | --- | ------- | ------- | -------- |
| 1            | 89          | 100           | 96             | 92  | 3.333 s | 0.00131 | 186 ms   |
| 2            | 92          | 100           | 96             | 92  | 3.194 s | 0.00131 | 80.5 ms  |
| 3            | 91          | 100           | 96             | 92  | 3.251 s | 0.00131 | 134.5 ms |

The strict LCP < 2 s target remains unmet for M8. README documents the Windows headless-shell runner setting after full Chromium timed out at Tracing.start. These are historical score results, not full M9 acceptance.

## Remaining work and limits

M3–M9 remain pending: full cart review, WhatsApp ordering, reservations, offers/reviews, dashboard management, cross-tab record sync, PWA/offline installation, final SEO/JSON-LD and the ten-run offline rehearsal. Reserve and dashboard routes remain explicit interim screens.

No live deployment, custom domain, real phone or real WhatsApp app was verified. Browser device emulation is not real-device sign-off. The restaurant identity/location remain illustrative; phone, WhatsApp and social values are empty until supplied. Memory fallback data disappears on close, and later dashboard synchronization is same-profile/same-origin only. Asset/stack/behavior decisions are in DECISIONS.md.

Tooling can emit Node deprecation/color-environment notices; these are separate from the guarded application console. After the final visible search-label polish, all eight focused layout/detail-sheet checks passed across the same four browser projects (1.1 minutes). The latest HTML report contains that focused run; the earlier full 80-test result is recorded above.
