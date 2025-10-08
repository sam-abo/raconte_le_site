import { check_activation } from "./utils.js";

//Global Variables to avoid scope problems
let params = new URLSearchParams(window.location.search); //URL on 1st loading
let episode = params.get("path"); //episode title
let page = params.get("page"); //page number
let page_pos = page - 1; //page index

let data = null;            // les données JSON
let iterable = [];           // liste des épisodes
let ep_select_obj = null;    // select des épisodes
let page_select_obj = null;  // select des pages
let img = null;              // l'image affichée
let copy_data = [];         // la copie des données json pour ne pas faire n'importe quoi avec
let newUrl = null;          //le nouvel url qu'on redéfinit à chaque fois




let imageCache = {};

//initialization of the page
function initialization() {
    fetch("public-webp/episodes_list.json")
        .then(res => res.json())
        .then(json => {
            data = json,
            iterable = Object.keys(data);
            copy_data = data[episode][1];

            // objets qu'on va éviter de recréer à chaque fois pour ne pas y accoller les listen events tout le temps
            // TITRE des épisodes
            const div_ep_title = document.getElementById("title");
            const ep_title = document.createElement("h1");
            ep_title.textContent = episode;
            // SELECT des épisodes
            const div_select_episodes = document.getElementById("ep_selector");

            ep_select_obj = document.createElement("select");
            ep_select_obj.id = "easy_ep_select";
            

            //BOUTON pour valider le select d'EPISODE
            const button_ep_select = document.createElement("button");
            button_ep_select.textContent = "Go";
            button_ep_select.id = "button_ep_select"
            //Construction du select d'épisodes :
            for (let i = iterable.length ; i > 0 ; i --){
                const option = document.createElement("option");
                option.text = "Épisode " + i;
                ep_select_obj.appendChild(option);
                option.value = iterable[i-1];
            };

            //SELECT des PAGES
            const div_select_pages = document.getElementById("page_manip");

            page_select_obj = document.createElement("select");
            page_select_obj.id = "easy_page_select";

            // For each page, create an option value (dépend de episode, qui change, donc doit rester là):
            // let page_iterable = Object.keys(data[episode][1]);
            // for (let i = 0 ; i < page_iterable.length ; i ++){
            //     const option_page = document.createElement("option");
            //     option_page.text = `page  ${parseInt(i) +1}`;
            //     // console.log(option_page.text);
            //     page_select_obj.appendChild(option_page);
            //     option_page.value = i+1;
            // };

            //BOUTON du select des PAGES
            const button_page_select = document.createElement("button");
            button_page_select.textContent = "Go";
            button_page_select.id = "button_page_select"
            //Bouton previous page
            const prev_page = document.createElement("button");
            prev_page.textContent = "Précédente";
            prev_page.id = "page_nav_button"
            //Bouton next page
            const next_page = document.createElement("button");
            next_page.textContent = "Suivante";
            next_page.id = "page_nav_button"

            //Image courrante
            const div_img = document.getElementById("page");
            img = document.createElement("img");
            img.setAttribute("id", "current_page");
            img.setAttribute("type", "current");

            img.decoding = "sync";
            img.loading = "lazy";
            // img.loading = "lazy";

            img.src =  copy_data[page_pos];


            //image_cache

            // preload(page,page_pos).then(() => console.log("Preload done"));
            preload(page,page_pos)



            //############################################ Ajout des EVENT LISTENERS
            // BUTTON SELECT EPISODE
            button_ep_select.addEventListener("click", () => {Select_Goto(ep_select_obj.value, "episode", ep_title);});
            // BUTTON SELECT PAGE
            button_page_select.addEventListener("click", () => {Select_Goto(page_select_obj.value, "page", ep_title);});
            // BUTTON page PREV
            prev_page.addEventListener("click", () => {Goto_adjacent_page("-");});
            // BUTTON page NEXT
            next_page.addEventListener("click", () => {Goto_adjacent_page("+")});
            // KEY ARROWS :
            document.addEventListener("keydown", e => {
                if (e.key === "ArrowRight") {Goto_adjacent_page("+");} /*Page suivante*/
                if (e.key === "ArrowLeft") {Goto_adjacent_page("-");} /*Page précédente*/
            });

            // click sur l'image pour aller à la suivante (modifier pour pouvoir aller à la précédente aussi)
            img.addEventListener("click", () => {Goto_adjacent_page("+");});


            // ################################################# APPEND CHILDS
            div_ep_title.appendChild(ep_title);
            div_img.appendChild(img);
            div_select_episodes.appendChild(ep_select_obj);
            div_select_episodes.appendChild(button_ep_select);

            div_select_pages.appendChild(prev_page);
            div_select_pages.appendChild(page_select_obj);
            div_select_pages.appendChild(next_page);
            div_select_pages.appendChild(button_page_select);
            // Viewer_opt(data,copy_data, page,episode,img);
            Viewer_opt(data, episode);

        });
}

