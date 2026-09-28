# Agent notes (Base44 dev environment)

- Run: `docker compose -f docker-compose.base44.yml up -d`. Single `web` service (node:22, `next dev` with Turbopack) on port 3000; deps install into a named volume on start (no lockfile in repo, so versions float).
- No local database: the app talks to a hosted Supabase project. `src/lib/supabase/config.ts` hardcodes a default URL + publishable key, so the app boots with zero secrets. Migrations in `supabase/migrations` target that hosted project — do not run them from here.
- Server-only features need `SUPABASE_SERVICE_ROLE_KEY` (admin client) and `OPENAI_API_KEY` (assistant). Flight/payment/aviation provider vars are intentionally empty until real providers exist — never invent them.
- `next.config.ts` adds `allowedDevOrigins` from `BASE44_PUBLIC_HOST_SUFFIX` so the preview origin can load dev assets/HMR.
- Known issue: `scripts/copy-maplibre-worker.mjs` expects `maplibre-gl-worker.mjs`/`-shared.mjs`, which maplibre-gl 5.24 no longer ships, so `/maplibre/*` is missing (map worker may fail). `public/maplibre/` is gitignored.
- `src/middleware.ts` gates non-public routes; unauthenticated requests redirect to `/login`.
- Checks: `npm run lint`, `npm run typecheck`, `npm test` (vitest) inside the `web` container.
