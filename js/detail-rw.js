document.addEventListener("DOMContentLoaded", () => {
    initProfileRwLoader();
    fetchDetailRwPage();
});

/**
 * 1. Menampilkan Timeline Histori RW di Section Beranda (#profil-rw)
 */
function initProfileRwLoader() {
    const checkExist = setInterval(() => {
        const rwContainer = document.getElementById("rwContainer");
        if (rwContainer) {
            clearInterval(checkExist);
            fetchProfileRw(rwContainer);
        }
    }, 100);
}

async function fetchProfileRw(rwContainer) {
    try {
        const targetUrl = (window.API && window.API.RW) ? window.API.RW.GET_ALL : "http://localhost:3000/api/admin/rw";
        const fetcher = typeof window.apiFetch === "function" ? window.apiFetch : fetch;

        const response = await fetcher(targetUrl);
        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            rwContainer.innerHTML = "";

            result.data.forEach(item => {
                const isAktif = item.is_aktif == 1;
                const badgeStatus = isAktif 
                    ? `<span style="background: var(--primary-blue); color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">Aktif (${item.periode || 'Saat Ini'})</span>`
                    : `<span style="background: #94a3b8; color: white; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600;">Alumni / Histori</span>`;

                const fotoPath = item.foto_utama 
                    ? `assets/galery/rt/${item.foto_utama}` 
                    : `assets/img/default-avatar.png`;

                const timelineHtml = `
                    <div class="rw-timeline-item" style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: var(--shadow-sm); display: flex; gap: 20px; align-items: center;">
                        <img src="${fotoPath}" 
                             alt="${item.nama_ketua}" 
                             style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 2px solid var(--primary-blue);"
                             onerror="this.onerror=null; this.src='assets/img/default-avatar.png';">
                        <div>
                            <div style="margin-bottom: 5px;">${badgeStatus}</div>
                            <h4 style="margin: 5px 0; color: var(--primary-blue); font-size: 16px;">${item.nama_ketua || 'Belum diisi'}</h4>
                            <p style="margin: 0; color: var(--text-muted); font-size: 13px;">
                                <i class="fa-solid fa-calendar-days" style="margin-right: 5px;"></i> Masa Jabatan: ${item.periode || '-'}
                            </p>
                        </div>
                    </div>
                `;
                rwContainer.insertAdjacentHTML("beforeend", timelineHtml);
            });
        } else {
            rwContainer.innerHTML = `<p style="text-align: center; color: #718096; padding: 20px;">Belum ada data histori RW tersimpan.</p>`;
        }
    } catch (err) {
        console.error(">>> [ERROR PROFILE RW]:", err);
    }
}

/**
 * 2. Menampilkan Detail Kepengurusan RW & Histori Lengkap di Halaman detail-rw.html
 */
async function fetchDetailRwPage() {
    const rwDetailWrapper = document.getElementById("rwDetailWrapper");
    if (!rwDetailWrapper) return;

    try {
        const targetUrl = (window.API && window.API.RW) ? window.API.RW.GET_ALL : "http://localhost:3000/api/admin/rw";
        const fetcher = typeof window.apiFetch === "function" ? window.apiFetch : fetch;

        const response = await fetcher(targetUrl);
        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            // Ambil ketua aktif (is_aktif = 1), fallback ke data pertama jika tidak ada
            const ketuaAktif = result.data.find(d => d.is_aktif == 1) || result.data[0];
            const historiRw = result.data.filter(d => d.id !== ketuaAktif.id);

            const fotoAktifPath = ketuaAktif.foto_utama 
                ? `assets/galery/rt/${ketuaAktif.foto_utama}` 
                : `assets/img/default-avatar.png`;

            // Format Visi & Misi
            let visiMisiContent = '';
            if (ketuaAktif.visi_misi && ketuaAktif.visi_misi.trim() !== '') {
                const lines = ketuaAktif.visi_misi.split('\n').filter(l => l.trim() !== '');
                visiMisiContent = `
                    <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        <h4 style="color: var(--primary-blue); margin-bottom: 10px;">
                            <i class="fa-solid fa-bullseye"></i> Visi, Misi & Catatan Kepemimpinan:
                        </h4>
                        <ul style="color: var(--text-muted); padding-left: 20px; line-height: 1.8; list-style-type: disc;">
                            ${lines.map(line => `<li>${line}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            // Render Tampilan Utama
            rwDetailWrapper.innerHTML = `
                <!-- Card Ketua RW Aktif -->
                <div class="margin-bottom-30" style="background: white; padding: 35px 30px; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
                    <h3 style="color: var(--primary-blue); margin-bottom: 25px; text-align: center;">
                        <i class="fa-solid fa-user-shield"></i> Pengurus RW Masa Bakti ${ketuaAktif.periode || '-'}
                    </h3>
                    
                    <div style="display: flex; justify-content: center;">
                        <div class="member-card" style="text-align: center; background: #f8fafc; padding: 25px; border-radius: 12px; width: 100%; max-width: 320px; border: 1px solid #e2e8f0;">
                            <img src="${fotoAktifPath}" 
                                 alt="Ketua RW" 
                                 style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px auto; border: 3px solid var(--primary-blue);"
                                 onerror="this.onerror=null; this.src='assets/img/default-avatar.png';">
                            <h3 style="margin-bottom: 5px; color: var(--primary-blue);">${ketuaAktif.nama_ketua || 'Belum diisi'}</h3>
                            <h4 style="color: var(--text-muted); font-size: 14px; margin-bottom: 10px;">Ketua RW 05</h4>
                            <p style="margin: 0; color: var(--dark-text); font-weight: 600;">
                                <i class="fa-solid fa-phone" style="color: var(--accent-red); margin-right: 5px;"></i> Kontak: ${ketuaAktif.nomor_telepon || '-'}
                            </p>
                        </div>
                    </div>

                    ${visiMisiContent}
                </div>

                <!-- Histori Kepemimpinan RW -->
                <div class="margin-bottom-30">
                    <h3 style="color: var(--primary-blue); margin-bottom: 15px;">
                        <i class="fa-solid fa-clock-rotate-left"></i> Histori Ketua RW Dari Masa ke Masa
                    </h3>
                    <div style="background: white; padding: 25px; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
                        <ul style="line-height: 2.2; color: var(--text-muted); list-style-type: square; padding-left: 20px;">
                            <li style="color: var(--primary-blue); font-weight: bold;">
                                Periode ${ketuaAktif.periode || '-'}: ${ketuaAktif.nama_ketua} (Aktif Saat Ini)
                            </li>
                            ${historiRw.map(h => `
                                <li><strong>Periode ${h.periode || '-'}:</strong> ${h.nama_ketua}</li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `;
        } else {
            rwDetailWrapper.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 8px;">
                    <i class="fa-solid fa-folder-open fa-3x" style="color: #a0aec0; margin-bottom: 10px;"></i>
                    <p style="color: #4a5568;">Belum ada data detail RW yang tersedia di database.</p>
                </div>
            `;
        }
    } catch (err) {
        console.error(">>> [ERROR DETAIL RW PAGE]:", err);
    }
}