# AGENTS.md — Restaurant Demo Website

You are a senior product designer + frontend engineer + QA lead. Build the project described in `PRD.md`, styled exactly per `design.md`. Read both fully before writing any code. If they conflict, `PRD.md` wins on behavior and `design.md` wins on visuals.

## 0. Mission

This is a **sales demo** that will be shown live to restaurant owners and hosted on **Netlify or Vercel**. It is not a production app.

1. **Nothing may fail during a live demo.** Reliability beats features. Cut scope before cutting reliability.
2. **It must look premium and feel smooth** (60fps interactions, no layout shift, no flashes of unstyled content).
3. **It must be re-brandable in minutes** through a single config file.

## 1. Hard rules (never violate)

1. Works fully **offline after first load**. Self-host fonts and images. No runtime calls to external APIs, CDNs, analytics, iframes, or embeds.
2. **No backend.** Local-first state (Zustand + localStorage). The dashboard shares data with the customer site across tabs of the same browser using BroadcastChannel, with the `storage` event as fallback. Put persistence behind a `StorageAdapter` interface.
3. Every feature has an explicit **failure fallback**. No blank screens, no uncaught errors, **zero console errors/warnings** on every route.
4. If localStorage is unavailable (private mode, quota), fall back to an in-memory store and show a small non-blocking notice. The app must still work for the session.
5. Wrap the app in an error boundary that shows a friendly "Something went wrong — Reload" screen. It must never show a white screen.
6. No lorem ipsum. No broken images: every image has a fixed aspect-ratio box, a blur/branded placeholder, and an `onError` fallback tile.
7. Everything restaurant-specific (name, logo, colors, phone, currency, hours, timezone, socials, menu, offers, reviews) lives in `src/config/restaurant.config.ts` and `src/config/menu.data.ts`. **No hard-coded restaurant strings in components.**
8. Respect `prefers-reduced-motion`. Animations must never block interaction.
9. No `any`, no `@ts-ignore`, no skipped/disabled tests, no TODO comments left in shipped code.
10. Do not add libraries beyond the stack below without writing the justification in `DECISIONS.md`.

## 2. Stack

| Concern | Choice |
|---|---|
| Build | Vite + React 18 + TypeScript (strict) |
| Styling | Tailwind CSS, driven by CSS variables from `design.md` tokens |
| State | Zustand with `persist` middleware |
| Forms/validation | React Hook Form + Zod |
| Dates | date-fns |
| UI primitives | Radix UI (Dialog, Tabs, Toast) + a bottom-sheet implementation |
| Motion | Framer Motion, used sparingly |
| Routing | React Router (`/`, `/menu`, `/reserve`, `/dashboard`) with SPA fallback |
| Icons | lucide-react (bundled, no CDN) |
| Fonts | Fontsource (self-hosted, variable) |
| Images | Sharp script → responsive WebP + blur placeholders |
| Offline | vite-plugin-pwa (precache everything, navigate fallback to index.html) |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright (Chromium, WebKit, mobile viewports) |
| Quality | ESLint, Prettier, Lighthouse CI, axe-core (via @axe-core/playwright) |

Pin the Node version in `.nvmrc` (use the current LTS) and `engines` in `package.json`. Commit the lockfile.

## 3. Repository layout

```
/
├─ AGENTS.md  PRD.md  design.md  DECISIONS.md  CREDITS.md  README.md
├─ netlify.toml  vercel.json  public/_redirects
├─ .nvmrc
├─ assets-src/            # raw photos dropped here
├─ scripts/optimize-images.mjs
├─ public/images/         # generated WebP (committed)
├─ src/
│  ├─ config/ (restaurant.config.ts, menu.data.ts, seed.ts)
│  ├─ lib/ (storage-adapter.ts, whatsapp.ts, format.ts, hours.ts, reservation-rules.ts)
│  ├─ store/ (cart.store.ts, orders.store.ts, reservations.store.ts, sync.ts)
│  ├─ components/ (ui/, layout/, menu/, cart/, reserve/, offers/, reviews/, dashboard/)
│  ├─ routes/
│  └─ styles/tokens.css
├─ tests/unit/  tests/e2e/
└─ lighthouserc.json
```

## 4. Images

- Preferred: license-free photos (Unsplash/Pexels) downloaded locally into `assets-src/`, processed by `npm run images` into `public/images/` (WebP, widths 480/960/1600, plus a tiny blur placeholder). Record photographer + source URL for every image in `CREDITS.md`.
- If you have no network access, do **not** hotlink. Ship branded fallback tiles (token colors + dish name) and write `IMAGES_NEEDED.md` listing exact filenames and aspect ratios so the owner can drop real photos into `assets-src/`.
- The app must look complete in both cases.

## 5. Milestones

Work in order. After each milestone: run `npm run check` (lint + typecheck + unit tests), commit with a clear message, and tick the box in `PROGRESS.md`. Do not start the next milestone with failing checks.

