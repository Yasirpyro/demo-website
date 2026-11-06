# PRD — Restaurant Website Demo

## 1. Purpose and context

A white-label restaurant website used as a **live sales demo** for restaurant owners. It showcases: browsing a menu, building a cart, sending the order to the restaurant on WhatsApp, reserving a table, and a dashboard where the owner sees incoming orders and reservations.

- **Audience of the demo:** restaurant owners/managers deciding whether to buy a site like this.
- **Presenter:** the agency owner, on a phone and/or laptop, possibly on unreliable Wi-Fi.
- **Hosting:** static deploy on Netlify or Vercel.
- **Success =** the presenter completes the golden path (§3) in under 3 minutes with zero errors, and the owner thinks "I want this with my menu and my logo."

### Goals
1. Zero failures during a live demo (offline-capable, no external dependencies, graceful fallbacks).
2. Premium look and smooth motion on a mid-range phone.
3. Rebrand in ≤ 10 minutes by editing config files only.
4. Clear, rehearsable demo flow.

### Non-goals
- Real payments, user accounts, real delivery tracking, real-time cross-device sync (optional stretch only, off by default), CMS, email/SMS sending, multi-language UI (menu text may contain any language).

## 2. Users and assumptions

- **Customer (demo role-play):** on a phone, wants to see the menu, order, and book a table.
- **Restaurant staff (demo role-play):** on a laptop or phone, uses `/dashboard`.
- **Presenter:** uses the "Reset demo data" and "Simulate" tools.
- Orders and reservations are delivered to the restaurant via **WhatsApp**; the dashboard is a local mirror of what was created in this browser.
- Assumptions to record in `DECISIONS.md`: default currency/locale, default timezone, demo restaurant identity, image sourcing. All must be config values.

## 3. Golden path (the 3-minute demo script)

Every feature is built and tested against this path first.

1. Open `/` on phone. Hero loads instantly; presenter points out the info bar showing "Open now · closes 11:00 PM".
2. Tap a category panel → menu opens filtered to that category.
3. Type a dish name in search; results filter instantly. Clear search.
4. Open an item, add it (quantity 2). Add a second item from another category. Add the featured combo from Offers.
5. Open the cart: change quantities, remove one item, see total update.
6. Tap **Order on WhatsApp**: fill name, order type, notes → WhatsApp opens with the complete order message pre-filled.
7. Go to `/reserve`: pick date, time, guests, name, phone → confirmation screen appears; WhatsApp confirmation link available.
8. Open `/dashboard` in a second tab of the same browser: the order and reservation appear. Change an order to "Preparing", confirm a reservation.
9. On the dashboard, tap **Simulate incoming order**: a new order drops in with a highlight and optional chime.
10. Tap **Reset demo data** → back to the clean seeded state, ready for the next prospect.

The same flow must work with the network disabled after the first load.

## 4. Information architecture and routes

| Route | Content |
|---|---|
| `/` | Header, hero, category panels, popular dishes, offers, reviews, info + hours + map link, footer |
| `/menu` | Full menu with search, category chips, item grid; accepts `?category=<id>` |
| `/reserve` | Reservation form + confirmation state |
| `/dashboard` | Orders + reservations management (no login in demo; page shows a "Demo dashboard" badge) |
| `*` | Friendly 404 with link home |

Cart is a global drawer/sheet, not a route. All routes work on direct load/refresh (SPA fallback on host).

## 5. Features

Priority: **E** = essential, **R** = recommended, **A** = advanced. Each feature lists acceptance criteria (AC) and a required fallback.

### 5.1 Digital menu (E)
- Browse by category; each item shows photo, name, short description, price, optional tags (Veg, Spicy, Popular, New), and an Add button.
- Item detail sheet: larger image, description, quantity stepper, optional note, "Add to cart · total".
- **AC1:** Menu renders from `menu.data.ts` only. **AC2:** Prices are formatted with `Intl.NumberFormat` using config currency/locale. **AC3:** Items marked `available: false` show "Sold out" and cannot be added. **AC4:** Images never show broken icons (fallback tile). **AC5:** No layout shift as images load.
- **Seed:** 4–5 categories, 15–25 items, each with realistic names, descriptions, prices.

### 5.2 Search and filters (R)
- Search input (name, description, tags), case-insensitive, debounced ≤150ms, plus category chips and a tag filter (Veg, Spicy).
- **AC1:** Results update without page reload and without flicker. **AC2:** Empty result shows a friendly empty state with "Clear filters". **AC3:** Filter state is reflected in the URL query so refresh keeps it.

