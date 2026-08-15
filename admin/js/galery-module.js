let currentGaleriKategori = 'umkm';

function switchTab(tabId, element) {
    const cleanId = tabId.startsWith('tab-') ? tabId : `tab-${tabId}`;

    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    document.querySelectorAll('.gallery-pill-filter .pill-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetTab = document.getElementById(cleanId);
    if (targetTab) {
        targetTab.style.display = 'block';
    }

    if (element) {
        element.classList.add('active');
    }

    if (cleanId === 'tab-umkm') currentGaleriKategori = 'umkm';
    else if (cleanId === 'tab-kegiatan') currentGaleriKategori = 'kegiatan';
    else if (cleanId === 'tab-ikon') currentGaleriKategori = 'ikon';

    loadGaleriData();
}

async function loadGaleriData() {
    try {
        if (!window.API || !window.API.GALERI || !window.API.GALERI.GET_ALL) {
            console.error("API.GALERI.GET_ALL belum terdefinisi di api.js!");
            return;
        }

        const response = await apiFetch(window.API.GALERI.GET_ALL);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP Error ${response.status}: Server mengembalikan error.`, errorText);
            return;
        }

        const result = await response.json();

        if (!result.success) return alert(result.message);

        const dataUmkm = result.data.filter(item => item.kategori === 'umkm');
        const dataKegiatan = result.data.filter(item => item.kategori === 'kegiatan');
        const dataIkon = result.data.filter(item => item.kategori === 'ikon');

        const countUmkm = document.getElementById('count-umkm');
        const countKegiatan = document.getElementById('count-kegiatan');
        const countIkon = document.getElementById('count-ikon');
        if (countUmkm) countUmkm.innerText = `${dataUmkm.length} Data`;
        if (countKegiatan) countKegiatan.innerText = `${dataKegiatan.length} Data`;
        if (countIkon) countIkon.innerText = `${dataIkon.length} Data`;

        renderGaleriTable('container-umkm', dataUmkm);
        renderGaleriTable('container-kegiatan', dataKegiatan);
        renderGaleriTable('container-ikon', dataIkon);
    } catch (error) {
        console.error("Gagal memuat data galeri:", error);
    }
}

function renderGaleriTable(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted); padding:10px 0;">Belum ada data pada kategori ini.</p>`;
        return;
    }

    const baseUrl = (window.API && window.API.BASE_URL) ? window.API.BASE_URL : 'http://localhost:3000';

    let rows = items.map(item => {
        // Multi-fallback URL jika foto di-host di backend atau frontend
        const primaryImgUrl = `${baseUrl}/assets/galery/berita/${item.foto_utama}`;
        const fallbackImgUrl1 = `${baseUrl}/assets/galery/rt/${item.foto_utama}`;
        const fallbackImgUrl2 = `../assets/galery/berita/${item.foto_utama}`;

        return `
        <tr>
            <td>
                ${item.foto_utama 
                    ? `<img src="${primaryImgUrl}" 
                            style="width:50px; height:50px; object-fit:cover; border-radius:6px;" 
                            onerror="this.onerror=null; this.src='${fallbackImgUrl1}'; this.onerror=function(){this.src='${fallbackImgUrl2}';};">` 
                    : '<span style="color:#aaa;">Tanpa Foto</span>'}
            </td>
            <td><strong>${escapeHtml(item.judul)}</strong></td>
            <td>${escapeHtml(item.deskripsi || '-')}</td>
            <td>${escapeHtml(item.kontak || '-')}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openGaleriModal('${item.kategori}', ${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-sm" style="background:var(--danger-color); color:#fff;" onclick="deleteGaleriData(${item.id})">
                    <i class="fa-solid fa-trash"></i> Hapus
                </button>
            </td>
        </tr>
    `}).join('');

    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Foto</th>
                    <th>Judul / Nama</th>
                    <th>Deskripsi</th>
                    <th>Kontak / Info</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function openGaleriModal(kategori, editData = null) {
    const existingModal = document.getElementById('modal-galeri');
    if (existingModal) existingModal.remove();

    const isEdit = !!editData;
    const titleText = isEdit ? 'Edit Data Galeri' : `Tambah Data ${kategori.toUpperCase()}`;

    const modalHtml = `
        <div class="modal-backdrop" id="modal-galeri" style="display:flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h4>${titleText}</h4>
                    <button class="btn-close-modal" onclick="closeGaleriModal()">&times;</button>
                </div>
                <form id="form-galeri" onsubmit="submitGaleriForm(event)">
                    <div class="modal-body">
                        <input type="hidden" name="id" value="${editData ? editData.id : ''}">
                        <input type="hidden" name="kategori" value="${editData ? editData.kategori : kategori}">

                        <div class="form-group">
                            <label>Judul / Nama ${kategori.toUpperCase()} *</label>
                            <input type="text" name="judul" class="form-control" required value="${editData ? escapeHtml(editData.judul) : ''}">
                        </div>

                        <div class="form-group">
                            <label>Kontak / No. Telp (Opsional)</label>
                            <input type="text" name="kontak" class="form-control" value="${editData ? escapeHtml(editData.kontak || '') : ''}">
                        </div>

                        <div class="form-group">
                            <label>Deskripsi / Keterangan</label>
                            <textarea name="deskripsi" class="form-control">${editData ? escapeHtml(editData.deskripsi || '') : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label>Foto Utama (Otomatis Kompres Ke WEBP)</label>
                            <input type="file" id="input_foto_galeri" name="foto_utama" class="form-control" accept="image/*">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeGaleriModal()">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan Data</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeGaleriModal() {
    const modal = document.getElementById('modal-galeri');
    if (modal) modal.remove();
}

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

async function submitGaleriForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData();

    const inputs = form.querySelectorAll("input:not([type='file']), select, textarea");
    inputs.forEach(input => {
        if (input.name) formData.append(input.name, input.value);
    });

    try {
        const fileInput = document.getElementById('input_foto_galeri');
        if (fileInput && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const webpFile = await convertToWebP(file);
            formData.append("foto_utama", webpFile);
        }

        const response = await apiFetch(window.API.GALERI.SAVE, {
            method: 'POST',
            body: formData
        });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            closeGaleriModal();
            loadGaleriData();
        } else {
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        alert("Terjadi kesalahan jaringan/konversi gambar.");
    }
}

async function deleteGaleriData(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
        const response = await apiFetch(window.API.GALERI.DELETE(id), { method: 'DELETE' });
        const result = await response.json();

        if (result.success) {
            alert(result.message);
            loadGaleriData();
        } else {
            alert("Gagal: " + result.message);
        }
    } catch (error) {
        alert("Terjadi kesalahan saat menghapus data.");
    }
}

function filterGaleriTable(input, containerId) {
    const filter = input.value.toLowerCase();
    const table = document.querySelector(`#${containerId} table`);
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? '' : 'none';
    });
}

function escapeHtml(str) {
    return (str || "").replace(/[&<>"']/g, function (m) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;",
        }[m];
    });
}

window.filterGaleriTable = filterGaleriTable;
window.switchTab = switchTab;
window.openGaleriModal = openGaleriModal;
window.closeGaleriModal = closeGaleriModal;
window.submitGaleriForm = submitGaleriForm;
window.deleteGaleriData = deleteGaleriData;
window.loadGaleriData = loadGaleriData;