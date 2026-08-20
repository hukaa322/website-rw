let currentGaleriKategori = 'umkm';
let allGaleriData = [];

// Expose modul ke global window untuk admin-router.js
window.GaleriModule = {
    init: function() {
        currentGaleriKategori = 'umkm';
        loadGaleriData();
    }
};

// Konfigurasi dinamis teks per kategori
const galeriConfig = {
    'umkm': {
        tabTitle: 'Daftar UMKM Warga',
        btnTambah: 'Tambah UMKM',
        thJudul: 'Nama UMKM',
        thKontak: 'Kontak WA',
        thDeskripsi: 'Deskripsi Usaha',
        labelJudul: 'Nama Usaha / UMKM',
        placeholderJudul: 'Contoh: Warung Berkah, Laundry 88',
        labelKontak: 'No. WhatsApp / Kontak',
        placeholderKontak: 'Contoh: 081234567890',
        labelDeskripsi: 'Deskripsi Produk / Usaha',
        placeholderDeskripsi: 'Jelaskan produk atau layanan yang ditawarkan...'
    },
    'kegiatan': {
        tabTitle: 'Dokumentasi Kegiatan RW',
        btnTambah: 'Upload Foto Kegiatan',
        thJudul: 'Nama Kegiatan',
        thKontak: 'Tanggal / Lokasi',
        thDeskripsi: 'Keterangan Acara',
        labelJudul: 'Nama Kegiatan / Acara',
        placeholderJudul: 'Contoh: Kerja Bakti Massal RW 05, Senam Sehat',
        labelKontak: 'Tanggal & Lokasi Acara',
        placeholderKontak: 'Contoh: Lapangan RW 05 / 17 Agustus 2026',
        labelDeskripsi: 'Keterangan Kegiatan',
        placeholderDeskripsi: 'Tuliskan rangkuman jalannya kegiatan...'
    },
    'ikon': {
        tabTitle: 'Ikon & Landmark Desa',
        btnTambah: 'Tambah Ikon Tempat',
        thJudul: 'Nama Tempat / Landmark',
        thKontak: 'Lokasi / Alamat',
        thDeskripsi: 'Deskripsi Tempat',
        labelJudul: 'Nama Tempat / Fasilitas / Landmark',
        placeholderJudul: 'Contoh: Gapura Utama Desa, Balai Pertemuan RW, Taman Pintar',
        labelKontak: 'Lokasi / Titik Alamat',
        placeholderKontak: 'Contoh: Jl. Utama RT 02 / Samping Balai Warga',
        labelDeskripsi: 'Deskripsi & Keunikan Tempat',
        placeholderDeskripsi: 'Jelaskan fungsi, daya tarik, atau sejarah singkat ikon tempat ini...'
    }
};

