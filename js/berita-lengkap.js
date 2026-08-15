/**
 * Logic Arsip Berita Lengkap (Filter & Search)
 */
let allNewsData = [];
let currentCategory = "ALL";
let searchQuery = "";

document.addEventListener("DOMContentLoaded", () => {
    initArchiveNews();
    bindFilterEvents();
});

async function initArchiveNews() {
    const grid = document.getElementById("allNewsGrid");
    if (!grid) return;

    try {
        // Ambil data berita lewat endpoint publik
        const res = await window.apiFetch(window.API.BERITA.GET_PUBLIC);
        const response = await res.json();

        if (!res.ok || !response.success) {
            throw new Error(response.message || "Gagal mengambil data dari server.");
        }

        allNewsData = response.data || [];
        renderFilteredNews();
    } catch (err) {
        console.error("Error loading archive news:", err);
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #DC3545;">
                <i class="fa-solid fa-circle-exclamation fa-2x"></i>
                <p style="margin-top: 12px; font-weight: 600;">Gagal memuat arsip berita: ${escapeHtml(err.message)}</p>
            </div>`;
    }
}

// Filter data berdasarkan kategori dan pencarian kata kunci
function renderFilteredNews() {
    const grid = document.getElementById("allNewsGrid");
    if (!grid) return;

    const filtered = allNewsData.filter((item) => {
        const matchCategory = (currentCategory === "ALL") || (item.kategori === currentCategory);
        const matchSearch = (item.judul || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.isi_berita || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748B;">
                <i class="fa-regular fa-folder-open fa-3x" style="margin-bottom: 12px;"></i>
                <h3 style="font-size: 18px; color: #0F172A; margin-bottom: 4px;">Tidak ada berita ditemukan</h3>
                <p style="font-size: 14px;">Coba gunakan kata kunci pencarian lain atau ubah filter kategori.</p>
            </div>`;
        return;
    }

    const baseUrl = (window.API && window.API.BASE_URL) ? window.API.BASE_URL : '';

    grid.innerHTML = filtered.map((item) => {
        const formattedDate = new Date(item.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        // PERBAIKAN PATH: Diubah mengarah ke /assets/galery/berita/
        const imageUrl = item.foto_utama 
            ? (item.foto_utama.startsWith('http') ? item.foto_utama : `${baseUrl}/assets/galery/berita/${item.foto_utama}`)
            : 'assets/img/default-news.jpg';

        return `
            <div class="news-card">
                <img src="${escapeHtml(imageUrl)}" 
                     alt="${escapeHtml(item.judul)}" 
                     class="news-thumb" 
                     onerror="this.onerror=null; this.src='assets/galery/berita/${item.foto_utama}';">
                <div class="news-body">
                    <span class="news-category">${escapeHtml(item.kategori || "Pengumuman")}</span>
                    <h3 class="news-title">${escapeHtml(item.judul)}</h3>
                    <p class="news-date"><i class="fa-regular fa-calendar"></i> ${formattedDate}</p>
                    <a href="detail-berita.html?id=${item.id}" class="news-readmore">
                        Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
    }).join("");
}
// Event Listeners untuk Search dan Filter
function bindFilterEvents() {
    const searchInput = document.getElementById("searchInput");
    const categoryBtns = document.querySelectorAll("#categoryFilter .filter-btn");

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            renderFilteredNews();
        });
    }

    categoryBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            categoryBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.getAttribute("data-category");
            renderFilteredNews();
        });
    });
}

function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, (m) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
    }[m]));
}