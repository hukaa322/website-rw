let currentGaleriKategori = 'umkm';

function switchTab(tabId, element) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.style.display = 'block';
    if (element) element.classList.add('active');

    if (tabId === 'tab-umkm') currentGaleriKategori = 'umkm';
    else if (tabId === 'tab-kegiatan') currentGaleriKategori = 'kegiatan';
    else if (tabId === 'tab-ikon') currentGaleriKategori = 'ikon';

    loadGaleriData();
}

async function loadGaleriData() {
    try {
        if (!API.GALERI || !API.GALERI.GET_ALL) {
            console.error("API.GALERI.GET_ALL belum terdefinisi di api.js!");
            return;
        }

        const response = await apiFetch(API.GALERI.GET_ALL);

        // Validasi jika response bukan status HTTP 200 OK
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP Error ${response.status}: Server mengembalikan HTML/Error alih-alih JSON.`, errorText);
            return;
        }

        const result = await response.json();

        if (!result.success) return alert(result.message);

        const dataUmkm = result.data.filter(item => item.kategori === 'umkm');
        const dataKegiatan = result.data.filter(item => item.kategori === 'kegiatan');
        const dataIkon = result.data.filter(item => item.kategori === 'ikon');

        // Update Counter Badge (Jika ada)
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

    let rows = items.map(item => `
        <tr>
            <td>
                ${item.foto_utama 
                    ? `<img src="${API.BASE_URL}/assets/galery/rt/${item.foto_utama}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;">` 
                    : '<span style="color:#aaa;">Tanpa Foto</span>'}
            </td>
            <td><strong>${item.judul}</strong></td>
            <td>${item.deskripsi || '-'}</td>
            <td>${item.kontak || '-'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openGaleriModal('${item.kategori}', ${JSON.stringify(item).replace(/"/g, '&quot;')})">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-sm" style="background:var(--danger-color); color:#fff;" onclick="deleteGaleriData(${item.id})">
                    <i class="fa-solid fa-trash"></i> Hapus
                </button>
            </td>
        </tr>
    `).join('');

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
        <div class="modal-backdrop" id="modal-galeri">
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
                            <input type="text" name="judul" class="form-control" required value="${editData ? editData.judul : ''}">
                        </div>

                        <div class="form-group">
                            <label>Kontak / No. Telp (Opsional)</label>
                            <input type="text" name="kontak" class="form-control" value="${editData ? editData.kontak || '' : ''}">
                        </div>

                        <div class="form-group">
                            <label>Deskripsi / Keterangan</label>
                            <textarea name="deskripsi" class="form-control">${editData ? editData.deskripsi || '' : ''}</textarea>
                        </div>

                        <div class="form-group">
                            <label>Foto Utama ${isEdit ? '(Biarkan kosong jika tidak diubah)' : ''}</label>
                            <input type="file" name="foto_utama" class="form-control" accept="image/*">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeGaleriModal()">Batal</button>
                        <button type="submit" class="btn btn-primary">Simpan</button>
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

async function submitGaleriForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    try {
        const response = await apiFetch(API.GALERI.SAVE, {
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
        alert("Terjadi kesalahan jaringan.");
    }
}

async function deleteGaleriData(id) {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
        const response = await apiFetch(API.GALERI.DELETE(id), { method: 'DELETE' });
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

// Fitur pencarian instan pada tabel
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

window.filterGaleriTable = filterGaleriTable;

window.switchTab = switchTab;
window.openGaleriModal = openGaleriModal;
window.closeGaleriModal = closeGaleriModal;
window.submitGaleriForm = submitGaleriForm;
window.deleteGaleriData = deleteGaleriData;
window.loadGaleriData = loadGaleriData;