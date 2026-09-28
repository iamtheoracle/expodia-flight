# Expodia Flights Platform Milestones — Design Specification

## Goal
Turn the existing Expodia Flights repository into a production-ready travel platform for human booking agents and travelers without replacing working booking, planner, authentication, or management flows.

## Locked constraints
- Repository: iamtheoracle/expodia-flight, branch main as source of truth.
- Preserve working architecture; make additive, targeted changes.
- No fake/demo flights, fares, events, users, engagement, tracking, tickets, or provider results.
- Real operational facts must have source/provenance and freshness state.
- Two-minute intelligence refresh means checking for new or materially changed intelligence; it must never force publication.
- Duplicate content must be suppressed by stable source/content identity and publication history.
- Do not attach an LLM to deterministic operations such as auth, permissions, validation, RLS, booking state transitions, numbering, security, or duplicate detection.
- Sensitive traveler/passport data is private and must not be exposed in public feed, verification, or community surfaces.
- Do not deploy automatically to Netlify or Cloudflare.

## Three distinct product experiences
The platform has three separate dashboard experiences inside one application. They share infrastructure, services, and database where appropriate, but they are not one dashboard with cosmetic permission differences.

1. Traveler dashboard: customer-facing discovery, flight search, trip planning, cart, profile, bookings, tickets, documents, tracking, notifications, saved items, communities, and travel intelligence. It must never expose agent or admin operational data or controls.
2. Agent dashboard: human booking-agent operational workspace for customer/passenger intake, flight search, cart/checkout, bookings, tickets, documents, tracking, customer communication, cases/tasks, and agent intelligence. An agent is not automatically an administrator and must not receive the traveler UI merely because the same account can authenticate.
3. Admin dashboard: management/control plane for agents, applications, permissions, security, provider/configuration controls, audit, operational intelligence, content and system health. Existing company-admin authorization boundaries remain authoritative.

Each dashboard has distinct navigation, layout, terminology, data visibility, route guards, and workflows. Shared components may be reused only where their authorization contract is explicit. Server-side authorization is mandatory; hiding navigation items is not a security boundary.

## Route and authorization separation
Public routes remain limited to authentication and explicitly public verification/tracking surfaces. Traveler routes are restricted to authenticated traveler identities. Agent operational routes are restricted to authenticated agent identities. Admin routes are restricted to company_admins. A user may hold more than one server-side role only when the underlying records explicitly grant those roles; one role must never imply another. Public verification must return only the minimum non-sensitive booking/ticket status required for verification.

## Milestones
1. Dashboard separation and authorization foundation: establish explicit traveler, agent, and admin route/layout/authorization boundaries before connecting new data surfaces.
2. Runtime and deployment reconciliation: remove contradictory/stale deployment assumptions, make the standard Next.js runtime authoritative, document Cloudflare as an optional Workers path only when its adapter is explicitly installed/configured, and keep CI reproducible.
3. Traveler identity and documents: extend the existing private traveler profile for booking-required identity/document information, with RLS and server-side validation; connect documents/notifications to actual booking and travel state.
4. Intelligence foundation: create a source-backed travel-intelligence model and deterministic freshness/deduplication layer; support NEW, UPDATED, CURRENT, EXPIRED, EVERGREEN and ARCHIVED states.
5. Continuous discovery feed: replace the hard-coded signed-in Home cards with a real query-backed feed using verified intelligence, communities, pagination/infinite loading, and suppression of unchanged/repeated items.
6. Notifications and community surfaces: populate notifications, documentation, community updates, and sidebar navigation from real records; keep operational, booking, document, and discovery notifications distinct.
7. Production hardening: audit RLS, permissions, server/client boundaries, env vars, error handling, tests, build, and deployment documentation; verify all milestones with CI before declaring completion.

## UI behavior
The signed-in Home should feel like an aviation/travel community discovery surface: dense enough to be useful, mobile-first, responsive, accessible, and clearly separated from confirmed booking/flight operations. Brand labels should not repeat "Expodia" unnecessarily.

## Acceptance
Each milestone is independently testable. A milestone is not complete until its relevant tests pass, its database permissions are coherent, and its UI does not fabricate data.
