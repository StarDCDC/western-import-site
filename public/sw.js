/// <reference lib="webworker" />

const CACHE_NAME = 'western-import-v1';

const PRECACHE_URLS = [
  '/',
  '/catalog',
  '/about',
  '/contact',
];

// Install - precache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch - network first, fallback cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  let data = { title: 'Western Import', body: 'Ai o notificare nouă!', icon: '/logo.jpg', url: '/' };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch { /* use defaults */ }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo.jpg',
      badge: '/logo.jpg',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      for (const client of clients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
