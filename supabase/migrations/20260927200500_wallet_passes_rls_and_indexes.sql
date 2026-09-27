drop policy if exists "agents read own wallet passes" on public.wallet_passes;
create policy "agents read own wallet passes" on public.wallet_passes for select using (
  exists (select 1 from public.bookings b where b.id = wallet_passes.booking_id and b.agent_id = (select auth.uid()))
);
create index if not exists wallet_passes_booking_passenger_idx on public.wallet_passes(booking_id, passenger_id);
create index if not exists wallet_passes_passenger_idx on public.wallet_passes(passenger_id);