### 5.3 Food cart (E)
- Add, increment, decrement (at 1 → remove), remove, optional per-item note, order-level note, subtotal, optional delivery fee and service charge from config, total.
- Desktop: right drawer. Mobile: bottom sheet plus a **sticky cart bar** ("2 items · total · View cart") visible when the cart is non-empty.
- **AC1:** Cart persists across reloads. **AC2:** Quantity limited to 1–20 per line. **AC3:** Totals use integer math (no floating-point drift). **AC4:** Empty cart shows a friendly empty state with a link to the menu. **AC5:** Adding an item triggers a subtle confirmation (toast or cart-bar pulse), not a blocking modal.

### 5.4 WhatsApp ordering (E)
- Checkout step inside the cart: name (required), phone (optional, validated if present), order type (Delivery / Pickup / Dine-in), address (required only for Delivery), table number (optional, Dine-in), notes.
- On submit: (a) create the order locally with status `new`, (b) clear the cart, (c) open a `https://wa.me/<number>?text=<encoded message>` link.
- **Open the link from a real user-gesture-triggered anchor click** (`target="_blank" rel="noopener"`) so popup blockers don't interfere.
- **Fallback (required):** after submit, show a confirmation panel containing an "Open WhatsApp again" link and a **"Copy order text"** button (uses Clipboard API with `execCommand` fallback). Both always visible, so the presenter can recover instantly.
- **AC1:** Message matches the template in §7 exactly. **AC2:** Emoji and non-Latin text (Urdu, Arabic) are encoded correctly. **AC3:** If the encoded URL would exceed 1800 characters, truncate item notes first, then add "(+N more items, see dashboard)"; never produce a broken link. **AC4:** Restaurant number comes from config, digits only (no `+`, spaces, dashes) in the link. **AC5:** Order appears on the dashboard immediately.

### 5.5 Table reservation (E for dine-in)
- Fields: name (required), phone (required), date, time slot, guests (1–12 stepper; "13+ → call us" message), special request (optional).
- Date picker limited to today … today + N days (config, default 30). Time slots generated from config opening hours in intervals (default 30 min) and exclude past slots for today.
- Slot capacity from config (default: max 3 reservations per slot in demo data); full slots are shown disabled with "Fully booked".
- On submit: save locally with status `pending`, show confirmation screen (summary + "Send confirmation on WhatsApp" link + "Add to calendar" `.ics` download generated locally + "Make another reservation").
- **AC1:** Past dates/times cannot be selected or submitted. **AC2:** Closed days/hours are not offered. **AC3:** All validation errors are inline, specific, and never block the whole form. **AC4:** Timezone comes from config; "today" and "now" are computed in the restaurant's timezone. **AC5:** The form is fully keyboard- and screen-reader-usable.

### 5.6 Restaurant information (E)
- Opening hours table (per weekday), live **Open now / Closed · opens at …** badge, address, phone (tap-to-call), WhatsApp button, social links, "Open in Google Maps" link, and a **static map image** (no embedded iframe).
- **AC1:** Open/closed logic correct across midnight closings and special closed days (config). **AC2:** All outbound links open in a new tab with `rel="noopener noreferrer"`.

### 5.7 Mobile responsive design (E)
- Mobile-first; verified at 360, 390, 430, 768, 1024, 1280, 1536 widths.
- **AC1:** No horizontal scroll at any width. **AC2:** Tap targets ≥ 44×44px. **AC3:** Text ≥ 16px in inputs (prevents iOS zoom). **AC4:** Safe-area insets respected (sticky bar, sheets). **AC5:** Works in portrait and landscape.

### 5.8 Special offers (R)
- 3–4 offer cards (combo, % off, bundle, happy-hour style) with price, savings, meta, and **Add combo to cart**, which adds the bundle as a single priced line (or its component items per config).
- **AC1:** Offers come from config. **AC2:** Optional validity text ("Today only", "Weekdays") is display-only. **AC3:** Savings displayed are computed from item prices, never hand-typed.

### 5.9 Customer reviews (R)
- Rating summary (average + count) and a card list/carousel (name initial avatar, stars, text, date).
- **AC1:** Reviews come from config and are flagged `sample: true`; a build-time check warns if any sample review remains when `config.mode = "production"`. **AC2:** Carousel is swipeable on touch and has keyboard controls.
- Do not fabricate named real people or real-platform attributions; use clearly generic sample names.

