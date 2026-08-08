// Data Layanan Warga Vireta 2
const dataLayanan = [
    {
        id: "pengantar",
        judul: "Surat Pengantar RW",
        kategori: "administrasi",
        icon: "fa-file-signature",
        deskripsi: "Untuk pembuatan KTP, KK, Surat Pindah, atau Keterangan Usaha. Bawa pengantar dari Ketua RT setempat ke Sekretariat RW.",
        waktu: "Proses 1 Hari Kerja"
    },
    {
        id: "iuran-kas",
        judul: "Pembayaran Iuran Warga",
        kategori: "iuran",
        icon: "fa-wallet",
        deskripsi: "Pembayaran iuran kebersihan, kebersihan lingkungan, dan kas bulanan RW 05 secara digital via Transfer/QRIS.",
        waktu: "Setiap Bulan (Tgl 1 - 10)"
    },
    {
        id: "posyandu",
        judul: "Posyandu & Lansia",
        kategori: "kesehatan",
        icon: "fa-heart-pulse",
        deskripsi: "Pemeriksaan tumbuh kembang balita dan kesehatan lansia diadakan rutin setiap hari Selasa pertama setiap bulan di Balai RW.",
        waktu: "Selasa Pertama / Bulan"
    },
    {
        id: "keamanan",
        judul: "Keamanan & Siskamling",
        kategori: "keamanan",
        icon: "fa-shield-halved",
        deskripsi: "Petugas pos ronda bertugas 24 jam. Jika terjadi keadaan darurat, hubungi Seksi Keamanan RW atau Ketua RT setempat.",
        waktu: "Layanan 24 Jam"
    }
];

// Fungsi Render Card Layanan ke DOM
function renderLayanan(kategori = "semua") {
    const grid = document.getElementById("layananGrid");
    if (!grid) return;

    // Filter data berdasarkan kategori
    const dataFiltered = kategori === "semua"
        ? dataLayanan
        : dataLayanan.filter(item => item.kategori === kategori);

    if (dataFiltered.length === 0) {
        grid.innerHTML = `<p class="text-center" style="grid-column: 1/-1; color: var(--text-muted);">Belum ada layanan pada kategori ini.</p>`;
        return;
    }

    // Render HTML Card Layanan
    grid.innerHTML = dataFiltered.map(item => `
        <div class="service-card">
            <div class="service-icon">
                <i class="fa-solid ${item.icon}"></i>
            </div>
            <h3>${item.judul}</h3>
            <p>${item.deskripsi}</p>
            <span><i class="fa-regular fa-clock"></i> ${item.waktu}</span>
            <a href="layanan.html?type=${item.id}" class="btn btn-primary width-100">
                Selengkapnya / Ajukan
            </a>
        </div>
    `).join("");
}

// Event Listener untuk Tombol Tab Filter Layanan
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("layanan-tab-btn")) {
        // Toggle Active Class Button
        document.querySelectorAll(".layanan-tab-btn").forEach(btn => btn.classList.remove("active"));
        e.target.classList.add("active");

        // Render sesuai kategori
        const kategori = e.target.getAttribute("data-category");
        renderLayanan(kategori);
    }
});

// Inisialisasi saat dokumen siap
window.addEventListener("DOMContentLoaded", () => {
    renderLayanan("semua");
});