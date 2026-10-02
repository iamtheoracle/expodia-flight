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

## MapLibre worker

`scripts/copy-maplibre-worker.mjs` runs as a `predev`/`prebuild` hook and copies
MapLibre worker files to `public/maplibre/`. The installed maplibre-gl v5.24
ships `.js` files instead of the `.mjs` files the script expects — this is a
harmless warning, not a build blocker.
