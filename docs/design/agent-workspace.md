# Expodia Flights Agent Workspace

## Viewports

- Desktop: 1440px reference canvas; content max-width 1440px; 248px navigation; 72px header.
- Tablet: 768–1199px; compact navigation; two-column metric grid.
- Mobile: 320–767px; navigation collapses; single-column content; 16px horizontal page padding.

## Core spacing

- Desktop page padding: 32px.
- Tablet page padding: 24px.
- Mobile page padding: 16px.
- Section gap: 24px.
- Card padding: 20px.
- Field/control gap: 16px.
- Compact gap: 8px.

## Typography

- Primary body: 15px / 1.5.
- Field labels and metadata: 13px / 1.4.
- Page title: 28px / 1.2 desktop; 24px mobile.
- Section title: 17px / 1.3.

## Interaction rules

- Every operational state uses text plus an optional icon; colour is never the only status signal.
- Loading, empty, error, unavailable-provider, revalidation-change, confirmed, failed, and ticket-pending states must be explicit.
- Search results must display provider-backed availability and fare data only.
- Booking confirmation must identify the provider confirmation event.
- No dashboard metric increments without an underlying persisted event.

## Visual direction

Professional travel-agent software: restrained, high-contrast, dense enough for operational work but not visually noisy. Use white surfaces, near-black primary text, subtle borders, controlled status colours, and generous whitespace. Avoid decorative dashboards, fake charts, fake recent activity, or consumer-social visual patterns.
