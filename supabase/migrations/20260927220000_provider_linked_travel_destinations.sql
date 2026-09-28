alter table public.bookings
  add column if not exists provider_destination_url text,
  add column if not exists provider_manage_url text,
  add column if not exists provider_destination_source text,
  add column if not exists provider_destination_verified_at timestamptz;

alter table public.bookings
  add constraint bookings_provider_destination_source_check
  check (
    provider_destination_source is null
    or provider_destination_source in ('BOOKING_RECORD', 'PROVIDER_RECORD', 'APPROVED_PARTNER_CONFIG')
  );

create index if not exists bookings_provider_destination_idx
  on public.bookings(provider_name, provider_destination_verified_at)
  where provider_destination_url is not null or provider_manage_url is not null;