// Fungsi Ganti Tab
function switchGaleriTab(kategori, btnElement) {
    currentGaleriKategori = kategori;
    
    // Ganti class active pada tombol pill
    document.querySelectorAll('.gallery-pill-filter .pill-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    // Update Label & Header Tabel
    const conf = galeriConfig[kategori];
    const tabTitle = document.getElementById('galeri-tab-title');
    const labelBtn = document.getElementById('label-btn-tambah');
    const thJudul = document.getElementById('th-judul');
    const thKontak = document.getElementById('th-kontak');
    const thDeskripsi = document.getElementById('th-deskripsi');

    if (tabTitle) tabTitle.innerText = conf.tabTitle;
    if (labelBtn) labelBtn.innerText = conf.btnTambah;
    if (thJudul) thJudul.innerText = conf.thJudul;
    if (thKontak) thKontak.innerText = conf.thKontak;
    if (thDeskripsi) thDeskripsi.innerText = conf.thDeskripsi;

    loadGaleriData();
}

// Load Data Galeri
async function loadGaleriData() {
    const tbody = document.getElementById('galeri-table-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>`;

    try {
        if (!window.API || !window.API.GALERI || !window.API.GALERI.GET_ALL) {
            console.error("API.GALERI.GET_ALL belum terdefinisi di api.js!");
            return;
        }

        const response = await apiFetch(window.API.GALERI.GET_ALL);
        const result = await response.json();

        if (result.success) {
            // Filter data berdasarkan tab kategori yang aktif
            allGaleriData = (result.data || []).filter(item => item.kategori === currentGaleriKategori);
            renderGaleriTable(allGaleriData);
        } else {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--danger-color);">${result.message}</td></tr>`;
        }
    } catch (err) {
        console.error("Error loadGaleriData:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--danger-color);">Gagal memuat data galeri.</td></tr>`;
    }
}

// Render Tabel Galeri
function renderGaleriTable(data) {
    const tbody = document.getElementById('galeri-table-body');
    const totalElem = document.getElementById('galeri-total-count');
    
    if (!tbody) return;
    if (totalElem) totalElem.innerText = `${data.length} Data`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada data pada kategori ini.</td></tr>`;
        return;
    }

    const baseUrl = (window.API && window.API.BASE_URL) ? window.API.BASE_URL : 'http://localhost:3000';

    tbody.innerHTML = data.map(item => {
        const primaryImgUrl = `${baseUrl}/assets/galery/berita/${item.foto_utama}`;
        const fallbackImgUrl1 = `${baseUrl}/assets/galery/rt/${item.foto_utama}`;
        const fallbackImgUrl2 = `../assets/galery/berita/${item.foto_utama}`;

        return `
            <tr>
                <td>
                    ${item.foto_utama 
                        ? `<img src="${primaryImgUrl}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;" onerror="this.onerror=null; this.src='${fallbackImgUrl1}'; this.onerror=function(){this.src='${fallbackImgUrl2}';};">` 
                        : '<span style="color:#aaa; font-size:12px;">Tanpa Foto</span>'}
                </td>
                <td><strong>${escapeHtml(item.judul)}</strong></td>
                <td>${escapeHtml(item.deskripsi || '-')}</td>
                <td>${escapeHtml(item.kontak || '-')}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-secondary" onclick="editGaleri(${item.id})">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-secondary" style="color:var(--danger-color);" onclick="deleteGaleriData(${item.id})">
                        <i class="fa-solid fa-trash"></i> Hapus
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Buka Modal (Form Menyesuaikan Kategori Tab)
function openGaleriModal(editData = null) {
    const form = document.getElementById('formGaleri');
    if (form) form.reset();

    const conf = galeriConfig[currentGaleriKategori];
    const isEdit = !!editData;

    // Set Hidden Inputs
    document.getElementById('galeriId').value = editData ? editData.id : '';
    document.getElementById('galeriKategori').value = currentGaleriKategori;

    // Set Title Modal
    document.getElementById('modalGaleriTitle').innerHTML = isEdit 
        ? `<i class="fa-solid fa-pen-to-square"></i> Edit ${conf.labelJudul}`
        : `<i class="fa-solid fa-plus"></i> Tambah ${conf.labelJudul}`;

    // Sesuaikan Label & Placeholder Input
    const labelJudul = document.getElementById('formLabelJudul');
    const inputJudul = document.getElementById('galeriJudul');
    const labelKontak = document.getElementById('formLabelKontak');
    const inputKontak = document.getElementById('galeriKontak');
    const labelDeskripsi = document.getElementById('formLabelDeskripsi');
    const inputDeskripsi = document.getElementById('galeriDeskripsi');

    labelJudul.innerHTML = `${conf.labelJudul} <span style="color:var(--danger-color)">*</span>`;
    inputJudul.placeholder = conf.placeholderJudul;
    labelKontak.innerText = conf.labelKontak;
    inputKontak.placeholder = conf.placeholderKontak;
    labelDeskripsi.innerText = conf.labelDeskripsi;
    inputDeskripsi.placeholder = conf.placeholderDeskripsi;

    // Isi Nilai jika sedang Edit
    if (editData) {
        inputJudul.value = editData.judul || '';
        inputKontak.value = editData.kontak || '';
        inputDeskripsi.value = editData.deskripsi || '';
    }

    document.getElementById('galeriModal').style.display = 'flex';
}

function closeGaleriModal() {
    const modal = document.getElementById('galeriModal');
    if (modal) modal.style.display = 'none';
}

// Konversi Gambar ke WebP
async function convertToWebP(file, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                        const webpFileName = `${originalName}.webp`;
                        const convertedFile = new File([blob], webpFileName, {
                            type: "image/webp",
                            lastModified: Date.now()
                        });
                        resolve(convertedFile);
                    } else {
                        reject(new Error("Gagal konversi WebP"));
                    }
                }, "image/webp", quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// Submit Form Simpan Data
async function handleGaleriSubmit(event) {
    event.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitGaleri');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;

    const formData = new FormData();
    formData.append("id", document.getElementById('galeriId').value);
    formData.append("kategori", document.getElementById('galeriKategori').value);
    formData.append("judul", document.getElementById('galeriJudul').value);
    formData.append("kontak", document.getElementById('galeriKontak').value);
    formData.append("deskripsi", document.getElementById('galeriDeskripsi').value);

    try {
        const fileInput = document.getElementById('galeriFoto');
        if (fileInput && fileInput.files.length > 0) {
            const webpFile = await convertToWebP(fileInput.files[0]);
            formData.append("foto_utama", webpFile);
        }

        const response = await apiFetch(window.API.GALERI.SAVE, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            closeGaleriModal();
            loadGaleriData();
        } else {
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        alert("Terjadi kesalahan koneksi atau upload gambar.");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Data`;
    }
}

// Edit & Hapus
function editGaleri(id) {
    const item = allGaleriData.find(d => d.id === id);
    if (!item) return;
    openGaleriModal(item);
}

async function deleteGaleriData(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
        const response = await apiFetch(window.API.GALERI.DELETE(id), { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            loadGaleriData();
        } else {
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        alert("Terjadi kesalahan saat menghapus data.");
    }
}

// Pencarian
function filterGaleriTable() {
    const searchInput = document.getElementById('searchGaleri');
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase();
    const filtered = allGaleriData.filter(item => 
        (item.judul && item.judul.toLowerCase().includes(query)) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(query)) ||
        (item.kontak && item.kontak.toLowerCase().includes(query))
    );
    renderGaleriTable(filtered);
}

function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, function (m) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m];
    });
}

// Expose ke global window
window.switchGaleriTab = switchGaleriTab;
window.openGaleriModal = openGaleriModal;
window.closeGaleriModal = closeGaleriModal;
window.handleGaleriSubmit = handleGaleriSubmit;
window.editGaleri = editGaleri;
window.deleteGaleriData = deleteGaleriData;
window.filterGaleriTable = filterGaleriTable;
window.loadGaleriData = loadGaleriData;