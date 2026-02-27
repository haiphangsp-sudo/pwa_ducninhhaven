// sw.js
//Offline-first static caching (không cache POST).
const CACHE_NAME = "haven-static-v1";

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
});

self.addEventListener("fetch",event=>{

  if(event.request.method==="POST"){
    return; // never cache POST
  }

  event.respondWith(
    caches.match(event.request)
      .then(response=>response || fetch(event.request))
  );

});