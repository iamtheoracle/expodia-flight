# Expodia Flights Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing Expodia Flights foundation into a runnable, provider-safe agent application without fabricating production flight activity.

**Architecture:** Next.js/React/TypeScript provides the agent-facing application and server routes. Supabase/PostgreSQL owns relational operational records and RLS; provider adapters are the only source of authoritative inventory, pricing, booking, ticketing, and operational flight data. Documents, verification, tracking, notifications, and audit consume confirmed records through explicit contracts.

**Tech Stack:** Next.js, React, TypeScript, Supabase/PostgreSQL/Auth/Storage/Edge Functions, Vitest, Playwright where appropriate, GitHub Actions. The actual flight-ticket provider remains an explicit integration boundary until its company/API documentation and credentials are supplied.

**Spec:** Approved Expodia Flights architecture and requirements established in the project conversation and reflected in `docs/architecture/system-boundaries.md` and `docs/design/agent-workspace.md`.

## Global Constraints

- Expodia Flights remains the agent-facing product; existing specialist systems are preserved.
- Provider data is authoritative for inventory, pricing, booking, ticket issuance, and operational flight data.
- No fabricated production flights, fares, bookings, PNRs, tickets, statuses, notifications, or activity.
- Sandbox/test data must be visibly labelled and isolated from production.
- Production provider credentials never ship to the browser.
- A booking becomes `CONFIRMED` only after provider confirmation.
- A ticket becomes `TICKETED` only after provider issuance confirmation.
- Price/availability must be revalidated immediately before booking.
- A changed fare or availability result must stop the booking flow and require explicit agent acceptance.
- Airport-local date/time semantics are preserved and overnight arrival dates are explicit.
- Customer/contact and passenger are separate domain records.
- Every identifier, QR code, barcode, document, and verification reference must resolve to the correct authoritative record.
- Public verification IDs must be non-guessable and must not expose unnecessary passenger data.
- Provider failures must never be converted into successful-looking UI states.
- No production-ready provider adapter may be invented before provider documentation is supplied.

---

### Task 1: Establish the executable project baseline

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Create or modify: `next.config.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `.env.example`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces a runnable Next.js application with deterministic typecheck, lint, test, and build commands.

- [ ] Inspect the current package scripts and dependencies before changing them.
- [ ] Add only dependencies required by the current foundation; do not add a provider SDK without a named provider.
- [ ] Ensure scripts exist for `dev`, `build`, `start`, `lint`, `typecheck`, and `test`.
- [ ] Ensure the TypeScript configuration covers the source and test files without weakening strictness.
- [ ] Ensure the CI workflow executes install, lint, typecheck, test, and build.
- [ ] Run the commands locally/through available verification tooling and record failures rather than masking them.
- [ ] Commit the baseline as `chore: establish executable application baseline`.

### Task 2: Lock down domain lifecycle and identifier integrity with tests first

**Files:**
- Modify: `src/lib/domain/entities.ts`
- Create or modify: `src/lib/domain/status.ts`
- Modify: `src/lib/domain/entities.test.ts`
- Modify: `src/lib/providers/contracts.ts`
- Modify: `src/lib/providers/contracts.test.ts`

**Interfaces:**
- `BookingStatus`: `SEARCHING | PRICE_CHECK | AWAITING_CONFIRMATION | CONFIRMED | TICKET_PENDING | TICKETED | FAILED | CANCELLED | EXPIRED | REFUND_PENDING | REFUNDED`.
- `BookingConfirmation`: provider booking reference, confirmed timestamp, authoritative provider payload reference.
- `TicketIssuanceConfirmation`: provider ticket reference, ticket number when supplied, issued timestamp, authoritative provider payload reference.
- Provider capabilities for search, revalidation, booking, ticketing, and status tracking.

- [ ] Write failing tests proving a booking cannot transition to `CONFIRMED` without provider confirmation.
- [ ] Write failing tests proving a ticket cannot transition to `TICKETED` without provider issuance confirmation.
- [ ] Write failing tests proving a provider price/availability change is not silently accepted.
- [ ] Write failing tests for identifier relationships: ticket → passenger → booking → segment and verification → ticket.
- [ ] Implement the minimum domain transition functions required by those tests.
- [ ] Keep provider-specific request/response schemas outside generic domain entities.
- [ ] Run the focused tests and then the complete test suite.
- [ ] Commit as `feat: enforce booking and ticket lifecycle integrity`.

### Task 3: Implement Supabase server/client foundation and relational schema

**Files:**
- Modify: `supabase/migrations/0001_initial_schema.sql`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/types.ts`
- Create: `supabase/seed/README.md`

