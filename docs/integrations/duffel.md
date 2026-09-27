# Expodia Flights — Duffel integration

Duffel is the primary flight-content and booking provider for the current Expodia production architecture. Expodia keeps the provider behind the existing provider-neutral interfaces so a second GDS/NDC provider can be added later without rebuilding the application.

Duffel's current API uses Offer Requests for flight search and Orders for booking. Offers are short-lived and must be revalidated before booking. Orders expose airline booking references and issued documents such as e-tickets when returned by the airline. 

## Configuration

Server-side only:

- DUFFEL_API_KEY
- Optional DUFFEL_API_BASE_URL (defaults to https://api.duffel.com)

Do not put the token in NEXT_PUBLIC_* variables, GitHub source, client JavaScript, or documents.

For development, use a Duffel test-mode token. Test mode is not representative of live schedules/prices, so production acceptance must be performed with live provider credentials and real provider responses.

## Expodia flow

Search:
Expodia search request -> Duffel Offer Request -> provider offers -> normalize -> store provider offer ID + expiry.

Before checkout/booking:
Expodia offer -> Duffel GET /air/offers/{offer_id} -> compare current total/currency -> require fresh agent/customer approval if price changed.

Booking:
Expodia will create the Duffel Order only after the platform has verified passenger data and an approved payment instruction. Duffel supports instant orders and hold orders where the selected offer permits a hold.

Ticketing:
Duffel Order -> provider documents -> Expodia stores the authoritative e-ticket identifier returned by Duffel. Expodia must never invent a ticket number or PNR.

Operational status:
Duffel remains the booking/content source. A separate operational flight-status provider should remain authoritative for live departure/gate/terminal/status data.

The current adapter intentionally does not fabricate missing passenger/payment data or pretend that an order has been booked.
