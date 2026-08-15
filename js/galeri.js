document.addEventListener("DOMContentLoaded", () => {
    checkAndInitGaleri();
    observeGaleriContainer();
});

function checkAndInitGaleri() {
    // 1. Landing Page (#galeri)
    const galleryContainer = document.getElementById("galleryContainer");
    if (galleryContainer && !galleryContainer.dataset.initialized) {
        galleryContainer.dataset.initialized = "true";
        initLandingGaleri();
    }

    // 2. Halaman Galeri Lengkap (galery-lengkap.html)
    const fullGalleryContainer = document.getElementById("fullGalleryContainer");
    if (fullGalleryContainer && !fullGalleryContainer.dataset.initialized) {
        fullGalleryContainer.dataset.initialized = "true";
        initFullGaleriPage();
    }
}

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

// Render kartu galeri mengarah ke galery-detail.html dengan ID item
function renderGalleryCards(data) {
    return data.map(item => {
        const imgSrc = item.foto_utama 
            ? `${API.BASE_URL}/assets/galery/berita/${item.foto_utama}` 
            : 'assets/img/placeholder.jpg';

        let badgeClass = 'bg-primary';
        let labelKategori = 'UMKM Warga';
        
        if (item.kategori === 'kegiatan') {
            badgeClass = 'bg-success';
            labelKategori = 'Kegiatan RW';
        } else if (item.kategori === 'ikon' || item.kategori === 'warga') {
            badgeClass = 'bg-warning';
            labelKategori = 'Ikon Warga';
        }

        return `
            <div class="gallery-card" data-category="${item.kategori}">
                <div class="gallery-img-wrapper">
                    <a href="galery-detail.html?id=${item.id}" aria-label="${item.judul}">
                        <img src="${imgSrc}" alt="${item.judul}" loading="lazy">
                    </a>
                    <span class="gallery-badge ${badgeClass}">
                        ${labelKategori}
                    </span>
                </div>
                <div class="gallery-content">
                    <h4 class="gallery-title">
                        <a href="galery-detail.html?id=${item.id}">
                            ${item.judul}
                        </a>
                    </h4>
                    <p class="gallery-desc">
                        ${item.deskripsi || 'Tidak ada deskripsi tersedia.'}
                    </p>
                    <a href="galery-detail.html?id=${item.id}" class="gallery-btn-action">
                        <i class="fa-solid fa-circle-info"></i> Detail
                    </a>
                </div>
            </div>
        `;
    }).join('');
}

async function initLandingGaleri() {
    const galleryContainer = document.getElementById("galleryContainer");
    if (!galleryContainer) return;

    await fetchAndRenderGaleri("semua", galleryContainer);

    const filterBtns = galleryContainer.parentElement.querySelectorAll(".gallery-tab-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            filterBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            const category = this.getAttribute("data-category");
            fetchAndRenderGaleri(category, galleryContainer);
        });
    });
}

async function initFullGaleriPage() {
    const fullGalleryContainer = document.getElementById("fullGalleryContainer");
    if (!fullGalleryContainer) return;

    await fetchAndRenderGaleri("semua", fullGalleryContainer);

    const filterBtns = document.querySelectorAll(".gallery-tabs .gallery-tab-btn");
    filterBtns.forEach(btn => {
        btn.addEventListener("click", function() {
            filterBtns.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            const category = this.getAttribute("data-category");
            fetchAndRenderGaleri(category, fullGalleryContainer);
        });
    });
}

async function fetchAndRenderGaleri(category, targetElement) {
    if (!targetElement) return;

    try {
        targetElement.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted, #64748B);">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top:10px;">Memuat data galeri...</p>
            </div>
        `;

        const url = `${API.GALERI.GET_PUBLIC}?kategori=${category}`;
        const response = await apiFetch(url);
        const result = await response.json();

        if (!result.success || !result.data || result.data.length === 0) {
            targetElement.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted, #64748B);">
                    <i class="fa-solid fa-box-open fa-2x"></i>
                    <p style="margin-top:10px;">Belum ada foto galeri pada kategori ini.</p>
                </div>
            `;
            return;
        }

        targetElement.innerHTML = renderGalleryCards(result.data);

    } catch (error) {
        console.error("Gagal mengambil data galeri:", error);
        targetElement.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red; padding: 20px;">Gagal memuat data dari server.</div>`;
    }
}