create table if not exists public.flight_searches (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  origin_iata text not null,
  destination_iata text not null,
  departure_date date not null,
  return_date date,
  trip_type text not null check (trip_type in ('ONE_WAY','ROUND_TRIP','MULTI_CITY')),
  adults integer not null check (adults > 0),
  children integer not null default 0 check (children >= 0),
  infants integer not null default 0 check (infants >= 0),
  cabin text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.flight_offers (
  id text primary key,
  search_id uuid references public.flight_searches(id) on delete set null,
  provider_name text not null,
  provider_offer_id text not null,
  source public.data_source not null,
  currency text not null,
  total_amount numeric(14,2) not null check (total_amount >= 0),
  expires_at timestamptz,
  raw_offer jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (provider_name, provider_offer_id)
);

create table if not exists public.flight_offer_segments (
  id uuid primary key default gen_random_uuid(),
  offer_id text not null references public.flight_offers(id) on delete cascade,
  segment_order integer not null check (segment_order >= 0),
  provider_flight_id text not null,
  carrier_code text not null,
  flight_number text not null,
  origin_iata text not null,
  destination_iata text not null,
  departure_local timestamptz not null,
  arrival_local timestamptz not null,
  duration_minutes integer,
  aircraft_code text,
  stops integer not null default 0 check (stops >= 0),
  created_at timestamptz not null default now(),
  unique (offer_id, segment_order)
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','EXPIRED','CHECKOUT','COMPLETED','ABANDONED')),
  currency text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  offer_id text not null references public.flight_offers(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, offer_id)
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  agent_id uuid not null references public.agents(id) on delete cascade,
  provider_name text,
  provider_transaction_id text,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null,
  status text not null check (status in ('PENDING','AUTHORIZED','SUCCEEDED','FAILED','REFUND_PENDING','REFUNDED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  document_type text not null,
  document_number text not null unique,
  status text not null default 'READY' check (status in ('PENDING','READY','FAILED','VOIDED')),
  storage_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_type text not null check (actor_type in ('AGENT','SYSTEM','PROVIDER')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.external_references (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  provider_name text not null,
  reference_type text not null,
  reference_value text not null,
  created_at timestamptz not null default now(),
  unique (provider_name, reference_type, reference_value)
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  search_id uuid references public.flight_searches(id) on delete set null,
  agent_name text not null,
  action text not null,
  status text not null check (status in ('STARTED','SUCCEEDED','FAILED','REQUIRES_REVIEW')),
  input_metadata jsonb not null default '{}'::jsonb,
  output_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists flight_searches_agent_idx on public.flight_searches(agent_id, created_at desc);
create index if not exists flight_offers_search_idx on public.flight_offers(search_id, created_at desc);
create index if not exists flight_offer_segments_offer_idx on public.flight_offer_segments(offer_id, segment_order);
create index if not exists carts_agent_status_idx on public.carts(agent_id, status, created_at desc);
create index if not exists cart_items_cart_idx on public.cart_items(cart_id);
create index if not exists payment_transactions_booking_idx on public.payment_transactions(booking_id, created_at desc);
create index if not exists documents_booking_idx on public.documents(booking_id, created_at desc);
create index if not exists booking_events_booking_idx on public.booking_events(booking_id, created_at desc);
create index if not exists external_references_booking_idx on public.external_references(booking_id);
create index if not exists agent_runs_booking_idx on public.agent_runs(booking_id, created_at desc);

alter table public.flight_searches enable row level security;
alter table public.flight_offers enable row level security;
alter table public.flight_offer_segments enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.documents enable row level security;
alter table public.booking_events enable row level security;
alter table public.external_references enable row level security;
alter table public.agent_runs enable row level security;

drop policy if exists "agents manage own flight searches" on public.flight_searches;
create policy "agents manage own flight searches" on public.flight_searches
for all to authenticated
using (agent_id = (select auth.uid()))
with check (agent_id = (select auth.uid()));

drop policy if exists "agents read own flight offers" on public.flight_offers;
create policy "agents read own flight offers" on public.flight_offers
for select to authenticated
using (
  exists (
    select 1 from public.flight_searches s
    where s.id = flight_offers.search_id and s.agent_id = (select auth.uid())
  )
  or exists (
    select 1 from public.cart_items ci
    join public.carts c on c.id = ci.cart_id
    where ci.offer_id = flight_offers.id and c.agent_id = (select auth.uid())
  )
);

drop policy if exists "agents manage own flight offers" on public.flight_offers;
create policy "agents manage own flight offers" on public.flight_offers
for insert to authenticated
with check (
  exists (
    select 1 from public.flight_searches s
    where s.id = search_id and s.agent_id = (select auth.uid())
  )
  or search_id is null
);

drop policy if exists "agents read own offer segments" on public.flight_offer_segments;
create policy "agents read own offer segments" on public.flight_offer_segments
for select to authenticated
using (
  exists (
    select 1 from public.flight_offers o
    left join public.flight_searches s on s.id = o.search_id
    where o.id = flight_offer_segments.offer_id
      and (
        s.agent_id = (select auth.uid())
        or exists (
          select 1 from public.cart_items ci
          join public.carts c on c.id = ci.cart_id
          where ci.offer_id = o.id and c.agent_id = (select auth.uid())
        )
      )
  )
);

drop policy if exists "agents manage own carts" on public.carts;
create policy "agents manage own carts" on public.carts
for all to authenticated
using (agent_id = (select auth.uid()))
with check (agent_id = (select auth.uid()));

drop policy if exists "agents manage own cart items" on public.cart_items;
create policy "agents manage own cart items" on public.cart_items
for all to authenticated
using (
  exists (select 1 from public.carts c where c.id = cart_id and c.agent_id = (select auth.uid()))
)
with check (
  exists (select 1 from public.carts c where c.id = cart_id and c.agent_id = (select auth.uid()))
);

drop policy if exists "agents manage own payments" on public.payment_transactions;
create policy "agents manage own payments" on public.payment_transactions
for all to authenticated
using (agent_id = (select auth.uid()))
with check (agent_id = (select auth.uid()));

drop policy if exists "agents manage own documents" on public.documents;
create policy "agents manage own documents" on public.documents
for all to authenticated
using (agent_id = (select auth.uid()))
with check (agent_id = (select auth.uid()));

drop policy if exists "agents manage own booking events" on public.booking_events;
create policy "agents manage own booking events" on public.booking_events
for all to authenticated
using (agent_id = (select auth.uid()))
with check (agent_id = (select auth.uid()));

drop policy if exists "agents manage own external references" on public.external_references;
create policy "agents manage own external references" on public.external_references
for all to authenticated
using (agent_id = (select auth.uid()))
with check (agent_id = (select auth.uid()));

drop policy if exists "agents manage own agent runs" on public.agent_runs;
create policy "agents manage own agent runs" on public.agent_runs
for all to authenticated
using (agent_id = (select auth.uid()))
with check (agent_id = (select auth.uid()));

alter type public.booking_status add value if not exists 'DRAFT';
alter type public.booking_status add value if not exists 'CART';
alter type public.booking_status add value if not exists 'PASSENGERS_PENDING';
alter type public.booking_status add value if not exists 'VERIFICATION_PENDING';
alter type public.booking_status add value if not exists 'PAYMENT_PENDING';
alter type public.booking_status add value if not exists 'PAYMENT_CONFIRMED';
alter type public.booking_status add value if not exists 'BOOKING_PENDING';
alter type public.booking_status add value if not exists 'TICKETING_PENDING';
alter type public.booking_status add value if not exists 'COMPLETED';
alter type public.booking_status add value if not exists 'CANCEL_REQUESTED';
alter type public.booking_status add value if not exists 'REQUIRES_REVIEW';
