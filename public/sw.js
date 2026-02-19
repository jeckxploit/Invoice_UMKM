// Service Worker for InvoiceUMKM PWA
const CACHE_VERSION = 'v2';
const CACHE_NAME = `invoiceumkm-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => !key.includes(CACHE_VERSION))
          .map((key) => {
            console.log('Deleting old cache:', key);
            return caches.delete(key);
          })
      );
    })
  );

  // Force reload all clients to use new version
  event.waitUntil(
    self.clients.claim().then(() => {
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => {
          // Only reload if not on the root path
          const url = new URL(client.url);
          if (url.pathname !== '/') {
            client.navigate('/');
          }
        });
      });
    })
  );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  // Skip API routes - always fetch from network
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Don't cache API responses
          return networkResponse;
        })
        .catch((error) => {
          console.error('API fetch error:', error);
          // Return error response, don't fallback to cache
          return new Response(JSON.stringify({
            error: 'Network error',
            message: 'Unable to fetch from server'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Root path - always fetch from network to ensure landing page shows
  if (url.pathname === '/' || url.pathname === '') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Cache the landing page for offline
          const responseClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(event.request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return cached response or offline page
          return cachedResponse || caches.match('/offline.html');
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle cache clear command
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys.map((key) => caches.delete(key))
        );
      })
    );
  }
});
