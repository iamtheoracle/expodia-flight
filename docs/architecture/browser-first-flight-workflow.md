# Browser-first flight discovery

Flight discovery is an agent workflow, not an API prerequisite.

An authenticated customer or human agent supplies origin, destination, dates, passengers and optional cabin/currency. The Flight Discovery worker receives the intent and searches the configured approved/partner flight sources through an authorized browser/search capability.

The worker:
1. understands the route and passenger requirements;
2. selects the approved sources assigned to flight inventory;
3. browses those sources;
4. reads currently displayed inventory/fare information;
5. captures source evidence and observation time;
6. normalizes the information into Expodia's flight-offer structure;
7. deduplicates equivalent observations;
8. presents the available options immediately when possible;
9. keeps the source/partner provenance attached;
10. continues monitoring relevant sources in the background.

The UI does not need to expose the worker's internal polling schedule. The worker can operate continuously according to each source's permitted access, event capability, rate limits and practical freshness requirements.

## Availability

A previously observed seat is not guaranteed to remain available. A source's current booking system is authoritative at the point of transaction. If an option becomes unavailable, the worker must mark the stale result and notify the customer/human agent rather than pretending the seat is still available.

## Payment and booking boundary

Discovery is not payment and discovery is not booking.

The current Expodia operating model is:
- customer chooses an option;
- Expodia connects the customer with the responsible human agent;
- the human agent presents the payment methods they actually accept;
- payment is completed through the selected method;
- payment confirmation is recorded;
- the booking is performed/confirmed through the responsible business/provider workflow;
- only then are booking/ticket/document states advanced.

AI workers may prepare and reconcile this workflow but must not fabricate payment, booking, ticket or seat confirmation.

## Fare presentation

Supplier fare and customer-facing price are separate values.

A discount or customer price must come from an approved commercial rule, supplier promotion, agent/business configuration or other authorized pricing rule. The system must never invent a discount simply to make a fare appear cheaper.

Every customer-facing fare should retain:
- supplier amount/currency;
- customer amount/currency;
- pricing source/rule;
- any discount amount/currency;
- source and observation timestamp;
- relevant baggage, fare-family, cabin and fare-rule information when available.

## No API prerequisite

An API may later be added where it improves authoritative inventory, reliability or transaction handling. It is not required merely to begin discovery. The browser-first workflow and provider adapters can coexist without one replacing the other.
