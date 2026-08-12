document.addEventListener("DOMContentLoaded", () => {
    fetchDetailRt();
});

async function fetchDetailRt() {
    const detailContainer = document.getElementById("rtDetailCard");
    if (!detailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const rtId = urlParams.get("id");

    if (!rtId) {
        detailContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; width: 100%;">
                <i class="fa-solid fa-triangle-exclamation fa-3x" style="color: #e53e3e;"></i>
                <p style="margin-top: 15px; color: #4a5568;">ID RT tidak ditemukan pada URL.</p>
                <a href="index.html" class="btn btn-primary margin-top-15">Kembali ke Beranda</a>
            </div>
        `;
        return;
    }

    try {
        const response = await apiFetch(API.RT.GET_ALL);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            const item = result.data.find(d => String(d.id) === String(rtId));

            if (!item) {
                detailContainer.innerHTML = `
                    <div style="text-align: center; padding: 40px; width: 100%;">
                        <p style="color: #4a5568;">Data RT tidak ditemukan.</p>
                    </div>
                `;
                return;
            }

            const noRt = String(item.nomor_rt).padStart(2, '0');

            let images = [];
            if (Array.isArray(item.foto) && item.foto.length > 0) {
                images = item.foto;
            } else {
                if (item.foto_utama) images.push(item.foto_utama);
                if (item.foto_2) images.push(item.foto_2);
                if (item.foto_3) images.push(item.foto_3);
                if (item.foto_kegiatan) images.push(item.foto_kegiatan);
            }

            if (images.length === 0) images.push('default-avatar.png');

            const imagesHtml = images.map((imgName, index) => {
                const isDefault = imgName === 'default-avatar.png';
                const src = isDefault ? `assets/img/${imgName}` : `assets/galery/rt/${imgName}`;
                const activeClass = index === 0 ? 'active' : '';

                return `
                    <img src="${src}" 
                         alt="Foto RT ${noRt}" 
                         class="slide-img ${activeClass}" 
                         onerror="this.onerror=null; this.src='assets/img/default-avatar.png';">
                `;
            }).join("");

            const sliderControlsHtml = images.length > 1 ? `
                <div class="slider-controls">
                    <button class="prev-slide" id="prevBtn"><i class="fa-solid fa-chevron-left"></i></button>
                    <button class="next-slide" id="nextBtn"><i class="fa-solid fa-chevron-right"></i></button>
                </div>
            ` : '';

            let ringkasanListHtml = '';
            if (item.ringkasan && item.ringkasan.trim() !== '') {
                const lines = item.ringkasan.split('\n').filter(line => line.trim() !== '');
                ringkasanListHtml = lines.map(line => `<li>${line}</li>`).join('');
            } else {
                ringkasanListHtml = `
                    <li>Penataan Pos Kamling dan jadwal ronda malam.</li>
                    <li>Pengelolaan kebersihan lingkungan dan pemilahan sampah.</li>
                    <li>Pendataan ulang administrasi warga.</li>
                `;
            }

            const cakupanWilayah = `Wilayah RT ${noRt} / RW 11`;

            detailContainer.innerHTML = `
                <div class="slider-wrapper about-slider" id="detailSlider">
                    ${imagesHtml}
                    ${sliderControlsHtml}
                </div>

                <div class="about-info">
                    <span class="category" style="background: var(--primary-blue); color: white; padding: 6px 14px; border-radius: 20px; font-size: 12px;">
                        RT ${noRt} / RW 11
                    </span>
                    <h3 style="margin-top: 15px; color: var(--primary-blue);">${item.nama_ketua || 'Belum diisi'}</h3>
                    
                    <p style="color: var(--dark-text); font-weight: 600; margin-bottom: 10px;">
                        <i class="fa-solid fa-phone" style="color: var(--accent-red);"></i> Kontak: ${item.nomor_telepon ? formatPhone(item.nomor_telepon) : '-'}
                    </p>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        Masa Jabatan: ${item.masa_jabatan || '2024 - 2027'}<br>
                        Cakupan Wilayah: ${cakupanWilayah}
                    </p>

                    <h4 style="color: var(--dark-text); margin-bottom: 10px;">Ringkasan & Program Kerja RT:</h4>
                    <ul style="color: var(--text-muted); padding-left: 20px; margin-bottom: 25px; list-style-type: disc;">
                        ${ringkasanListHtml}
                    </ul>
                </div>
            `;

            if (images.length > 1) {
                setupManualSlider();
            }
        }
    } catch (err) {
        console.error(">>> [ERROR DETAIL RT]:", err);
    }
}

function setupManualSlider() {
    const slider = document.getElementById("detailSlider");
    if (!slider) return;

    const imgs = slider.querySelectorAll(".slide-img");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    let currentIndex = 0;

    function showSlide(index) {
        imgs.forEach((img, i) => {
            img.classList.toggle("active", i === index);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % imgs.length;
            showSlide(currentIndex);
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + imgs.length) % imgs.length;
            showSlide(currentIndex);
        });
    }
}

function formatPhone(phone) {
    let cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
    }
    return phone;
}

async function fetchLandingRt() {
    const rtContainer = document.getElementById("rtContainer");
    if (!rtContainer) return; // Keluar jika bukan di index.html

    // Tampilkan Spinner/Loading
    rtContainer.innerHTML = `
        <div style="text-align: center; padding: 30px 0; grid-column: 1 / -1;">
            <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #007bff;"></i>
            <p style="margin-top: 10px; color: #6c757d;">Memuat profil RT...</p>
        </div>
    `;

    try {
        const fetcher = typeof window.apiFetch === "function" ? window.apiFetch : fetch;
        const targetUrl = (window.API && window.API.RT) ? window.API.RT.GET_ALL : "http://localhost:3000/api/admin/rt";

        const response = await fetcher(targetUrl);
        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            rtContainer.innerHTML = ""; // Bersihkan loading

            result.data.forEach(item => {
                const noRt = String(item.nomor_rt).padStart(2, '0');
                
                // Gambar/Foto
                const foto = item.foto_utama 
                    ? `assets/galery/rt/${item.foto_utama}` 
                    : `assets/img/default-avatar.png`;

                const rtCardHtml = `
                    <div class="rt-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.1)); text-align: center;">
                        <img src="${foto}" 
                             alt="Ketua RT ${noRt}" 
                             style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; margin: 0 auto 15px; border: 3px solid var(--primary-blue, #007bff);"
                             onerror="this.onerror=null; this.src='assets/img/default-avatar.png';">
                        <span style="background: var(--primary-blue, #007bff); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            RT ${noRt}
                        </span>
                        <h3 style="margin: 10px 0 5px; color: #2d3748; font-size: 18px;">${item.nama_ketua || 'Belum diisi'}</h3>
                        <p style="color: #718096; font-size: 13px; margin-bottom: 15px;">
                            <i class="fa-solid fa-phone" style="color: #e53e3e;"></i> ${item.nomor_telepon || '-'}
                        </p>
                        <a href="detail-rt.html?id=${item.id}" class="btn btn-outline" style="display: inline-block; padding: 8px 16px; border: 1px solid #007bff; color: #007bff; border-radius: 6px; text-decoration: none; font-size: 13px;">
                            Lihat Profil
                        </a>
                    </div>
                `;
                rtContainer.insertAdjacentHTML("beforeend", rtCardHtml);
            });
        } else {
            rtContainer.innerHTML = `<p style="text-align: center; color: #718096; grid-column: 1 / -1;">Belum ada data RT yang tersedia.</p>`;
        }
    } catch (err) {
        console.error(">>> [ERROR LANDING RT]:", err);
        rtContainer.innerHTML = `<p style="text-align: center; color: #e53e3e; grid-column: 1 / -1;">Gagal memuat data RT.</p>`;
    }
}