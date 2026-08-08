document.addEventListener("DOMContentLoaded", () => {
    initProfileRtLoader();
});

function initProfileRtLoader() {
    const checkExist = setInterval(() => {
        const rtContainer = document.getElementById("rtContainer");
        if (rtContainer) {
            clearInterval(checkExist);
            fetchProfileRt(rtContainer);
        }
    }, 100);
}

async function fetchProfileRt(rtContainer) {
    console.log(">>> [PROFILE RT] Mengambil data dari backend...");

    rtContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 0;">
            <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #007bff;"></i>
            <p style="margin-top: 10px; color: #6c757d;">Memuat data RT...</p>
        </div>
    `;

    try {
        const response = await apiFetch(API.RT.GET_ALL);
        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            rtContainer.innerHTML = "";

            result.data.forEach(item => {
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

                const cardHtml = `
                    <div class="member-card">
                        <div class="card-slider slider-wrapper">
                            ${imagesHtml}
                        </div>
                        <h3>RT ${noRt} / RW 05</h3>
                        <h4>${item.nama_ketua || 'Belum diisi'}</h4>
                        <p>
                            <i class="fa-solid fa-phone"></i> 
                            ${item.nomor_telepon ? formatPhone(item.nomor_telepon) : '-'}
                        </p>
                        <a href="detail-rt.html?id=${item.id}" class="btn btn-outline btn-sm margin-top-15">
                            Selengkapnya <i class="fa-solid fa-angle-right"></i>
                        </a>
                    </div>
                `;

                rtContainer.insertAdjacentHTML("beforeend", cardHtml);
            });

            initCardSliders();

        } else {
            rtContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: #f8f9fa; border-radius: 8px;">
                    <i class="fa-solid fa-folder-open fa-2x" style="color: #a0aec0; margin-bottom: 10px;"></i>
                    <p style="color: #4a5568; margin: 0;">Belum ada data RT yang tersedia.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error(">>> [ERROR PROFILE RT] Gagal mengambil data:", error);
        rtContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 30px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 8px;">
                <i class="fa-solid fa-triangle-exclamation fa-2x" style="color: #e53e3e; margin-bottom: 10px;"></i>
                <p style="color: #c53030; margin: 0;">Gagal terhubung ke server backend.</p>
            </div>
        `;
    }
}

function initCardSliders() {
    const sliders = document.querySelectorAll(".card-slider");

    sliders.forEach(slider => {
        const imgs = slider.querySelectorAll(".slide-img");
        if (imgs.length <= 1) return;

        let currentIndex = 0;

        setInterval(() => {
            imgs[currentIndex].classList.remove("active");
            currentIndex = (currentIndex + 1) % imgs.length;
            imgs[currentIndex].classList.add("active");
        }, 3000);
    });
}

function formatPhone(phone) {
    let cleaned = ('' + phone).replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
        return cleaned.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
    }
    return phone;
}