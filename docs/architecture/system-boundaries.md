# Expodia Flights System Boundaries

## Principle

Expodia Flights is an orchestration product, not a collection of fake activity generators. Systems cooperate through explicit contracts while retaining their own responsibilities.

## Authoritative boundaries

| System | Owns | Must not invent |
|---|---|---|
| Flight provider | Inventory, fares, provider availability, booking confirmation, ticket issuance, operational status | Any provider result not actually returned |
| Booking | Application booking lifecycle and provider references | Provider confirmation |
| Customer/passenger | Customer contact and passenger identity data | Airline operational data |
| Ticket/document | Issued ticket records and document snapshots | Ticket issuance without provider confirmation |
| Verification | Secure resolution of a verification reference to the correct ticket | A valid ticket that does not exist |
| Tracking | Operational flight state from authoritative status sources | Gate, terminal, delay, departure, or arrival events without source data |
| Notifications | Delivery of authorized, event-backed messages | Events that did not happen |
| Audit | Immutable operational history | Synthetic activity presented as real |

## Coordination rules

1. A provider offer is not an application booking.
2. A revalidated offer is not a confirmed booking.
3. A confirmed booking is not a ticketed booking.
4. A ticket is not valid for public verification until the ticket record and verification reference are persisted consistently.
5. A tracking event is not a booking event; tracking consumes flight identity and authoritative operational data.
6. A notification is downstream of a confirmed event and must be idempotent.
7. Provider-specific schemas remain inside provider adapters and are mapped into application contracts.
8. Sandbox data is isolated and visibly labelled.

## Identity chain

`verification reference → ticket → passenger → booking → flight segment → provider flight`

Any mismatch in this chain prevents release or verification.
