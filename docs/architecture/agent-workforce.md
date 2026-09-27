# Expodia Flights — Agent Workforce

Expodia uses a coordinated workforce rather than one super-agent. Human agents own customer-facing approvals and consequential actions. Internal specialist workers perform bounded tasks and return structured results to the Orchestrator.

## Workers

Orchestrator; Inventory Verifier; Fare Verifier; Passenger Verifier; Booking Worker; Payment Worker; Ticketing Worker; Document Worker; Wallet Worker; Flight Operations; Check-in Worker; Change Worker; Refund Worker; Communication Worker; Integrity Worker.

## Handoff rule

A worker returns STARTED, SUCCEEDED, FAILED, or REQUIRES_REVIEW. It may return bounded next jobs. Workers do not silently invoke unrelated workers.

## Human approval

Booking, check-in, itinerary changes, and cancellation/refund remain human-approval operations unless a future provider contract explicitly authorizes automation.

## Truth rule

Provider systems remain authoritative for availability, fares, booking confirmation, ticket issuance, boarding-pass data, and operational flight status. Expodia must never invent PNRs, ticket numbers, boarding passes, barcodes, QR codes, prices, gates, terminals, or flight status.

## Wallet

Customers can receive Add to Apple Wallet and Add to Google Wallet when the pass is eligible. Boarding-pass passes require actual provider check-in/boarding-pass data. Apple signing credentials and Google Wallet issuer credentials remain server-side and are never committed to the repository.

## Lifecycle

Search -> revalidate -> agent/customer review -> booking -> payment -> ticketing -> documents -> wallet eligibility -> check-in -> boarding -> flight tracking -> completion.

## Branding

The current prototype may use the requested temporary Expedia reference branding on logo/document surfaces. Issuer, airline, provider, and ticket authority must remain explicit. Expodia-generated documents must never be represented as airline-issued credentials.
