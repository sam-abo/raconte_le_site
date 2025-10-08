//EPISODES LIST SCRIPT

import { check_activation } from "./utils.js";


import { check_activation } from "./utils.js";

// function Listing3() {
//   fetch("public-webp/episodes_list.json")
//     .then(res => res.json())
//     .then(data => {
//       const list = document.getElementById("chapter-list");
//       if (!list) {
//         console.error("Impossible : #chapter-list introuvable");
//         return;
//       }

//       const iterable = Object.keys(data).reverse(); // récent d'abord
//       const batchSize = 20;
//       let index = 0;
//       let isLoading = false;

//       function createItem(episode) {
//         const li = document.createElement("li");
//         const a = document.createElement("a");
//         a.href = `lecture.html?path=${encodeURIComponent(episode)}&page=1`;
//         a.textContent = episode;
//         li.appendChild(a);
//         return li;
//       }

//       function loadBatch() {
//         if (isLoading) return;
//         if (index >= iterable.length) return;
//         isLoading = true;
//         const slice = iterable.slice(index, index + batchSize);
//         slice.forEach(ep => list.appendChild(createItem(ep)));
//         index += slice.length;
//         isLoading = false;
//         console.log(`Chargés : ${index}/${iterable.length}`);

//         if (index >= iterable.length) {
//           // plus rien à charger → on supprime sentinel (observer géré en dehors)
//           if (sentinel) {
//             observer.disconnect(); // stop l'observer
//             sentinel.remove();
//             console.log("Tous les épisodes chargés, sentinel supprimé.");
//           }
//         }
//       }

//       // premier lot
//       loadBatch();

//       // crée un sentinel valide (LI pour UL)
//       const sentinel = document.createElement("li");
//       sentinel.id = "sentinel";
//       sentinel.setAttribute("aria-hidden", "true");
//       // garde une petite hauteur pour être détectable; enlever en prod si besoin
//       sentinel.style.minHeight = "1px";
//       // list.appendChild(sentinel) --> on l'ajoute toujours en fin
//       list.appendChild(sentinel);

//       // Si ton <ul> est dans un conteneur avec overflow:auto (ex. .link-list), utilise-le comme root
//       const scrollableAncestor = list.closest(".link-list"); // ou adapte le sélecteur
//       const observerOptions = {
//         root: scrollableAncestor || null,
//         rootMargin: "200px", // précharge avant que l'utilisateur arrive
//         threshold: 0
//       };

//       const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//           if (entry.isIntersecting) {
//             console.log("Sentinel en vue — chargement du lot suivant...");
//             loadBatch();
//           }
//         });
//       }, observerOptions);

//       observer.observe(sentinel);
//     })
//     .catch(err => console.error("Erreur fetch episodes_list.json:", err));

//   check_activation("Listing");
// }



// function Listing2() {
//   fetch("public-webp/episodes_list.json")
//     .then(res => res.json())
//     .then(data => {
//       const list_div = document.getElementById("link-list")
//       const list = document.getElementById("chapter-list");
//       const iterable = Object.keys(data).reverse(); // plus récent en premier

//       let batchSize = 5; // combien d’épisodes on charge par lot
//       let index = 0;

//       // Fonction qui ajoute un lot d’épisodes
//       function loadBatch() {
//         const slice = iterable.slice(index, index + batchSize);
//         slice.forEach(episode => {
//           const li = document.createElement("li");
//           const a = document.createElement("a");
//           a.href = `lecture.html?path=${episode}&page=1`;
//           a.textContent = episode;
//           li.appendChild(a);
//           list.appendChild(li);
//         });
//         index += batchSize;
//       }

//       // On charge le premier lot
//       loadBatch();

//       // On crée un "sentinel" (élément invisible) à la fin de la liste
//       const sentinel = document.createElement("div");
//       sentinel.id = "sentinel";
//       list_div.appendChild(sentinel);

//       // IntersectionObserver = quand le sentinel entre en vue → on charge plus
//       const observer = new IntersectionObserver(entries => {
//         if (entries[0].isIntersecting && index < iterable.length) {
//           loadBatch();
//         }
//       });

//       observer.observe(sentinel);
//     });

//   check_activation("Listing");
// }

function Listing() { 
  fetch("public-webp/episodes_list.json")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("chapter-list");
    let iterable = Object.keys(data);
    iterable.reverse().forEach(episode => {

      const li = document.createElement("li");
      const a = document.createElement("a");
      let link = `lecture.html?path=${episode}&page=1`;
      a.href = link;
      a.textContent = episode;
      li.appendChild(a);
      list.appendChild(li);
    })

  });

  check_activation("Listing")

}
Listing()