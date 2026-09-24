alter table public.documents
  add column if not exists document_version integer not null default 1,
  add column if not exists template_id text,
  add column if not exists template_version text,
  add column if not exists issuer_type text not null default 'EXPODIA',
  add column if not exists issuer_name text,
  add column if not exists country_code text,
  add column if not exists language_code text not null default 'en',
  add column if not exists mime_type text not null default 'application/pdf',
  add column if not exists content_hash text,
  add column if not exists supersedes_document_id uuid references public.documents(id) on delete set null,
  add column if not exists issued_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists documents_supersedes_idx on public.documents(supersedes_document_id);
create index if not exists documents_template_idx on public.documents(template_id, template_version);

alter table public.documents drop constraint if exists documents_status_check;
alter table public.documents add constraint documents_status_check
  check (status in ('PENDING','READY','FAILED','VOIDED','SUPERSEDED'));

create table if not exists public.document_templates (
  id text primary key,
  document_type text not null,
  issuer_type text not null,
  issuer_name text,
  country_code text,
  language_code text not null default 'en',
  version text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','VERIFIED','RETIRED')),
  source_reference text,
  required_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (id, version)
);

alter table public.document_templates enable row level security;
drop policy if exists "agents read verified document templates" on public.document_templates;
create policy "agents read verified document templates" on public.document_templates
for select to authenticated using (status = 'VERIFIED');

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version integer not null check (version > 0),
  status text not null check (status in ('READY','VOIDED','SUPERSEDED')),
  storage_path text,
  content_hash text,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

alter table public.document_versions enable row level security;
drop policy if exists "agents read own document versions" on public.document_versions;
create policy "agents read own document versions" on public.document_versions
for select to authenticated using (
  exists (
    select 1 from public.documents d
    where d.id = document_id and d.agent_id = (select auth.uid())
  )
);
