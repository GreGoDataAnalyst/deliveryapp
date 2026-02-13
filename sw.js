self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("food-v1").then(c =>
      c.addAll(["/", "/index.html", "/css/pico.min.css"])
    )
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
