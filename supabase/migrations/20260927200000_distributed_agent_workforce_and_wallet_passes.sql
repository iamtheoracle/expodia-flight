alter table public.agent_runs
  add column if not exists parent_run_id uuid references public.agent_runs(id) on delete set null,
  add column if not exists requires_human_approval boolean not null default false,
  add column if not exists result_reference text;

create index if not exists agent_runs_parent_run_id_idx on public.agent_runs(parent_run_id);
create index if not exists agent_runs_booking_status_idx on public.agent_runs(booking_id, status);

create table if not exists public.wallet_passes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  passenger_id uuid not null references public.passengers(id) on delete restrict,
  platform text not null check (platform in ('APPLE_WALLET','GOOGLE_WALLET')),
  pass_type text not null check (pass_type in ('BOARDING_PASS','TICKET','ITINERARY')),
  external_object_id text not null unique,
  status text not null default 'PENDING' check (status in ('PENDING','ELIGIBLE','ISSUED','REVOKED')),
  provider_source text not null check (provider_source in ('PROVIDER','EXPODIA')),
  provider_pass_reference text,
  issued_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (booking_id, passenger_id) references public.booking_passengers(booking_id, passenger_id)
);

alter table public.wallet_passes enable row level security;

create policy "agents read own wallet passes" on public.wallet_passes for select using (
  exists (select 1 from public.bookings b where b.id = booking_id and b.agent_id = auth.uid())
);

create index if not exists wallet_passes_booking_idx on public.wallet_passes(booking_id);
create index if not exists wallet_passes_ticket_idx on public.wallet_passes(ticket_id);

insert into public.ai_worker_registry (worker_key, capability, status, runtime, visibility, description)
values
('orchestrator','Route and coordinate travel operations','READY','Expodia orchestration runtime','INTERNAL','Coordinates bounded specialist workers and reconciles their results.'),
('fare_verifier','Verify fares, baggage and fare conditions','READY','Provider APIs + orchestration runtime','INTERNAL','Verifies provider-supplied fare conditions before customer/agent acceptance.'),
('passenger_verifier','Validate passenger and travel-document completeness','READY','Supabase + orchestration runtime','INTERNAL','Checks required passenger data without silently changing identity information.'),
('booking_worker','Execute provider booking operations','READY','Provider APIs + orchestration runtime','INTERNAL','Executes booking only through an authorized configured provider.'),
('payment_worker','Track and verify payment state','READY','Payment provider + Supabase','INTERNAL','Records verified payment state and never infers success from user claims.'),
('ticketing_worker','Verify provider ticket issuance','READY','Provider APIs + orchestration runtime','INTERNAL','Marks tickets issued only after provider issuance confirmation.'),
('wallet_worker','Issue eligible Apple Wallet and Google Wallet passes','READY','Wallet provider APIs + secure server runtime','INTERNAL','Prepares wallet passes only from verified ticket/check-in data; credentials stay server-side.')
on conflict (worker_key) do update set
  capability = excluded.capability,
  runtime = excluded.runtime,
  description = excluded.description,
  updated_at = now();
