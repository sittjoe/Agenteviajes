/**
 * Service Worker - Magia Disney & Royal v2.0
 * Offline support con cache inteligente
 */

const CACHE_NAME = 'magia-disney-v2';
const CACHE_VERSION = '2.0.0';

const STATIC_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/storage.js',
    './js/data.js',
    './js/app.js',
    './js/quotes.js',
    './js/tools.js',
    './assets/logo.png',
    './manifest.json'
];

const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Install - Cache static assets
self.addEventListener('install', event => {
    console.log('[SW] Installing v' + CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // Cache external assets separately (may fail)
                return caches.open(CACHE_NAME + '-external')
                    .then(cache => {
                        return Promise.allSettled(
                            EXTERNAL_ASSETS.map(url => 
                                fetch(url).then(response => {
                                    if (response.ok) {
                                        return cache.put(url, response);
                                    }
                                })
                            )
                        );
                    });
            })
            .then(() => self.skipWaiting())
    );
});

// Activate - Clean old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating v' + CACHE_VERSION);
    
    event.waitUntil(
        caches.keys()
            .then(keys => {
                return Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME && key !== CACHE_NAME + '-external')
                        .map(key => {
                            console.log('[SW] Deleting old cache:', key);
                            return caches.delete(key);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch - Cache-first for static, network-first for dynamic
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other protocols
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Return cached version if available
                if (cachedResponse) {
                    // Update cache in background for next time
                    if (url.origin === location.origin) {
                        fetch(event.request)
                            .then(response => {
                                if (response.ok) {
                                    caches.open(CACHE_NAME)
                                        .then(cache => cache.put(event.request, response));
                                }
                            })
                            .catch(() => {}); // Ignore network errors
                    }
                    return cachedResponse;
                }
                
                // Not in cache, try network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache if not successful
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        
                        // Cache the new response
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // Network failed, try to return offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Handle messages from main thread
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});
