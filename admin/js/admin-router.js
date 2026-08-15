document.addEventListener("DOMContentLoaded", async () => {
    await loadLayouts();

    const routes = {
        "": "pages/dashboard.html",
        "#/dashboard": "pages/dashboard.html",
        "#/detail-rt": "pages/detail-rt.html",
        "#/detail-rw": "pages/detail-rw.html",
        "#/galeri": "pages/galeri.html",
        "#/layanan": "pages/layanan.html",
        "#/pengumuman-berita": "pages/pengumuman-berita.html"
    };

    const mainContainer = document.getElementById("router-view");

    async function loadPage() {
        const hash = window.location.hash || "#/dashboard";
        const pagePath = routes[hash] || "pages/dashboard.html";

        document.querySelectorAll(".nav-link, .footnav-link").forEach(link => {
            if (link.getAttribute("href") === hash) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        try {
            const res = await fetch(pagePath);
            if (res.ok) {
                mainContainer.innerHTML = await res.text();
                initPageEvents(hash);
            } else {
                mainContainer.innerHTML = "<h2>404 - Halaman Tidak Ditemukan</h2>";
            }
        } catch (err) {
            console.error("Gagal memuat halaman:", err);
            mainContainer.innerHTML = "<h2>Gagal memuat konten.</h2>";
        }
    }

    window.addEventListener("hashchange", loadPage);
    loadPage();
});

// Di fungsi initPageEvents pada admin-router.js
function initPageEvents(hash) {
    if (hash === "#/detail-rt") {
        if (typeof window.loadRtData === "function") {
            window.loadRtData();
        }
    } else if (hash === "#/detail-rw") {
        if (typeof window.loadRwData === "function") {
            window.loadRwData();
        }
    } else if (hash === "#/pengumuman-berita") {
        if (window.NewsModule && typeof window.NewsModule.init === "function") {
            window.NewsModule.init();
        }
    } else if (hash === "#/layanan") {
        if (window.LayananModule && typeof window.LayananModule.init === "function") {
            window.LayananModule.init();
        }
    } else if (hash === "#/galeri") {
        if (typeof window.loadGaleriData === "function") {
            window.loadGaleriData();
        }
    }
}

async function loadLayouts() {
    try {
        const [navRes, footRes] = await Promise.all([
            fetch("layouts/navbar.html"),
            fetch("layouts/footnavbar.html")
        ]);

        if (navRes.ok) {
            document.getElementById("navbar-wrapper").innerHTML = await navRes.text();
        }
        if (footRes.ok) {
            document.getElementById("footnavbar-wrapper").innerHTML = await footRes.text();
        }

        document.querySelectorAll(".btn-logout-action").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (confirm("Apakah Anda yakin ingin keluar?")) {
                    try {
                        // Menggunakan apiFetch dan API.LOGOUT dari api.js
                        await apiFetch(API.LOGOUT, { method: "POST" });
                    } catch (e) {}
                    window.location.href = "../login/index.html";
                }
            });
        });
    } catch (err) {
        console.error("Gagal memuat file layout:", err);
    }
}