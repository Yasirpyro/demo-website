# Deployment checklist

## Pre-deployment verification

- Run `npm ci`, `npm run check`, and `npm run build`.
- Preview `dist` (`npm run preview`) and directly load `/`, `/menu`, `/reserve`, and `/dashboard`.
- Replace fictional contact/location details in `src/config/restaurant.config.ts` before a real prospect deployment.
- Verify the chosen host (Vercel or Netlify) uses standard Node LTS (v20 or v22).
- Ensure SPA rewrites and caching headers are active via `vercel.json` or `netlify.toml`.

## Demo readiness checklist

- Deploy the live demo site to Vercel or Netlify.
- Open the live URL once online on both demo devices (phone and laptop); allow the service worker to precache assets.
- Test offline reload: toggle airplane mode or offline status and confirm all routes and images render.
- Install the web app to home screen on mobile via the browser prompt.
- Run the golden path on the live deployed URL:
  1. Add items to cart.
  2. Order via WhatsApp (confirm message opens in WhatsApp app).
  3. Book a reservation.
  4. View and manage live incoming records on `/dashboard` in a parallel tab.
- Dashboard synchronization operates across tabs within the same browser profile.
