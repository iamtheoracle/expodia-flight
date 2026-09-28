# Expodia Flights Platform Milestones Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the six production-readiness milestones against the existing Expodia Flights codebase without rebuilding working flows.

**Architecture:** Preserve the existing Next.js + Supabase architecture. Add deterministic data models/services first, then connect UI surfaces to real records. Keep AI limited to research synthesis/recommendation tasks; deterministic application logic owns authorization, validation, state, deduplication, and persistence.

**Tech Stack:** Next.js 16, React 19, TypeScript, Supabase SSR/Postgres/RLS, Vitest, existing MapLibre integration.

**Spec:** docs/superpowers/specs/2026-09-28-expodia-platform-milestones-design.md

## Dashboard Contract
- Traveler, agent, and admin are three distinct product experiences, not one dashboard with permission-based cosmetics.
- Traveler UI/routes: customer-facing discovery, search, planning, cart, profile, bookings, tickets, documents, tracking, notifications, communities, saved items and travel intelligence; no agent/admin operational data.
- Agent UI/routes: human booking operations for customers/passengers, search, cart/checkout, bookings, tickets, documents, tracking, customer communication, cases/tasks and agent intelligence; agent status does not imply admin access.
- Admin UI/routes: management/control plane for agents, applications, permissions, security, provider/configuration controls, audit, operational intelligence, content and system health.
- Navigation, layout, terminology, data visibility and route guards are distinct per dashboard; UI hiding is never the security boundary.
- Server-side authorization must explicitly verify the required role. A user may hold multiple roles only when explicit role records grant them.
## Global Constraints
- No fake/demo operational content.
- main remains the source-of-truth branch; implementation occurs on a feature branch and is not deployed automatically.
- Sensitive traveler/document data remains private.
- Two-minute refresh is a research/check interval, not a forced publishing interval.
- Deterministic logic owns auth, permissions, validation, booking/document state, deduplication and security.
- Preserve working booking, planner, auth and management behavior.
- Cloudflare is optional; standard Next.js remains the authoritative runtime unless an explicit Workers deployment is configured.

## Review Focus
- A traveler without complete passport/document information must still be able to browse, while booking-required validation blocks only the affected workflow.
- An unchanged intelligence source must not create another feed post on refresh.
- A materially changed source must update an existing item rather than create a duplicate.
- Public tracking/verification must never reveal private passenger identity or passport data.
- A logged-in traveler must not read another traveler's profile, documents, notifications or conversations through the client.
- A deployment with no optional provider credentials must fail honestly without rendering invented inventory.

### Task 1: Dashboard separation and authorization foundation

**Files:** src/middleware.ts, existing traveler/agent/admin route layouts and shells, authorization helpers, tests.
**Interfaces:** Produces explicit server-side role checks and dashboard-specific route contracts consumed by all later milestones.
- [ ] Write failing tests covering traveler access to traveler routes, traveler denial of agent/admin routes, agent access to agent routes, agent denial of admin routes, admin access to admin routes, and public verification access without private identity data.
- [ ] Inspect the existing role sources (agents, company_admins, traveler profile/security records) and define the smallest deterministic role-resolution helper; do not infer one role from another.
- [ ] Refactor middleware/server guards so traveler, agent and admin route trees have explicit authorization boundaries while preserving existing company-admin protection.
- [ ] Ensure each dashboard renders its own navigation/layout rather than reusing an agent shell for travelers or treating admin as an agent variant.
- [ ] Add server-side tests proving direct URL access cannot bypass the UI boundaries.
- [ ] Run focused authorization tests and the existing suite.

### Task 2: Runtime and deployment reconciliation
**Files:** package.json, .github/workflows/ci.yml, deployment documentation; remove or relocate stale root Cloudflare-only configuration if it conflicts with the authoritative runtime.
**Interfaces:** Produces a single documented default runtime and CI contract.
- [ ] Add a deployment contract test/documentation check.
- [ ] Make CI use the lockfile deterministically where available and keep Node 22.
- [ ] Remove contradictory root-level deployment assumptions without deleting reusable application code.
- [ ] Document standard Next.js deployment and optional Cloudflare Workers requirements.
- [ ] Run lint, typecheck, test and build through CI.

### Task 3: Private traveler profile and document foundation
**Files:** new Supabase migration, traveler profile route/components, document helpers/tests.
**Interfaces:** Produces private traveler identity/document records addressable by auth user id.
- [ ] Add failing tests for ownership and validation behavior.
- [ ] Add migration for legal name, date of birth, nationality, contact details and structured travel-document fields required by the booking flow.
- [ ] Add RLS policies using auth.uid ownership.
- [ ] Extend profile UI without exposing data to other users.
- [ ] Add deterministic validation for booking-required fields.
- [ ] Run migration/security tests and the full suite.

### Task 4: Intelligence source, freshness and deduplication foundation
**Files:** new Supabase migration, server-side intelligence modules, tests.
**Interfaces:** Produces a deterministic upsertIntelligenceItem(sourceId, sourceUrl, observedAt, content, kind) contract; unchanged content is not republished.
- [ ] Write red tests for identical-source suppression and material-update detection.
- [ ] Add source/provenance and content-fingerprint persistence.
- [ ] Add freshness states NEW/UPDATED/CURRENT/EXPIRED/EVERGREEN/ARCHIVED.
- [ ] Implement deterministic normalization/fingerprinting and upsert.
- [ ] Keep AI outside the persistence/state machine.
- [ ] Run focused tests then the full suite.

### Task 5: Real signed-in discovery feed
**Files:** src/app/home/page.tsx, feed components/styles, server query/service modules, tests.
**Interfaces:** Feed query returns only publishable, permission-safe intelligence ordered by freshness/relevance with pagination.
- [ ] Write red tests for empty verified source set and duplicate suppression.
- [ ] Replace hard-coded feed cards with query-backed records.
- [ ] Add pagination/infinite loading without browser-side scraping.
- [ ] Add community/category metadata and source/freshness disclosure.
- [ ] Remove repeated "Expodia" UI labels where unnecessary.
- [ ] Run focused UI/service tests and full suite.

### Task 6: Notifications, communities and documentation surfaces
**Files:** notifications route/components, sidebar/home rail, notification data access, tests.
**Interfaces:** Notifications distinguish booking, document, travel, account, community and intelligence events.
- [ ] Write red tests for notification ownership and category filtering.
- [ ] Connect notification UI to real records.
- [ ] Add documentation/passport/document reminders from actual traveler state.
- [ ] Populate community/sidebar surfaces from real records and useful navigation.
- [ ] Keep empty states honest when no records exist.
- [ ] Run focused tests and full suite.

### Task 7: Production hardening and final verification
**Files:** RLS/security migrations if needed, env example, deployment docs, tests.
**Interfaces:** Production readiness is verified by lint, typecheck, test, build and CI status.
- [ ] Audit exposed public-schema tables and RLS.
- [ ] Audit server-only secrets and NEXT_PUBLIC variables.
- [ ] Search for demo/mock/placeholder operational content.
- [ ] Verify provider absence produces explicit unavailable states.
- [ ] Run lint, typecheck, tests and production build.
- [ ] Review Cloudflare/Next/Netlify configuration consistency and document any remaining incompatibility.
