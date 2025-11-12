//EPISODES LIST SCRIPT

import { check_activation } from "./utils.js";


function Listing() { 
  fetch("/raconte_le_site/public-webp/episodes_list.json")
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