function MYpreload(page, page_pos) {
    requestIdleCallback(async () => {
        imageCache = {};

        if (page > 1) {
            const preloadPrev = new Image();
            preloadPrev.src = copy_data[page_pos - 1];
            await preloadPrev.decode().catch(() => {});
            imageCache[0] = preloadPrev;
        }

        if (page < copy_data.length) {
            const preloadNext = new Image();
            preloadNext.src = copy_data[page_pos + 1];
            await preloadNext.decode().catch(() => {});
            imageCache[2] = preloadNext;
        }

        console.log(`Cache updated for page=${page}`);
    });
};

// Utilitaire : retourne une promesse qui se résout quand l'image est chargée + décodée
function preloadImage(src) { // function that immediatly returns a promise for the image;
    //the promise is define such that, resolve : what we do if it resolves, and reject, what we do if it doesnt.
    return new Promise((resolve, reject) => {
        //We define a new image
        const img = new Image();
        img.decoding = "async";
        img.loading = "eager";
        img.src = src; //give it the src we had
        //important part, decode returns a promise
        img.onload = () => img.decode().then(() => resolve(img)).catch(() => resolve(img)); //decode is a Then-able promis, so we call 
        
        //Reject, define the case where we fail something, so the call to the function must be nested in a try to catch the error just in case
        img.onerror = reject;
    });
}

// Dynamic preload
let preloadController = null;
async function preload(page, page_pos) {
    //Be able to cancel previous preload of a page if we go too fast.
    if (preloadController) {
        preloadController.abort();
        console.log("🛑 Previous preload aborted");
    }

    preloadController = new AbortController();
    const { signal } = preloadController;

    //define a newcache
    const newCache = {};

    if (page < copy_data.length) { //if we can preload the next image
        // const nextSrc = copy_data[page_pos + 1]; //fetch the src
        // newCache[2] = preloadImage(nextSrc); //launch the real preloading (so decode)
        newCache[2] = preloadImage(copy_data[page_pos + 1]); //launch the real preloading (so decode) of the src

        console.log("🕓 Preloading next page...");
    };

    if (page > 1) {
        const prevSrc = copy_data[page_pos - 1];
        newCache[0] = preloadImage(prevSrc);
        console.log("🕓 Preloading previous page...");
    };

    // ImageCache becomes newCache which contians promises ! thats important.
    imageCache = newCache;
};



function Select_Goto(value, target, ep_title, updateHistory = true) {
    if (target == "episode"){
        page=1;               // on fixe la page au début
        page_pos = page - 1;  // recalcul index

        // console.log(`Copy_data before : ${copy_data}`);
        episode = value;
        copy_data = data[episode][1];
        // console.log(`Copy_data after : ${copy_data}`);
        


        img.src = data[value][1][page_pos]; // change seulement l'image
        ep_title.textContent = value;

        

        // mettre à jour l'URL sans reload
        newUrl = `lecture.html?path=${value}&page=${page}`;
        history.pushState({page}, "", newUrl);
        window.Location = newUrl;
        //preload
        // preload(page,page_pos).then(() => console.log("Preload done"));
        preload(page,page_pos)

        
        
    };

    if (target == "page"){
        page=value;               // on fixe la nouvelle page
        page_pos = parseInt(page) - 1;  // recalcul index

        console.log(page_pos);
        img.src = data[episode][1][page_pos]; // change seulement l'image

        // mettre à jour l'URL sans reload
        newUrl = `lecture.html?path=${episode}&page=${page}`;
        history.pushState({page}, "", newUrl);
        window.Location = newUrl;


        //preload une fois qu'on est atteri sur la page visée
        // preload(page,page_pos).then(() => console.log("Preload done"));
        preload(page,page_pos)

    };
};

// function Goto_adjacent_page(target) {

//     if (target == "+") {
//         //d'abord, on verrifie si y'a une image qui existe en cache à la position "après",
//         // Si c'est le cas on a forcément validé la condition page < copy_data.length  :

//         if (page < copy_data.length) { //si on est pas arrivé à la fin
//             // --- 🔹 Vérifie si l'image suivante est déjà en cache
//             if (imageCache[2]) {
//                 console.log(`✅ Cache hit: using preloaded image for page ${page}`);
//                 //idem, pour l'opti on évite de trop utiliser src puisqu'on manipule des images grandes
//                 // img.src = imageCache[2].src; //l'image courante devient l'image du slot "après"

