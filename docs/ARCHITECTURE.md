# Expodia — Continuous System Architecture

Expodia is **one continuous system**: from the moment a person opens the app, through intelligence, search, booking, human support, documents, notifications, and email, back to a personalized travel feed.

Agents are **internal machinery**. The traveler never chooses an agent; they talk to **Expodia**.

## Hard rules

1. **Never fabricate** inventory, fares, seats, PNRs, tickets, live positions, or operational status.
2. **Traveler and worker accounts are separate** — never mixed.
3. Unverified research is **not** operational truth.
4. When a provider is missing: show **honest unavailable**, not a simulated answer.
5. **Inspect first** — do not remove working capabilities without explicit authorization.

## Continuous loop

```
WORLD (airlines, airports, providers, sources, communities)
  → RESEARCH & PROVIDER LAYER
  → INTELLIGENCE
  → VERIFICATION
  → MEMORY (multi-scope store)
  → PERSONALIZATION
  → DESIGN / DISPLAY
  → USER EXPERIENCE (Reddit-style travel surface)
  → Traveler interacts (search, book, ask, discuss, travel)
  → New signals
  → loop continues
```

## Public surfaces

### Traveler

- Account (email / Google / PIN as implemented)
- Profile, trips, searches, documents, messages, preferences
- **Home feed** (personalized travel intelligence — not generic social media)
- Discover, Communities, Search, Trips, Messages, Notifications

### Expodia worker

- Invitation / referral registration
- Cases, bookings, copilot, customer context
- Separate professional UI — not the traveler shell

## Visible AI

**Virtual Agent** — single assistant the traveler sees.  
**Super-Agent Orchestrator** — internal brain; routes work to specialist domains.

## Top-level domains

| Domain | Responsibility |
|--------|----------------|
| EXPODIA SUPER AGENT | Orchestration only |
| FLIGHT INTELLIGENCE | Flights, airlines, airports, routes, tracking, fares |
| RESEARCH & BROWSER | Web research, discovery, continuous research |
| BOOKING & TRAVEL OPERATIONS | Book, change, cancel, cases, journeys |
| MARKETPLACE | Hotels, stays, travel services |
| DOCUMENTS | Extraction, verification, itinerary/receipt/reference |
| SUPPORT & HUMAN WORKERS | Support, handoff, worker copilot |
| MAP & GEOGRAPHY | Airports, routes, geo visualization |
| COMMUNITY & PERSONALIZATION | Feed, interests, community, user signals |
| DESIGN & DISPLAY | How intelligence appears (cards, alerts, maps) |
| SECURITY & VERIFICATION | Permissions, provenance, reconcile, anti-fabrication |
| OPERATIONS | DB, integrations, jobs, deploy, monitor, recovery |

Under each domain: **specialist capabilities** coordinated by the Super Agent — not dozens of independent processes.

## Per-agent template

Every specialist is specified with:

1. Who the agent is  
2. Responsibility  
3. What activates it  
4. What information it can access  
5. Tools / providers it may use  
6. What it produces  
7. Which agent receives the result  
8. What it is **not** allowed to do  
9. How it verifies its work  
10. Behavior when information / provider access is unavailable  

See `docs/AGENT-SPECS.md` for Super Agent and Flight Intelligence expansions.

## Reddit-style UI (travel-specific)

Borrow interaction patterns, not Reddit’s product:

- Personalized **Home** feed  
- Communities / interests  
- Profile, discovery, cards, discussion  
- Search, messaging, notifications, saved content  

Signals are **travel-specific** (trips, routes, destinations, bookings).  
Do **not** invent aviation news or fares for the feed; use verified intelligence or explicit empty states.

## Implementation status (honest)

| Layer | Status |
|-------|--------|
| Public shell | Partial |
| MapLibre hero | Merged (PR #15) |
| Traveler planner (`/traveler`) | Working — do not break |
| Signed-in Home feed (`/home`) | Added as additive surface |
| Super-Agent runtime | Spec only |
| Flight providers | Connect or show unavailable |
| Continuous research | Spec only |

## Related docs

- `docs/AGENT-SPECS.md` — Super Agent + Flight Intelligence (10-point)
- Existing routes: `/traveler`, `/explore`, `/track`, `/assistant`, `/access`
