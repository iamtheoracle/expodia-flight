# Expodia Flights

Expodia Flights is an agent-facing flight-booking platform for searching real flight inventory, booking flights through connected providers, issuing confirmed tickets, generating professional travel documents, verifying tickets, tracking flights, and communicating confirmed events.

## Operating principle

**Expodia Flights should feel alive because its systems are actually working — never because the agents pretend something happened.**

Provider systems are authoritative for availability, fares, booking confirmation, ticket issuance, and operational flight data. The application never fabricates production flights, prices, PNRs, tickets, statuses, gate/terminal information, notifications, or activity.

## System cooperation

The product keeps specialist responsibilities separate while allowing them to assist one another:

- Provider layer: real inventory, fare, booking, ticketing, and flight-status capabilities.
- Booking system: application booking lifecycle and provider-confirmation state.
- Customer/passenger system: customer contacts and passenger records.
- Ticket/document system: authoritative ticket records and professional document snapshots.
- Verification system: secure resolution of a ticket to its correct record.
- Flight tracking system: operational status using provider flight identity.
- Notification system: event-driven communication after confirmed events.
- Audit system: records actions, provider events, state changes, and document/notification activity.

No subsystem is treated as a replacement for another subsystem.

## Provider status

The repository currently contains provider-agnostic contracts only. A production flight-ticket provider must be supplied before real inventory, booking, or ticket issuance can be connected. Provider endpoints, credentials, request formats, and response schemas must never be invented.

## Development

The intended application stack is Next.js, React, TypeScript, Supabase/PostgreSQL, Supabase Auth/Storage/Edge Functions, and provider adapters. See `docs/superpowers/plans/2026-09-06-expodia-flights-foundation.md` for the implementation plan.

## Distributed agent workforce

The platform uses specialist internal workers coordinated by an Orchestrator rather than a single super-agent. Worker contracts live in `src/lib/agents/`; Wallet contracts live in `src/lib/wallet/`; the architecture is documented in `docs/architecture/agent-workforce.md`.

The current workforce includes inventory, fare, passenger, booking, payment, ticketing, document, Wallet, flight-operations, check-in, change, refund, communication, and integrity workers. Human approval remains required for consequential operations unless a future authorized provider contract explicitly permits automation.

Apple Wallet and Google Wallet are integration seams. No provider credentials are stored in the repository. A boarding-pass Wallet pass requires actual provider check-in/boarding-pass data; Expodia never fabricates airline credentials.
