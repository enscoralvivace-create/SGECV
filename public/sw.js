const CACHE_VERSION = "vivace-suite-v3";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll(PRECACHE_URLS);

      // Importante:
      // NO llamamos a skipWaiting() aquí.
      // La actualización será controlada por PwaUpdatePrompt.
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE)
          .map((cacheName) => caches.delete(cacheName)),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function shouldIgnoreRequest(request) {
  const url = new URL(request.url);

  return (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/_next/webpack-hmr")
  );
}

async function handleNavigationRequest(request) {
  try {
    return await fetch(request);
  } catch {
    const offlinePage = await caches.match(
      OFFLINE_URL,
    );

    return offlinePage ?? Response.error();
  }
}

async function handleStaticRequest(request) {
  const cachedResponse =
    await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse =
      await fetch(request);

    if (
      networkResponse.ok &&
      networkResponse.type === "basic"
    ) {
      const cache =
        await caches.open(STATIC_CACHE);

      await cache.put(
        request,
        networkResponse.clone(),
      );
    }

    return networkResponse;
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (shouldIgnoreRequest(request)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      handleNavigationRequest(request),
    );

    return;
  }

  event.respondWith(
    handleStaticRequest(request),
  );
});