create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "Public read site settings"
on public.site_settings for select
to public
using (true);

insert into public.site_settings (key, value) values
  ('gift_locked', 'false'),
  ('weekly_gift_amount', '500')
on conflict (key) do nothing;