### 5.10 Restaurant dashboard (A)
- Two tabs: **Orders** and **Reservations**, with count badges.
- Orders: cards/table with time, customer, type, items, total, notes, status. Status flow: `new → preparing → ready → completed`, plus `cancelled`. Reservations: `pending → confirmed → seated/completed`, plus `cancelled / no-show`.
- Tools: filter by status, search by name, **Simulate incoming order**, **Simulate incoming reservation**, **Reset demo data** (with a confirm dialog), optional sound toggle.
- **AC1:** Data created on the customer site appears within 1 second in another tab of the same browser (BroadcastChannel; `storage` event fallback). **AC2:** New items get a highlight that fades after ~4s. **AC3:** Status changes persist and sync back to other tabs. **AC4:** Today's summary tiles (orders count, revenue total, reservations count). **AC5:** Works on a phone in a single tab (no sync needed) and on a laptop. **AC6:** Dashboard route works with no login but shows a visible "Demo dashboard" badge. **AC7:** A visible, honest hint explains that live sync works between tabs of the same browser.

## 6. Data model (TypeScript)

```ts
type Currency = { code: string; locale: string; fractionDigits: number };

type RestaurantConfig = {
  mode: 'demo' | 'production';
  name: string; tagline: string; logo: string;
  phone: string;                 // display, e.g. "+00 000 0000000"
  whatsappNumber: string;        // digits only, international format, no '+'
  address: string; mapsUrl: string; mapImage: string;
  email?: string;
  timezone: string;              // IANA, e.g. "UTC"
  currency: Currency;
  socials: { instagram?: string; tiktok?: string; youtube?: string; facebook?: string };
  hours: Record<'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun', { open: string; close: string } | null>; // "HH:mm", close may be < open (past midnight)
  closedDates: string[];         // "YYYY-MM-DD"
  fees: { delivery: number; servicePercent: number; freeDeliveryOver?: number };
  reservations: { maxGuests: number; slotMinutes: number; advanceDays: number; capacityPerSlot: number };
  features: { remoteSync: boolean; sound: boolean };
  theme?: Partial<ThemeTokens>;  // overrides design.md tokens
};

type Category = { id: string; name: string; image: string; blurb?: string };
type MenuItem = {
  id: string; categoryId: string; name: string; description: string;
  price: number;                 // integer in major currency units unless fractionDigits > 0, then minor units
  image: string; tags: ('veg'|'spicy'|'popular'|'new')[]; available: boolean;
};
type Offer = { id: string; title: string; blurb: string; itemIds: { id: string; qty: number }[]; price: number; validity?: string; image: string };
type Review = { id: string; name: string; rating: 1|2|3|4|5; text: string; date: string; sample: true };

type CartLine = { itemId: string; qty: number; note?: string };           // offers expand to a bundle line {offerId, qty}
type OrderType = 'delivery' | 'pickup' | 'dinein';
type OrderStatus = 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type Order = {
  id: string;                    // "ORD-" + 4 digits, unique
  createdAt: string;             // ISO
  customer: { name: string; phone?: string; address?: string; table?: string };
  type: OrderType; lines: { name: string; qty: number; unitPrice: number; note?: string }[];
  notes?: string; subtotal: number; fees: number; total: number; status: OrderStatus;
};
type ReservationStatus = 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
type Reservation = {
  id: string;                    // "RES-" + 4 digits
  createdAt: string; name: string; phone: string;
  date: string;                  // "YYYY-MM-DD" in restaurant timezone
  time: string;                  // "HH:mm"
  guests: number; request?: string; status: ReservationStatus;
};
```

Persistence keys are namespaced and versioned (`rdemo:v1:cart`, `rdemo:v1:orders`, `rdemo:v1:reservations`). On schema mismatch, reset that key safely instead of crashing.

## 7. WhatsApp message template

Plain text (URL-encoded in the link). Totals use config currency formatting.

```
🍽️ *New Order — {orderId}*
Name: {name}
Type: {Delivery | Pickup | Dine-in}
{Address: {address}}          (delivery only)
{Table: {table}}              (dine-in, if given)
{Phone: {phone}}              (if given)

*Items*
{qty} × {item name} — {line total}
  ↳ {item note}               (if any)
...

Subtotal: {subtotal}
{Delivery fee: {fee}}         (if any)
*Total: {total}*

{Notes: {notes}}              (if any)
```

Reservation message:

```
📅 *Table Reservation — {reservationId}*
Name: {name}
Phone: {phone}
Date: {Weekday, DD Mon YYYY}
Time: {hh:mm AM/PM}
Guests: {n}
{Request: {request}}
```

