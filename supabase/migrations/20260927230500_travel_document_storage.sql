insert into storage.buckets (id,name,public)
values ('travel-documents','travel-documents',false)
on conflict (id) do nothing;

create policy "authenticated agents can read assigned travel documents"
on storage.objects for select to authenticated
using (
  bucket_id = 'travel-documents'
  and exists (
    select 1 from public.documents d
    join public.bookings b on b.id = d.booking_id
    where d.storage_path = storage.objects.name
      and b.agent_id = (select auth.uid())
  )
);
