# Grillizia demo script — Golden path walkthrough

1. **Homepage & Brand**:
   - Open Grillizia on phone and laptop. Note the warm visual identity, typography, and live opening-hours badge.
   - Showcase category photo panels and hero dish switcher.

2. **Menu & Filtering**:
   - Tap a category panel to jump straight into the filtered menu.
   - Use search ("tikka") and dietary toggles ("Veg"); show that filters update the URL so links can be shared.
   - Open a dish sheet, select quantity and enter a special preparation note, then tap "Add to cart".

3. **Cart & Ordering**:
   - Open the cart drawer (or mobile sticky bar).
   - Show transparent integer fees, item notes, and instant undo if an item is decreased or removed.
   - Click "Order on WhatsApp", enter customer details, and tap "Save order & open WhatsApp".
   - Note the formatted message with line items, notes, and totals, plus the "Copy order text" fallback.

4. **Table Reservation**:
   - Navigate to `/reserve`.
   - Pick date, time slot, and guest count. Highlight timezone-aware slot rules and instant confirmation.

5. **Live Dashboard & Cross-Tab Sync**:
   - Open `/dashboard` in a second tab of the same browser profile.
   - Notice the newly submitted order and reservation appearing immediately without page reload (via BroadcastChannel/storage).
   - Change order status from "Received" to "Preparing" to "Ready".
   - Use "Simulate incoming order" to demonstrate high-volume live kitchen flow.
   - Use "Reset demo data" to quickly restore the environment for the next prospect.

6. **Offline Capability & PWA**:
   - Disconnect network / activate Airplane mode.
   - Reload any page: observe the discreet offline indicator and seamless full-app navigation, dish images, and cart interaction powered by the service worker.