Omit lines whose value is empty; never print "undefined", "null", or empty labels.

## 8. Edge-case table (each needs a test)

| Case | Required behavior |
|---|---|
| Empty cart, tap checkout | Button disabled; empty state with link to menu |
| Quantity decremented to 0 | Line removed with undo toast |
| Quantity above 20 | Capped, subtle message |
| Delivery with no address | Inline error on address field |
| Invalid phone | Inline error; allow letters-free formats with spaces/dashes/+ |
| Notes with emoji / Urdu / Arabic / quotes / `&` / `#` / newlines | Encoded correctly; message intact |
| Very long order | URL stays < 1800 chars via truncation rule; full order still saved locally |
| WhatsApp link blocked / popup blocked | Confirmation panel with link + Copy order text |
| Clipboard API unavailable | `execCommand('copy')` fallback; if both fail, show text in a selectable box |
| Reserve date in the past | Not selectable; submit blocked |
| Reserve time already passed today | Slot hidden/disabled |
| Closed day / outside hours | Slots not offered; message explains |
| Slot full | Slot disabled "Fully booked" |
| Guests 13+ | Message: "For large groups please call us" with tap-to-call; no submit |
| Restaurant open past midnight | Open/closed badge correct after 00:00 |
| localStorage disabled | In-memory fallback + notice; no crash |
| Corrupt/old stored data | Key reset safely; app loads |
| Offline, first visit | (Not supported before first load) friendly "Connect once to install" is not needed; the host serves normally |
| Offline after first load | All routes, images, fonts work |
| Two dashboard tabs open | Both stay in sync |
| Dashboard refresh | Data persists |
| Item image 404 | Branded fallback tile |
| Rapid double-tap on submit | Single order created (idempotent submit lock) |
| Browser back from confirmation | No duplicate submission |

## 9. Non-functional requirements

**Performance** (mobile profile, production build): LCP < 2.0s on a throttled mid-range device profile, CLS < 0.05, TBT < 200ms, Lighthouse Performance ≥ 90. Initial JS ≤ 200 KB gzip (route-split dashboard and Framer Motion features if needed). Hero image preloaded; below-fold images lazy-loaded.

**Accessibility:** WCAG 2.2 AA. Semantic landmarks, visible focus rings, focus trap and return in sheets/dialogs, labelled form fields, `aria-live` for toasts and cart updates, color contrast ≥ 4.5:1 for text, full keyboard operation, reduced-motion support. Lighthouse Accessibility ≥ 95; axe: zero critical/serious.

**Reliability:** zero console errors/warnings; error boundary; idempotent submits; versioned storage; no unhandled promise rejections.

**Browser support:** latest two versions of Chrome, Safari (iOS 15.4+), Firefox, Edge; Android Chrome.

**SEO/meta:** title, description, Open Graph (image generated locally), `theme-color`, favicon set, web app manifest, `Restaurant` + `Menu` JSON-LD derived from config.

**Security/privacy:** no third-party scripts, no trackers, no cookies. Customer data stays in the browser. Sanitize/escape all user text rendered in the dashboard.

**Offline/PWA:** precache all build assets and images; navigation fallback to `index.html`; installable on phones.

## 10. Hosting requirements (Netlify or Vercel)

- Static build (`dist`), no server code, no environment variables.
- SPA rewrite to `/index.html` configured for both hosts (`public/_redirects`, `netlify.toml`, `vercel.json`).
- `base: '/'`; cache headers: immutable for hashed assets, `no-cache` for `index.html` and `sw.js`.
- Works on `*.netlify.app`, `*.vercel.app`, and custom domains without code changes.
- Deployment and pre-demo checklist documented (see `AGENTS.md` §7).

## 11. Acceptance for the whole project

The project is accepted when the owner can: (1) deploy to Netlify or Vercel using only `README.md`; (2) run the golden path on a real phone including the real WhatsApp app receiving a correctly formatted message; (3) run it 10 times in a row offline without failure; (4) rebrand for a new prospect by editing only files in `src/config/` and `assets-src/`; (5) see all automated thresholds in `AGENTS.md` §9 met and documented in `REPORT.md`.

## 12. Open assumptions (Codex: record your choices in DECISIONS.md)

Demo restaurant identity and cuisine mix; default currency/locale/timezone; seed menu content; image sourcing; whether the sticky cart bar or drawer is primary on mobile (default: sticky bar opening a bottom sheet).
