create extension if not exists pgcrypto;

create type public.booking_status as enum (
  'SEARCHING', 'PRICE_CHECK', 'AWAITING_CONFIRMATION', 'CONFIRMED',
  'TICKET_PENDING', 'TICKETED', 'FAILED', 'CANCELLED', 'EXPIRED',
  'REFUND_PENDING', 'REFUNDED'
);

create type public.ticket_status as enum ('PENDING', 'ISSUED', 'VOIDED');
create type public.data_source as enum ('PRODUCTION', 'SANDBOX');

create table public.agents (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id),
  email text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.passengers (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  given_name text not null,
  family_name text not null,
  date_of_birth date,
  nationality text,
  document_number text,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id),
  customer_id uuid not null references public.customers(id),
  status public.booking_status not null default 'SEARCHING',
  provider_name text,
  provider_booking_id text,
  pnr text,
  currency text,
  total_amount numeric(14,2),
  source public.data_source not null default 'PRODUCTION',
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_name, provider_booking_id)
);

create table public.booking_passengers (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  passenger_id uuid not null references public.passengers(id) on delete restrict,
  primary key (booking_id, passenger_id)
);

create table public.flight_segments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  provider_name text not null,
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
  unique (provider_name, provider_flight_id, booking_id)
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  passenger_id uuid not null references public.passengers(id) on delete restrict,
  provider_name text,
  provider_ticket_id text,
  e_ticket_number text,
  verification_reference text not null unique,
  status public.ticket_status not null default 'PENDING',
  document_version integer not null default 1 check (document_version > 0),
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider_name, provider_ticket_id),
  foreign key (booking_id, passenger_id) references public.booking_passengers(booking_id, passenger_id)
);

create table public.verification_records (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null unique references public.tickets(id) on delete cascade,
  verification_reference text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_verified_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) on delete set null,
  passenger_id uuid references public.passengers(id) on delete set null,
  event_key text not null,
  channel text not null,
  recipient text not null,
  status text not null,
  provider_message_id text,
  idempotency_key text not null unique,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  event_type text not null,
  entity_type text not null,
  entity_id text not null,
  source public.data_source not null default 'PRODUCTION',
  provider_name text,
  provider_request_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index bookings_agent_id_idx on public.bookings(agent_id);
create index bookings_pnr_idx on public.bookings(pnr);
create index passengers_customer_id_idx on public.passengers(customer_id);
create index segments_provider_flight_idx on public.flight_segments(provider_name, provider_flight_id);
create index audit_booking_id_idx on public.audit_events(booking_id);

alter table public.agents enable row level security;
alter table public.customers enable row level security;
alter table public.passengers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_passengers enable row level security;
alter table public.flight_segments enable row level security;
alter table public.tickets enable row level security;
alter table public.verification_records enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_events enable row level security;

create policy "agents read own profile" on public.agents for select using (id = auth.uid());
create policy "agents manage own customers" on public.customers for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());
create policy "agents read own passengers" on public.passengers for select using (
  exists (select 1 from public.customers c where c.id = customer_id and c.agent_id = auth.uid())
);
create policy "agents manage own passengers" on public.passengers for insert with check (
  exists (select 1 from public.customers c where c.id = customer_id and c.agent_id = auth.uid())
);
create policy "agents read own bookings" on public.bookings for select using (agent_id = auth.uid());
create policy "agents create own bookings" on public.bookings for insert with check (agent_id = auth.uid());
create policy "agents update own bookings" on public.bookings for update using (agent_id = auth.uid()) with check (agent_id = auth.uid());
create policy "agents read own booking passengers" on public.booking_passengers for select using (
  exists (select 1 from public.bookings b where b.id = booking_id and b.agent_id = auth.uid())
);
create policy "agents manage own booking passengers" on public.booking_passengers for insert with check (
  exists (select 1 from public.bookings b where b.id = booking_id and b.agent_id = auth.uid())
);
create policy "agents read own segments" on public.flight_segments for select using (
  exists (select 1 from public.bookings b where b.id = booking_id and b.agent_id = auth.uid())
);
create policy "agents read own tickets" on public.tickets for select using (
  exists (select 1 from public.bookings b where b.id = booking_id and b.agent_id = auth.uid())
);
create policy "public verification read active record" on public.verification_records for select using (active = true);
create policy "agents read own notifications" on public.notifications for select using (
  exists (select 1 from public.bookings b where b.id = booking_id and b.agent_id = auth.uid())
);
create policy "agents read own audit" on public.audit_events for select using (agent_id = auth.uid());
