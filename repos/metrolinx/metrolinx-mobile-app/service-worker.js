/**
 * Service Worker for Metrolinx Voice Transit Assistant
 * Enables offline functionality and app-like behavior
 */

const CACHE_NAME = 'metrolinx-voice-v1.0.0';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './speech-handler.js',
    './real-gtfs-api.js',
    './gtfs-parser.js',
    './manifest.json',
    // Add any icon files when they're created
    // './icon-192.png',
    // './icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }

                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request).then((response) => {
                    // Don't cache non-successful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Add to cache for future use
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch((error) => {
                console.error('Service Worker: Fetch failed', error);
                
                // Return offline page for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
                
                // For other requests, just fail
                throw error;
            })
    );
});

// Background sync for future features
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Add background sync logic here
            Promise.resolve()
        );
    }
});

// Push notifications for future features
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'New transit update available',
        icon: './icon-192.png',
        badge: './icon-96.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: './icon-96.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './icon-96.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Metrolinx Voice Assistant', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event.action);
    
    event.notification.close();

    if (event.action === 'explore') {
        // Open the app
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Message handler for communication with main app
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker: Script loaded');
