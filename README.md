# Enes & Efsa Özel Web Uygulaması

Bu uygulama Enes ve Efsa için hazırlanmış özel bir anı, günlük ve canlı bağlantı sitesidir.

## Sayfalar

- `/`  
  Ana sayfa. Enes & Efsa yazısı ve canlı aşk sayacı burada.

- `/zaman-tuneli`  
  Anıların listelendiği zaman tüneli.

- `/zaman-tuneli/yeni`  
  Yeni anı ekleme sayfası. PIN girildikten sonra anı eklenir.

- `/gunluk`  
  Ortak günlük. PIN kime aitse not onun adıyla kaydedilir.

- `/baglanti`  
  İki kişinin ekranda parmağını canlı olarak görebildiği bağlantı sayfası.

## PIN Sistemi

Uygulamada iki PIN var:

```txt
3773 = Efsa
1453 = Enes
```

Günlükte `3773` girilirse yazılan notlar **Efsa** adıyla kaydedilir.  
Günlükte `1453` girilirse yazılan notlar **Enes** adıyla kaydedilir.

Zaman tüneline anı ekleme sayfasında da aynı PIN sistemi kullanılır.

## Bilgisayarda Çalıştırma

Terminali proje klasöründe aç:

```txt
C:\Users\enesi\Desktop\efes
```

Bağımlılıkları kur:

```bash
npm.cmd install
```

Uygulamayı başlat:

```bash
npm.cmd run dev
```

Tarayıcıda aç:

```txt
http://localhost:3000
```

## Supabase Bağlantısı

Proje klasöründe `.env.local` dosyası oluştur.

İçine şunu yaz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://senin-projen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=senin-anon-key-degerin
```

Bu iki değeri Supabase panelinde şuradan alırsın:

```txt
Project Settings > API
```

## Supabase SQL

Supabase panelinde:

```txt
SQL Editor > New query
```

aç ve aşağıdaki kodu çalıştır.

```sql
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  memory_date date not null,
  title text not null,
  description text not null,
  image_url text,
  location text,
  mood text,
  song text,
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.memories enable row level security;

drop policy if exists "Everyone can read posts" on public.posts;
drop policy if exists "Everyone can insert posts" on public.posts;
drop policy if exists "Everyone can read memories" on public.memories;
drop policy if exists "Everyone can insert memories" on public.memories;

create policy "Everyone can read posts"
on public.posts
for select
to anon
using (true);

create policy "Everyone can insert posts"
on public.posts
for insert
to anon
with check (
  author in ('Enes', 'Efsa')
  and length(content) between 1 and 5000
);

create policy "Everyone can read memories"
on public.memories
for select
to anon
using (true);

create policy "Everyone can insert memories"
on public.memories
for insert
to anon
with check (
  author in ('Enes', 'Efsa')
  and length(title) between 1 and 120
  and length(description) between 1 and 5000
);

do $$
begin
  alter publication supabase_realtime add table public.posts;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.memories;
exception
  when duplicate_object then null;
end $$;
```

Bu SQL iki tablo oluşturur:

- `posts`: Ortak günlük notları.
- `memories`: Zaman tüneline eklenen anılar.

## Fotoğraf Yükleme İçin Supabase Storage

Zaman tüneline artık fotoğraf linki yazmak yerine direkt fotoğraf seçebilirsiniz.

Bunun çalışması için Supabase'de bir Storage bucket oluşturmalısınız:

1. Supabase panelinde sol menüden **Storage** bölümüne gir.
2. **New bucket** butonuna bas.
3. Bucket adını tam olarak şöyle yaz:

```txt
memory-photos
```

4. Bucket'ı **Public** yap.
5. Oluştur.

Sonra Supabase **SQL Editor** içinde aşağıdaki kodu çalıştır:

```sql
alter table public.memories
add column if not exists location text,
add column if not exists mood text,
add column if not exists song text;

drop policy if exists "Anyone can upload memory photos" on storage.objects;
drop policy if exists "Anyone can read memory photos" on storage.objects;

create policy "Anyone can upload memory photos"
on storage.objects
for insert
to anon
with check (bucket_id = 'memory-photos');

create policy "Anyone can read memory photos"
on storage.objects
for select
to anon
using (bucket_id = 'memory-photos');
```

Bu ne işe yarıyor?

- `memory-photos` bucket'ına fotoğraf yüklemeye izin verir.
- Yüklenen fotoğrafların zaman tünelinde görünmesini sağlar.
- Zaman tüneli kartlarına `konum`, `ruh hali` ve `şarkı` alanlarını ekler.

## Anı Ekleme

Şu adrese gir:

```txt
http://localhost:3000/zaman-tuneli/yeni
```

PIN gir:

```txt
3773 = Efsa
1453 = Enes
```

Sonra şu alanları doldur:

- Tarih
- Başlık
- Anı metni
- Konum, isteğe bağlı
- Ruh hali, isteğe bağlı
- Şarkı, isteğe bağlı
- Fotoğraf, isteğe bağlı

Kaydedince anı otomatik olarak `/zaman-tuneli` sayfasında görünür.

## Günlük Kullanımı

Şu adrese gir:

```txt
http://localhost:3000/gunluk
```

PIN gir:

```txt
3773 = Efsa
1453 = Enes
```

Sonra not yazıp gönder. Not, PIN sahibinin adıyla kaydedilir.

## Canlı Bağlantı

Şu adrese iki kişi aynı anda girmeli:

```txt
http://localhost:3000/baglanti
```

Vercel'e yükleyince adres şöyle olur:

```txt
https://site-adin.vercel.app/baglanti
```

İki kişi aynı sayfadayken ekrana dokunduğunda karşı tarafta neon halka görünür. İki dokunma noktası birbirine yaklaşınca kalpler çıkar.

Bu sistem şöyle çalışır:

- Sen ekrana dokunduğunda X ve Y koordinatın Supabase Broadcast kanalına gönderilir.
- Karşı taraf aynı sayfadaysa bu mesajı anlık alır.
- Karşı tarafın ekranında senin dokunduğun yerde parmak izi görünür.
- Karşı taraf dokunuyorsa üstte “Karşı tarafın dokunuşu görünüyor” yazısı çıkar.

## Vercel'e Yüklerken

Vercel panelinde Environment Variables kısmına sadece şunları ekle:

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Sonra deploy et.

## Değişen Önemli Dosyalar

```txt
app/page.js
```

Ana sayfa, Enes & Efsa yazısı ve sayaç.

```txt
app/gunluk/page.js
```

PIN'e göre Enes veya Efsa olarak günlük açma.

```txt
app/zaman-tuneli/page.js
```

Supabase'den anıları çekip listeleme.

```txt
app/zaman-tuneli/yeni/page.js
```

Yeni anı ekleme formu.
