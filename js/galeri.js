document.addEventListener("DOMContentLoaded", () => {
    // Jalankan pengecekan langsung & siapkan observer jika komponen dimuat delay
    checkAndInitGaleri();
    observeGaleriContainer();
});

function checkAndInitGaleri() {
    const galleryContainer = document.getElementById("galleryContainer");
    if (galleryContainer && !galleryContainer.dataset.initialized) {
        galleryContainer.dataset.initialized = "true";
        initLandingGaleri();
    }
    initDetailGaleriPage();
}

// Menangani jika section dimuat lewat components.js / dynamic loader
function observeGaleriContainer() {
    const observer = new MutationObserver(() => {
        const galleryContainer = document.getElementById("galleryContainer");
        if (galleryContainer && !galleryContainer.dataset.initialized) {
            galleryContainer.dataset.initialized = "true";
            initLandingGaleri();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// === 1. LOGIKA UTAMA LANDING PAGE (#galeri) ===
async function initLandingGaleri() {
    const galleryContainer = document.getElementById("galleryContainer");
    if (!galleryContainer) return;

    // Fetch data galeri pertama kali
    await fetchAndRenderGaleri("semua");

    // Event listener tombol tab filter
    const filterBtns = document.querySelectorAll(".gallery-tab-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            filterBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            const category = this.getAttribute("data-category");
            fetchAndRenderGaleri(category);
        });
    });
}

async function fetchAndRenderGaleri(category) {
    const galleryContainer = document.getElementById("galleryContainer");
    if (!galleryContainer) return;

    try {
        galleryContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted, #64748B);">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top:10px;">Memuat data galeri...</p>
            </div>
        `;

        const url = `${API.GALERI.GET_PUBLIC}?kategori=${category}`;
        const response = await apiFetch(url);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            galleryContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted, #64748B);">
                    <i class="fa-solid fa-box-open fa-2x"></i>
                    <p style="margin-top:10px;">Belum ada foto galeri pada kategori ini.</p>
                </div>
            `;
            return;
        }

        // Render data dari MySQL ke Grid Card
        galleryContainer.innerHTML = result.data.map(item => {
            const imgSrc = item.foto_utama 
                ? `${API.BASE_URL}/assets/galery/rt/${item.foto_utama}` 
                : 'assets/img/placeholder.jpg';
            
            let badgeClass = 'bg-primary';
            let labelKategori = 'UMKM Warga';
            if (item.kategori === 'kegiatan') {
                badgeClass = 'bg-success';
                labelKategori = 'Kegiatan RW';
            } else if (item.kategori === 'ikon') {
                badgeClass = 'bg-warning';
                labelKategori = 'Ikon Warga';
            }

            return `
                <div class="gallery-card" data-category="${item.kategori}">
                    <div class="gallery-img-wrapper" style="height: 200px; overflow: hidden; position: relative;">
                        <img src="${imgSrc}" alt="${item.judul}" style="width: 100%; height: 100%; object-fit: cover;">
                        <span class="gallery-badge ${badgeClass}" style="position: absolute; top: 12px; left: 12px; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #fff;">
                            ${labelKategori}
                        </span>
                    </div>
                    <div class="gallery-content" style="padding: 16px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">${item.judul}</h4>
                        <p style="font-size: 13px; color: var(--text-muted, #64748B); line-height: 1.5; margin-bottom: 12px;">
                            ${item.deskripsi || 'Tidak ada deskripsi tersedia.'}
                        </p>
                        ${item.kontak ? `
                            <a href="https://wa.me/${item.kontak.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-sm btn-outline" style="font-size: 12px;">
                                <i class="fa-brands fa-whatsapp"></i> Hubungi (${item.kontak})
                            </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Gagal mengambil galeri publik:", error);
        galleryContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red; padding: 20px;">Gagal memuat data dari server.</div>`;
    }
}

// === 2. LOGIKA UTAMA HALAMAN DETAIL (galeri.html) ===
async function initDetailGaleriPage() {
    const detailContainer = document.querySelector(".about-grid");
    if (!detailContainer || window.location.pathname.includes("index.html")) return;

    try {
        const response = await apiFetch(`${API.GALERI.GET_PUBLIC}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            const item = result.data[0];
            const imgSrc = item.foto_utama 
                ? `${API.BASE_URL}/assets/galery/rt/${item.foto_utama}` 
                : 'assets/img/placeholder.jpg';

            detailContainer.innerHTML = `
                <div class="slider-wrapper about-slider">
                    <img src="${imgSrc}" alt="${item.judul}" class="slide-img active" style="width:100%; max-height:380px; object-fit:cover; border-radius:8px;">
                </div>
                <div class="about-info">
                    <span class="category" style="background: var(--accent-color, #FFC107); color: #000; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700;">
                        Kategori: ${item.kategori.toUpperCase()}
                    </span>
                    <h3 style="margin-top: 15px; color: var(--primary-color, #00468B);">${item.judul}</h3>
                    <p style="color: var(--text-muted); line-height: 1.8;">
                        ${item.deskripsi || 'Dokumentasi resmi warga Vireta 2.'}
                    </p>
                    ${item.kontak ? `
                        <div style="margin-top: 15px;">
                            <a href="https://wa.me/${item.kontak.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-primary btn-sm">
                                <i class="fa-brands fa-whatsapp"></i> Hubungi: ${item.kontak}
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    } catch (error) {
        console.error("Gagal memuat detail galeri:", error);
    }
}