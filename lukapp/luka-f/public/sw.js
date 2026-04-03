const SHELL_CACHE   = "lukapp-shell-v4";
const DYNAMIC_CACHE = "lukapp-dynamic-v4";

const PRECACHE = [
  "/",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/logo-verde.png",
  "/logo-morado.png",
];

// ── Install: pre-cachear shell ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(PRECACHE.map((url) => new Request(url, { cache: "reload" })))
    )
  );
  self.skipWaiting();
});

// ── Activate: limpiar caches viejos ────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== DYNAMIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: estrategia por tipo de recurso ──────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar GET del mismo origen
  if (request.method !== "GET" || url.hostname !== self.location.hostname) return;

  // API: siempre red, nunca caché
  if (url.pathname.startsWith("/api/")) return;

  // Chunks de Next.js (_next/static): cache-first permanente (tienen hash en nombre)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetchAndCache(request, SHELL_CACHE)
      )
    );
    return;
  }

  // Imágenes y fuentes: cache-first
  if (request.destination === "image" || request.destination === "font") {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached ?? fetchAndCache(request, DYNAMIC_CACHE)
      )
    );
    return;
  }

  // Navegación (páginas HTML): network-first → caché → /offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(DYNAMIC_CACHE).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached ?? caches.match("/offline"))
        )
    );
    return;
  }
});

async function fetchAndCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

// ── Push notifications ──────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload = { title: "lukapp", body: "", url: "/dashboard" };
  try { payload = { ...payload, ...event.data.json() }; } catch {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-48.png",
      vibrate: [100, 50, 100],
      data: { url: payload.url },
    })
  );
});

// ── Notification click ──────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      const existing = list.find((c) => "focus" in c);
      if (existing) { existing.focus(); existing.navigate(url); return; }
      clients.openWindow(url);
    })
  );
});
