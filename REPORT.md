# M0 + M1 delivery report

## Built

- Vite + React 18 + strict TypeScript, Tailwind tokens, local fonts, routing, error recovery, and typed branding/menu configuration.
- Twenty menu seed dishes across five categories; monetary formatting uses integer amounts and configured currency precision.
- Versioned storage adapter with corrupt-key recovery and in-memory fallback, including a visible session-only notice.
- Responsive homepage with manual hero selectors, signature-dish browsing, cooking story, live Karachi opening hours, illustrated map and footer.
- Explicit interim menu/reservation/dashboard routes and a friendly 404.
- Local photo optimization and reference-analysis scripts; 4 source photos, 12 responsive WebP files, inline blur previews and photo credits.
- Netlify/Vercel SPA settings, CI, setup/rebranding/deployment documentation and milestone ledger.

## Verified on Node 26.13.0

| Check                     | Result                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------- |
| ESLint                    | Pass, zero warnings                                                                          |
| TypeScript strict check   | Pass                                                                                         |
| Vitest                    | 21/21 tests across 5 files                                                                   |
| Token contrast            | 11 text/UI pairs pass; dark surfaces use a light focus outline                               |
| Production build          | Pass; initial application JS 74.58 kB gzip, below 200 kB budget                              |
| Playwright                | 48/48 tests, 2.3 minutes, no retries or skipped tests                                        |
| Browser matrix            | Chromium desktop, Android Chrome emulation, iPhone WebKit emulation, desktop WebKit          |
| axe-core                  | Zero critical/serious violations on home, menu, reserve, dashboard and 404 in all 4 projects |
| Application console guard | Zero errors/warnings throughout the passing production suite                                 |
| Development smoke         | All 5 routes render; zero console errors/warnings                                            |
| Responsive overflow       | None at 360, 390, 430, 768, 1024, 1280, 1536 and 844×390 landscape                           |
| Keyboard                  | Mobile focus trap, Escape dismissal, focus return and link navigation pass                   |
| Failure/recovery          | Blocked storage, corrupt/old stored data, quota failure and image fallback/recovery pass     |
| Reduced motion            | Image and entrance animations disabled                                                       |
| Asset origin              | No external runtime requests during homepage browsing                                        |
| Formatting / whitespace   | Pass                                                                                         |

## Lighthouse CI: three mobile runs

The CI command completed successfully using Chromium headless shell; all configured aggregate score assertions passed.

| Run | Performance | Accessibility | Best Practices | SEO | LCP     | CLS     | TBT      |
| --- | ----------- | ------------- | -------------- | --- | ------- | ------- | -------- |
| 1   | 89          | 100           | 96             | 92  | 3.333 s | 0.00131 | 186 ms   |
| 2   | 92          | 100           | 96             | 92  | 3.194 s | 0.00131 | 80.5 ms  |
| 3   | 91          | 100           | 96             | 92  | 3.251 s | 0.00131 | 134.5 ms |

Median Performance is 91; one individual run fell below 90. CLS and TBT meet their budgets in all three runs. The separate strict LCP < 2 s target is not met and remains explicit M8 performance work. Further M8 improvements include image delivery, readable small metadata, accessible-name matching for visual dish counters, and a valid robots.txt. Do not treat this first delivery as final M9 acceptance.

Full reports: .cache/lighthouse/. Full Chromium timed out at Tracing.start on this host; the dedicated headless shell completed normally with no Lighthouse runtime error. README records the reproducible runner setting.

## Visual review

Desktop and phone screenshots were inspected. The cream/brown palette was compared with the supplied screenshot; reference-video frames were sampled every 500 ms. Motion is adapted to manual interaction rather than perpetual rotation. The final phone layout places dish thumbnails in a horizontal row. Screenshots are under .cache/screenshots; browser reports are under playwright-report.

Design self-review: AI Slop Score 1/10 (intentional but common Inter); Distinctiveness Score 8/10 (food-led composition, warm tokens, signature hero controls and editorial hierarchy). These are design judgments, not automated metrics.

## Explicit limitations and next work

M2–M9 remain unchecked. Menu filtering/details, cart, WhatsApp ordering, reservations, offers/reviews and dashboard record management are not implemented. No data submission is implied by interim routes. Zustand feature stores and cross-tab record synchronization start with their owning milestones.

All fonts/images are local, but service-worker precaching, offline reload/installability and the ten-run offline golden-path rehearsal remain M8–M9. The final Restaurant JSON-LD and full demo SEO work also remain pending. No deployment, custom-domain configuration, real phone, real WhatsApp app or live-host routing check has been performed.

The brand and location are fictional/illustrative. Phone, WhatsApp and social fields are intentionally empty and their links stay hidden. Supply real values before a prospect demo. The map is an illustration; the external map link opens the named neighborhood. Photo substitutions for naan and chai are documented for M2.

Browser emulation is not a substitute for real-device sign-off. Later dashboard sync is same-profile/same-origin only; memory fallback data disappears on close. Detailed defaults and justified adaptations are in DECISIONS.md.

The Node 26 test tooling emits process-level deprecation/color-environment notices; these are separate from the application console, which is guarded and clean.
