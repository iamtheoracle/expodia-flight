# Expodia Geographic Intelligence Map

The Expodia map is a geographic operating surface, not a decorative world map and not a replica of another travel application's interface.

## Purpose

The map connects geography to Expodia's agent workforce. A location can become an airport research task, a disruption investigation, a journey route, a destination discovery, a nearby-service search, a trip planning context or a human-agent workflow.

## Truth model

Airport reference data answers what an airport is and where it is. It does not prove current delays, cancellations, weather, gate status, capacity or operational condition.

Operational information must carry source provenance, observation time and verification state. Unknown information remains unknown.

Booked and authorized journeys can be rendered as route objects. The map must not invent flight paths, positions, delays, airport alerts or passenger locations.

## Layers

- Airports: global geographic reference entities.
- Journeys: authorized Expodia journeys and verified route segments.
- Disruptions: verified airport, route or network disruptions.
- Weather: weather observations and their verified travel implications.
- Destinations: places and destination intelligence discovered by agents.
- Services: nearby hotels, rides, tours, activities, airport services and other authorized travel resources.

Layers are capabilities. They do not imply that their underlying source has been connected.

## Agent relationship

The map does not become the source of truth. It consumes the same normalized state used by Track, Trips, Chat, Feed and agent workspaces.

The workforce can:

1. observe sources;
2. normalize geographic entities;
3. verify or classify observations;
4. attach observations to airports, routes, journeys or destinations;
5. publish authorized changes;
6. let the map render the current state.

The frontend must never manufacture a missing operational value merely to make the map look populated.

## Interaction model

Selecting an airport opens an intelligence inspector. Searching geography focuses the map. Selecting a layer changes the operating question.

Future actions should allow an authorized user to ask an agent to investigate, monitor, plan, compare, save, share or hand off an entity. The map therefore becomes an entry point into the workforce rather than a terminal visualization.

## Reference implementation

The first implementation uses Apple MapKit JS because the repository already contains a MapKit integration seam. This is a rendering choice, not a lock-in of the intelligence architecture.

Provider/API integrations remain optional underlying tools. A source may be browser-observed, event-driven, API-backed or a combination. The map only consumes normalized Expodia state.

## Non-goals

Do not copy Flighty's branding, copy, visual identity or proprietary presentation. Flighty is a reference for the product category and demonstrates that airport intelligence can be exposed geographically; Expodia's information architecture and operating model remain its own.

Do not claim that an observed seat, fare, route, weather condition or operational state is guaranteed at transaction time. Authoritative provider confirmation remains required where applicable.
