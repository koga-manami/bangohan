const CACHE_NAME = "bangohan-v2";
const urlsToCache = ["/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // API リクエストはキャッシュしない
  if (event.request.url.includes("/api/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML ナビゲーション（ページ遷移）はネットワーク優先
  // → 常に最新データを表示し、オフライン時のみキャッシュにフォールバック
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 静的アセット（JS, CSS, 画像など）はキャッシュ優先
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        fetch(event.request).then((freshResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, freshResponse);
          });
        });
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
