// Service Worker - Advanced PWA
// Version 2.0 - Magia Disney & Royal

const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `magia-disney-${CACHE_VERSION}`;

// Base path helper to soportar despliegues en subcarpetas
const BASE_PATH = self.location.pathname.replace(/sw\.js$/, '');
const asset = (path) => `${BASE_PATH}${path}`;

// Assets to cache
const ASSETS_TO_CACHE = [
    BASE_PATH,
    asset('index.html'),
    asset('manifest.json'),
    asset('css/styles.css'),
    asset('css/print.css'),
    asset('js/storage.js'),
    asset('js/data.js'),
    asset('js/app.js'),
    asset('js/quotes.js'),
    asset('js/tools.js'),
    asset('js/pdf-generator.js'),
    asset('js/form-validation.js'),
    asset('js/form-enhancer.js'),
    asset('js/crm.js'),
    asset('js/pipeline.js'),
    asset('js/templates.js'),
    asset('js/advanced-quotes.js'),
    asset('js/analytics.js'),
    asset('js/analytics-ui.js'),
    asset('js/personalization.js'),
    asset('js/pwa.js'),
    asset('js/data-manager.js'),
    asset('js/ui-controller.js'),
    asset('assets/logo.png'),
    asset('assets/logo-premium.jpg')
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker', CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clear old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker', CACHE_VERSION);

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('magia-disney-') && name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    // Return cached version and update in background
                    updateCache(event.request);
                    return cachedResponse;
                }

                // Not in cache, fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Cache successful responses
                        if (response && response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Network failed, show offline page
                        return caches.match(asset('index.html'));
                    });
            })
    );
});

// Background update
function updateCache(request) {
    fetch(request)
        .then(response => {
            if (response && response.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, response);
                });
            }
        })
        .catch(() => {
            // Silent fail for background updates
        });
}

// Push notification event
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Magia Disney & Royal';
    const options = {
        body: data.body || 'Tienes una nueva notificación',
        icon: asset('assets/logo-premium.jpg'),
        badge: asset('assets/logo.png'),
        vibrate: [200, 100, 200],
        data: data.url || BASE_PATH
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data || BASE_PATH)
    );
});

// Background sync (future)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-quotes') {
        event.waitUntil(syncQuotes());
    }
});

async function syncQuotes() {
    // Future: sync with cloud
    console.log('[SW] Background sync triggered');
    return Promise.resolve();
}

// Message event
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker loaded', CACHE_VERSION);
