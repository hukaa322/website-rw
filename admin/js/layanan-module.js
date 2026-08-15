let currentJenisLayanan = 'surat';
let allLayananData = [];

// Expose modul ke global window agar dipanggil admin-router.js
window.LayananModule = {
    init: function() {
        currentJenisLayanan = 'surat';
        loadLayananData();
    }
};

// Transisi Tab
function switchTab(jenis, btnElement) {
    currentJenisLayanan = jenis;
    
    document.querySelectorAll('.gallery-pill-filter .pill-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const titles = {
        'surat': 'Daftar Layanan Surat Administrasi',
        'iuran': 'Daftar Informasi Pembayaran Iuran',
        'layanan': 'Daftar Jadwal Kesehatan & Keamanan'
    };
    
    const titleElem = document.getElementById('tab-title');
    if (titleElem) titleElem.innerText = titles[jenis] || 'Daftar Layanan';

    loadLayananData();
}

function formatWaLink(phone, namaKegiatan) {
    let clean = (phone || '').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    const msg = encodeURIComponent(`Halo, saya ingin mengajukan / bertanya mengenai: ${namaKegiatan}`);
    return `https://wa.me/${clean}?text=${msg}`;
}

// Load Data
async function loadLayananData() {
    const tbody = document.getElementById('layanan-table-body');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data...</td></tr>`;

    try {
        if (!window.API || !window.API.LAYANAN) {
            console.error("API.LAYANAN belum dikonfigurasi di api.js!");
            return;
        }

        const response = await apiFetch(`${window.API.LAYANAN.GET_ALL}?jenis_layanan=${currentJenisLayanan}`);
        const result = await response.json();

        if (result.success) {
            allLayananData = result.data || [];
            renderLayananTable(allLayananData);
        } else {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger-color);">${result.message}</td></tr>`;
        }
    } catch (err) {
        console.error("Error loadLayananData:", err);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger-color);">Gagal terhubung ke server.</td></tr>`;
    }
}

// Render Tabel
function renderLayananTable(data) {
    const tbody = document.getElementById('layanan-table-body');
    const totalElem = document.getElementById('total-count');
    
    if (!tbody) return;
    if (totalElem) totalElem.innerText = `${data.length} Data`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada data layanan untuk kategori ini.</td></tr>`;
        return;
    }

    const baseUrl = (window.API && window.API.BASE_URL) ? window.API.BASE_URL : '..';

    tbody.innerHTML = data.map((item, index) => {
        const waLink = formatWaLink(item.nomor_telepon, item.nama_kegiatan);
        const imgUmum = item.gambar_umum ? `<a href="${baseUrl}/assets/galery/layanan/${item.gambar_umum}" target="_blank" class="btn btn-sm btn-secondary"><i class="fa-solid fa-image"></i> Gambar</a>` : '-';
        const imgQris = item.gambar_qris ? `<a href="${baseUrl}/assets/galery/layanan/${item.gambar_qris}" target="_blank" class="btn btn-sm btn-secondary"><i class="fa-solid fa-qrcode"></i> QRIS</a>` : '-';

        return `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${item.nama_kegiatan}</strong></td>
                <td><span class="badge-count">${item.target_wilayah}</span></td>
                <td>
                    <a href="${waLink}" target="_blank" style="color: #25D366; font-weight: 700; text-decoration: none;">
                        <i class="fa-brands fa-whatsapp"></i> ${item.nomor_telepon}
                    </a>
                </td>
                <td>${imgUmum} ${item.jenis_layanan === 'iuran' ? '/ ' + imgQris : ''}</td>
                <td>${item.keterangan || '-'}</td>
                <td style="text-align: center;">
                    <button class="btn btn-sm btn-secondary" onclick="editLayanan(${item.id})"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                    <button class="btn btn-sm btn-secondary" style="color:var(--danger-color);" onclick="deleteLayanan(${item.id})"><i class="fa-solid fa-trash"></i> Hapus</button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterLayananTable() {
    const searchInput = document.getElementById('searchLayanan');
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase();
    const filtered = allLayananData.filter(item => 
        (item.nama_kegiatan && item.nama_kegiatan.toLowerCase().includes(query)) ||
        (item.target_wilayah && item.target_wilayah.toLowerCase().includes(query)) ||
        (item.nomor_telepon && item.nomor_telepon.includes(query))
    );
    renderLayananTable(filtered);
}

function openLayananModal() {
    const form = document.getElementById('formLayanan');
    if (form) form.reset();
    
    document.getElementById('layananId').value = '';
    document.getElementById('layananJenis').value = currentJenisLayanan;
    document.getElementById('modalLayananTitle').innerHTML = `<i class="fa-solid fa-plus"></i> Tambah Layanan (${currentJenisLayanan.toUpperCase()})`;
    
    const groupQris = document.getElementById('groupQris');
    if (groupQris) {
        groupQris.style.display = (currentJenisLayanan === 'iuran') ? 'block' : 'none';
    }

    document.getElementById('layananModal').style.display = 'flex';
}

function closeLayananModal() {
    document.getElementById('layananModal').style.display = 'none';
}

// Helper Canvas: Konversi File Gambar ke Format WebP
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
                        reject(new Error("Gagal konversi ke WebP"));
                    }
                }, "image/webp", quality);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

async function handleFormSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('formLayanan');
    const formData = new FormData();

    // Salin input non-file
    const inputs = form.querySelectorAll("input:not([type='file']), select, textarea");
    inputs.forEach(input => {
        if (input.name) formData.append(input.name, input.value);
    });

    const btnSubmit = document.getElementById('btnSubmitLayanan');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;

    try {
        // Konversi Gambar Umum jika diunggah
        const inputGambarUmum = document.getElementById('gambarUmum');
        if (inputGambarUmum && inputGambarUmum.files.length > 0) {
            const webpFile = await convertToWebP(inputGambarUmum.files[0]);
            formData.append('gambar_umum', webpFile);
        }

        // Konversi Gambar QRIS jika diunggah
        const inputGambarQris = document.getElementById('gambarQris');
        if (inputGambarQris && inputGambarQris.files.length > 0) {
            const webpFile = await convertToWebP(inputGambarQris.files[0]);
            formData.append('gambar_qris', webpFile);
        }

        const response = await apiFetch(window.API.LAYANAN.SAVE, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            closeLayananModal();
            loadLayananData();
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (err) {
        alert('Terjadi kesalahan sistem/konversi gambar.');
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Data`;
    }
}

function editLayanan(id) {
    const item = allLayananData.find(d => d.id === id);
    if (!item) return;

    openLayananModal();
    document.getElementById('layananId').value = item.id;
    document.getElementById('namaKegiatan').value = item.nama_kegiatan;
    document.getElementById('targetWilayah').value = item.target_wilayah;
    document.getElementById('nomorTelepon').value = item.nomor_telepon;
    document.getElementById('keteranganLayanan').value = item.keterangan || '';
    document.getElementById('modalLayananTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Layanan`;
}

async function deleteLayanan(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus data layanan ini?")) return;

    try {
        const response = await apiFetch(window.API.LAYANAN.DELETE(id), { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            loadLayananData();
        } else {
            alert('Gagal: ' + result.message);
        }
    } catch (err) {
        alert('Terjadi kesalahan saat menghapus.');
    }
}