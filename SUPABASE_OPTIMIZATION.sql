-- Midnight Keepsake performans indexleri
-- Supabase SQL Editor icinde bir kez calistir.
-- Bu indexler zaman tuneli ve gunluk sayfalarinda "yeniden eskiye" siralamayi hizlandirir.

create index if not exists memories_feed_order_idx
on public.memories (memory_date desc, created_at desc);

create index if not exists posts_feed_order_idx
on public.posts (created_at desc);
