# Grillizia

A white-label restaurant sales demo. This delivery implements the foundation, homepage and interactive menu (M0–M2). Cart review, ordering, reservations, dashboard and offline installation follow in later milestones. See PROGRESS.md.

## Run locally

Install the Node version in .nvmrc (26.13.0), then run:

```sh
npm ci
npm run dev
```

On Windows use npm.cmd if your PowerShell profile blocks npm.ps1. Run npm run check for lint, strict types, unit tests and contrast. npm run build creates dist; npm run preview serves the production output. npm run test:e2e runs browser verification after npx playwright install chromium webkit. No environment variables are needed.

## Rebrand

Edit src/config/restaurant.config.ts and src/config/menu.data.ts. Drop images with the documented names into assets-src/ and run npm run images. Set real contact values before a prospect demo; empty phone/WhatsApp/social values hide their links. Theme overrides apply CSS variables. Use the boldDark export as an alternate preset.

## Deploy to Netlify

1. Push this repository to your Git provider.
2. In Netlify choose Add new project — Import an existing project, then select the repository.
3. Build command: npm run build. Publish directory: dist. Node version comes from netlify.toml.
4. Deploy; confirm direct loads of /menu, /reserve and /dashboard.
5. Alternatively run npm ci and npm run build locally, then drop the dist folder into Netlify Drop.
6. In Domain management add your custom domain and follow Netlify’s DNS instructions.

## Deploy to Vercel

1. Import the Git repository into Vercel, select Vite, build with npm run build, output dist.
2. Select the pinned Node major if the host supports it. If 26 is not yet offered, wait for host support or explicitly document and verify an LTS compatibility change before deploying.
3. Deploy; vercel.json supplies SPA routing and cache headers.
4. Alternatively install the Vercel CLI, run npm ci and npm run build, then vercel deploy --prod from the repository root.
5. Add a custom domain in Project Settings — Domains and apply the displayed DNS records.

For a new prospect, copy/fork the repository, change config and assets, and create a separate hosting project/origin. Never share browser demo data between prospects.

## Honest demo limits

This is a fictional brand with no live contact number. No payments, accounts, backend or customer submissions exist in this delivery. The menu supports browsing, filters, dish details and a locally saved selection. Booking and management routes clearly describe their pending milestones. Cart review and checkout are not available yet. Offline reload/installability is not ready until M8.

Later BroadcastChannel/localStorage sync is per browser profile and origin: a phone and laptop do not synchronize. Both demo tabs must use the same browser profile. Private browsing may disable storage; the application falls back to memory and data disappears on close. Real-phone WhatsApp verification requires the owner at M9.

Requirements: docs/AGENTS.md, docs/PRD.md and docs/design.md. Technical choices: DECISIONS.md. Verification and limitations: REPORT.md.

## Verification notes on Windows

The tested runtime is Node 26.13.0. Browser binaries can be kept inside this ignored workspace cache:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $PWD '.cache/browsers'
npx playwright install chromium webkit
npm run test:e2e
```

If Lighthouse times out at Tracing.start with full Chromium, use the dedicated headless shell bundled with the pinned Playwright version:

```powershell
$env:CHROME_PATH = (Resolve-Path '.cache/browsers/chromium_headless_shell-1194/chrome-win/headless_shell.exe').Path
npm run lighthouse
```

This is a test-runner setting; the website build and deployment require no environment variables. Lighthouse starts its own preview on port 4180. The development watcher ignores generated test artifacts to avoid Windows file-lock errors.
