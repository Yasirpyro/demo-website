# Grillizia delivery report

## Current scope

M0 Foundation and M1 Homepage are complete. M2 Menu is complete. The rename to Grillizia was verified and committed separately as 7283da3 before M2 began.

M2 adds four homepage category panels linking to the filtered menu, all 20 dishes across five categories, URL-persisted search/category/dietary filters, empty-state recovery, sold-out handling, and accessible Radix detail sheets with validated quantity and optional notes. React Hook Form and Zod validate the detail form.

Add buttons save real local cart lines through Zustand persist and StorageAdapter. Matching dish/note lines merge up to quantity 20. A saved-selection summary and clear action provide visibility/recovery. This is the intake needed for M2, not a completed M3 cart: the global drawer/sticky bar, per-line editing/removal, fees and checkout remain pending. The page explicitly says that no orders are sent.

## Current verification

- npm run check passes: ESLint with zero warnings, strict TypeScript, 37 unit tests across seven files, and 11 token contrast pairs.
- npm run build passes: initial application JS 75.79 kB gzip; the lazy menu chunk is 33.16 kB gzip. The initial 200 kB budget is met.
- The full Playwright matrix passes: 80/80 tests in 3.4 minutes, with no retries or skipped tests, across desktop Chromium, Android Chrome emulation, iPhone WebKit emulation and desktop WebKit. Application console guards stay clean, and route/detail-sheet axe checks report no critical/serious violations.
- Desktop and phone layouts were visually inspected. Chai cropping was corrected; mismatched photos were removed from vegetarian and dessert entries.
- Brand strings, package metadata and the current README use Grillizia. Supplied reference documents/media are preserved.

The tests cover filter intersections, description/tag search, Unicode search and notes, valid cart persistence, corrupt/old cart reset, unknown stored fields, quantity caps, unavailable items, modal focus and escape behavior, reload persistence, HTML-like notes rendered as text, storage denial and overflow at every specified breakpoint. Existing route accessibility, console, reduced-motion and homepage regressions are retained.

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
