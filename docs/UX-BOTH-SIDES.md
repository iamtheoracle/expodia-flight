# Expodia UX — both sides (from reference funnels)

Reference patterns studied: OTA search list, fare family, passengers, **seat maps**, add-ons, payment breakdown, account menu, and **flight passport stats** (empty zeros).

**Hard rule:** UI can look as smooth as those products; **data never invents** inventory, seats, prices, PNRs, or delay minutes.

---

## Two sides

| Side | Who | Shell | Goal |
|------|-----|-------|------|
| **Traveler** | Signed-in customer | `/home` Reddit-style + work flows | Search → book → trips → passport → support |
| **Worker** | Expodia professional | Separate ops UI (not traveler chrome) | Cases, bookings, seat/fare assist, handoff |

Accounts **never mix**.

---

## A. Traveler side — end-to-end

### A1. Surfaces

| Route / area | Role | Reference pattern |
|--------------|------|-------------------|
| `/` public | Marketing + MapLibre | Public discovery |
| `/home` | Personalized feed | Social shell |
| `/explore` | Offer **list** | Trip.com results |
| Fare sheet (modal/page) | Fare family + bags | Fare select modal |
| `/bookings/new` (wizard) | Stepper 1–5 | Passenger → seats → add-ons → pay |
| Seat maps | Per **segment** | JFK–HNL then HNL–SYD |
| Add-ons | Optional | AirHelp / flex / lounge style |
| Pay + Details | Breakdown | Fare + tax + seats + add-ons |
| `/traveler` | My Plan | Planning |
| `/traveler/profile` or passport cards | Lifetime stats | Passport zeros until real legs |
| `/assistant` | Virtual Agent + command bar | One assistant |
| `/track` | Live status | Only if tracking connected |
| `/support`, inbox | Human handoff | Connect professional |

### A2. Booking stepper (smooth, little clicks)

```
1 Search / select offer     SEARCH → SELECT_OFFER
2 Passengers + contact      BOOK_START
3 Seats per segment         SEAT_MAP → SEAT_ASSIGN (or SEAT_SKIP)
4 Add-ons                   ADDON_SELECT (optional)
5 Pay / confirm             BOOK_REVIEW → BOOK_COMMIT (confirm)
```

**UX rules copied from reference**

- One primary CTA per step (Continue / Next flight / Go to payment)
- **Skip seat selection** always available when maps exist or not
- Sticky **running total** on every step
- Segment tabs for multi-leg seats (never one confusing mega-map)
- AI seat banner = **rank open seats only** (“near front”) — never invent a free seat
- Unavailable cells = provider `×` only
- Scarcity (“N left”) only if provider sends it

### A3. Offer list card (Explore)

Each row from **provider** `FlightOffer` only:

- Depart / arrive times, +day
- Duration, stops
- Marketing carrier(s)
- Price (currency)
- Bag badges if in payload
- Sort chips: cheapest / bags / filters → `COMPARE_FLIGHTS`

Empty / not configured → existing unavailable banner, not fake rows.

### A4. Passport / stats (profile)

From reference empty passport:

| Metric | Source |
|--------|--------|
| Flights, long haul | Verified `FlightLeg` count |
| Distance, flight time | Legs + airport distances |
| Airports, airlines | Distinct on legs |
| Delay minutes | Tracking/status only |
| Top aircraft | Equipment field only; else “no real plane yet” |

All **0** until real bookings/tickets/logs exist.

### A5. Traveler command bar intents (already partially live)

`SEARCH_FLIGHTS` · `TRACK_FLIGHT` · `PLAN_ADD` · `STAY_SEARCH` · `SUPPORT_HANDOFF`  
Extend when ready: `SEAT_MAP` · `SEAT_SKIP` · `ADDON_SELECT` · `BOOK_COMMIT`

---

## B. Worker side — professional

Workers help travelers complete the **same funnel** without using the Reddit shell.

### B1. Surfaces

| Area | Purpose |
|------|--------|
| Case inbox | Handoffs from Virtual Agent / Support |
| Booking copilot | Open traveler’s offer, seats, add-ons, payment blockers |
| Document tools | Tickets, receipts, verify |
| Presence | Online for `connectHuman` |
| Audit | Who changed what (no silent fare edits) |

### B2. Worker views of the same trip

| Traveler step | Worker sees |
|---------------|-------------|
| Offer list | Same provider offers + which one traveler selected |
| Passengers | Editable only with policy; name-as-on-ID warnings |
| Seats | Map + assignments; can suggest open seats (still provider-only) |
| Add-ons | What was offered / selected / declined |
| Payment | Status, errors, amount breakdown |
| After ticket | Docs + passport legs for that traveler |

### B3. Worker triggers

- `SUPPORT_HANDOFF` creates case with **context pack**: last intent, offer id, search id, errors
- Worker actions log to audit; Super Agent does not invent a booking for the worker either

---

## C. Shared money model (from reference breakdown)

```
Total =
  Adult ticket (fare + taxes)
+ Child ticket (fare + taxes)
+ Seat selection (sum of priced seats)
+ Add-ons (insurance, flex, lounge, protection…)
```

Display each line only when present in provider/cart payload.

Example shape observed in reference (illustrative, not live Expodia data):

- Tickets ~ fare + tax per pax
- Seats line item aggregated
- Small protection products per pax
- Sticky total updates after each assign/add

---

## D. Super Agent plans for this UX

### Traveler “book with seats”

```
SEARCH_FLIGHTS → COMPARE → SELECT_OFFER
→ BOOK_START (passengers)
→ for segment in segments: SEAT_MAP → SEAT_ASSIGN | SEAT_SKIP
→ ADDON_SELECT (optional)
→ BOOK_REVIEW → BOOK_COMMIT(confirm)
→ DOCUMENTS + PROFILE_STATS_REFRESH
```

### Worker assist

```
SUPPORT_HANDOFF
→ load case context
→ read-only provider offer + seat map if connected
→ propose actions traveler must still confirm for pay
```

### Fail closed

| Missing | UI |
|---------|-----|
| No search provider | Explore unavailable |
| No seat API | Skip seats, one honest line |
| No tracking | Passport delays stay 0 |
| No offer id | Cannot BOOK_COMMIT |

---

## E. Implementation order (put into use)

1. **Docs** (this file) — done on merge  
2. **Explore offer cards** — layout only, wire to `/api/flights/search` when connected  
3. **Booking wizard stepper** — passengers (exists) → seat step stub → add-ons stub → review  
4. **Seat step** — `SEAT_SKIP` + unavailable if no map API  
5. **Passport cards** on profile — zeros until `FlightLeg` store  
6. **Worker case panel** — show context pack from handoff  
7. Live seat/addon providers when commercial agreements exist  

Do **not** remove working `/traveler` planner while adding wizard steps.

---

## F. Design tokens (traveler work flows)

Align operational steps with existing Expodia public CSS where possible:

- Primary CTA full-width blue/dark (Continue / Select)
- Sticky footer: total + primary
- Stepper dots 1…N
- Cards for fare / add-on / seat recommend
- Home feed stays Reddit-style; **booking wizard stays “work” density**

Worker UI: denser tables, case timeline, no community feed.

---

## G. Related docs

- `docs/ARCHITECTURE.md` — continuous system  
- `docs/AGENT-SPECS.md` — Super Agent + Flight  
- `docs/TRIGGERS-AND-ORCHESTRATION.md` — intents  
- `/assistant` — `AgentCommandBar` live  
