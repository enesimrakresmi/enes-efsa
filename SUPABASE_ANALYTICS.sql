-- EfEs • Supabase Bildirim ve Efsa IP Takip Tablolari
-- Bu kodu Supabase Dashboard -> SQL Editor icinde bir kez calistirin.

-- 1. Web Push Bildirim Abonelikleri Tablosu
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_alias text not null default 'Anonim',
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
drop policy if exists "push_subscriptions_anon_all" on public.push_subscriptions;
create policy "push_subscriptions_anon_all"
on public.push_subscriptions
for all
to anon
using (true)
with check (true);

-- 2. Efsa & Bilinen IP'ler Tablosu (Birden fazla IP eklenebilir: Ev, Mobil, Okul vb.)
create table if not exists public.known_ips (
  ip text primary key,
  user_alias text not null default 'Efsa',
  label text default 'Efsa Cihazı',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.known_ips enable row level security;
drop policy if exists "known_ips_all_anon" on public.known_ips;
create policy "known_ips_all_anon"
on public.known_ips
for all
to anon
using (true)
with check (true);

-- 3. Ziyaret ve Aktivite Loglari Tablosu
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  ip text not null,
  user_alias text not null default 'Misafir',
  current_path text not null default '/',
  visited_paths jsonb not null default '[]'::jsonb,
  duration_seconds integer not null default 0,
  user_agent text,
  device_type text default 'Bilinmiyor',
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_last_active_idx
on public.activity_logs (last_active_at desc);

create index if not exists activity_logs_ip_idx
on public.activity_logs (ip);

-- 4. Otomatik Son 50 Kayit Prune (Silme) Fonksiyonu & Trigger'i
create or replace function public.prune_activity_logs()
returns trigger as $$
begin
  delete from public.activity_logs
  where id not in (
    select id from public.activity_logs
    order by last_active_at desc
    limit 50
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_prune_activity_logs on public.activity_logs;
create trigger trigger_prune_activity_logs
after insert or update on public.activity_logs
for each statement execute function public.prune_activity_logs();

alter table public.activity_logs enable row level security;
drop policy if exists "activity_logs_all_anon" on public.activity_logs;
create policy "activity_logs_all_anon"
on public.activity_logs
for all
to anon
using (true)
with check (true);
