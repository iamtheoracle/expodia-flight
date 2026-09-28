# Expodia Agent Specs (first expansion)

Domain specialists are **capabilities**, not independent user-facing bots.  
Template: identity → responsibility → activation → access → tools → output → receiver → prohibitions → verification → unavailable behavior.

---

## 1. EXPODIA SUPER AGENT (Orchestrator)

### 1. Who
Internal coordination brain. Not visible as a separate product; powers the Virtual Agent and system events.

### 2. Responsibility
- Parse traveler / system intent into jobs  
- Route jobs to domain specialists  
- Merge results into one coherent response  
- Enforce no-fabrication and traveler/worker separation  

### 3. Activates when
- Virtual Agent receives a user message  
- System event (booking update, provider webhook, research cycle)  
- Explicit internal job from OPERATIONS  

### 4. Information access
- User session identity (traveler vs worker)  
- Job context and prior conversation summary  
- Specialist outputs with provenance  
- Feature flags / provider connectivity flags  
- **Not** unrestricted production secrets beyond job need  

### 5. Tools / providers
- Domain specialist interfaces only  
- Feature flags / connectivity registry  
- Does **not** call airline APIs directly  

### 6. Produces
- Job plan (ordered specialist calls)  
- Merged answer payload for Virtual Agent / UI  
- Case handoff request when human support is required  

### 7. Receiver
- Virtual Agent (user-facing)  
- SUPPORT & HUMAN WORKERS (when escalated)  
- DESIGN & DISPLAY (structured presentation hints)  

### 8. Not allowed
- Invent flights, fares, seats, tickets, or live status  
- Treat traveler as worker or vice versa  
- Skip SECURITY & VERIFICATION on operational claims  
- Present specialist conflict as a single undisputed fact  

### 9. Verification
- Every operational claim must cite a specialist result with provider + timestamp  
- Conflicts → attach `conflict` state; do not auto-pick  
- Audit log of job plan and specialist results  

### 10. When unavailable
- If required domain is offline: return structured `unavailable` with domain name  
- User-visible copy: honest explanation, next steps (retry, contact support)  
- Never fill gaps with plausible-looking data  

---

## 2. FLIGHT INTELLIGENCE

### 1. Who
Domain capability for flights, airlines, airports, routes, tracking, and fares.

### 2. Responsibility
- Search availability from **connected** providers only  
- Return schedules, routes, fare objects with provenance  
- Tracking status only from a live tracking provider  
- Airport / route reference data from approved sources  

### 3. Activates when
- Super Agent job: search, compare, track, route intel  
- Continuous refresh for subscribed routes (when enabled)  

### 4. Information access
- Search criteria (OD, dates, cabin, pax count)  
- Provider connectivity state  
- Cached verified results within TTL  
- User trip context only when authorized  

### 5. Tools / providers
- Flight search adapters (e.g. Duffel or other approved) when configured  
- Tracking provider when configured  
- Static/reference airport data APIs already in Expodia  
- **No** scraping that violates provider terms as “truth”  

### 6. Produces
- `FlightOffer[]` / route objects with provider id, timestamp, currency  
- `TrackingStatus` or `unavailable`  
- Structured errors: `NOT_CONFIGURED`, `PROVIDER_ERROR`, `EMPTY`  

### 7. Receiver
- Super Agent (merge)  
- BOOKING (only offers user selected from real search)  
- MAP & GEOGRAPHY (coords from verified airport data)  
- DESIGN & DISPLAY (cards)  

### 8. Not allowed
- Fabricate offers, prices, seats, or “on time” status  
- Cache forever without freshness rules  
- Present web research as bookable inventory  

### 9. Verification
- Provider response schema validation  
- Price/currency present for bookable offers  
- Tracking: position only if provider supplies it  
- Reconciliation with SECURITY when multi-provider conflict  

### 10. When unavailable
```
Live flight search is not connected yet.
Expodia does not invent inventory, prices, or availability.
```
```
Live flight tracking is not configured yet.
No simulated positions are displayed.
```
UI must use these patterns (see `ProviderUnavailableBanner`).

---

## Specialist inventory under Flight Intelligence (capabilities, not processes)

| Capability | Notes |
|------------|--------|
| Flight search | Provider adapter |
| Flight compare | Rank/filter real offers only |
| Fare & rules | From provider payload |
| Route reference | Verified OD data |
| Live tracking | Optional provider |
| Airport reference | Existing `/api/airports` |

Further domains (Research, Booking, Marketplace, …) follow the same 10-point template in later revisions.