//                 requestAnimationFrame(() => {
//                     img.src = imageCache[2].src;
//                 });
//                 // imageCache[2] = null; 

//             } else {
//                 console.log(`❌ Cache miss: loading image from source for page ${page}`); //à prori, ça devrait ne jamais arriver mais on sait jamais
//                 img.src = copy_data[page_pos];
//             }

//             params = new URLSearchParams(window.location.search);
//             episode = params.get("path"); 
//             page++;               // incrémente page
//             page_pos = page - 1;  // recalcul index
//             newUrl = `lecture.html?path=${episode}&page=${page}`;

//             preload(page,page_pos);

            

//             // mettre à jour l'URL sans reload
//             history.pushState({page}, "", newUrl);

//             // preload

//             return
//         }
//     }

//     if (target == "-") {
        
//         if (page > 1) {
//             // --- 🔹 Vérifie si l'image suivante est déjà en cache
//             if (imageCache[0]) {
//                 console.log(`✅ Cache hit: using preloaded image for page ${page}`);
//                 requestAnimationFrame(() => {
//                     img.src = imageCache[0].src;
//                 });
//                 //on vide le cache

//             } else {
//                 console.log(`❌ Cache miss: loading image from source for page ${page}`);
//                 img.src = copy_data[page_pos];
//             }

//             params = new URLSearchParams(window.location.search);
//             episode = params.get("path"); 
//             copy_data = data[episode][1];
            
//             page--;               // décrémente page
//             page_pos = page - 1;  // recalcul index
//             preload(page,page_pos);

            

//             // img.src = copy_data[page_pos]; // change seulement l'image

//             // mettre à jour l'URL sans reload
//             newUrl = `lecture.html?path=${episode}&page=${page}`;
//             history.pushState({page}, "", newUrl);

//             //preload
//             // preload(page,page_pos).then(() => console.log("Preload done"));
//             // preload(page,page_pos);


//             return
//         }
//     }
// }


async function Goto_adjacent_page(target) {
    //Go to becomes async to handle the promises of imageCache.
    if ((target == "+") && (page < copy_data.length)) {
        page++;
        page_pos = page - 1;
        const newUrl = `lecture.html?path=${episode}&page=${page}`;
        //immediatly change url
        history.pushState({ page }, "", newUrl);

        // check if a promise is in cache:
        if (imageCache[2]) {
            console.log(`🕓 Awaiting cached image for page ${page}`);
            try {
                const loadedImg = await imageCache[2]; // waiting for the promise first
                console.log(`✅ Cache hit resolved: page ${page}`);
                requestAnimationFrame(() => {
                    // img.src = imageCache[2].src;
                    img.src = loadedImg.src; //change the src.
                });
                // img.src = loadedImg.src; //change the src.
            } catch (e) { //if something goes wrong, we switch to source array.
                console.warn("❌ Cache failed, fallback to direct load");
                img.src = copy_data[page_pos];
            }
        //case where no promise is in cache    
        } else {
            console.log(`❌ Cache miss: loading directly`);
            img.src = copy_data[page_pos];
        }
    };

    if ((target == "-") && (page > 1)) {
        page--;
        page_pos = page - 1;
        const newUrl = `lecture.html?path=${episode}&page=${page}`;
        history.pushState({ page }, "", newUrl);

        // Si on a déjà une promesse en cache :
        if (imageCache[0]) {
            console.log(`🕓 Awaiting cached image for page ${page}`);
            try {
                const loadedImg = await imageCache[0]; // on attend la promesse
                console.log(`✅ Cache hit resolved: page ${page}`);
                // img.src = loadedImg.src;
                console.log(`✅ Cache hit resolved: page ${page}`);
                requestAnimationFrame(() => {
                    // img.src = imageCache[2].src;
                    img.src = loadedImg.src; //change the src.
                });
            } catch (e) {
                console.warn("❌ Cache failed, fallback to direct load");
                img.src = copy_data[page_pos];
            }
        } else {
            console.log(`❌ Cache miss: loading directly`);
            img.src = copy_data[page_pos];
        }
    };
    // Launch the next preload (async, but we can't launch it earlier because else we abord the current wait)
    preload(page, page_pos);
}



function Viewer_opt() {

    console.log(params);
    console.log(page);

    
    // For each page, create an option value (dépend de episode, qui change, donc on le recréé à chaque changement d'ep, donc doit rester là):
    let page_iterable = Object.keys(data[episode][1]);
    for (let i = 0 ; i < page_iterable.length ; i ++){
        const option_page = document.createElement("option");
        option_page.text = `page  ${parseInt(i) +1}`;
        // console.log(option_page.text);
        page_select_obj.appendChild(option_page);
        option_page.value = i+1;
    };
    
    check_activation("Viewer");
}

initialization();