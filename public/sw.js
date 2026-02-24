// Service Worker for offline support and caching
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";
const MAX_CACHE_SIZE = 10; // Reduced to prevent disk space issues
const CACHE_EXPIRATION_DAYS = 1; // Reduced to 1 day

// Assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/login",
  "/register",
  "/offline",
  "/icon-192.png",
  "/icon-512.png",
];

// Helper: Limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // Remove oldest items
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

// Helper: Check if cache is expired
function isCacheExpired(response) {
  if (!response) return true;
  const cachedDate = new Date(response.headers.get("date"));
  const now = new Date();
  const daysSinceCached = (now - cachedDate) / (1000 * 60 * 60 * 24);
  return daysSinceCached > CACHE_EXPIRATION_DAYS;
}

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip caching for API requests, auth, and POST requests
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.includes("/auth") ||
    request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Check if cached response is expired
      if (cachedResponse && !isCacheExpired(cachedResponse)) {
        return cachedResponse;
      }

      // Fetch from network
      return fetch(request)
        .then((fetchResponse) => {
          // Only cache successful responses for HTML, CSS, JS, images
          if (
            fetchResponse.status === 200 &&
            (url.pathname.endsWith(".html") ||
              url.pathname.endsWith(".css") ||
              url.pathname.endsWith(".js") ||
              url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/))
          ) {
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, fetchResponse.clone());
              // Limit cache size to prevent disk space issues
              limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
              return fetchResponse;
            });
          }
          return fetchResponse;
        })
        .catch(() => {
          // Return offline page if both cache and network fail
          if (request.destination === "document") {
            return caches.match("/offline");
          }
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync:", event.tag);

  if (event.tag === "sync-meetings") {
    event.waitUntil(syncMeetings());
  }
});

async function syncMeetings() {
  // Sync queued meeting data when back online
  console.log("[Service Worker] Syncing meetings...");
  // Implementation would depend on IndexedDB storage
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received");

  const data = event.data?.json() ?? {};
  const title = data.title || "Church Fellowship CRM";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id,
    },
    actions: [
      {
        action: "explore",
        title: "View",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification click:", event.action);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(
      clients.openWindow(event.notification.data.primaryKey || "/")
    );
  }
});
