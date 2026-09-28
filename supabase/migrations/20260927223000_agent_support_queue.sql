-- Human-agent support queue visibility.
drop policy if exists "agents read routed support conversations" on public.support_conversations;
create policy "agents read routed support conversations"
on public.support_conversations
for select to authenticated
using (
  assigned_agent_id = (select auth.uid())
  or status = 'PENDING'
);

drop policy if exists "agents update routed support conversations" on public.support_conversations;
create policy "agents update routed support conversations"
on public.support_conversations
for update to authenticated
using (assigned_agent_id = (select auth.uid()) or status = 'PENDING')
with check (assigned_agent_id = (select auth.uid()));

create index if not exists support_conversations_queue_idx
on public.support_conversations(status, priority, created_at desc);
