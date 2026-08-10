document.addEventListener("DOMContentLoaded", function () {
    const rwContainer = document.getElementById("rwContainer");
    const rwDetailWrapper = document.getElementById("rwDetailWrapper");

    // 1. HALAMAN PROFIL RW (profil-rw.html)
    if (rwContainer) {
        loadRWList();
    }

    // 2. HALAMAN DETAIL RW (detail-rw.html)
    if (rwDetailWrapper) {
        loadRWDetail();
    }

    async function loadRWList() {
        let dataRW = null;

        // Jalur Panggilan API ke Backend/Database
        const possibleEndpoints = [
            '../api/profil_rw.php',
            'http://localhost/vireta2/api/profil_rw.php',
            '../data/rw.json'
        ];

        // 1. Coba panggil fungsi dari api.js jika ada
        try {
            if (typeof getProfilRW === 'function') {
                dataRW = await getProfilRW();
            } else if (typeof fetchAPI === 'function') {
                dataRW = await fetchAPI('/profil-rw');
            }
        } catch (e) {
            console.log("Memakai fetch manual ke endpoint...");
        }

        // 2. Jika api.js tidak ada, fetch ke endpoint PHP / Backend
        if (!dataRW) {
            for (let url of possibleEndpoints) {
                try {
                    const res = await fetch(url);
                    if (res.ok) {
                        const json = await res.json();
                        dataRW = json.data || json;
                        if (dataRW) break;
                    }
                } catch (err) {
                    // Lanjut coba endpoint berikutnya
                }
            }
        }

        // 3. Fallback jika backend mati/tidak merespon
        if (!dataRW || (Array.isArray(dataRW) && dataRW.length === 0)) {
            dataRW = [
                {
                    id: 1,
                    nama: "Drs. H. Ahmad Fauzi",
                    status: "Aktif (2024 - 2029)",
                    masa_jabatan: "2024 - 2029",
                    foto: "../assets/img/rw-profile.jpg"
                }
            ];
        }

        renderRWList(Array.isArray(dataRW) ? dataRW : [dataRW]);
    }

    function renderRWList(listRW) {
        rwContainer.innerHTML = "";

        listRW.forEach(rw => {
            const id = rw.id || rw.id_rw || 1;
            const nama = rw.nama || rw.nama_ketua || "Ketua RW 05";
            const status = rw.status || "Aktif";
            const masaJabatan = rw.masa_jabatan || rw.periode || "2024 - 2029";
            const foto = (rw.foto && rw.foto.trim() !== "") ? rw.foto : "https://placehold.co/600x300/0F4C81/FFFFFF?text=Foto+Profil+RW";

            const cardHTML = `
                <div class="rw-card">
                    <!-- Foto Profil -->
                    <img src="${foto}" alt="${nama}" onerror="this.onerror=null; this.src='https://placehold.co/600x300/0F4C81/FFFFFF?text=Foto+Profil+RW';">
                    
                    <!-- Badge Status -->
                    <span class="badge">${status}</span>
                    
                    <!-- Informasi RW -->
                    <h3>${nama}</h3>
                    <p><i class="fa-regular fa-calendar-days"></i> Masa Jabatan: ${masaJabatan}</p>
                    
                    <!-- TOMBOL SELENGKAPNYA BISA DIKLIK -->
                    <a href="detail-rw.html?id=${id}" class="btn btn-primary margin-top-15">
                        Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            `;

            rwContainer.innerHTML += cardHTML;
        });
    }

    async function loadRWDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id') || 1;

        rwDetailWrapper.innerHTML = `
            <div class="rw-card detail-card" style="max-width: 800px; margin: 0 auto;">
                <img src="https://placehold.co/600x300/0F4C81/FFFFFF?text=Foto+Profil+RW" alt="Detail RW" style="width: 100%; max-height: 350px; object-fit: cover; border-radius: 16px;">
                <div style="padding: 20px 0; text-align: center;">
                    <span class="badge">Aktif (2024 - 2029)</span>
                    <h2 style="color: #0F4C81; margin: 10px 0;">Drs. H. Ahmad Fauzi</h2>
                    <p style="color: #64748B;"><i class="fa-regular fa-calendar-days"></i> Masa Jabatan: 2024 - 2029</p>
                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #E2E8F0;">
                    <p style="text-align: justify; line-height: 1.6;">Selamat datang di halaman resmi Profil & Kepengurusan RW 05 Villa Regensi Tangerang 2.</p>
                </div>
            </div>
        `;
    }
});