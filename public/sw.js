const CACHE_NAME = "coban-pwa-v1";
const STATIC_ASSETS = ["/", "/icon-192x192.png", "/icon-512x512.png"];

self.addEventListener("install", function (event) {
  console.log("Service Worker installing.");

  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("Caching app shell");
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  console.log("Service Worker activating.");

  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches
      .match(event.request)
      .then(function (response) {
        if (response) {
          console.log("Serving from cache:", event.request.url);
          return response;
        }

        console.log("Fetching from network:", event.request.url);
        return fetch(event.request).then(function (response) {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(function () {
        // Fallback for offline navigation
        if (event.request.destination === "document") {
          return caches.match("/");
        }
      })
  );
});
