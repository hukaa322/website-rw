async function loadComponent(id, file) {

    try {

        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(`${file} tidak ditemukan`);
        }

        const html = await response.text();

        document.getElementById(id).innerHTML = html;

    } catch (error) {

        console.error(error);

    }

}

window.addEventListener("DOMContentLoaded", async () => {

    await loadComponent("navbar", "components/navbar.html");

    await loadComponent("sidebar", "components/sidebar.html");

    await loadComponent("hero", "pages/hero.html");

    await loadComponent("berita", "pages/berita.html");

    await loadComponent("galeri", "pages/galeri.html");

    await loadComponent("footer", "components/footer.html");

});