**Interfaces:**
- Server-side Supabase client for authenticated/server operations.
- Browser Supabase client limited to safe authenticated operations.
- Relational records for agents, customers, passengers, bookings, flight segments, tickets, verifications, notifications, provider events, and audit events.

- [ ] Write/extend schema tests or SQL validation checks for required foreign keys and lifecycle constraints.
- [ ] Add primary keys and timestamps to all operational records.
- [ ] Add explicit provider identifiers and request/event correlation identifiers where needed.
- [ ] Add constraints preventing orphan tickets, passengers, segments, and verification records.
- [ ] Add a non-guessable verification identifier separate from internal primary keys.
- [ ] Enable RLS on agent-owned operational tables.
- [ ] Define policies so authenticated agents can access only records permitted by their agent identity/organization boundary.
- [ ] Keep provider secrets outside browser-readable configuration.
- [ ] Document that seed data is development/sandbox-only and must never be treated as production inventory.
- [ ] Commit as `feat: establish Supabase operational data foundation`.

### Task 4: Implement provider registry and production-safe search seam

**Files:**
- Modify: `src/lib/providers/registry.ts`
- Modify: `src/lib/providers/contracts.ts`
- Create: `src/lib/providers/errors.ts`
- Create: `src/lib/providers/sandbox.ts`
- Create: `src/app/api/flights/search/route.ts`
- Create: `src/app/api/flights/revalidate/route.ts`
- Create: `src/lib/providers/registry.test.ts`
- Create: `src/app/api/flights/search/route.test.ts`

**Interfaces:**
- `FlightSearchProvider.search(request): Promise<FlightSearchResult>`.
- `AvailabilityProvider.revalidate(selection): Promise<RevalidationResult>`.
- Provider registry resolves configured capabilities without exposing credentials.

- [ ] Write a failing test proving production search returns a provider-not-configured error when no real provider is configured.
- [ ] Write a failing test proving sandbox results carry an explicit sandbox environment marker.
- [ ] Write a failing test proving sandbox records cannot be returned from a production provider registry.
- [ ] Implement provider resolution and explicit configuration errors.
- [ ] Implement sandbox support only for automated development/test flows and visibly mark all sandbox data.
- [ ] Implement search request validation for airport/city codes, dates, passenger counts, cabin, and trip type.
- [ ] Return normalized domain results without leaking provider-specific credentials or raw secrets.
- [ ] Implement revalidation as a separate server-side operation.
- [ ] Run focused tests and commit as `feat: add provider-safe flight search boundary`.

### Task 5: Implement booking orchestration without provider invention

**Files:**
- Create: `src/lib/bookings/service.ts`
- Create: `src/lib/bookings/service.test.ts`
- Create: `src/app/api/bookings/revalidate/route.ts`
- Create: `src/app/api/bookings/route.ts`
- Modify: `src/lib/domain/entities.ts`

**Interfaces:**
- `revalidateBooking(selection): Promise<RevalidationResult>`.
- `createBooking(input): Promise<BookingResult>`.
- Idempotency key and provider request correlation ID are mandatory for provider-facing booking execution.

- [ ] Write a failing test proving booking is rejected when no provider is configured.
- [ ] Write a failing test proving booking is rejected when revalidation reports changed price/availability and the agent has not accepted the change.
- [ ] Write a failing test proving provider confirmation is persisted before the booking is shown as confirmed.
- [ ] Implement idempotent orchestration around the provider boundary.
- [ ] Persist provider request IDs and authoritative confirmation references.
- [ ] Never synthesize PNR, provider booking IDs, ticket numbers, or confirmation timestamps as if they came from a provider.
- [ ] Commit as `feat: add booking orchestration boundary`.

### Task 6: Build the agent workspace around real workflow states

**Files:**
- Modify: `src/app/bookings/new/page.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/lib/design-tokens.ts`
- Create: `src/components/app-shell/*`
- Create: `src/components/booking/*`

**Interfaces:**
- Search form submits to the server search boundary.
- Results render only normalized provider responses.
- Review state consumes the selected result and revalidation response.
- Confirmation state consumes persisted booking/ticket state.

