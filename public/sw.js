// DermIQ - Minimal Servis Çalışanı (Service Worker)
// Amaç: PWA "Ana Ekrana Ekle" kurulabilirliği (Chrome/Android bir fetch handler'ı
// olan kayıtlı bir servis çalışanı gerektirir) ve basit çevrimdışı dayanıklılık.
// Vite'ın hashlenmiş build dosya adlarını build zamanında bilmediğimiz için belirli
// dosyaları önceden önbelleğe almaz; bunun yerine kendi kaynağımızdaki GET isteklerini
// ağdan alır, başarılı olursa önbelleğe yazar, ağ başarısız olursa (çevrimdışı) önbellekten sunar.

const CACHE_NAME = 'dermiq-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      if (clients.length > 0) return clients[0].focus();
      return self.clients.openWindow('/');
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
