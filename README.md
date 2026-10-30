# CafeFinds — a coffee shop log

A mobile-first "Letterboxd for coffee shops": browse a map of nearby cafés
(Google Places), mark the ones you've been to, rate them with coffee beans and
leave a note. Anyone can browse and read logs; you need an account to log a
café. Built with React + Vite, Express, Prisma and Neon Postgres, and it
installs to an iPhone Home Screen as a PWA.

## Stack

- **Frontend**: React + Vite, React Router, plain CSS (no framework), `vite-plugin-pwa`
- **Type and motion**: Bricolage Grotesque (one variable family, loaded from Google Fonts); animation is CSS only and respects `prefers-reduced-motion`
- **Maps**: Google Maps JavaScript API + Places library (Autocomplete + Nearby Search)
- **Backend**: Express, mounted as a single Vercel serverless function in production
- **Database**: Prisma ORM → Neon serverless Postgres
- **Accounts**: email or username + password, session in an httpOnly cookie

## Setup

```bash
npm install
cp .env.example .env      # fill in the values; see the comments in the file
npx prisma migrate deploy # applies every migration, including accounts
npm run dev:server        # API on :3001
npm run dev               # app on :5173 (proxies /api to :3001)
```

Environment variables (all documented in `.env.example`):

| Variable | Needed for |
| --- | --- |
| `DATABASE_URL`, `DIRECT_URL` | Neon Postgres |
| `VITE_GOOGLE_MAPS_API_KEY` | The map and café search |
| `JWT_SECRET` | Signing the session cookie. **Required in production**: the API refuses to start sessions without it |
| `APP_URL` | The link inside password-reset emails (falls back to Vercel's production domain) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Sending password-reset emails. Without a key, local dev prints the reset link to the server console |

## Who can do what

| | Guest | Signed in |
| --- | --- | --- |
| Browse the map, search, open a café | ✓ | ✓ |
| Read café logs and public profiles | ✓ | ✓ |
| Mark visited, rate, write a log | | ✓ |
| Your log page, settings | | ✓ |

This is enforced on the server (`requireAuth` on every write route), not just
hidden in the UI.

## Screens

`/` map · `/log` your diary · `/u/:username` public profile · `/settings`
profile, email, password, delete account · `/login` · `/register` ·
`/forgot-password` · `/reset-password`

## How the pieces fit together

- **Sessions**: signing in sets a signed JWT in an httpOnly, `SameSite=Lax`
  cookie (30 days). `tokenVersion` on the user is bumped on every password
  change or reset, which signs out every other device.
- **Map tab**: nearby cafés come from a Google Places `nearbySearch` re-run
  whenever the map goes idle. Opening a café calls `GET /api/cafes/:placeId`
  (public). A café only gets a database row when a signed-in person first
  marks it visited or rates it (`POST /api/cafes/upsert`), so browsing never
  writes to the database.
- **Visited checklist**: `POST /api/visits/toggle` flips a `Visit` row keyed
  on `(userId, cafeId)`.
- **Reviews**: one per user per café (`POST /api/reviews` upserts, rating 1–5,
  note up to 500 characters). Saving a review implies a visit.
- **Password reset**: `POST /api/auth/forgot` always answers the same way,
  whether or not the email has an account. The emailed token is single-use,
  valid for one hour, and only its SHA-256 hash is stored.
- **Existing anonymous data**: before accounts, each device had a random id.
  If a device with one registers, its old visits and reviews move into the new
  account (see `claimedLegacy` in `server/routes/auth.js`).

## Add it to an iPhone Home Screen

It installs straight from Safari as a standalone PWA: open the deployed URL in
**Safari**, tap **Share** → **Add to Home Screen** → **Add**. The same steps
appear in Settings until the app detects it is already running standalone.

## Known gaps / next steps

- **No email verification.** Anyone can register with any address; they just
  can't read its mail. Add a confirmation email before relying on addresses.
- **Rate limiting is per serverless instance.** Auth routes allow 20 attempts
  per 15 minutes per IP, but each instance counts on its own. Put a shared
  store (e.g. Upstash) or the host's firewall behind it for real traffic.
- Marker icons use classic `google.maps.Marker`; migrate to
  `AdvancedMarkerElement` + a Map ID for custom HTML pins.
- No photo upload for avatars, reviews or cafés. Places `photos` could fill in
  café images.
