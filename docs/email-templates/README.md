# Expodia transactional email templates

The email system uses a reusable travel-confirmation structure based on established travel-booking information hierarchy. The flight booking receipt is a production Expodia template and is intentionally plain, monochrome, dense and multi-section rather than a decorative marketing design.

Templates:
- booking-confirmation: Your trip is booked
- itinerary: Your itinerary
- payment-receipt: Payment received
- ticket-issued: Your ticket is ready
- itinerary-changed: Your itinerary has changed
- cancellation: Your trip was cancelled
- refund: Your refund is being processed
- boarding-pass-ready: Your boarding pass is ready
- trip-reminder: Your trip is coming up
- document-ready: Your travel document is ready

Rules:
- Never invent a confirmation number, PNR, ticket number, fare, flight time, seat, payment or provider document.
- Populate only from the canonical booking/document/payment record.
- Preserve provider-issued identity on provider documents.
- Expodia-generated emails identify Expodia as issuer.
- Email and website use the same canonical document/reference.
- The template family is versioned and can be replaced later without changing workflow data.
