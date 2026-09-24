drop policy if exists "agents manage own flight offers" on public.flight_offers;
create policy "agents create own flight offers" on public.flight_offers
for insert to authenticated
with check (
  exists (
    select 1 from public.flight_searches s
    where s.id = search_id and s.agent_id = (select auth.uid())
  )
);