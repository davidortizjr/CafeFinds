# Cupboard — a coffee shop log

A minimal, mobile-first "Letterboxd for coffee shops": browse a map of nearby
cafes (Google Places), check them off once you've been, and leave a rating +
note. Built React + Vite, Express, Prisma, Neon Postgres. Installable to an
iPhone Home Screen as a PWA — no App Store needed.

## Stack

- **Frontend**: React + Vite, React Router, plain CSS (no framework), `vite-plugin-pwa`
- **Maps**: Google Maps JavaScript API + Places library (Autocomplete + Nearby Search)
- **Backend**: Express, mounted as a single Vercel serverless function in production
- **Database**: Prisma ORM → Neon serverless Postgres
- **Identity**: anonymous per-device id (no login yet — see "Auth" below)

## 1. Set up Neon

1. Create a project at [neon.tech](https://neon.tech).
2. In the project's **Connect** panel, copy two connection strings:
   - the **pooled** one (has `-pooler` in the host) → `DATABASE_URL`
   - the **direct** one → `DIRECT_URL` (used only for migrations)
3. Copy `.env.example` to `.env` and paste both in.

## 2. Set up Google Maps

1. In [Google Cloud Console](https://console.cloud.google.com/), enable **Maps
   JavaScript API** and **Places API** on a project.
2. Create an API key, then restrict it (Application restrictions → HTTP
   referrers) to `localhost:5173/*` for dev and your production domain once
   deployed.
3. Put the key in `.env` as `VITE_GOOGLE_MAPS_API_KEY`.

## 3. Install & run locally

```bash
npm install
npx prisma migrate dev --name init   # creates tables in Neon
npm run dev:server                   # Express API on :3001 (separate terminal)
npm run dev                          # Vite dev server on :5173, proxies /api
```

Open `http://localhost:5173` on your phone (same network) or in a mobile
device emulator — the whole UI is designed around a phone-width viewport.

## 4. Deploy to Vercel

1. Push this repo to GitHub and import it in Vercel.
2. In **Project Settings → Environment Variables**, add `DATABASE_URL`,
   `DIRECT_URL`, and `VITE_GOOGLE_MAPS_API_KEY`.
3. Deploy. `vercel.json` is already configured to build the Vite frontend to
   `dist/` and route all `/api/*` traffic to the single Express function in
   `api/index.js`.
4. Run `npx prisma migrate deploy` once (locally, pointed at your Neon
   `DIRECT_URL`) to create tables in the production database — Vercel builds
   don't run migrations automatically.
5. Add your Vercel domain to the Google Maps API key's HTTP referrer
   restrictions.

## 5. Add it to an iPhone Home Screen

Since this isn't on the App Store yet, it installs straight from Safari as a
standalone PWA:

1. Open the deployed URL in **Safari** on the iPhone.
2. Tap the **Share** icon → **Add to Home Screen** → **Add**.
3. It launches full-screen with its own icon, no browser chrome.

The app's `Profile` tab shows these same steps until it detects it's already
running in standalone mode.

## How the pieces fit together

- **Map tab**: nearby cafes come from a Google Places `nearbySearch` re-run
  whenever the map goes idle. Tapping a marker (or a search result) calls
  `POST /api/cafes/upsert`, which finds-or-creates that cafe in Postgres
  keyed on its Google `place_id`, and returns it hydrated with aggregate
  rating, everyone else's reviews, and whether *you've* been there.
- **Visited checklist**: `POST /api/visits/toggle` flips a `Visit` row keyed
  on `(userId, cafeId)`. Visited cafes get a distinct stamp-colored marker
  on the map and a stamp badge everywhere else.
- **Reviews**: one review per user per cafe (`POST /api/reviews` upserts).
  Saving a review implies a visit, so the checklist and diary stay in sync.
- **Log tab**: `GET /api/log` returns every cafe you've checked off, newest
  first — the diary view.

## Auth

There's no sign-up flow yet. Each device generates a random id on first
load (`src/lib/user.js`), stored in `localStorage`, and the server upserts a
matching `User` row for it. That's enough for a single-device MVP; when
you're ready for real accounts, swap `getDeviceId()` for a real auth
provider (Clerk, Auth.js, etc.) and point the `x-device-id` header at the
authenticated user's id instead — the Prisma schema doesn't need to change.

## Notes / next steps

- Marker icons use classic `google.maps.Marker`; migrate to
  `AdvancedMarkerElement` + a Map ID if you want custom HTML pins later.
- There's no image upload for reviews or cafe photos — Places `photos` data
  could be pulled in for that.
- No rate limiting on the API routes yet; add it before opening this up
  publicly.
