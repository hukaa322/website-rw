/**
 * Render Berita Landing Page
 */
document.addEventListener("DOMContentLoaded", () => {
    // Jalankan fungsi check dengan interval pendek sampai elemen #newsContainer siap di DOM
    const checkContainer = setInterval(() => {
        const container = document.getElementById("newsContainer");
        if (container) {
            clearInterval(checkContainer); // Hentikan pengecekan berulang
            loadLandingNews(); // panggil fetch data
        }
    }, 100);
});

async function loadLandingNews() {
    const container = document.getElementById("newsContainer");
    if (!container) return;

    try {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748B;">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top: 0.5rem; font-weight: 600;">Memuat berita terbaru...</p>
            </div>`;

        // Ambil data berita dari endpoint publik
        const res = await window.apiFetch(window.API.BERITA.GET_PUBLIC);
        const response = await res.json();

        if (!res.ok || !response.success) {
            throw new Error(response.message || "Gagal mengambil data berita.");
        }

        renderLandingNews(response.data || []);
    } catch (err) {
        console.error("Error loading news:", err);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #DC3545;">
                <i class="fa-solid fa-circle-exclamation fa-2x"></i>
                <p style="margin-top: 0.5rem;">Gagal memuat berita: ${escapeHtml(err.message)}</p>
            </div>`;
    }
}

function renderLandingNews(beritaList) {
    const container = document.getElementById("newsContainer");

    if (!beritaList || beritaList.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #64748B;">
                <i class="fa-regular fa-folder-open fa-2x"></i>
                <p style="margin-top: 0.5rem;">Belum ada pengumuman atau berita terbaru.</p>
            </div>`;
        return;
    }

    const recentNews = beritaList.slice(0, 6);

    container.innerHTML = recentNews.map((item) => {
        const formattedDate = formatDate(item.tanggal);
        
        // Sesuaikan path folder aset gambar
        const imageUrl = item.foto_utama 
            ? (item.foto_utama.startsWith('http') ? item.foto_utama : `${window.API.BASE_URL}/assets/galery/rt/${item.foto_utama}`)
            : 'assets/img/default-news.jpg';

        return `
            <div class="news-card">
                <div class="news-slider slider-wrapper">
                    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.judul)}" class="slide-img active" onerror="this.src='assets/img/default-news.jpg'">
                </div>
                <div class="news-content">
                    <span class="category">${escapeHtml(item.kategori || 'Pengumuman')}</span>
                    <h3>${escapeHtml(item.judul)}</h3>
                    <p class="date"><i class="fa-regular fa-calendar"></i> ${formattedDate}</p>
                    <a href="detail-berita.html?id=${item.id}" class="read-more">
                        Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }).join("");
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
}

function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, function (m) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        }[m];
    });
}