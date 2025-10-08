self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("my-cache").then((cache) => {
      return cache.addAll(["/episodes.json"]); //ajouter dans le cache au moment du install le json auquel on fait nos requetes
    })
  );
});

self.addEventListener("fetch", (event) => { //à l'évènement fetch
  if (event.request.url.includes("episodes.json")) { //une requete qui contient episodes.json dans l'url est envoyée
    event.respondWith( //la réponse
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          let clone = response.clone();
          caches.open("my-cache").then((cache) => cache.put(event.request, clone)); //on met l'objet response.clone dans le cache, j'imagine que response est notre json
          return response;
        });
      })
    );
  }
});
