async function initDetailGaleriPage() {
    // Gunakan container baru untuk halaman galeri full
    const fullGalleryContainer = document.getElementById("fullGalleryContainer");
    if (!fullGalleryContainer) return; // Skip jika bukan di halaman galeri.html

    try {
        const response = await apiFetch(`${API.GALERI.GET_PUBLIC}`);
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            fullGalleryContainer.innerHTML = result.data.map(item => {
                // PATH SUDAH DIPERBAIKI KE /berita/
                const imgSrc = item.foto_utama 
                    ? `${API.BASE_URL}/assets/galery/berita/${item.foto_utama}` 
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
                        <div class="gallery-content" style="padding: 16px; background: white;">
                            <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">${item.judul}</h4>
                            <p style="font-size: 13px; color: var(--text-muted, #64748B); line-height: 1.5; margin-bottom: 12px;">
                                ${item.deskripsi || 'Tidak ada deskripsi tersedia.'}
                            </p>
                            ${item.kontak ? `
                                <a href="https://wa.me/${item.kontak.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-sm btn-primary" style="font-size: 12px; width: 100%; text-align: center; display: block;">
                                    <i class="fa-brands fa-whatsapp"></i> Hubungi Penjual
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error("Gagal memuat detail galeri:", error);
        fullGalleryContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red;">Gagal memuat data galeri.</div>`;
    }
}