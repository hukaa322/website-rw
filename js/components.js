async function loadComponent(id, file) {

    try {

        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(`${file} tidak ditemukan`);
        }

        const html = await response.text();

        const element =
            document.getElementById(id);

        if (element) {
            element.innerHTML = html;
        }

    } catch (error) {

        console.error(error);

    }

}


/* =================================
   SAAT WEBSITE DIBUKA
================================= */

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * LOAD NAVBAR
         */
        await loadComponent(
            "navbar",
            getComponentPath("navbar.html")
        );


        /*
         * LOAD FOOTER
         */
        await loadComponent(
            "footer",
            getComponentPath("footer.html")
        );


        /*
         * INIT HAMBURGER
         */
        initHamburgerMenu();


        /*
         * ATUR LINK HALAMAN
         */
        initPageNavigation();

    }
);


/* =================================
   MENENTUKAN PATH COMPONENT
================================= */

function getComponentPath(file) {

    const isInsidePages =
        window.location.pathname
            .includes("/pages/");

    if (isInsidePages) {

        return `../components/${file}`;

    }

    return `components/${file}`;

}


/* =================================
   NAVIGASI HALAMAN
================================= */

function initPageNavigation() {

    const isInsidePages =
        window.location.pathname
            .includes("/pages/");


    const homePath =
        isInsidePages
            ? "../index.html"
            : "index.html";


    const pagePath =
        isInsidePages
            ? "../pages/"
            : "pages/";


    /*
     * HOME
     */

    const homeLink =
        document.getElementById("homeLink");

    if (homeLink) {
        homeLink.href = homePath;
    }


    /*
     * SEMUA MENU
     */

    document
        .querySelectorAll(".hamburger-item")
        .forEach(item => {

            const page =
                item.dataset.page;


            if (page === "home") {

                item.href = homePath;

            } else {

                item.href =
                    `${pagePath}${page}.html`;

            }


            /*
             * Tandai halaman aktif
             */

            const currentPage =
                window.location.pathname
                    .split("/")
                    .pop();


            const targetPage =
                page === "home"
                    ? "index.html"
                    : `${page}.html`;


            if (currentPage === targetPage) {

                item.classList.add("active");

            } else {

                item.classList.remove("active");

            }

        });

}


/* =================================
   HAMBURGER MENU
================================= */

function initHamburgerMenu() {

    const hamburgerBtn =
        document.getElementById(
            "hamburgerBtn"
        );

    const hamburgerMenu =
        document.getElementById(
            "hamburgerMenu"
        );

    const menuOverlay =
        document.getElementById(
            "menuOverlay"
        );


    if (
        !hamburgerBtn ||
        !hamburgerMenu ||
        !menuOverlay
    ) {

        return;

    }


    /*
     * BUKA / TUTUP
     */

    hamburgerBtn.addEventListener(
        "click",
        () => {

            const isOpen =
                hamburgerMenu.classList.toggle(
                    "active"
                );

            menuOverlay.classList.toggle(
                "active",
                isOpen
            );


            hamburgerBtn.setAttribute(
                "aria-expanded",
                isOpen
            );


            const icon =
                hamburgerBtn.querySelector("i");


            if (icon) {

                if (isOpen) {

                    icon.classList.remove(
                        "fa-bars"
                    );

                    icon.classList.add(
                        "fa-xmark"
                    );

                } else {

                    icon.classList.remove(
                        "fa-xmark"
                    );

                    icon.classList.add(
                        "fa-bars"
                    );

                }

            }

        }
    );


    /*
     * KLIK OVERLAY
     */

    menuOverlay.addEventListener(
        "click",
        closeMenu
    );


    /*
     * KLIK MENU
     */

    document
        .querySelectorAll(".hamburger-item")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    closeMenu();

                }
            );

        });


    function closeMenu() {

        hamburgerMenu.classList.remove(
            "active"
        );

        menuOverlay.classList.remove(
            "active"
        );


        hamburgerBtn.setAttribute(
            "aria-expanded",
            "false"
        );


        const icon =
            hamburgerBtn.querySelector("i");


        if (icon) {

            icon.classList.remove(
                "fa-xmark"
            );

            icon.classList.add(
                "fa-bars"
            );

        }

    }

}