# Expodia Flights — Base44 Dev Environment

## Running the app

```sh
docker compose -f docker-compose.base44.yml up -d --build
```

The app runs on port 3000 via `next dev` (Turbopack) with live reload.

## Known issue: Turbopack production build fails

`next build` (Turbopack) fails during static page prerendering with
`TypeError: Cannot read properties of null (reading 'useContext')`.
This is a Turbopack minification/mangling bug — the build succeeds with
`--no-mangling` or `--webpack`.

**Fix applied:** the `build` script in `package.json` uses `next build --webpack`.
The dev server still uses Turbopack (which works fine).

## Supabase

Default Supabase URL and anon key are hardcoded in `src/lib/supabase/config.ts`,
so the app boots without env vars. `SUPABASE_SERVICE_ROLE_KEY` is required only
for admin/server endpoints (throws if missing when `createSupabaseAdminClient`
is called — not needed for the app to start).

## Google sign-in

Every sign-in screen (`/access`, `/login`, `/traveler/login`, `/traveler/signup`) renders
`src/components/auth/GoogleSignInButton.tsx`. It starts a Supabase OAuth flow and returns to
`/auth/callback?role=<traveler|professional|auto>&next=<path>`. The callback provisions a
`traveler_profiles` row when the role is `traveler`, or — for `auto`, used by `/access` — when the
returning account is neither an agent nor a company admin.

Google must be enabled in the Supabase dashboard (Authentication → Providers → Google) with the
client id/secret and the redirect URL `<app-origin>/auth/callback`. No app env var is involved.

## Notifications

`src/lib/notifications/` holds the channel contracts plus one adapter per provider:
SendGrid (`EMAIL`), Google RBM (`RCS`), and Web Push (`PUSH`). `dispatch.ts` routes by channel;
`POST /api/notifications/send` is the authenticated entry point. Providers throw
`NotificationProviderNotConfiguredError` when their credentials are absent, so the app boots
without them — email and RCS simply cannot deliver until the secrets are supplied.

In-app notifications and pop-ups are client-side: `in-app-store.ts` (localStorage, mirroring
`planning-store.ts`) feeds `ToastProvider` (mounted in the root layout) and `NotificationBell`
(mounted in the agent and traveler shells). The traveler trips page raises a real departure
reminder into that store once per trip.

Browser push needs a VAPID key pair plus the `push_subscriptions` table from
`supabase/migrations/0022_push_subscriptions.sql`, which must be applied to the Supabase project.
Delivery additionally needs `SUPABASE_SERVICE_ROLE_KEY`.

## MapLibre worker

`scripts/copy-maplibre-worker.mjs` runs as a `predev`/`prebuild` hook and copies
MapLibre worker files to `public/maplibre/`. The installed maplibre-gl v5.24
ships `.js` files instead of the `.mjs` files the script expects — this is a
harmless warning, not a build blocker.
