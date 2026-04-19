/**
 * Diplomacy 2.0 — Service Worker (Grundgerüst)
 * 
 * Dieses SW-Skelett wird in späteren Phasen (F15) erweitert um:
 * - Offline-Caching von App-Shell + Assets
 * - Web Push Notifications (Zug-Erinnerungen, Chat)
 * - Background Sync (Befehle offline cachen)
 */

const CACHE_NAME = "diplomacy2-v1";
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
];

/* ── Install: Cache App Shell ──────────────────── */
self.addEventListener("install", (event) => {
  console.log("[SW] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate immediately without waiting for old SW
  self.skipWaiting();
});

/* ── Activate: Clean up old caches ─────────────── */
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Claim clients immediately
  self.clients.claim();
});

/* ── Fetch: Network-First with Cache Fallback ─── */
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip WebSocket and API calls
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/socket.io/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || new Response("Offline", { status: 503 });
        });
      })
  );
});

/* ── Push Notifications (Platzhalter für F15) ──── */
// self.addEventListener("push", (event) => {
//   const data = event.data?.json();
//   self.registration.showNotification(data.title, {
//     body: data.body,
//     icon: "/icons/icon-192x192.png",
//     badge: "/icons/badge-72x72.png",
//   });
// });
