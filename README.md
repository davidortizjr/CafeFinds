# CafeFinds — a coffee shop log

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

## Add it to an iPhone Home Screen

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
