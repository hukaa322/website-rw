// Data Dummy Galeri (Nanti bisa diganti dengan data dari database MySQL)
const dataGaleri = [
    {
        id: 1,
        judul: "Kuliner Khas Vireta",
        kategori: "umkm",
        deskripsi: "Produk makanan & minuman olahan warga RW 05",
        gambar: ["assets/img/umkm-1a.jpg", "assets/img/umkm-1b.jpg"]
    },
    {
        id: 2,
        judul: "Kerja Bakti Masal",
        kategori: "kegiatan",
        deskripsi: "Gotong royong membersihkan saluran air menjelang musim hujan",
        gambar: ["assets/img/berita-1a.jpg", "assets/img/berita-1b.jpg"]
    },
    {
        id: 3,
        judul: "Posyandu Lansia & Balita",
        kategori: "warga",
        deskripsi: "Pemeriksaan kesehatan rutin warga setiap bulan",
        gambar: ["assets/img/kegiatan-1.jpg"]
    },
    {
        id: 4,
        judul: "Kerajinan Tangan Daur Ulang",
        kategori: "umkm",
        deskripsi: "Kreativitas Ibu-ibu PKK mengolah sampah plastik",
        gambar: ["assets/img/umkm-2.jpg"]
    }
];

// Fungsi untuk Render Galeri ke DOM
function renderGaleri(kategori = "semua") {
    const container = document.getElementById("galleryContainer");
    if (!container) return;

    // Filter Data Berdasarkan Kategori
    const dataFiltered = kategori === "semua" 
        ? dataGaleri 
        : dataGaleri.filter(item => item.kategori === kategori);

    if (dataFiltered.length === 0) {
        container.innerHTML = `<p class="text-center" style="grid-column: 1/-1; color: var(--text-muted);">Belum ada galeri pada kategori ini.</p>`;
        return;
    }

    // Render HTML Card Galeri
    container.innerHTML = dataFiltered.map(item => `
        <div class="gallery-item">
            <div class="gallery-slider slider-wrapper">
                <img src="${item.gambar[0]}" alt="${item.judul}" class="slide-img active">
            </div>
            <div class="gallery-overlay">
                <h4>${item.judul}</h4>
                <p>${item.deskripsi}</p>
                <a href="galeri.html?kategori=${item.kategori}&id=${item.id}" class="btn btn-primary btn-sm margin-top-10">
                    Selengkapnya
                </a>
            </div>
        </div>
    `).join("");
}

// Event Listener untuk Tombol Tab Filtering
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("gallery-tab-btn")) {
        // Toggle Class Active
        document.querySelectorAll(".gallery-tab-btn").forEach(btn => btn.classList.remove("active"));
        e.target.classList.add("active");

        // Filter Galeri
        const kategori = e.target.getAttribute("data-category");
        renderGaleri(kategori);
    }
});

// Jalankan saat dokumen dimuat
window.addEventListener("DOMContentLoaded", () => {
    renderGaleri("semua");
});