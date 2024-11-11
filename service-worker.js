const CACHE_NAME = 'my-site-cache-v1';
const assets = [
  "/uts-protofolio/",                     // Pastikan halaman utama tersedia
  "/uts-protofolio/index.html",            // Halaman utama
  "/uts-protofolio/style.css",             // File CSS
  "/uts-protofolio/script.js",             // File JavaScript
  "/uts-protofolio/manifest.json",         // File manifest
  "/uts-protofolio/icon-192x192.png",      // Ikon untuk notifikasi dan manifest
  "/uts-protofolio/image.jpeg",            // Gambar lainnya
  "/uts-protofolio/certificate1.png",      // Sertifikat 1
  "/uts-protofolio/certificate2.png",      // Sertifikat 2
  "/uts-protofolio/certificate3.png"       // Sertifikat 3
];

self.addEventListener('install', event => {
  console.log('Service Worker Install Event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(assets);
      })
      .catch(error => {
        console.error('Failed to cache assets:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
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
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
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
      icon: '/uts-protofolio/icon-192x192.png' // Path ikon diperbaiki
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
    clients.openWindow('https://srihastut.github.io/uts-protofolio/') // URL yang benar untuk membuka portfolio
  );
});
