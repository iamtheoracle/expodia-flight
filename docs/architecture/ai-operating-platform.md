# Expodia AI Operating Platform

This track is additive. Existing booking, provider, Wallet, document and agent-workforce implementations are preserved.

## Operating model

Expodia's interface is a control surface over a persistent AI workforce. A visible command such as search, discover, compare, track, plan, share or manage is an intent/workflow trigger; it is not required to map one-to-one to an API endpoint.

The workforce can be triggered by:
- schedules;
- source events/webhooks;
- customers;
- human agents;
- administrators;
- other AI workers.

Workers can continue operating when no customer is online. Background work is durable and idempotent. Slow external work is represented as pending/running work rather than falsely reported as complete.

## Discovery is a worker instruction, not a required product section

Discovery domains are internal worker responsibilities. They do not have to become separate navigation items or visible product categories.

Workers may continuously monitor assigned sources for:
- flights and routes;
- airports and aviation;
- aircraft information;
- hotels;
- destinations and places;
- tours, activities and experiences;
- travel news;
- partner updates;
- assigned technical repositories and documentation.

Each worker keeps source state and detects material changes. A repeated observation is not automatically a new discovery. New or materially changed information is stored even when nobody is online.

## Distribution

A verified result may be routed to:
- the Home/Feed surface;
- a customer's trip;
- an authorized family/group;
- an individual conversation;
- a human agent workspace;
- another AI worker.

Distribution is permission-aware and does not expose internal worker disagreement.

## Global operation

The system must not assume a Nigerian or single-currency operating model. Currency, locale, country, timezone, payment method and provider are independent dimensions.

## Transaction boundaries

AI workers may research, compare, monitor, reconcile and prepare work. Provider systems remain authoritative for provider-controlled facts. Human agents remain responsible for real-world booking and payment actions under the current Expodia operating model.

## Preservation rule

Do not delete or rewrite existing functionality merely to adopt this architecture. Preserve -> isolate -> build -> test -> reconcile -> integrate -> retire only after an explicit decision.
