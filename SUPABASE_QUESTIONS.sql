-- Sorular sayfasi icin tablolar
-- Supabase SQL Editor icinde bir kez calistir.

create table if not exists public.couple_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.couple_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.couple_questions(id) on delete cascade,
  author text not null check (author in ('Enes', 'Efsa')),
  answer text not null,
  updated_at timestamptz not null default now(),
  unique (question_id, author)
);

alter table public.couple_questions enable row level security;
alter table public.couple_answers enable row level security;

drop policy if exists "couple questions select anon" on public.couple_questions;
create policy "couple questions select anon"
on public.couple_questions
for select
to anon
using (true);

drop policy if exists "couple questions insert anon" on public.couple_questions;
create policy "couple questions insert anon"
on public.couple_questions
for insert
to anon
with check (true);

drop policy if exists "couple answers select anon" on public.couple_answers;
create policy "couple answers select anon"
on public.couple_answers
for select
to anon
using (true);

drop policy if exists "couple answers insert anon" on public.couple_answers;
create policy "couple answers insert anon"
on public.couple_answers
for insert
to anon
with check (true);

drop policy if exists "couple answers update anon" on public.couple_answers;

create index if not exists couple_questions_order_idx
on public.couple_questions (sort_order asc, created_at asc);

create index if not exists couple_answers_question_idx
on public.couple_answers (question_id, author);

insert into public.couple_questions (question, sort_order)
select *
from (
  values
    ('En sevdiğin renk ne?', 10),
    ('Birlikte gitmeyi en çok istediğin yer neresi?', 20),
    ('En sevdiğin yemek ne?', 30),
    ('Çocukken en mutlu olduğun an neydi?', 40),
    ('Beni düşündüğünde aklına gelen ilk kelime ne?', 50),
    ('Beraber yaşamak istediğin küçük bir hayal ne?', 60),
    ('Kötü bir gün geçirdiğinde seni en hızlı ne iyi hissettirir?', 70),
    ('Bizim için seçtiğin bir şarkı ne olurdu?', 80)
) as seed(question, sort_order)
where not exists (
  select 1
  from public.couple_questions existing
  where existing.question = seed.question
);
