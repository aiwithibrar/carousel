/*
 * CarouselForge — Service Worker
 * Ensures PWA installability but requires an internet connection (Network Only).
 */

var CACHE_NAME = 'carouselforge-v6.0-network-only';

// Install: Skip waiting immediately
self.addEventListener('install', function (event) {
    self.skipWaiting();
});

// Activate: Clean all old offline caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.map(function (name) {
                    console.log('[SW] Deleting old cache:', name);
                    return caches.delete(name); // Delete all existing caches
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

// Fetch: Pass everything directly to the network. No offline fallback.
self.addEventListener('fetch', function (event) {
    event.respondWith(fetch(event.request));
});
