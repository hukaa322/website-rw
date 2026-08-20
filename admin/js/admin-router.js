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

function initPageEvents(hash) {
    if (hash === "" || hash === "#/dashboard") {
        loadDashboardStatistics();
    } else if (hash === "#/detail-rt") {
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
        if (window.GaleriModule && typeof window.GaleriModule.init === "function") {
            window.GaleriModule.init();
        } else if (typeof window.loadGaleriData === "function") {
            window.loadGaleriData();
        }
    }
}

async function loadDashboardStatistics() {
    try {
        const baseBackend = window.API?.BASE_URL || "http://localhost:3000";

        // Fetch paralel dari endpoint modul
        const [resSurat, resRt, resBerita, resGaleri] = await Promise.all([
            window.apiFetch(`${baseBackend}/api/rw/surat-antrean`),
            window.apiFetch(window.API.RT.GET_ALL),
            window.apiFetch(window.API.BERITA.GET_ALL),
            window.apiFetch(window.API.GALERI.GET_ALL)
        ]);

        const dataSurat = await resSurat.json();
        const dataRt = await resRt.json();
        const dataBerita = await resBerita.json();
        const dataGaleri = await resGaleri.json();

        // 1. Status Surat Pengantar
        const suratList = (dataSurat.success && Array.isArray(dataSurat.data)) ? dataSurat.data : [];
        const pendingCount = suratList.filter(s => s.status === 'approved_rt').length;
        const selesaiCount = suratList.filter(s => s.status === 'selesai').length;

        const elPending = document.getElementById("stat-surat-pending");
        const elSelesai = document.getElementById("stat-surat-selesai");
        if (elPending) elPending.innerText = `${pendingCount} Surat`;
        if (elSelesai) elSelesai.innerText = `${selesaiCount} Surat`;

        // 2. Total RT
        const rtList = (dataRt.success && Array.isArray(dataRt.data)) ? dataRt.data : [];
        const elRt = document.getElementById("stat-total-rt");
        if (elRt) elRt.innerText = `${rtList.length} RT`;

        // 3. Total Berita
        const beritaList = (dataBerita.success && Array.isArray(dataBerita.data)) ? dataBerita.data : [];
        const elBerita = document.getElementById("stat-total-berita");
        if (elBerita) elBerita.innerText = `${beritaList.length} Berita`;

        // 4. Total Galeri & UMKM
        const galeriList = (dataGaleri.success && Array.isArray(dataGaleri.data)) ? dataGaleri.data : [];
        const elUmkm = document.getElementById("stat-total-umkm");
        if (elUmkm) elUmkm.innerText = `${galeriList.length} Item`;

        // 5. Render Tabel Antrean Cepat Surat Masuk
        const tbody = document.getElementById("dash-surat-body");
        if (!tbody) return;

        const pendingSurat = suratList.filter(s => s.status === 'approved_rt').slice(0, 5);

        if (pendingSurat.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding: 25px; color: #64748b;">
                        <i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Tidak ada permohonan surat masuk yang tertunda.
                    </td>
                </tr>`;
            return;
        }

        tbody.innerHTML = pendingSurat.map((item, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${new Date(item.tgl_ttd_rt || item.created_at).toLocaleDateString('id-ID')}</td>
                <td><strong>${item.nomor_surat || '-'}</strong></td>
                <td><span class="badge-count">RT ${String(item.rt_target).padStart(2, '0')}</span></td>
                <td><strong>${item.nama_lengkap}</strong></td>
                <td>${item.keperluan_opsi}</td>
                <td><span style="background:#fef3c7; color:#b45309; padding:4px 8px; border-radius:6px; font-weight:700; font-size:0.75rem;">Menunggu ACC RW</span></td>
                <td style="text-align:center;">
                    <a href="#/layanan" class="btn btn-sm btn-primary" style="text-decoration:none; padding:4px 10px; font-size:0.8rem;">
                        <i class="fa-solid fa-stamp"></i> Proses
                    </a>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Gagal load statistik dashboard:", error);
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
                        await window.apiFetch(window.API.LOGOUT, { method: "POST" });
                    } catch (e) {}
                    window.location.href = "../login/index.html";
                }
            });
        });
    } catch (err) {
        console.error("Gagal memuat layout navbar/footnavbar:", err);
    }
}