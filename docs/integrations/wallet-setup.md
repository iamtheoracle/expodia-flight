# Expodia Wallet Integration Setup

## Apple Wallet

Use Apple Developer Wallet/PassKit. Expodia will issue passes from a protected server runtime. The web customer flow can present an Add to Apple Wallet button; Apple documents web distribution and pass updates.

Required before production issuance:
- Apple Developer account/team.
- Pass Type ID.
- Apple Wallet certificate for signing.
- Server-side pass signing and update service.
- Pass identifiers and serial-number strategy.
- HTTPS distribution endpoint.

Official documentation:
- https://developer.apple.com/wallet/get-started/
- https://developer.apple.com/documentation/PassKit
- https://developer.apple.com/documentation/walletpasses/distributing-and-updating-a-pass

## Google Wallet

Use the Google Wallet API and Google Pay & Wallet Console.

Required before production issuance:
- Google Wallet API Issuer account.
- Google Cloud project with the Google Wallet REST API enabled.
- Service account and secure server-side credential.
- Passes Class/Object definitions.
- Test users and demo-mode validation.
- Publishing access before broad production issuance.

Official documentation:
- https://developers.google.com/wallet/tickets/boarding-passes
- https://developers.google.com/wallet/tickets/boarding-passes/getting-started/issuer-onboarding
- https://developers.google.com/wallet/tickets/boarding-passes/getting-started/auth/rest
- https://developers.google.com/wallet/tickets/boarding-passes/test-and-go-live/launch-checklist

## Expodia rules

- Never commit Apple certificates, private keys, Google service-account keys, or provider credentials.
- Wallet passes are generated only from verified ticket/check-in data.
- Boarding-pass passes require actual provider boarding-pass/check-in data.
- Changes to an eligible pass must flow from the authoritative booking/ticket record.
- Wallet issuance is recorded in public.wallet_passes and linked to booking, ticket, and passenger.
