create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into app_settings (key, value, updated_at)
values ('practice_mode', 'test', now())
on conflict (key) do nothing;

-- This family-admin app reads and updates app_settings from server actions.
-- Disable RLS for this simple key/value settings table so mode toggles do not fail
-- with "new row violates row-level security policy". If you prefer RLS, create
-- equivalent select/insert/update policies for the app role used by the server.
alter table app_settings disable row level security;