- [ ] **M0 Foundation** — Vite/TS/Tailwind, tokens from `design.md`, fonts, config files, routing, error boundary, storage adapter with in-memory fallback, CI scripts, deploy configs.
- [ ] **M1 Layout + Hero** — header, hero, footer, responsive shell, info section (hours with live open/closed indicator, address, phone, socials, "Open in Maps" link).
- [ ] **M2 Menu** — category panels, menu grid, item cards, item detail sheet, search + category filters, empty state.
- [ ] **M3 Cart** — add/remove/quantity, persisted cart, drawer + mobile sticky bar, totals, notes.
- [ ] **M4 WhatsApp ordering** — checkout form, message builder, `wa.me` deep link, copy-order fallback, order saved locally for the dashboard.
- [ ] **M5 Reservations** — form with rules, slot capacity, confirmation screen, WhatsApp confirmation message, saved for dashboard.
- [ ] **M6 Offers + Reviews** — offer cards (add combo to cart), reviews list, rating summary.
- [ ] **M7 Dashboard** — orders + reservations, status changes, live cross-tab updates, new-item highlight, "Simulate order/reservation", "Reset demo data".
- [ ] **M8 Offline + polish** — PWA precache, offline test, motion pass, accessibility pass, performance pass, SEO meta + Restaurant JSON-LD.
- [ ] **M9 Verification + deploy** — full test suite, Lighthouse CI, rehearsal script, deployment docs verified, `README.md` and `DEMO_SCRIPT.md` finalized.

Optional stretch (OFF by default, behind `config.features.remoteSync = false`): a Supabase implementation of `StorageAdapter` for true cross-device dashboard sync. Do **not** enable it, and do not let it add any runtime dependency when disabled.

## 6. Testing requirements

- **Vitest**: cart math (totals, rounding, quantity bounds), WhatsApp message builder (URL encoding, emoji/Urdu/Arabic text, max length handling), reservation validation (past date, closed hours, guest limits, slot capacity), opening-hours logic across midnight, storage adapter fallback.
- **Playwright** (desktop Chromium, iPhone and Android viewports, WebKit): the golden path from `PRD.md` §3; offline mode (`context.setOffline(true)` after first load); cart persistence on reload; dashboard receiving an order from a second page in the same context; error fallbacks (blocked popup → copy-order button).
- **axe-core**: zero critical/serious violations on every route.
- **Console guard**: a Playwright fixture that fails any test if `console.error` or `console.warn` fires.
- **Lighthouse CI** (mobile profile, production build): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- **Rehearsal script** `npm run rehearse`: runs the golden path 10 times consecutively with network offline; all 10 must pass.

## 7. Deployment (Netlify or Vercel)

The site is a static SPA. It must deploy unchanged to either host. Provide both configs and verify the build locally with `npm run build && npm run preview`.

- Build command: `npm run build` · Output directory: `dist` · Node: version from `.nvmrc`.
- `public/_redirects` (Netlify): `/*  /index.html  200`
- `netlify.toml`: build command, publish dir, SPA redirect, headers (long immutable cache for `/assets/*`, `no-cache` for `/index.html` and `/sw.js`).
- `vercel.json`: framework `vite`, `rewrites` to `/index.html` for non-asset routes, same cache headers.
- Vite `base` must be `/` so assets resolve on any host or custom domain.
- Service worker must not cache itself indefinitely: `sw.js` is served `no-cache`; use `registerType: 'autoUpdate'`.
- No environment variables required. The build must succeed with none set.
- `README.md` must include step-by-step deploy instructions for both: connect Git repo (auto-deploys), or drag-and-drop `dist` on Netlify / `vercel deploy --prod` from the CLI; how to create a separate site per prospect; how to attach a custom domain.
- Add `DEPLOY_CHECKLIST.md`: deploy the day before; open the live URL once on the demo phone and laptop while online so the service worker precaches; confirm offline reload works; add to home screen; run the golden path once on the deployed URL; confirm the WhatsApp link opens the real app.

## 8. Known platform limits (state these in README, do not hide them)

- BroadcastChannel/localStorage are per-browser and per-origin. **The dashboard and customer site must be open in the same browser profile** to sync live. Orders placed on a phone will NOT appear on a laptop's dashboard (unless the optional remote sync is later enabled). The demo script is built around this: use two tabs on one device, or use "Simulate order" on the dashboard.
- Private/incognito windows may block localStorage. The in-memory fallback covers this, but data is lost on close.

## 9. Definition of Done

All of the following, verified by running them, not assumed:

1. `npm run check` passes (lint, typecheck, unit tests).
2. `npm run test:e2e` passes on all configured projects.
3. `npm run rehearse` passes 10/10.
4. `npm run lighthouse` meets the thresholds in §6.
5. Zero console errors/warnings on every route, in dev and production builds.
6. Production build works offline after a first online load.
7. No `lorem`, `TODO`, `placeholder`, broken image, or dead link anywhere (add a test that scans for these).
8. `README.md`, `DEMO_SCRIPT.md`, `DEPLOY_CHECKLIST.md`, `CREDITS.md`, and `DECISIONS.md` are complete.
9. A final `REPORT.md` listing: what was built, every test result with numbers, assumptions you made, anything you could not verify (especially the real-phone WhatsApp check, which only the owner can do), and known limitations.

## 10. Working style

- State assumptions at the top of `DECISIONS.md` instead of asking questions. Only stop and ask if something blocks progress entirely.
- Small commits, one milestone at a time. Never leave the main branch broken.
- If a feature is at risk, simplify it and keep the fallback rather than adding complexity.
- Prefer boring, proven solutions over clever ones.
