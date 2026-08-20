async function loadComponent(id, file) {
    try {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`${file} tidak ditemukan`);
        }
        const html = await response.text();
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = html;
        }
    } catch (error) {
        console.error(error);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    // Memuat komponen header & footer
    await loadComponent("navbar", "components/navbar.html");
    await loadComponent("bottom-nav", "components/bottom-nav.html");
    await loadComponent("footer", "components/footer.html");

    // Memuat section landing page
    await loadComponent("hero", "pages/hero.html");
    await loadComponent("tentang", "pages/tentang.html");
    await loadComponent("profil-rt", "pages/profil-rt.html");
    await loadComponent("profil-rw", "pages/profil-rw.html");
    await loadComponent("berita", "pages/berita.html");
    await loadComponent("galeri", "pages/galeri.html");
    await loadComponent("layanan", "pages/layanan.html");

    // Inisialisasi modul setelah HTML berhasil dipasang di DOM
    if (typeof loadHomeNews === "function") {
        loadHomeNews();
    }
    if (typeof window.initLayananPage === "function") {
        window.initLayananPage();
    }

    initSmoothScroll();
});

function initSmoothScroll() {
    document.addEventListener("click", (e) => {
        const anchor = e.target.closest('a[href^="#"]');
        if (anchor) {
            const targetId = anchor.getAttribute("href");
            if (targetId === "#") return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navbarHeight = 75;
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - navbarHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });

                document.querySelectorAll('.nav-desktop a, .bottom-nav .nav-item').forEach(nav => nav.classList.remove('active'));
                anchor.classList.add('active');
            }
        }
    });
}