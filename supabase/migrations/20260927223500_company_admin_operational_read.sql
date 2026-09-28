-- Company-admin operational read access.
-- This is intentionally read-only and restricted to users recorded in company_admins.

drop policy if exists "company admins read agents" on public.agents;
create policy "company admins read agents" on public.agents
for select to authenticated
using (exists(select 1 from public.company_admins a where a.user_id=(select auth.uid())));

drop policy if exists "company admins read agent presence" on public.agent_presence;
create policy "company admins read agent presence" on public.agent_presence
for select to authenticated
using (exists(select 1 from public.company_admins a where a.user_id=(select auth.uid())));

drop policy if exists "company admins read bookings" on public.bookings;
create policy "company admins read bookings" on public.bookings
for select to authenticated
using (exists(select 1 from public.company_admins a where a.user_id=(select auth.uid())));

drop policy if exists "company admins read payments" on public.payment_transactions;
create policy "company admins read payments" on public.payment_transactions
for select to authenticated
using (exists(select 1 from public.company_admins a where a.user_id=(select auth.uid())));

drop policy if exists "company admins read documents" on public.documents;
create policy "company admins read documents" on public.documents
for select to authenticated
using (exists(select 1 from public.company_admins a where a.user_id=(select auth.uid())));

drop policy if exists "company admins read agent runs" on public.agent_runs;
create policy "company admins read agent runs" on public.agent_runs
for select to authenticated
using (exists(select 1 from public.company_admins a where a.user_id=(select auth.uid())));

drop policy if exists "company admins read support conversations" on public.support_conversations;
create policy "company admins read support conversations" on public.support_conversations
for select to authenticated
using (exists(select 1 from public.company_admins a where a.user_id=(select auth.uid())));

drop policy if exists "company admins read customers" on public.customers;
create policy "company admins read customers" on public.customers
for select to authenticated
using (exists(select 1 from public.company_admins a where a.user_id=(select auth.uid())));

drop policy if exists "company admins read passengers" on public.passengers;
create policy "company admins read passengers" on public.passengers
for select to authenticated
using (
  exists(select 1 from public.company_admins a where a.user_id=(select auth.uid()))
);