- [ ] Apply the approved 12ui design system/process before expanding the visual surface.
- [ ] Preserve the professional travel-agent shell and existing design direction rather than introducing an unrelated visual language.
- [ ] Specify and implement desktop, tablet, and mobile breakpoints explicitly.
- [ ] Implement loading, empty, provider-unavailable, validation-error, fare-changed, booking-failed, and success states.
- [ ] Remove any language or UI that could imply fabricated production inventory.
- [ ] Ensure responsive navigation/sidebar behavior is deterministic.
- [ ] Add accessibility labels, focus states, keyboard navigation, and status text that does not depend on color alone.
- [ ] Commit as `feat: connect agent workspace to real workflow states`.

### Task 7: Define verification, document, tracking, notification, and audit contracts

**Files:**
- Create: `src/lib/verification/contracts.ts`
- Create: `src/lib/verification/service.ts`
- Create: `src/lib/documents/contracts.ts`
- Create: `src/lib/documents/service.ts`
- Create: `src/lib/tracking/contracts.ts`
- Create: `src/lib/tracking/service.ts`
- Create: `src/lib/notifications/contracts.ts`
- Create: `src/lib/notifications/service.ts`
- Create: `src/lib/audit/service.ts`

**Interfaces:**
- Verification resolves only to authoritative ticket/booking records.
- Document generation consumes a confirmed/ticketed snapshot and records document version.
- Tracking consumes provider flight identity and authoritative status events.
- Notifications consume confirmed internal events and are idempotent.
- Audit records actor, action, entity, timestamp, outcome, and provider correlation when applicable.

- [ ] Write tests for verification-to-ticket integrity.
- [ ] Write tests for document generation rejecting non-ticketed records where a ticket is required.
- [ ] Write tests for notification idempotency.
- [ ] Write tests for tracking identity requiring sufficient provider flight context.
- [ ] Implement contracts and services without inventing external provider payloads.
- [ ] Commit as `feat: establish operational service contracts`.

### Task 8: Establish ticket document architecture

**Files:**
- Create: `src/lib/documents/template-rules.ts`
- Create: `src/lib/documents/render-ticket.ts`
- Create: `src/lib/documents/render-ticket.test.ts`
- Create: `src/app/api/tickets/[ticketId]/document/route.ts`
- Create: `src/app/verify/[verificationId]/page.tsx`

**Interfaces:**
- `selectTicketTemplate(ticketContext): TicketTemplateSelection`.
- `renderTicketDocument(ticketSnapshot): Promise<DocumentArtifact>`.
- Verification page resolves a non-guessable verification ID to the correct authoritative ticket.

- [ ] Define the standard ticket document sections: issuer, passenger, booking/ticket identifiers, itinerary, fare/payment, baggage, travel information/terms, verification, and machine-readable credential area where authorized.
- [ ] Define template selection hierarchy: provider-required format → airline/carrier → document type → issuing market → language → currency → regulatory requirements → default.
- [ ] Ensure PDF output is print-safe and mobile-viewable with explicit page-break and margin rules.
- [ ] Use provider/airline-authorized QR/barcode data where required; never present an app-generated code as an official airline boarding credential.
- [ ] Add document versioning and authoritative snapshot metadata.
- [ ] Add a visible online-verification path from the document.
- [ ] Commit as `feat: establish authoritative ticket document engine`.

### Task 9: Quality gates and release verification

**Files:**
- Modify: `.github/workflows/ci.yml` if required.
- Modify: `README.md` with current setup/run/verification instructions.

- [ ] Run typecheck.
- [ ] Run lint.
- [ ] Run unit tests.
- [ ] Run production build.
- [ ] Run available integration/UI tests.
- [ ] Verify CI status for the resulting commit.
- [ ] Inspect the final changed-file set and recent commit history.
- [ ] Confirm no fabricated production data exists in the UI, fixtures, seeds, or server routes.
- [ ] Confirm the application clearly reports that real flight search/booking is unavailable until an actual provider is configured.
- [ ] Commit release-verification documentation as `docs: record foundation verification`.

## Provider Integration Gate

Do not implement a real provider adapter until the user supplies the provider company and API documentation/credentials. At that point, create a separate provider-specific implementation plan covering authentication, search, fare rules, revalidation, booking, ticketing, cancellation/refund support, webhooks, rate limits, error mapping, and provider-specific document/credential requirements. The generic domain contracts in this plan must remain stable while the provider adapter implements them.
