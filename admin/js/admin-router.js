document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load Component Layouts terlebih dahulu (Navbar & Footnavbar)
    await loadLayouts();

    // 2. Definisi Rute Halaman
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

        // Sync Status Aktif pada Nav Desktop & HP
        document.querySelectorAll(".nav-link, .footnav-link").forEach(link => {
            if (link.getAttribute("href") === hash) {
                link.classList.add("active");
            } else {
                link.classList.remove("active");
            }
        });

        // Load Konten Halaman
        try {
            const res = await fetch(pagePath);
            if (res.ok) {
                mainContainer.innerHTML = await res.text();
                // Panggil pemicu event modul halaman di sini
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

// 3. Fungsi Hook Initializer Modul Halaman
function initPageEvents(hash) {
    if (hash === "#/detail-rt") {
        if (typeof window.loadRtData === "function") {
            window.loadRtData();
        }
    }
}

// 4. Helper Pemuat Layout Dinamis
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

        // Action Listener Logout untuk tombol yang dimuat
        document.querySelectorAll(".btn-logout-action").forEach(btn => {
            btn.addEventListener("click", async () => {
                if (confirm("Apakah Anda yakin ingin keluar?")) {
                    try {
                        await fetch("http://localhost:3000/api/logout", {
                            method: "POST",
                            credentials: "include"
                        });
                    } catch (e) {}
                    window.location.href = "../login/index.html";
                }
            });
        });
    } catch (err) {
        console.error("Gagal memuat file layout:", err);
    }
}