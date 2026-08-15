/**
 * Module News & Pengumuman - Admin Dashboard Vireta 2
 */

(function () {
    // Definisi Elemen DOM
    let tableBody, modal, form, btnTambah, btnClose, btnBatal, modalTitle;

    // Standard init function yang dipanggil saat view dimuat oleh admin-router.js
    function initNewsModule() {
        tableBody = document.getElementById("berita-list-body");
        modal = document.getElementById("modal-berita");
        form = document.getElementById("form-berita");
        btnTambah = document.getElementById("btn-tambah-berita");
        btnClose = document.getElementById("btn-close-modal");
        btnBatal = document.getElementById("btn-batal-modal");
        modalTitle = document.getElementById("modal-berita-title");

        if (!tableBody) return; // Guard clause jika elemen tidak ada di DOM

        bindEvents();
        loadBeritaData();
    }

    // Event Listeners
    function bindEvents() {
        if (btnTambah) {
            btnTambah.addEventListener("click", () => openModal());
        }
        if (btnClose) {
            btnClose.addEventListener("click", () => closeModal());
        }
        if (btnBatal) {
            btnBatal.addEventListener("click", () => closeModal());
        }
        if (form) {
            form.addEventListener("submit", handleFormSubmit);
        }
    }

    // 1. Fetch & Render Data Berita
    async function loadBeritaData() {
        try {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 1.5rem;">
                        <i class="fa-solid fa-spinner fa-spin"></i> Memuat data berita...
                    </td>
                </tr>`;

            const res = await window.apiFetch(window.API.BERITA.GET_ALL);
            const response = await res.json();

            if (!res.ok || !response.success) {
                throw new Error(response.message || "Gagal mengambil data berita");
            }

            renderTable(response.data);
        } catch (err) {
            console.error("Fetch Error:", err);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: red; padding: 1.5rem;">
                        Gagal memuat data: ${err.message}
                    </td>
                </tr>`;
        }
    }

    // Render Baris Tabel
// Render Baris Tabel
    function renderTable(dataList) {
        if (!dataList || dataList.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 1.5rem;">
                        Belum ada data berita atau pengumuman.
                    </td>
                </tr>`;
            return;
        }

        const baseUrl = (window.API && window.API.BASE_URL) ? window.API.BASE_URL : '';

        tableBody.innerHTML = dataList.map((item) => {
            const formattedDate = formatDate(item.tanggal);
            const safeItemJson = encodeURIComponent(JSON.stringify(item));

            // Kolom Foto dengan Fallbackonerror
            const fotoImg = item.foto_utama 
                ? `<img src="${baseUrl}/assets/galery/berita/${item.foto_utama}" 
                        style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;" 
                        onerror="this.onerror=null; this.src='../assets/galery/berita/${item.foto_utama}';">` 
                : '<span style="color:#aaa;">Tanpa Foto</span>';

            return `
                <tr>
                    <td>${fotoImg}</td>
                    <td><strong>${escapeHtml(item.judul)}</strong></td>
                    <td><span class="badge badge-info">${escapeHtml(item.kategori)}</span></td>
                    <td>${formattedDate}</td>
                    <td>
                        <button class="btn-edit btn-sm" onclick="NewsModule.editBerita('${safeItemJson}')">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="btn-delete btn-sm" onclick="NewsModule.deleteBerita(${item.id})">
                            <i class="fa-solid fa-trash"></i> Hapus
                        </button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    // 2. Open Modal (Tambah & Edit)
    function openModal(data = null) {
        form.reset();
        document.getElementById("berita-id").value = "";

        if (data) {
            modalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Berita / Pengumuman`;
            document.getElementById("berita-id").value = data.id || "";
            document.getElementById("judul").value = data.judul || "";
            document.getElementById("kategori").value = data.kategori || "Kegiatan";
            
            // Format Tanggal ke yyyy-MM-dd untuk input type="date"
            if (data.tanggal) {
                const dateObj = new Date(data.tanggal);
                document.getElementById("tanggal").value = dateObj.toISOString().split("T")[0];
            }
            document.getElementById("isi_berita").value = data.isi_berita || "";
        } else {
            modalTitle.innerHTML = `<i class="fa-solid fa-newspaper"></i> Buat Berita Baru`;
            // Default tanggal hari ini
            document.getElementById("tanggal").value = new Date().toISOString().split("T")[0];
        }

        modal.style.display = "flex";
    }

    function closeModal() {
        modal.style.display = "none";
        form.reset();
    }

    // Helper Canvas Browser: Konversi File Gambar ke Format WebP
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

    // 3. Submit Form (Save / Update)
    async function handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData();
        
        // Salin input non-file dari form
        const inputs = form.querySelectorAll("input:not([type='file']), select, textarea");
        inputs.forEach((input) => {
            if (input.name) {
                formData.append(input.name, input.value);
            }
        });

        const submitBtn = document.getElementById("btn-simpan-berita");
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;

            // Konversi foto_utama jika diunggah
            const fotoUtamaInput = document.getElementById("foto_utama");
            if (fotoUtamaInput && fotoUtamaInput.files.length > 0) {
                const file = fotoUtamaInput.files[0];
                const webpFile = await convertToWebP(file);
                formData.append("foto_utama", webpFile);
            }

            const res = await window.apiFetch(window.API.BERITA.SAVE, {
                method: "POST",
                body: formData,
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Gagal menyimpan data.");
            }

            alert(result.message || "Data berhasil disimpan!");
            closeModal();
            loadBeritaData(); // Reload tabel
        } catch (err) {
            alert("Error: " + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    // 4. Delete Data
    async function deleteBerita(id) {
        if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) return;

        try {
            const res = await window.apiFetch(window.API.BERITA.DELETE(id), {
                method: "DELETE",
            });
            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || "Gagal menghapus berita.");
            }

            alert(result.message || "Data berhasil dihapus.");
            loadBeritaData();
        } catch (err) {
            alert("Error: " + err.message);
        }
    }

    // Helpers
    function formatDate(dateStr) {
        if (!dateStr) return "-";
        const options = { day: "numeric", month: "long", year: "numeric" };
        return new Date(dateStr).toLocaleDateString("id-ID", options);
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

    // Global Export untuk dipanggil via inline onclick & router SPA
    window.NewsModule = {
        init: initNewsModule,
        editBerita: (encodedData) => {
            const data = JSON.parse(decodeURIComponent(encodedData));
            openModal(data);
        },
        deleteBerita: deleteBerita,
    };
})();