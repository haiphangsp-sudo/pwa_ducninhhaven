// sw.js
//Offline-first static caching (không cache POST).
const CACHE_NAME = "haven-static-v29";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./main.js",
  "./config.js",
  "./manifest.json"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(STATIC_ASSETS))
  );
   self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys().then(keys=>
      Promise.all(
        keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))
      )
    )
  );
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // 1. Không bao giờ cache các yêu cầu POST (Yêu cầu dịch vụ/gọi món)
  if (event.request.method === "POST") return;

  // 2. Với ảnh và API: Luôn lấy từ mạng để mới nhất
  if (
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.startsWith("/api/")
  ) {
    event.respondWith(fetch(event.request).catch(() => new Response("{}")));
    return;
  }

  // 3. Chiến lược Stale-While-Revalidate cho các file tĩnh (HTML, CSS, JS)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Chỉ lưu vào cache nếu phản hồi thành công (status 200)
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone(); // Nhân bản TRƯỚC khi trả về
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse); // Nếu mất mạng, dùng bản cache

      return cachedResponse || fetchPromise;
    })
  );
});
