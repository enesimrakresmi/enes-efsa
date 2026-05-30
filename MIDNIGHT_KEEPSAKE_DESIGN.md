# Midnight Keepsake Tasarım Sistemi

Bu projenin yeni görsel dilinin adı **Midnight Keepsake**.

Amaç, Enes & Efsa uygulamasını sadece karanlık bir web sitesi gibi değil, ikinize ait özel ve profesyonel bir anı alanı gibi hissettirmek. Tasarım karanlık, sakin ve modern kalırken; küçük mavi/pembe vurgularla daha mutlu, sıcak ve romantik bir atmosfer verir.

## Ana Fikir

Midnight Keepsake üç duygu üzerine kurulu:

- **Sakinlik:** Derin siyah arka plan, düşük kontrastlı çizgiler ve yumuşak cam yüzeyler.
- **Yakınlık:** Büyük başlıklar, kısa sıcak cümleler, kişisel detayları öne çıkaran paneller.
- **Kalite:** Tekrarlı kart dili, tutarlı boşluklar, sade ikon kullanımı ve mobilde temiz gezinme.

## Renkler

- Ana arka plan: `#0d0e12`
- Panel arka planı: `#13151a`
- Koyu kart yüzeyi: `#0d0f15`
- Birincil vurgu: `#93b7ff`
- İkincil mavi vurgu: `#6f8cff`
- Romantik yardımcı vurgu: `#ff8aaa`
- Ana metin: `#f3f4f6`
- Yardımcı metin: `#9ca3af`

Vurgu rengi ağırlıklı olarak mavi kullanılır. Pembe/kırmızı tonlar sadece romantik detaylarda, Efsa etiketlerinde ve küçük sıcak dokunuşlarda yer alır.

## Yüzeyler

Sayfalar tek bir ana yüzey üzerinde ilerler:

- `home-surface`: Izgaralı, koyu ve hafif derinlikli ana yüzey.
- `page-shell`: Sayfayı ortalayan genel kapsayıcı.
- `page-panel`: Form, liste veya özel içerikler için ana panel.
- `soft-card`: Kartların standart görünümü.

Kartlar keskin olmayan ama fazla oyuncak gibi görünmeyen `rounded-lg` köşelerle kullanılır.

## Tipografi

- Başlıklar kısa, güçlü ve sade olmalı.
- Açıklama metinleri gri, kısa ve net tutulmalı.
- Uzun metinlerde `break-words` ve `[overflow-wrap:anywhere]` kullanılmalı.
- Mobilde başlıklar taşmayacak şekilde `text-3xl`, masaüstünde `text-5xl` seviyesine çıkmalı.

## Navigasyon

Masaüstünde sol dikey menü, mobilde altta kompakt dock kullanılır.

Mobil menü:

- Ekranın altında yüzer.
- Tek bir cam yüzey gibi görünür.
- Aktif sayfa küçük nokta ve renkli ikonla anlaşılır.
- Her ikonun altında kısa metin bulunur.

## Sayfa Düzeni

Her ana sayfa şu sırayı izler:

1. Üst başlık alanı: küçük etiket, büyük başlık, kısa açıklama.
2. Aksiyon butonu varsa sağda veya mobilde altta tam genişlik.
3. İçerik alanı: kartlar, form veya canlı alan.
4. Boş durum varsa aynı tasarım diliyle sakin bir panel.

## Hareket

Animasyonlar gösterişli değil, sakin olmalı:

- Kartlar scroll ile gelirken yumuşak hissettirmeli.
- Canlı bağlantıda ağır DOM animasyonları yerine CSS transform ve opacity tercih edilmeli.
- Fazla parlama, büyük blur ve yoğun efektlerden kaçınılmalı.

## Kullanım Kuralı

Yeni sayfa eklenirken önce bu sınıflar düşünülür:

- Dış kapsayıcı: `page-shell`
- Başlık bölümü: `page-heading`
- Ana içerik kutusu: `page-panel`
- Küçük tekrar eden kutu: `soft-card`
- Geri/ikincil aksiyon: `ghost-action`
- Ana aksiyon: `primary-action`

Bu sayede uygulama büyüdükçe aynı kaliteli his korunur.
