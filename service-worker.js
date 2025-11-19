/* -------------------------------------------------------
   루다 계산기 PWA - 자동 업데이트 + 오프라인 안정화 v5
   특징:
   - index.html은 네트워크 우선 + 오프라인 fallback 지원
   - 정적 파일은 캐시 우선 + 자동 업데이트
   - skipWaiting + clients.claim → 즉시 업데이트 반영
-------------------------------------------------------- */

const CACHE_NAME = "ruda-calc-v5";
const STATIC_FILES = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png"
];

/* ---------- 설치 ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_FILES))
  );
  self.skipWaiting(); // 업데이트 즉시 적용
});

/* ---------- 활성화 ---------- */
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
  self.clients.claim(); // 모든 열린 탭에 즉시 적용
});

/* ---------- 요청 가로채기 ---------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  /* 🧡 1) index.html → 네트워크 우선 + 오프라인 fallback */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/index.html"))
    );
    return;
  }

  /* 💙 2) 정적 파일 → 캐시 우선 + 네트워크 백업 */
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).then((res) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, res.clone());
            return res;
          });
        })
      );
    })
  );
});
