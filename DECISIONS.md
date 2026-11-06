# Decisions

## Assumptions

- First delivery is M0 + M1. Later flows are explicitly unavailable, not simulated as working features.
- Fictional Saffron & Ember; Pakistani grill and café; PKR with zero fractional digits; en-PK locale; Asia/Karachi timezone.
- Clifton is illustrative. No precise invented address, phone number or social handle is published. Empty contacts are hidden. Real contact values go in restaurant.config.ts before prospect use.
- Homepage uses the supplied warm bakery composition adapted to grilled food. Use Inter for headings/UI and Oswald for accent labels; IBM Plex Mono is reserved for the later dashboard so no page uses more than two families.
- Supplied reference documents remain authoritative under docs/. Root AGENTS.md delegates to them.

## Runtime

Node 26.13.0 is pinned, verified against https://nodejs.org/dist/index.json and https://nodejs.org/en/about/previous-releases on 2026-11-07. The host starts with Node 22.11.0; record the runtime actually used for verification in REPORT.md. React remains 18 as required; Vite 6 supports the initial host while preparing the pinned runtime.

## Supporting dependencies

ffmpeg-static is build-only reference-analysis tooling, justified to extract supplied motion-reference frames without requiring a global ffmpeg installation. Testing helper packages and PostCSS/Autoprefixer are the supporting tooling for the prescribed stack. No extra runtime service is introduced.

## Persistence

StorageAdapter exposes getItem/setItem/removeItem/subscribe and a local/memory mode. It catches reads, writes and quota failures. Versioned envelopes reset only a damaged key. Zustand persist will consume the adapter when feature stores arrive; no unused cart/order stores are shipped. Cross-tab record synchronization belongs to M7.

## Scope

PWA precaching, installation, JSON-LD, ordering, reservations and management remain later milestones. All assets are local already; offline navigation is not claimed until M8.

## Reference analysis

Sharp quantization of the bakery screenshot returned dominant cream #f0e0c0 and brown #402010, supporting the prescribed #EFE1C6 / #3A180D. ffmpeg extracted 20 frames at 500 ms intervals from the supplied video. The first headline enters within 0–500 ms; the food rotates continuously through the middle and returns near the end. Use a 400 ms initial reveal and a 400 ms user-triggered dish fade; omit perpetual rotation and autoplay for predictable demos and reduced motion. This is an accessibility/reliability adaptation, not an exact reproduction. Analysis artifacts are reproducible with npm run references. Success/warning tokens are darkened for readable text. Focus on dark surfaces uses a light outline.

## Test runtime compatibility

Pin Playwright and playwright-core transitively to the same version so axe-core uses the identical Page type and browser runtime. On Node 26, disable Node’s experimental Web Storage for Vitest so jsdom owns localStorage; browser storage behavior remains unchanged.

The default studio credit has no outbound URL: a real studio URL was not supplied. Brand descriptor, hero footnote, story image/stamp and footer tagline also live in config. Font files are imported directly from Fontsource’s local WOFF2 assets to ship only the Latin subset used by this seed. Add a self-hosted Arabic font when seeding Arabic or Urdu text.

Hero preloading runs synchronously only for direct homepage visits. Preloading it on every SPA entry caused unused-resource console warnings on interim routes; conditional config-derived head injection avoids those warnings while preserving the homepage head start.

Retire the hero preload hint when its image loads: keeping a responsive hint after use let WebKit prefetch an unused size on viewport changes. The hero remains eager/high-priority; retiring the consumed hint prevents that redundant request. Browser screenshots use CSS pixels for stable artifact size across retina devices.

## Local Git setup

Git was initialized on main. Its metadata was initially owned by the Windows sandbox account. A safe.directory entry for this exact workspace (D:/demo website) was added to the user Git configuration so ordinary Git commands work; no wildcard trust was added. The generated TypeScript build cache is ignored rather than versioned.

Vite excludes generated caches, browser reports, test results and local tooling from its development watcher. Windows reported an EBUSY file-lock error when a browser report was regenerated while the development server watched it. This affects development tooling only, not production output.

## Lighthouse runner

The host’s full Chromium audit timed out on DevTools Tracing.start. The same production output audited successfully with Playwright’s dedicated headless shell; README documents the exact Windows runner setting. Performance thresholds are measured with that browser, not assumed from the passing functional suite.
