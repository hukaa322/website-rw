let allLayananLandingData = [];

async function initLayananLanding() {
    const gridContainer = document.getElementById("layananGrid");
    if (!gridContainer) return;

    try {
        const endpoint = (window.API && window.API.LAYANAN) 
            ? window.API.LAYANAN.GET_PUBLIC 
            : "http://localhost:3000/api/public/layanan";

        const response = await fetch(endpoint);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
            allLayananLandingData = result.data;
            renderLayananGrid(allLayananLandingData, "semua");
            setupTabFilters();
        } else {
            showEmptyState("Gagal memuat data layanan.");
        }
    } catch (error) {
        console.error("Error fetching landing layanan:", error);
        showEmptyState("Terjadi kesalahan koneksi server.");
    }
}

function setupTabFilters() {
    const tabButtons = document.querySelectorAll(".layanan-tab-btn");
    
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const category = button.getAttribute("data-category");
            
            let filteredData = allLayananLandingData;
            if (category === "administrasi") {
                filteredData = allLayananLandingData.filter(item => item.jenis_layanan === "surat");
            } else if (category === "iuran") {
                filteredData = allLayananLandingData.filter(item => item.jenis_layanan === "iuran");
            } else if (category === "kesehatan" || category === "keamanan") {
                filteredData = allLayananLandingData.filter(item => item.jenis_layanan === "layanan");
            }

            renderLayananGrid(filteredData, category);
        });
    });
}

function generateWaUrl(phone, namaKegiatan) {
    let cleanPhone = (phone || "").replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
        cleanPhone = "62" + cleanPhone.slice(1);
    }
    const message = encodeURIComponent(`Halo, saya ingin mengajukan/bertanya mengenai: ${namaKegiatan}`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
}

function renderLayananGrid(dataList, category) {
    const gridContainer = document.getElementById("layananGrid");
    if (!gridContainer) return;

    if (!dataList || dataList.length === 0) {
        showEmptyState("Belum ada data layanan untuk kategori ini.");
        return;
    }

    gridContainer.innerHTML = dataList.map(item => {
        const waUrl = generateWaUrl(item.nomor_telepon, item.nama_kegiatan);
        
        let iconClass = "fa-file-signature";
        let categoryBadge = "Surat & Administrasi";
        
        if (item.jenis_layanan === "iuran") {
            iconClass = "fa-receipt";
            categoryBadge = "Iuran Warga";
        } else if (item.jenis_layanan === "layanan") {
            iconClass = "fa-calendar-check";
            categoryBadge = "Jadwal Layanan";
        }

        const imagePath = item.gambar_umum 
            ? `assets/galery/layanan/${item.gambar_umum}`
            : (item.gambar_qris ? `assets/galery/layanan/${item.gambar_qris}` : null);

        return `
            <div class="layanan-card">
                ${imagePath ? `
                    <div class="card-image-wrapper">
                        <img src="${imagePath}" alt="${item.nama_kegiatan}" loading="lazy">
                    </div>
                ` : ''}
                <div class="card-content">
                    <div class="card-badges">
                        <span class="badge badge-category"><i class="fa-solid ${iconClass}"></i> ${categoryBadge}</span>
                        <span class="badge badge-target">${item.target_wilayah}</span>
                    </div>
                    <h3 class="card-title">${item.nama_kegiatan}</h3>
                    <p class="card-description">${item.keterangan || 'Silakan hubungi pengurus RT/RW terkait melalui WhatsApp.'}</p>
                    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa">
                        <i class="fa-brands fa-whatsapp"></i> Ajukan Via WA (${item.nomor_telepon})
                    </a>
                </div>
            </div>
        `;
    }).join("");
}

function showEmptyState(message) {
    const gridContainer = document.getElementById("layananGrid");
    if (gridContainer) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #64748B;">
                <i class="fa-solid fa-folder-open fa-2x"></i>
                <p style="margin-top: 10px; font-weight: 500;">${message}</p>
            </div>
        `;
    }
}

// PERBAIKAN UTAMA: Polling aman menunggu elemen #layananGrid siap di DOM
function checkAndInitLayanan() {
    if (document.getElementById("layananGrid")) {
        initLayananLanding();
    } else {
        setTimeout(checkAndInitLayanan, 100);
    }
}

document.addEventListener("DOMContentLoaded", checkAndInitLayanan);