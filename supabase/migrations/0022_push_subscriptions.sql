-- Browser push subscriptions for traveler and professional accounts.
-- Each row is one browser/device endpoint; a user may hold several.
-- Travelers own their rows; server-side delivery reads them with the service role.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;

create policy "users manage own push subscriptions" on public.push_subscriptions
for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);
