/**
 * Logic Section Pengumuman & Berita (Landing Page Utama)
 */

// Jalankan saat DOM SIAP (jika elemen sudah ada langsung)
// document.addEventListener("DOMContentLoaded", () => {
//     loadHomeNews();
// });

async function loadHomeNews() {
    const newsContainer = document.getElementById("newsContainer");
    if (!newsContainer) return;

    try {
        newsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #64748B;">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top: 12px; font-weight: 600;">
                    Memuat berita terbaru...
                </p>
            </div>
        `;

        const res = await window.apiFetch(window.API.BERITA.GET_PUBLIC);
        const response = await res.json();

        if (!res.ok || !response.success) {
            throw new Error(response.message || "Gagal mengambil data dari server.");
        }

        const dataList = response.data || [];

        if (dataList.length === 0) {
            newsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #64748B;">
                    <i class="fa-regular fa-folder-open fa-2x" style="margin-bottom: 8px;"></i>
                    <p style="font-weight: 600;">
                        Belum ada berita atau pengumuman yang dipublikasikan.
                    </p>
                </div>
            `;
            return;
        }

        const latestNews = dataList.slice(0, 6);
        const backendUrl = (window.API && window.API.BASE_URL) 
            ? window.API.BASE_URL 
            : "http://localhost:3000";

        const fallbackImage = "https://placehold.co/600x400/00468B/FFFFFF?text=Berita+Vireta+2";

        newsContainer.innerHTML = latestNews.map((item) => {
            const formattedDate = new Date(item.tanggal).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });

            let imageUrl = "";
            if (item.foto_utama) {
                const foto = String(item.foto_utama).trim();
                if (/^https?:\/\//i.test(foto)) {
                    imageUrl = foto;
                } else if (foto.startsWith("/")) {
                    imageUrl = `${backendUrl}${foto}`;
                } else if (foto.startsWith("assets/")) {
                    imageUrl = `${backendUrl}/${foto}`;
                } else {
                    imageUrl = `${backendUrl}/assets/galery/berita/${foto}`;
                }
            } else {
                imageUrl = fallbackImage;
            }

            const imgElement = `
                <img
                    src="${escapeHtml(imageUrl)}"
                    alt="${escapeHtml(item.judul)}"
                    class="news-thumb"
                    style="width: 100%; height: 200px; object-fit: cover; display: block;"
                    loading="lazy"
                    onerror="this.onerror=null; this.src='${fallbackImage}';"
                >
            `;

            return `
                <div class="news-card">
                    <a href="detail-berita.html?id=${item.id}" style="text-decoration: none; color: inherit; display: block;">
                        ${imgElement}
                    </a>

                    <div class="news-body">
                        <span class="news-category">
                            ${escapeHtml(item.kategori || "Pengumuman")}
                        </span>

                        <h3 class="news-title">
                            <a href="detail-berita.html?id=${item.id}" style="text-decoration: none; color: inherit;">
                                ${escapeHtml(item.judul)}
                            </a>
                        </h3>

                        <p class="news-date">
                            <i class="fa-regular fa-calendar"></i>
                            ${formattedDate}
                        </p>

                        <a href="detail-berita.html?id=${item.id}" class="news-readmore">
                            Selengkapnya
                            <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join("");

    } catch (err) {
        console.error("Error loading home news:", err);
        newsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #DC3545;">
                <i class="fa-solid fa-circle-exclamation fa-2x"></i>
                <p style="margin-top: 12px; font-weight: 600;">
                    Gagal memuat berita: ${escapeHtml(err.message)}
                </p>
            </div>
        `;
    }
}

function escapeHtml(str) {
    return (str || "").replace(
        /[&<>"']/g,
        (m) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[m])
    );
}