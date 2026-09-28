# Provider-linked travel identity and scan resolution

Every bookable travel item can have two identities at once: the real issuer/provider identity and Expodia's own tracking/record identity.

When an Expodia-connected QR/barcode is scanned, the first surface is the Expodia travel information view. It can present the issuer, product type, itinerary/reservation information, current verified status, relevant updates, provider-issued identifiers where appropriate, Expodia tracking/record reference, and source/verification time.

The first surface is informational and must not imply that Expodia is the issuer.

A clearly labelled action such as **More information**, **View with provider**, or **Manage with provider** can resolve to a provider destination stored with the booking record.

Provider destinations must come from the actual booking/provider response, a provider record, or centrally approved partner configuration. Never construct a provider URL from a brand name or guessed URL pattern. If no verified destination exists, the action is not rendered.

The same mechanism applies to flights, hotels, vacation accommodation, car rentals, activities, transfers and other travel services.

The identity bridge is:

Expodia reference
→ tracking reference
→ serial/document reference
→ provider booking reference
→ provider ticket/document number

The QR/barcode carries a signed, non-sensitive reference set where possible. A controlled resolver can use those identifiers to find the same canonical travel record. Provider-issued barcodes remain unchanged.

The external route is:

scan → Expodia information surface → user selects provider action → verified provider destination.

For news or information pages, Expodia may show the information first and then link to the verified external source. This is an information link, not a booking claim.

Public verification must expose only the minimum information allowed by the record's visibility policy. Sensitive passenger data and documents remain access-controlled.

Expodia may use familiar travel-information conventions and field ordering for readability, but must not claim Expedia/Expedia Group issued an Expodia document unless that is actually true. Expedia Group's official materials describe its ecosystem as covering flights, hotels/vacation rentals, cars and activities, which is a useful reference for the breadth of the product model, not an issuer relationship. 
