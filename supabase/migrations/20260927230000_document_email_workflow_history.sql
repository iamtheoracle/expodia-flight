create table if not exists public.document_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  event_type text not null,
  actor_type text not null check (actor_type in ('AI','HUMAN_AGENT','SYSTEM')),
  actor_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists document_events_document_created_idx on public.document_events(document_id, created_at desc);
create index if not exists document_events_booking_created_idx on public.document_events(booking_id, created_at desc);

create table if not exists public.email_deliveries (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete set null,
  booking_id uuid references public.bookings(id) on delete set null,
  template_id text not null,
  template_version text not null,
  recipient_email text not null,
  subject text not null,
  status text not null check (status in ('QUEUED','SENT','DELIVERED','FAILED','CANCELLED')),
  provider_message_id text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz
);
create index if not exists email_deliveries_booking_created_idx on public.email_deliveries(booking_id, created_at desc);
create index if not exists email_deliveries_document_created_idx on public.email_deliveries(document_id, created_at desc);

alter table public.document_events enable row level security;
alter table public.email_deliveries enable row level security;
create policy "agents can read document events for assigned bookings" on public.document_events for select to authenticated using (exists (select 1 from public.bookings b where b.id = document_events.booking_id and b.agent_id = (select auth.uid())));
create policy "agents can read email delivery history for assigned bookings" on public.email_deliveries for select to authenticated using (exists (select 1 from public.bookings b where b.id = email_deliveries.booking_id and b.agent_id = (select auth.uid())));
