document.addEventListener("DOMContentLoaded", () => {
    loadDetailBerita();
});

async function loadDetailBerita() {
    const wrapper = document.getElementById("detailNewsWrapper");
    if (!wrapper) return;

    // Ambil ID berita dari parameter URL (?id=...)
    const urlParams = new URLSearchParams(window.location.search);
    const beritaId = urlParams.get("id");

    if (!beritaId) {
        wrapper.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <i class="fa-solid fa-circle-exclamation fa-3x" style="color: #DC3545; margin-bottom: 12px;"></i>
                <h3 style="font-size: 18px; color: #0F172A; margin-bottom: 6px;">ID Berita Tidak Ditemukan</h3>
                <p style="color: #64748B; font-size: 14px;">Pastikan Anda mengakses berita melalui halaman utama.</p>
            </div>`;
        return;
    }

    try {
        // Ambil data berita dari endpoint publik
        const res = await window.apiFetch(window.API.BERITA.GET_PUBLIC);
        const response = await res.json();

        if (!res.ok || !response.success) {
            throw new Error(response.message || "Gagal mengambil data dari server.");
        }

        // Cari item berdasarkan ID
        const item = (response.data || []).find((b) => String(b.id) === String(beritaId));

        if (!item) {
            wrapper.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <i class="fa-regular fa-folder-open fa-3x" style="color: #64748B; margin-bottom: 12px;"></i>
                    <h3 style="font-size: 18px; color: #0F172A; margin-bottom: 6px;">Berita Tidak Ditemukan</h3>
                    <p style="color: #64748B; font-size: 14px;">Berita ini mungkin telah dihapus atau tidak tersedia.</p>
                </div>`;
            return;
        }

        // Format Tanggal
        const formattedDate = new Date(item.tanggal).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        // URL Gambar Utama
        const imageUrl = item.foto_utama 
            ? (item.foto_utama.startsWith('http') ? item.foto_utama : `${window.API.BASE_URL}/assets/galery/rt/${item.foto_utama}`)
            : null;

        // Render HTML Artikel Modern
        wrapper.innerHTML = `
            <!-- Header Artikel -->
            <span class="article-badge">${escapeHtml(item.kategori || "Pengumuman")}</span>
            <h1 class="article-title">${escapeHtml(item.judul)}</h1>
            
            <div class="article-meta">
                <span><i class="fa-regular fa-calendar" style="margin-right: 6px;"></i>${formattedDate}</span>
                <span>•</span>
                <span><i class="fa-regular fa-building" style="margin-right: 6px;"></i>RW 05 Vireta 2</span>
            </div>

            <!-- Gambar Utama -->
            ${imageUrl ? `
                <div class="article-cover-wrapper">
                    <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(item.judul)}" class="article-cover-img" onerror="this.parentElement.style.display='none'">
                </div>
            ` : ''}

            <!-- Isi Berita -->
            <div class="article-body">
                ${escapeHtml(item.isi_berita || "Tidak ada detail isi berita yang disampaikan.")}
            </div>

            <!-- Footer Artikel & Tombol Bagikan -->
            <div class="article-footer">
                <span style="font-size: 13px; font-weight: 600; color: #64748B;">Bagikan informasi ini:</span>
                <div class="share-buttons">
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(item.judul + ' - ' + window.location.href)}" target="_blank" class="btn-share" title="Bagikan ke WhatsApp">
                        <i class="fa-brands fa-whatsapp"></i>
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank" class="btn-share" title="Bagikan ke Facebook">
                        <i class="fa-brands fa-facebook-f"></i>
                    </a>
                    <a href="javascript:void(0)" onclick="navigator.clipboard.writeText(window.location.href); alert('Link berita berhasil disalin!');" class="btn-share" title="Salin Link">
                        <i class="fa-solid fa-link"></i>
                    </a>
                </div>
            </div>
        `;
    } catch (err) {
        console.error("Error loading detail news:", err);
        wrapper.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #DC3545;">
                <i class="fa-solid fa-circle-exclamation fa-2x"></i>
                <p style="margin-top: 12px; font-weight: 600;">Gagal memuat berita: ${escapeHtml(err.message)}</p>
            </div>`;
    }
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