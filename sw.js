// sw.js
//Offline-first static caching (không cache POST).
const CACHE_NAME = "haven-static-v4";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./main.js",
  "./config.js"
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
        keys.map(key=>{
          if(key!==CACHE_NAME){
            return caches.delete(key);
          }
        })
      )
    )
  );
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", event=>{

  const url = new URL(event.request.url);

  /* never cache POST */
  if(event.request.method==="POST") return;

  /* ---- RUNTIME DATA: always network ---- */
  if(url.pathname.includes("/data/menu.json")){
    event.respondWith(
      fetch(event.request, {cache:"no-store"})
        .catch(()=>caches.match("./data/menu.json"))
    );
    return;
  }

  /* ---- DEFAULT: cache first ---- */
  event.respondWith(
    caches.match(event.request)
      .then(res=>res || fetch(event.request))
  );

});