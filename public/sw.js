// EfEs • Service Worker
const CACHE_NAME = 'efes-keepsake-v2';
const STATIC_ASSETS = [
  '/',
  '/zaman-tuneli',
  '/mektuplar',
  '/baglanti',
  '/icon.png',
  '/manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 1. Push Notification Event
self.addEventListener('push', (event) => {
  let data = {
    title: 'EfEs • Hatıralarımız',
    body: 'Yeni bir gelişme var ✨',
    icon: '/icon.png',
    badge: '/icon.png',
    tag: 'efes-notification',
    data: { url: '/' }
  };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon.svg',
    badge: data.badge || '/icons/icon.svg',
    tag: data.tag || 'efes-notification',
    vibrate: [200, 100, 200],
    data: data.data || { url: '/' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 2. Notification Click Handler -> Open Target Page
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// 3. Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.pathname.startsWith('/api') || url.pathname.startsWith('/yonetim')) {
    return;
  }

  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.includes('fonts.gstatic.com') ||
    url.pathname.startsWith('/icons')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        }).catch(() => cachedResponse);
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          return caches.match('/');
        });
      })
    );
  }
});
