# Expodia Flights receipt template

This is the production template specification for the first passenger-facing flight receipt/booking confirmation.

The template is based on the information hierarchy and transactional document flow observed in established online travel flight confirmations. It is not a copy of another company's branding or proprietary artwork.

## Document

- Issuer: Expodia Flights
- Format: A4 PDF for the canonical document, with a matching transactional email wrapper.
- Pages: dynamic multi-page flow; the renderer must not compress the complete receipt into one page.
- Visual treatment: monochrome only. No decorative colour palette.
- Layout: plain, dense, operational, table-led.
- Branding: use the approved Expodia Flights mark already defined by the product. Do not insert third-party logos.
- No illustrations, gradients, decorative cards, marketing graphics, or redesign elements.

## Required order

1. Confirmation
   - Expodia Flights
   - flight booking confirmation/receipt title
   - itinerary/Expodia reference
   - provider confirmation when available
   - booking status
   - ticketing status
   - issue date

2. Traveler details
   - full passenger name
   - passenger type
   - ticket status
   - ticket number when issued
   - provider confirmation when available
   - seat and baggage only when verified

3. Flight itinerary
   - outbound flight(s)
   - return flight(s), when present
   - date
   - origin and destination
   - airline/carrier
   - flight number
   - departure and arrival
   - terminal
   - duration
   - stops
   - cabin/fare class
   - aircraft
   - supplier status

4. Fare and payment
   - total itinerary amount
   - amount paid
   - amount outstanding
   - currency
   - payment status
   - payment reference when available
   - payment date when available

5. Ticketing
   - provider PNR when supplied
   - e-ticket number when issued
   - ticket status
   - Expodia document number
   - verification reference where applicable

6. Important information
   - check-in
   - passport/visa responsibility
   - airport/terminal timing
   - airline-specific requirements
   - provider-specific conditions

7. Fare rules and restrictions
   - cancellation
   - changes
   - no-show
   - refundability
   - baggage restrictions
   - supplier restrictions

8. Issuer and support
   - Expodia Flights
   - customer email
   - authorized agent information when available
   - document/reference number

## Language

Use straightforward transactional language. The receipt may use familiar travel-confirmation terminology such as:

- Your flight is booked.
- Traveler details
- Flight details
- Airline confirmation
- Price summary
- Payment received
- Ticketing details
- Additional information
- Important information
- Rules and restrictions
- Need help?

Do not reproduce another company's exact copy. Do not state that Expodia is Expedia or Expedia Group.

## Data integrity

The renderer must use canonical booking, passenger, flight, payment and ticket records.

Never invent:
- airline
- flight number
- PNR
- e-ticket number
- departure/arrival time
- terminal
- aircraft
- baggage allowance
- seat
- fare
- tax
- payment
- confirmation

If a value does not exist in the authoritative record, show an explicit unavailable/pending state rather than a fabricated value.

A provider-issued ticket remains provider-issued. An Expodia receipt must clearly identify Expodia as the issuer.

## Email relationship

The receipt is the first passenger-facing transactional document when the configured booking/payment event occurs. The email links to the canonical document. Later ticket, boarding-pass, invoice and other documents are separate workflow artifacts.

The website, PDF and email must derive from the same canonical booking/document data so they cannot silently disagree.
