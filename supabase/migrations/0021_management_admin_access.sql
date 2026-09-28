-- Management dashboard access hardening.
-- Company administrators may read/manage the management surfaces used by /admin.
-- Regular professionals retain their existing least-privilege policies.

create policy "company_admin_agents_select" on public.agents
for select to authenticated
using (exists (select 1 from public.company_admins a where a.user_id = (select auth.uid())));

create policy "company_admin_registration_codes_select" on public.agent_registration_codes
for select to authenticated
using (exists (select 1 from public.company_admins a where a.user_id = (select auth.uid())));

create policy "company_admin_registration_codes_update" on public.agent_registration_codes
for update to authenticated
using (exists (select 1 from public.company_admins a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.company_admins a where a.user_id = (select auth.uid())));

create policy "company_admin_agent_applications_select" on public.agent_applications
for select to authenticated
using (exists (select 1 from public.company_admins a where a.user_id = (select auth.uid())));
