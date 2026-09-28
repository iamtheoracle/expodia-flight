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

## Milestones
1. Runtime and deployment reconciliation: remove contradictory/stale deployment assumptions, make the standard Next.js runtime authoritative, document Cloudflare as an optional Workers path only when its adapter is explicitly installed/configured, and keep CI reproducible.
2. Traveler identity and documents: extend the existing private traveler profile for booking-required identity/document information, with RLS and server-side validation; connect documents/notifications to actual booking and travel state.
3. Intelligence foundation: create a source-backed travel-intelligence model and deterministic freshness/deduplication layer; support NEW, UPDATED, CURRENT, EXPIRED, EVERGREEN and ARCHIVED states.
4. Continuous discovery feed: replace the hard-coded signed-in Home cards with a real query-backed feed using verified intelligence, communities, pagination/infinite loading, and suppression of unchanged/repeated items.
5. Notifications and community surfaces: populate notifications, documentation, community updates, and sidebar navigation from real records; keep operational, booking, document, and discovery notifications distinct.
6. Production hardening: audit RLS, permissions, server/client boundaries, env vars, error handling, tests, build, and deployment documentation; verify all milestones with CI before declaring completion.

## UI behavior
The signed-in Home should feel like an aviation/travel community discovery surface: dense enough to be useful, mobile-first, responsive, accessible, and clearly separated from confirmed booking/flight operations. Brand labels should not repeat "Expodia" unnecessarily.

## Acceptance
Each milestone is independently testable. A milestone is not complete until its relevant tests pass, its database permissions are coherent, and its UI does not fabricate data.
