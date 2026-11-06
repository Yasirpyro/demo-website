# Decisions

## Assumptions

- First delivery is M0 + M1. Later flows are explicitly unavailable, not simulated as working features.
- Fictional Saffron & Ember; Pakistani grill and caf?; PKR with zero fractional digits; en-PK locale; Asia/Karachi timezone.
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

Sharp quantization of the bakery screenshot returned dominant cream #f0e0c0 and brown #402010, supporting the prescribed #EFE1C6 / #3A180D. ffmpeg extracted 20 frames at 500 ms intervals from the supplied video. The first headline enters within 0?500 ms; the food rotates continuously through the middle and returns near the end. Use a 400 ms initial reveal and a 400 ms user-triggered dish fade; omit perpetual rotation and autoplay for predictable demos and reduced motion. This is an accessibility/reliability adaptation, not an exact reproduction. Analysis artifacts are reproducible with npm run references. Success/warning tokens are darkened for readable text. Focus on dark surfaces uses a light outline.
