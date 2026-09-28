# Tracking and document distribution

## Flight tracking

A trackable flight is a journey object, not a customer-location record. Tracking may be used by the passenger, a booker, a family/group member, a human agent or another authorized party. Seeing a flight's status does not imply access to the passenger's live physical location.

Every eligible booked/connected flight enters a monitoring lifecycle. The workforce observes authoritative airline/provider/airport/operations sources, stores the latest verified state, compares it with prior observations, and distributes meaningful changes to authorized recipients.

The tracking display is derived from the verified journey state. It can show carrier, flight number, route, scheduled and actual times, status, gate/terminal when verified, source and verification time, and journey milestones. The same state powers Track, Trips, Chat, notifications and authorized group/agent views.

Monitoring is adaptive:
- more than 48 hours before departure: standard background checks;
- 48 to 24 hours: increased checks;
- 24 to 6 hours: frequent checks;
- 6 to 2 hours: high-priority checks;
- 2 hours through boarding/departure: highest-priority monitoring;
- after departure: continue operational monitoring;
- near arrival: increase checks;
- after verified arrival: transition to post-arrival travel assistance.

These are policy classes, not permission to violate a source's terms or rate limits. Webhooks/events are preferred where available. Backoff and source-specific limits override the default cadence.

A notification is triggered by a new or materially changed verified observation, not by every repeated poll. The system stores source version, observation time, previous state and evidence for reconciliation.

## Ticket and document identity

The provider/airline-issued booking reference and ticket number remain the authoritative identifiers when they exist. Expodia must preserve them exactly and must not replace them with a newly invented ticket number.

Expodia may additionally issue its own booking, receipt, tracking or document reference. Those identifiers must be explicitly labelled as Expodia identifiers.

The app should feel familiar because it presents real provider information and established travel-document structures, but it must never imply that an Expodia-generated document was issued by an airline or another provider.

## Documents

When a real provider-issued document exists, preserve the original whenever permitted. Do not recreate it merely to make it look official.

For Expodia-generated documents, use centrally managed templates with explicit issuer, brand, typography, colour, spacing, fields, QR/barcode, locale, currency, date/time and legal/disclaimer rules.

The document workforce should:
1. identify the required document;
2. retrieve the original provider document where available;
3. verify booking/ticket/transaction data;
4. select the correct template when Expodia must render a document;
5. render it from authoritative data;
6. run an integrity check;
7. version and archive it;
8. make it downloadable;
9. distribute it by email to the passenger, human agent or other authorized recipient.

A booking event, payment confirmation, ticket issuance, change, cancellation, refund or boarding-pass issuance can trigger the relevant document workflow.

## Email

The email used for the booking is the default passenger delivery address only when it is the passenger/authorized recipient configured for that booking. The system must also support an authorized human-agent recipient and additional explicitly authorized recipients.

Email distribution is a delivery channel for the canonical document record. The website and email must not silently diverge into different versions.

## Scanning

A QR/barcode must not be required to redirect to the Expodia website. Where the encoded payload and signature permit it, a scanner/app can resolve the machine-readable information directly. The payload may contain a controlled reference and enough non-sensitive data for local display.

Airline/provider-issued barcodes must remain unmodified and must follow the issuer's actual specification. Expodia cannot safely replace an airline's boarding-pass barcode with a custom one.

For sensitive or dynamic verification, the scanner can use app resolution or a controlled verification service. The fallback path may be a web URL, but it is not the only resolution mode.
