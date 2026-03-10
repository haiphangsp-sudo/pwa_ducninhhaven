// sw.js
//Offline-first static caching (không cache POST).
const CACHE_NAME = "haven-static-v19";

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

self.addEventListener("fetch", event=>{

  const url = new URL(event.request.url);

  /* never cache POST */
  if(event.request.method==="POST") return;

  /* ---- API & RUNTIME DATA: always network ---- */
  if(
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/data/menu.json")
  ){
    event.respondWith(
      fetch(event.request,{cache:"no-store"})
        .catch(()=>new Response("{}",{status:200}))
    );
    return;
  }

  /* ---- DEFAULT: cache first ---- */
  event.respondWith(
    caches.match(event.request).then(res=> {
        if(res) return res;
        return fetch(event.request).then(net=>{
          const clone = net.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,clone));
          return net;
        });
      })
  );

});