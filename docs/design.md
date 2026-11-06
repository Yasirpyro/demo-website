# design.md — Restaurant Demo

Derived from two reference screenshots (a warm bakery-style landing page and a multi-cuisine restaurant page). The screenshots are low resolution, so every color, font, and size marked **(est.)** is an estimate. Codex: sample the reference images with an eyedropper/color-quantization script if the originals are provided, run the contrast checks in §9, and adjust tokens if any pair fails. Record final values in `DECISIONS.md`. The video reference, if provided, defines motion timing (§7): extract frames with ffmpeg and measure.

## 1. Design intent

- **Mood:** warm, appetizing, confident, editorial. Food photography is the hero; type is big and tight; surfaces are soft and rounded.
- **From reference 1:** cream canvas, deep brown text and bands, oversized bold headline with tight leading, pill-shaped nav and buttons, circular arrow icon buttons, a vertical column of rounded thumbnail selectors, small monospace supporting text, hero photo overlapping into the next section, a hand-drawn line illustration accent.
- **From reference 2:** full-height photo category panels with dark gradient overlays and condensed uppercase headings, a "Popular Deals" card grid showing price and delivery-time meta, top contact bar, map + partner area, yellow/amber action accents.
- **Combined direction:** use reference 1's warm editorial look as the main language; borrow reference 2's category panels, deal cards, and info bar for structure.
- **Never:** stock-template look, purple gradients, glassmorphism clutter, more than two accent colors, text over busy photos without an overlay.

## 2. Color tokens (CSS variables on `:root`, overridable via `config.theme`)

| Token | Value (est.) | Use |
|---|---|---|
| `--color-bg` | `#EFE1C6` | Page canvas (cream) |
| `--color-bg-soft` | `#F7EEDC` | Cards on cream, subtle sections |
| `--color-surface` | `#FFFFFF` | Cards, sheets, dashboard panels |
| `--color-ink` | `#3A180D` | Primary text, headings |
| `--color-ink-soft` | `#6B4A3C` | Secondary text |
| `--color-band` | `#3A180D` | Dark sections (e.g. "Our premium product" band), footer |
| `--color-on-band` | `#FBF4E6` | Text on dark band |
| `--color-primary` | `#8E1B22` | Primary buttons, key accents (maroon/red) |
| `--color-primary-hover` | `#741419` | Hover/pressed |
| `--color-on-primary` | `#FFFFFF` | Text on primary |
| `--color-accent` | `#F2A31B` | Highlights, deal badges, "view menu" arrows (amber). **Fill only, with dark text; never as text on light backgrounds.** |
| `--color-on-accent` | `#2A1208` | Text on accent |
| `--color-border` | `#D9C7A6` | Dividers, input borders |
| `--color-overlay` | `linear-gradient(to top, rgba(20,8,4,.85) 0%, rgba(20,8,4,.35) 55%, rgba(20,8,4,0) 100%)` | Photo overlays |
| `--color-success` | `#2E7D4F` | Confirmed, open |
| `--color-warning` | `#B26A00` | Pending |
| `--color-danger` | `#B3261E` | Errors, cancelled |
| `--color-focus` | `#1D4ED8` | Focus ring (2px + 2px offset, always visible) |

Dashboard status colors use tinted backgrounds with dark text: new (amber), preparing (blue-gray), ready (green), completed (neutral), cancelled (red).

## 3. Typography

All fonts self-hosted via Fontsource (variable where available), `font-display: swap`, with metric-matched system fallbacks to prevent layout shift. No Google Fonts CDN.

| Role | Font (est. match) | Notes |
|---|---|---|
| Display / headings | **Inter** (700–800) | Reference 1 headline looks like a bold geometric grotesque. Tracking −0.03em, leading 0.95–1.05 |
| Body / UI | **Inter** (400/500/600) | Leading 1.5 |
| Condensed accent | **Oswald** (500–600), uppercase | Category panel titles, as in reference 2 |
| Mono meta | **IBM Plex Mono** (400/500) | Small supporting text, prices in badges, order IDs |

**Type scale (fluid, with `clamp`)**

| Token | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| `display-xl` | `clamp(2.75rem, 9vw, 6.5rem)` | 800 | 0.95 | −0.035em |
| `display-lg` | `clamp(2.25rem, 6vw, 4rem)` | 800 | 1.0 | −0.03em |
| `h2` | `clamp(1.75rem, 4vw, 2.75rem)` | 700 | 1.1 | −0.02em |
| `h3` | `1.375rem` | 700 | 1.2 | −0.01em |
| `h4` | `1.125rem` | 600 | 1.3 | 0 |
| `body-lg` | `1.125rem` | 400 | 1.55 | 0 |
| `body` | `1rem` | 400 | 1.5 | 0 |
| `small` | `0.875rem` | 400/500 | 1.45 | 0 |
| `mono-sm` | `0.8125rem` | 400 | 1.5 | 0.01em |
| `panel-title` (Oswald) | `clamp(1.5rem, 3vw, 2.25rem)` | 600, uppercase | 1.05 | 0.02em |

