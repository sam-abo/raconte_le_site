export function check_activation(type) {
    let path = window.location.pathname;
    let page = path.split("/").pop();
    console.log(`✅` + `${type} ` + `${page} : OK`);
};

// export function change_page(){};