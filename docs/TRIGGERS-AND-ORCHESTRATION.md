# Triggers and orchestration

How user controls, system events, and plan follow-ups work together for one coherent Expodia answer.

## Pipeline

```
User / System / Agent trigger
  → intent + payload (+ confirm for mutations)
  → Super Agent plan
  → specialists (parallel only when safe)
  → verify → merge → one Answer
  → UI blocks + next actions
```

Travelers never select a specialist by name. Commands emit **intent ids**.

## User triggers → intents

| Control | Intent | Domains |
|---------|--------|---------|
| Search flights | `SEARCH_FLIGHTS` | Flight |
| Track flight | `TRACK_FLIGHT` | Flight |
| Compare / chips | `COMPARE_FLIGHTS` | Flight |
| Select offer | `SELECT_OFFER` | Context only |
| Book this | `BOOK_START` | Flight + Booking |
| Confirm & book | `BOOK_COMMIT` | Booking (requires confirm) |
| Find a stay | `STAY_SEARCH` | Marketplace |
| Add to My Plan | `PLAN_ADD` | Planner |
| Verify document | `DOCUMENT_VERIFY` | Documents |
| Talk to a person | `SUPPORT_HANDOFF` | Support |
| Free text Send | `FREE_TEXT` | Classify → same pipeline |
| My trips / Home | `NAV_*` | Navigation only |

## System triggers

| Event | Behavior |
|-------|----------|
| Sign-in | Shell `/home`; no fake feed posts |
| Provider webhook | Normalize → verify → notify affected users |
| Booking confirmed | Documents → email → trip |
| Provider down | `not_configured` / `error` Answer |

## Agent follow-ups (chaining)

| After | May enqueue |
|-------|-------------|
| Search ok | Compare / apply chips |
| Select + rules ask | Fare rules for that offer |
| Book commit ok | Documents + notify |
| Book commit fail | Support handoff with context |
| Track not configured | Stop — never invent position |

## Shared result statuses

`ok` | `empty` | `not_configured` | `error` | `conflict`

## Context bag

`session`, `lastSearchId`, `offers`, `selectedOfferId`, `activeTripId`, `connectivity`

## Implementation

- Types: `src/lib/agents/types.ts`
- Stub router: `src/lib/agents/orchestrate.ts` (routes intents to existing pages/APIs; fail closed)
- UI: `src/components/agents/AgentCommandBar.tsx` on Virtual Agent

See also: `docs/ARCHITECTURE.md`, `docs/AGENT-SPECS.md`.
