-- Gizli Mektuplar tablosu
-- Supabase SQL Editor icinde bir kez calistir.

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  author text not null check (author in ('Enes', 'Efsa')),
  recipient text not null check (recipient in ('Enes', 'Efsa', 'Ortak')),
  title text not null,
  content text not null,
  open_at timestamptz not null,
  created_at timestamptz not null default now()
);

do $$
declare
  old_constraint text;
begin
  select con.conname
  into old_constraint
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where nsp.nspname = 'public'
    and rel.relname = 'letters'
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%recipient%'
  limit 1;

  if old_constraint is not null then
    execute format('alter table public.letters drop constraint %I', old_constraint);
  end if;
end $$;

alter table public.letters
add constraint letters_recipient_check
check (recipient in ('Enes', 'Efsa', 'Ortak'));

alter table public.letters enable row level security;

drop policy if exists "letters select anon" on public.letters;
create policy "letters select anon"
on public.letters
for select
to anon
using (true);

drop policy if exists "letters insert anon" on public.letters;
create policy "letters insert anon"
on public.letters
for insert
to anon
with check (true);

create index if not exists letters_open_order_idx
on public.letters (open_at desc, created_at desc);

create index if not exists letters_created_order_idx
on public.letters (created_at desc);
