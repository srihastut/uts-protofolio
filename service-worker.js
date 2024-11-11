const CACHE_NAME = 'my-site-cache-v1';
const assets = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/image/icon-192x192.png",
  "/image/image.jpeg",
  "/image/certificate 1.png",
  "/image/certificate 2.png",
  "/image/certificate 3.png"
];

// Install Service Worker dan caching file-file yang penting
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME) // Gunakan CACHE_NAME yang benar
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(assets); // Ganti urlsToCache dengan assets
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch dan cek apakah file ada di cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Jika ada di cache, return file dari cache
        if (response) {
          return response;
        }
        // Jika tidak ada di cache, fetch dari network
        return fetch(event.request);
      })
  );
});

// Menangani pesan untuk menampilkan notifikasi
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const title = 'Hallo!';
    const options = {
      body: 'Selamat Datang di Web Portfolio Tuti. Terima kasih telah mengunjungi!',
      icon: '/image/icon-192x192.png'
    };

    if (Notification.permission === 'granted') {
      self.registration.showNotification(title, options);
    } else {
      console.error('Izin notifikasi belum diberikan.');
    }
  }
});

// Menangani klik pada notifikasi
self.addEventListener('notificationclick', event => {
  event.notification.close(); // Menutup notifikasi saat diklik
  event.waitUntil(
    clients.openWindow('https://github.com/srihastut') // URL yang akan dibuka saat notifikasi diklik
  );
});