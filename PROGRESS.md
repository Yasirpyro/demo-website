# Progress

- [x] M0 Foundation — lint, strict typecheck, 18 unit tests and token contrast pass
- [x] M1 Layout + Hero — responsive homepage, 21 unit tests, 48 browser tests, aggregate Lighthouse CI assertions pass
- [x] M2 Menu — Grillizia rebrand, category panels, 20-dish menu, URL filters, detail sheets and persisted local cart intake; 37 unit tests and 80 browser tests pass
- [x] M3 Cart — drawer, mobile bar, notes, quantities, integer fees and undo; 40 unit tests pass
- [x] M4 WhatsApp ordering — validated checkout, local orders, bounded links and copy recovery; 44 unit tests pass
- [ ] M5 Reservations
- [ ] M6 Offers + Reviews
- [ ] M7 Dashboard
- [ ] M8 Offline + polish
- [ ] M9 Verification + deploy

## Two-sprint completion

Sprint 1: M3–M6. Sprint 2: M7–M9. Each milestone is checked and committed independently.

## Current delivery limits

M0–M2 are implemented. M3–M9 remain pending. The earlier M0–M1 Lighthouse Performance scores were 89/92/91; their aggregate CI check passed, but these measurements were not rerun for M2 and the strict LCP target remains unmet for M8. Offline reload/installability and the full golden-path rehearsal have not been implemented or claimed. See REPORT.md.

M2 includes basic saved cart intake so Add actions work. The full cart drawer/sticky bar, per-line editing, fees and checkout are still pending. Seven dish images use branded fallback tiles; exact replacement filenames are in IMAGES_NEEDED.md.
