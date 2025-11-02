const CACHE_NAME = 'roamr-cache-v4'; // Updated version
const MAP_CACHE_NAME = 'roamr-map-tiles-v1';

// Assets to cache on installation
const urlsToCache = [
    '/',
    'index.html',
    'login.html',
    'login.css',
    'login.js',
    'script.js', // Assuming you will create this file for main app logic
    'style.css'  // Assuming you will create this file for main app styles
];

// 1. Install the service worker and cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened main cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 2. Intercept fetch requests
self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    // Strategy for OpenStreetMap Tiles: Cache then Network
    if (requestUrl.hostname.endsWith('.tile.openstreetmap.org')) {
        event.respondWith(
            caches.open(MAP_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    // Try to fetch a fresh copy from the network
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        // If successful, cache the new response
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });

                    // If a cached version is available, return it immediately.
                    // Otherwise, wait for the network fetch to complete.
                    return response || fetchPromise;
                });
            })
        );
        return;
    }

    // Strategy for other requests: Cache-first
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached response if found, otherwise fetch from network
                return response || fetch(event.request);
            })
    );
});

// 3. Clean up old caches on activation
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME, MAP_CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
