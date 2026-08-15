window.openRtModal = function(data = null) {
    const form = document.getElementById("rtForm");
    if (form) form.reset();
    
    const idInput = document.getElementById("rtId");
    if (idInput) idInput.value = "";

    if (data) {
        if (document.getElementById("rtId")) document.getElementById("rtId").value = data.id || "";
        if (document.getElementById("nomor_rt")) document.getElementById("nomor_rt").value = data.nomor_rt || "";
        if (document.getElementById("nama_ketua")) document.getElementById("nama_ketua").value = data.nama_ketua || "";
        if (document.getElementById("nomor_telepon")) document.getElementById("nomor_telepon").value = data.nomor_telepon || "";
        if (document.getElementById("ringkasan")) document.getElementById("ringkasan").value = data.ringkasan || "";
        if (document.getElementById("masa_jabatan")) document.getElementById("masa_jabatan").value = data.masa_jabatan || "";
    }

    const modal = document.getElementById("rtModal");
    if (modal) modal.style.display = "flex";
};

window.closeRtModal = function() {
    const modal = document.getElementById("rtModal");
    if (modal) modal.style.display = "none";
};

window.loadRtData = async function() {
    console.log(">>> [LOG FRONTEND] Mengambil data RT dari backend...");
    try {
        const res = await apiFetch(API.RT.GET_ALL);
        const result = await res.json();
        
        const tbody = document.getElementById("rtTableBody");
        if (!tbody) return;

        if (result.success) {
            tbody.innerHTML = "";
            window.rtDataStore = result.data;

            result.data.forEach(item => {
                const itemJson = JSON.stringify(item).replace(/'/g, "&apos;");
                tbody.innerHTML += `
                    <tr>
                        <td>RT ${String(item.nomor_rt).padStart(2, '0')}</td>
                        <td>
                            ${item.foto_utama 
                                ? `<img src="../assets/galery/rt/${item.foto_utama}" width="40" height="40" style="object-fit: cover; border-radius: 4px;">` 
                                : '-'}
                        </td>
                        <td>${item.nama_ketua}</td>
                        <td>${item.nomor_telepon}</td>
                        <td>
                            <button class="action-btn btn-edit" onclick='window.openRtModal(${itemJson})' style="margin-right: 5px; background: #eab308; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                <i class="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button class="action-btn btn-delete" onclick="window.deleteRt(${item.id})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch(err) {
        console.error(">>> [LOG FRONTEND ERROR] Gagal load RT:", err);
    }
};

window.deleteRt = async function(id) {
    if (confirm("Hapus data RT ini?")) {
        const res = await apiFetch(API.RT.DELETE(id), { method: "DELETE" });
        const result = await res.json();
        if (result.success) window.loadRtData();
    }
};

// Helper: Konversi File Gambar ke Format WebP via HTML5 Canvas
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

window.saveRtData = async function(event) {
    event.preventDefault();
    const formElement = event.target;
    const formData = new FormData();

    // Copy data non-file dari form
    const inputs = formElement.querySelectorAll("input:not([type='file']), select, textarea");
    inputs.forEach(input => {
        if (input.name) {
            formData.append(input.name, input.value);
        }
    });

    try {
        // Process & Convert foto_utama
        const fotoUtamaInput = document.getElementById("foto_utama");
        if (fotoUtamaInput && fotoUtamaInput.files.length > 0) {
            const file = fotoUtamaInput.files[0];
            const webpFile = await convertToWebP(file);
            formData.append("foto_utama", webpFile);
        }

        // Process & Convert foto_pendukung (Multiple)
        const fotoPendukungInput = document.getElementById("foto_pendukung");
        if (fotoPendukungInput && fotoPendukungInput.files.length > 0) {
            for (let i = 0; i < fotoPendukungInput.files.length; i++) {
                const file = fotoPendukungInput.files[i];
                const webpFile = await convertToWebP(file);
                formData.append("foto_pendukung", webpFile);
            }
        }

        const res = await apiFetch(API.RT.SAVE, {
            method: "POST",
            body: formData
        });

        const result = await res.json();

        if (result.success) {
            alert("BERHASIL: " + result.message);
            window.closeRtModal();
            window.loadRtData();
        } else {
            alert("GAGAL SIMPAN: " + result.message);
        }
    } catch (err) {
        console.error(">>> [LOG FRONTEND FATAL ERROR]:", err);
        alert("TERJADI ERROR KONEKSI/CONVERT FOTO: " + err.message);
    }
};