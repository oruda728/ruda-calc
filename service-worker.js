/* ---------------------------------------------
   안정화 버전 v4 - 서비스워커
   핵심 원칙:
   - index.html은 캐시 금지 (업데이트 즉시 반영)
   - JS/CSS/이미지만 캐시
   - 네트워크 우선 + 캐시 백업 전략
---------------------------------------------- */

const CACHE_NAME = "ruda-calc-v4";
const STATIC_FILES = [
  "/app.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

/* ---------- 설치 단계 ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

/* ---------- 활성화 단계 ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ---------- fetch 가로채기 ---------- */
self.addEventListener("fetch", (event) => {
  const request = event.request;

  /* 🚫 1) index.html은 캐시 절대 금지 → 항상 네트워크 우선  */
  if (request.mode === "navigate") {
    event.respondWith(fetch(request));
    return;
  }

  /* 📦 2) 그 외 파일(JS, 이미지 등)은 캐시 우선 + 네트워크 백업 */
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
      );
    })
  );
});
