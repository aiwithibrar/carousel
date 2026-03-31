/*
 * CarouselForge v2.0 — Service Worker
 * Provides full offline support via cache-first strategy.
 */

var CACHE_NAME = 'carouselforge-v2.4';
var ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './lib/html2canvas.min.js',
    './lib/jszip.min.js',
    './lib/FileSaver.min.js'
];

// Google Fonts to cache
var FONT_URLS = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap'
];

// Install: cache all core assets
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('[SW] Caching core assets');
            return cache.addAll(ASSETS);
        }).then(function () {
            return self.skipWaiting();
        })
    );
});

// Activate: clean old caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (name) {
                    return name !== CACHE_NAME;
                }).map(function (name) {
                    console.log('[SW] Deleting old cache:', name);
                    return caches.delete(name);
                })
            );
        }).then(function () {
            return self.clients.claim();
        })
    );
});

// Fetch: cache-first for local assets, network-first for fonts
self.addEventListener('fetch', function (event) {
    var requestUrl = new URL(event.request.url);

    // For Google Fonts — try network first, fall back to cache
    if (requestUrl.origin === 'https://fonts.googleapis.com' ||
        requestUrl.origin === 'https://fonts.gstatic.com') {
        event.respondWith(
            caches.open(CACHE_NAME).then(function (cache) {
                return fetch(event.request).then(function (response) {
                    // Cache the font response for offline use
                    cache.put(event.request, response.clone());
                    return response;
                }).catch(function () {
                    // Offline — serve from cache
                    return cache.match(event.request);
                });
            })
        );
        return;
    }

    // For local assets — cache-first
    event.respondWith(
        caches.match(event.request).then(function (cached) {
            if (cached) return cached;
            return fetch(event.request).then(function (response) {
                // Don't cache non-successful or opaque responses
                if (!response || response.status !== 200) return response;
                var responseClone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseClone);
                });
                return response;
            }).catch(function () {
                // Completely offline and not in cache
                return new Response('Offline — resource not cached', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            });
        })
    );
});
