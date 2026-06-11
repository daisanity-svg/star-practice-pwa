-- Allow the family app to upload and read card images in the public card-assets bucket.
-- Run this after creating the `card-assets` public bucket.

create policy if not exists "card_assets_public_read"
on storage.objects
for select
using (bucket_id = 'card-assets');

create policy if not exists "card_assets_public_insert"
on storage.objects
for insert
with check (bucket_id = 'card-assets');

create policy if not exists "card_assets_public_update"
on storage.objects
for update
using (bucket_id = 'card-assets')
with check (bucket_id = 'card-assets');

create policy if not exists "card_assets_public_delete"
on storage.objects
for delete
using (bucket_id = 'card-assets');
