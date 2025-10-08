// NAVBAR SCRIPT

import { check_activation } from "./utils.js"

function NavBarSwitch() {
    //querySelector permet de TARGET les classes pour les CHANGER
    const menu = document.querySelector('#mobile-menu'); 
    //Variable const qui va regarder ce qui se passe dans le doc pour l'ID mobile menu
    // pour gérer la mécanique de toggle.
    const menuLinks = document.querySelector('.navbar__menu');
    //variable const qui va regarder ce qui se passes dans le doc chez navbar__menu
    //pour gérer si c'est active ou non

    menu.addEventListener('click', function() { 
        //quand on clique sur les machins lié à menu (donc l'id mobile menu, donc les barres) 
        // on active une fonction qui fait ça :
        menu.classList.toggle('is-active'); //SWITCH L'ETAT DE LA CLASS TARGETée en ajoutant à is-active pour menu
        menuLinks.classList.toggle('active'); // pareil pour menuLinks avec active
    })

    check_activation("Navbar");

}


NavBarSwitch();

