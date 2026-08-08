document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.loadRwData === "function") {
        window.loadRwData();
    }
});

window.openRwModal = function(data = null) {
    const form = document.getElementById("rwForm");
    if (form) form.reset();

    const idInput = document.getElementById("rwId");
    if (idInput) idInput.value = "";

    if (data) {
        if (document.getElementById("rwId")) document.getElementById("rwId").value = data.id || "";
        if (document.getElementById("nama_ketua")) document.getElementById("nama_ketua").value = data.nama_ketua || "";
        if (document.getElementById("periode")) document.getElementById("periode").value = data.periode || "";
        if (document.getElementById("nomor_telepon")) document.getElementById("nomor_telepon").value = data.nomor_telepon || "";
        if (document.getElementById("visi_misi")) document.getElementById("visi_misi").value = data.visi_misi || "";
        if (document.getElementById("is_aktif")) document.getElementById("is_aktif").value = data.is_aktif ? "1" : "0";
    }

    const modal = document.getElementById("rwModal");
    if (modal) modal.style.display = "flex";
};

window.closeRwModal = function() {
    const modal = document.getElementById("rwModal");
    if (modal) modal.style.display = "none";
};

window.loadRwData = async function() {
    console.log(">>> [LOG ADMIN RW] Memuat data RW...");
    try {
        const targetUrl = (window.API && window.API.RW) ? window.API.RW.GET_ALL : "http://localhost:3000/api/admin/rw";
        const fetcher = typeof window.apiFetch === "function" ? window.apiFetch : fetch;

        const res = await fetcher(targetUrl);
        
        // Pengecekan Aman: Pastikan respon bernilai OK dan tipe datanya JSON
        if (!res.ok) {
            const errText = await res.text();
            console.error(">>> [ERROR SERVER RESPONDED NON-200]:", errText);
            return;
        }

        const result = await res.json();
        const tbody = document.getElementById("rwTableBody");
        if (!tbody) return;

        if (result.success && Array.isArray(result.data)) {
            tbody.innerHTML = "";
            result.data.forEach(item => {
                const itemJson = JSON.stringify(item).replace(/'/g, "&apos;");
                const statusBadge = item.is_aktif 
                    ? `<span style="background: #22c55e; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">Aktif</span>`
                    : `<span style="background: #94a3b8; color: white; padding: 3px 8px; border-radius: 12px; font-size: 11px;">Alumni/Histori</span>`;

                tbody.innerHTML += `
                    <tr>
                        <td>${item.periode || '-'}</td>
                        <td>
                            ${item.foto_utama 
                                ? `<img src="../assets/galery/rw/${item.foto_utama}" width="40" height="40" style="object-fit: cover; border-radius: 4px;">` 
                                : '-'}
                        </td>
                        <td>${item.nama_ketua || '-'}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="action-btn btn-edit" onclick='window.openRwModal(${itemJson})' style="background: #eab308; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">
                                <i class="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button class="action-btn btn-delete" onclick="window.deleteRw(${item.id})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error(">>> [ERROR LOAD RW ADMIN]:", err);
    }
};

window.saveRwData = async function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);

    try {
        const targetUrl = (window.API && window.API.RW) ? window.API.RW.SAVE : "http://localhost:3000/api/admin/rw";
        const fetcher = typeof window.apiFetch === "function" ? window.apiFetch : fetch;

        const res = await fetcher(targetUrl, {
            method: "POST",
            body: formData
        });

        if (!res.ok) {
            const errText = await res.text();
            alert("GAGAL RESPONS SERVER: " + errText);
            return;
        }

        const result = await res.json();
        if (result.success) {
            alert("BERHASIL: " + result.message);
            window.closeRwModal();
            window.loadRwData();
        } else {
            alert("GAGAL SIMPAN: " + result.message);
        }
    } catch (err) {
        console.error(">>> [ERROR SAVE RW]:", err);
        alert("Terjadi kesalahan sistem saat menyimpan data RW.");
    }
};

window.deleteRw = async function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data RW ini?")) {
        try {
            const targetUrl = (window.API && window.API.RW) ? window.API.RW.DELETE(id) : `http://localhost:3000/api/admin/rw/${id}`;
            const fetcher = typeof window.apiFetch === "function" ? window.apiFetch : fetch;

            const res = await fetcher(targetUrl, { method: "DELETE" });
            const result = await res.json();
            if (result.success) {
                window.loadRwData();
            }
        } catch (err) {
            console.error(">>> [ERROR DELETE RW]:", err);
        }
    }
};