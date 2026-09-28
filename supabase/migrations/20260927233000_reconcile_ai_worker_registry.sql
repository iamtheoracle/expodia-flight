-- Reconcile the persistent worker registry with the current Expodia worker catalog.
-- Existing registry entries are preserved; this only adds current workers that were missing.

insert into public.ai_worker_registry (worker_key, capability, status, runtime, visibility, description)
values
  ('inventory_verifier','Search, normalize and verify provider inventory','READY','Provider APIs + Expodia orchestration','INTERNAL','Verifies inventory observations before transaction workflows.'),
  ('fare_verifier','Verify fares, baggage and fare conditions','READY','Provider APIs + Expodia orchestration','INTERNAL','Verifies fare observations and commercial conditions.'),
  ('passenger_verifier','Validate passenger and travel-document completeness','READY','Supabase + Expodia orchestration','INTERNAL','Checks passenger data and required travel-document completeness.'),
  ('document_worker','Generate versioned Expodia travel documents from authoritative snapshots','READY','Document services + Supabase','INTERNAL','Coordinates Expodia-generated document artifacts.'),
  ('document_retrieval','Retrieve provider-issued travel documents when available','READY','Provider systems + document services','INTERNAL','Retrieves original provider-issued artifacts when available.'),
  ('document_verification','Verify document identifiers and source data','READY','Supabase + document services','INTERNAL','Cross-checks document identifiers against canonical records.'),
  ('document_renderer','Render approved Expodia document templates from verified data','READY','Document renderer runtime','INTERNAL','Renders only authorized Expodia-generated artifacts.'),
  ('document_distribution','Deliver canonical documents to authorized passengers and agents by app and email','READY','Expodia platform + email worker','INTERNAL','Distributes the canonical document version to authorized recipients.'),
  ('flight_operations','Track provider-supplied operational flight status','READY','Aviation providers + orchestration','INTERNAL','Monitors authoritative operational flight state.'),
  ('tracking_worker','Resolve authorized journey tracking and publish verified tracking state','READY','Expodia orchestration + aviation sources','INTERNAL','Publishes verified journey state without passenger-location tracking.'),
  ('trip_context_worker','Maintain journey lifecycle context and determine relevant next travel workflows','READY','Supabase + Expodia orchestration','INTERNAL','Maintains travel lifecycle context.'),
  ('checkin_worker','Monitor and process supported check-in workflows','READY','Provider systems + human approval','INTERNAL','Handles supported check-in workflows within approval boundaries.'),
  ('change_worker','Coordinate provider-supported itinerary changes','READY','Provider systems + human approval','INTERNAL','Coordinates itinerary changes without bypassing approval boundaries.'),
  ('refund_worker','Coordinate cancellation and refund workflows','READY','Provider systems + human approval','INTERNAL','Coordinates cancellation/refund work within approval boundaries.'),
  ('communication_worker','Send customer communications from verified events','READY','Expodia email/notification runtime','INTERNAL','Sends communications only from verified workflow events.'),
  ('integrity_worker','Cross-check identifiers and block inconsistent outputs','READY','Expodia orchestration + Supabase','INTERNAL','Blocks contradictory or incomplete workflow outputs.'),
  ('flight_discovery','Continuously discover meaningful flight and route changes','READY','Cloudflare Agents + approved sources','INTERNAL','Continuously observes assigned flight sources and detects meaningful changes.'),
  ('airport_discovery','Continuously monitor airport and aviation updates','READY','Cloudflare Agents + approved sources','INTERNAL','Continuously observes assigned airport and aviation sources.'),
  ('travel_discovery','Continuously discover hotels, destinations, places, tours, activities and experiences','READY','Cloudflare Agents + approved sources','INTERNAL','Stores useful travel discoveries with provenance and freshness.'),
  ('travel_news','Continuously monitor and reconcile travel news updates','READY','Cloudflare Agents + approved sources','INTERNAL','Monitors assigned travel news sources and publishes meaningful changes.'),
  ('technical_update_discovery','Monitor assigned technical sources for new commits, releases and documentation changes','READY','Cloudflare Agents + approved repositories','INTERNAL','Monitors explicitly assigned technical sources for meaningful changes.')
on conflict (worker_key) do nothing;
