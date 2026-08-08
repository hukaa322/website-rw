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
    function renderTable(dataList) {
        if (!dataList || dataList.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 1.5rem;">
                        Belum ada data berita atau pengumuman.
                    </td>
                </tr>`;
            return;
        }

        tableBody.innerHTML = dataList.map((item) => {
            const formattedDate = formatDate(item.tanggal);
            const safeItemJson = encodeURIComponent(JSON.stringify(item));

            return `
                <tr>
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

    // 3. Submit Form (Save / Update)
    async function handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const submitBtn = document.getElementById("btn-simpan-berita");
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...`;

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