Inputs and form text ≥ 16px. Support Urdu/Arabic menu text with a font stack fallback (`"Noto Naskh Arabic"` self-hosted only if the seed menu includes such text) and `dir="auto"` on user-content fields.

## 4. Spacing, radius, shadow, layout

- **Spacing:** 4px base. Tokens: 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96, 128.
- **Section padding:** mobile 56px vertical / 20px horizontal; desktop 96–128px vertical.
- **Container:** max-width 1200px, centered; hero may bleed wider.
- **Grid:** 4 columns mobile, 8 tablet, 12 desktop; gutters 16/24/32.
- **Breakpoints:** `sm 480`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1536`. Design mobile-first from 360px.
- **Radius:** pill `999px` (nav, buttons, chips), `24px` (hero/media cards), `20px` (cards), `16px` (thumbnails, inputs), `12px` (small elements).
- **Shadow:** `sm: 0 1px 2px rgba(58,24,13,.08)`, `md: 0 8px 24px rgba(58,24,13,.12)`, `lg: 0 20px 48px rgba(58,24,13,.18)`; sheets use `lg`.
- **Z-index scale:** header 40, sticky cart bar 50, sheet/drawer 60, dialog 70, toast 80.

## 5. Layout of pages

### Home (`/`)
1. **Info bar** (optional, config): phone, address, open/closed badge, social icons (small, dark text on cream).
2. **Header:** pill-shaped container. Left: round social icons or logo. Center: pill links (Menu, Offers, Reviews, Reserve, Contact). Right: circular-arrow **Order now** pill button (primary) and a cart button with count badge. Mobile: logo + cart + menu button opening a full-screen sheet.
3. **Hero:** two-line `display-xl` headline (left aligned, config tagline), `mono-sm` supporting sentence, primary pill CTA with circular arrow ("View menu"), large cropped hero dish photo bleeding off the right/bottom and overlapping the next section, vertical column of 3–4 rounded thumbnail selectors (right edge) that switch the hero dish, optional line-art illustration accent near the headline. On mobile: headline on top, photo below, thumbnails become a horizontal row.
4. **Dark band section** ("Our premium products" style): `--color-band` background, `on-band` text, "View all" pill link with circular arrow, horizontally scrollable featured dishes.
5. **Category panels** (reference 2): 4 equal full-height columns on desktop (min-height ~420px) each with photo, bottom gradient overlay, Oswald uppercase title, 2-line blurb, and a "View" link. On hover the panel photo scales 1.04 and the title shifts up 4px. On mobile: horizontal snap-scroll cards (80% width).
6. **Popular dishes / Our popular deals:** 3-column card grid (1 column mobile), card = photo (4:3), title, price badge, meta (prep time or tag), Add button.
7. **Offers:** deal cards with amber savings badge.
8. **Reviews:** rating summary + swipeable cards.
9. **Reserve teaser:** dark band with a short form preview linking to `/reserve`.
10. **Info + map:** hours table, address, static map image with "Open in Maps" button, contact buttons.
11. **Footer:** dark band, logo, links, socials, small "Built by HYRX AI Studio" credit (config-removable).

### Menu (`/menu`)
Sticky search field + category chips (horizontal scroll, snap), results grid (2 columns mobile, 3–4 desktop), result count line, empty state.

### Reserve (`/reserve`)
Two-column on desktop (photo/benefits left, form right); single column on mobile. Confirmation replaces the form with a summary card.

### Dashboard (`/dashboard`)
Neutral light theme using the same tokens. Header with "Demo dashboard" badge, summary tiles, tabs, status filter chips, cards/table (table on desktop, cards on mobile), action toolbar (Simulate, Reset, Sound).

## 6. Components

**Buttons.** Height 48px (44 minimum), pill radius, 600 weight. Variants: `primary` (maroon, white text), `secondary` (transparent, ink border), `accent` (amber fill, dark text), `ghost`, `icon-circle` (40–48px circle with an up-right arrow icon, as in reference 1). States: hover (darken, arrow nudges 2px up-right), pressed (scale .98), focus (2px ring + offset), disabled (50% opacity, no pointer), loading (spinner, width preserved).

**Inputs.** 52px height, 16px radius, 1px border, label above (always visible), helper/error text below with icon, error state uses danger color and `aria-describedby`.

**Chips.** Pill, 36px height, selected = ink background with cream text.

**Menu card.** Image 4:3 with 20px radius, name (h4), 2-line clamp description (small, ink-soft), price in mono badge, tag chips (Veg, Spicy, Popular), circular **+** button bottom right. When qty > 0 the + becomes a stepper. Sold-out: grayscale image + "Sold out" label.

**Cart drawer / sheet.** Desktop: 420px right drawer. Mobile: bottom sheet up to 90vh with drag handle and safe-area padding. Contents: lines with thumbnail, name, note link, stepper, line total; subtotal/fees/total; sticky footer with **Order on WhatsApp**. Focus trapped; Esc closes.

**Sticky cart bar (mobile).** Fixed bottom, 16px inset, pill, primary color, "N items · total · View cart"; appears with a spring only when the cart is non-empty; respects safe-area.

**Offer card.** Cream-soft card, amber badge "Save X", price and struck-through original, Add combo button.

**Review card.** White card, initial avatar, stars (filled amber with dark outline for non-color cue), text (4-line clamp with expand), date in mono.

**Toasts.** Bottom-center on mobile (above the cart bar), top-right on desktop, 3s auto-dismiss, `aria-live="polite"`, never cover the primary action.

**Confirmation panel (post-order / post-reservation).** Success icon, summary, "Open WhatsApp again", "Copy order text", secondary actions.

**Status badge.** Pill with dot + label, tinted background, dark text.

**Skeletons/placeholders.** Blur-up placeholder from the generated tiny image; fallback tile = `--color-bg-soft` with an inline SVG fork-and-knife glyph and the dish name.

## 7. Motion

- **Easing:** `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`; `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`; springs only for the cart bar and sheets (stiffness 380, damping 32).
- **Durations:** `fast 150ms` (hover, press), `base 250ms` (fades, chips), `slow 400ms` (sheets, drawers), `hero 700ms` (hero dish swap).
- **Patterns:** page-load fade-up (12px, stagger 60ms, max 6 items), hero dish crossfade + slight scale (1.03 → 1) when a thumbnail is chosen, panel hover zoom, button arrow nudge, add-to-cart pulse on the cart button, dashboard new-row highlight (amber background fading over 4s).
- **Rules:** animate only `transform` and `opacity`; no layout-affecting animation; no autoplay carousels (manual control keeps the demo predictable); disable all non-essential motion under `prefers-reduced-motion`; nothing may delay a tap response by more than 100ms.
- If a motion video reference is supplied, replace these estimates with timings measured from extracted frames and note the source in `DECISIONS.md`.

## 8. Imagery and iconography

- Food photos: warm, natural light, tight crops, consistent color grade. Hero dish PNG/WebP with transparent or clean background is ideal for the overlap effect; otherwise crop with a large rounded mask.
- Aspect ratios: hero 4:5 (mobile) / 5:4 (desktop), category panel 3:4, menu card 4:3, offer 16:10, thumbnails 1:1.
- Icons: lucide-react, 1.75px stroke, 20–24px. Hand-drawn line-art accent as a single inline SVG (cuisine-appropriate), color `--color-primary` at 70% opacity.
- Logo: config-provided SVG; provide a simple wordmark default. Favicon set generated locally.
- Every photo has meaningful `alt` text from the menu data.

## 9. Accessibility and contrast checks

Codex must run a script (e.g. with `wcag-contrast`) over these pairs and fix tokens on failure. Targets: ≥ 4.5:1 body text, ≥ 3:1 large text/UI.

`ink on bg` · `ink on bg-soft` · `ink-soft on bg` · `on-band on band` · `on-primary on primary` · `on-accent on accent` · `ink on surface` · status badge text on tint · focus ring on bg and on band.

Additional rules: never convey status by color alone (add icon/text); focus ring visible on all interactive elements; touch targets ≥ 44px; honor `prefers-reduced-motion` and `prefers-color-scheme` is **not** themed (single light theme; do not ship a half-finished dark mode).

## 10. Theming for rebranding

`src/styles/tokens.css` defines every token above as CSS variables; Tailwind's theme reads from them. `config.theme` may override colors, fonts, and radii at runtime by setting variables on `:root`, so a new prospect's brand can be applied from config alone. Provide two ready presets in config comments: `warm-bakery` (default, above) and `bold-dark` (near-black bg, white text, amber accent, Oswald-led headings, inspired by reference 2).

## 11. Do / Don't

**Do:** huge confident headlines, generous whitespace, real food photos, one primary action per view, rounded pills, consistent arrow-circle motif, visible feedback for every tap.
**Don't:** center everything, stack more than two font families per screen, put amber text on light backgrounds, use stock-icon food clip art, animate on scroll without reduced-motion handling, show raw errors, leave any image slot empty.
