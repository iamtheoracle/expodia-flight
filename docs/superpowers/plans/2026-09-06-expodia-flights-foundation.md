# Expodia Flights Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the production-grade Expodia Flights foundation on GitHub while preserving the approved system boundaries and preventing fabricated production activity.

**Architecture:** Expodia Flights is the agent-facing orchestration layer. Specialist systems retain their responsibilities and communicate through explicit domain contracts: provider inventory/booking/ticketing, customer/passenger records, documents, verification, tracking, notifications, and audit. Supabase/PostgreSQL is the application data foundation; provider credentials and integrations remain server-side.

**Tech Stack:** Next.js/React/TypeScript, Supabase/PostgreSQL/Auth/Storage/Edge Functions, Vitest/Playwright as appropriate, GitHub source control. The actual flight-ticket provider is intentionally abstract until its API/company is supplied.

**Spec:** Approved Expodia Flights architecture and requirements in the project conversation.

## Global Constraints

- Expodia Flights remains the product name and agent-facing experience.
- Existing specialist systems are preserved; improve orchestration rather than replacing them.
- Provider data is authoritative for inventory, pricing, booking, ticket issuance, and operational flight data.
- No fabricated production flights, fares, bookings, PNRs, tickets, statuses, notifications, or activity.
- Production provider credentials never ship to the browser.
- A booking is CONFIRMED only after provider confirmation.
- A ticket is TICKETED only after provider issuance confirmation.
- Dates and times preserve airport-local meaning and explicitly show overnight arrival dates.
- Every identifier, QR code, barcode, document, and verification reference must resolve to the correct authoritative record.
- Test/sandbox data must be explicitly labelled and isolated from production.
- UI must be responsive and maintain the approved professional travel-agent design language.

---

### Task 1: Repository foundation

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `docs/architecture/system-boundaries.md`

- [ ] Establish the application purpose, development rules, environment contract, and system boundaries.
- [ ] Document that provider integration is an adapter boundary and no provider API is invented.
- [ ] Document production-vs-sandbox data separation.

### Task 2: Application scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/lib/domain/status.ts`

- [ ] Add the minimal Next.js/TypeScript application shell.
- [ ] Define typed booking lifecycle states and system status semantics.
- [ ] Keep domain types independent from provider-specific schemas.

### Task 3: Domain contracts

**Files:**
- Create: `src/lib/domain/entities.ts`
- Create: `src/lib/providers/contracts.ts`
- Test: `src/lib/domain/entities.test.ts`
- Test: `src/lib/providers/contracts.test.ts`

- [ ] Write failing tests for identifier integrity and booking-state transitions.
- [ ] Implement minimal domain contracts for Customer, Passenger, Booking, FlightSegment, Ticket, Verification, Notification, and Audit records.
- [ ] Define provider capability interfaces for search, availability/revalidation, booking, ticketing, and flight status.
- [ ] Ensure provider-specific data cannot masquerade as application-confirmed data without a confirmation event.

### Task 4: Supabase database foundation

**Files:**
- Create: `supabase/migrations/0001_initial_schema.sql`
- Create: `supabase/seed/README.md`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`

- [ ] Create relational tables for agents, customers, passengers, bookings, flight segments, tickets, verifications, notifications, and audit events.
- [ ] Add foreign keys, unique constraints, timestamps, lifecycle constraints, and non-guessable verification identifiers.
- [ ] Add RLS policies appropriate to authenticated agent access.
- [ ] Keep provider credentials out of database/client code unless encrypted server-side storage is explicitly required by the integration.

### Task 5: Agent application shell

**Files:**
- Create: `src/app/(agent)/dashboard/page.tsx`
- Create: `src/app/(agent)/bookings/new/page.tsx`
- Create: `src/components/app-shell/*`
- Create: `src/components/booking/*`
- Create: `src/lib/design-tokens.ts`

- [ ] Establish desktop/tablet/mobile breakpoints and the approved visual token system.
- [ ] Build the agent dashboard and new-booking workspace without fake operational metrics.
- [ ] Build search, review, and booking states as real workflow states rather than decorative mock activity.
- [ ] Ensure empty/loading/error/success states are explicit.

### Task 6: Provider integration seam

**Files:**
- Create: `src/lib/providers/registry.ts`
- Create: `src/lib/providers/mock-sandbox.ts`
- Create: `src/app/api/flights/search/route.ts`
- Create: `src/app/api/bookings/revalidate/route.ts`
- Create: `src/app/api/bookings/route.ts`

- [ ] Implement provider selection through a registry.
- [ ] Keep sandbox provider data explicitly marked as sandbox and never expose it as production inventory.
- [ ] Require revalidation before booking.
- [ ] Reject booking if the provider changes price/availability without explicit agent acceptance.
- [ ] Leave real provider adapter unimplemented until provider documentation/credentials are supplied.

### Task 7: Verification, documents, tracking, notifications, and audit seams

**Files:**
- Create: `src/lib/verification/*`
- Create: `src/lib/documents/*`
- Create: `src/lib/tracking/*`
- Create: `src/lib/notifications/*`
- Create: `src/lib/audit/*`

- [ ] Define contracts so these systems consume confirmed records and cannot invent events.
- [ ] Make verification non-enumerable and resolve QR/link references to the correct ticket record.
- [ ] Define event-driven notification/idempotency boundaries.
- [ ] Define tracking identity using provider flight ID plus carrier/flight/date/origin/destination where available.
- [ ] Define document versioning and authoritative snapshot semantics.

### Task 8: Verification and quality gates

- [ ] Run type checking.
- [ ] Run unit tests.
- [ ] Run linting.
- [ ] Run production build.
- [ ] Inspect responsive UI states.
- [ ] Verify no production-looking fake data is presented as real.
- [ ] Review changed files and commit history before declaring the foundation complete.
