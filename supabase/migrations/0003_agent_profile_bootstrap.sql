drop policy if exists "agents create own profile" on public.agents;
create policy "agents create own profile" on public.agents
for insert to authenticated
with check (id = (select auth.uid()));

drop policy if exists "agents update own profile" on public.agents;
create policy "agents update own profile" on public.agents
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
