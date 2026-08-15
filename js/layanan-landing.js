(function () {
  let listLayanan = [];

  function formatWaNumber(phone) {
    if (!phone) return "";
    let clean = phone.toString().replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    }
    return clean;
  }

  function extractArrayData(resJson) {
    if (!resJson) return [];
    if (Array.isArray(resJson)) return resJson;
    if (resJson.data && Array.isArray(resJson.data)) return resJson.data;
    return [];
  }

  async function fetchLayananData() {
    const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
    const endpoint = window.API?.LAYANAN?.GET_PUBLIC || `${baseBackend}/api/public/layanan`;

    try {
      const fetcher = window.apiFetch ? window.apiFetch : fetch;
      const res = await fetcher(endpoint);
      const result = await res.json();
      listLayanan = extractArrayData(result);

      populateDropdownLayanan();
      renderQuickCards();
    } catch (err) {
      console.error("Gagal mengambil data layanan:", err);
      const select = document.getElementById("tujuanLayanan");
      if (select) select.innerHTML = '<option value="">Gagal memuat data layanan</option>';
    }
  }

  function populateDropdownLayanan() {
    const select = document.getElementById("tujuanLayanan");
    const kategori = document.getElementById("layananKategori")?.value || "surat";
    if (!select) return;

    const filtered = listLayanan.filter(item => item.jenis_layanan === kategori);

    if (filtered.length === 0) {
      select.innerHTML = `<option value="">-- Belum ada data untuk kategori ini --</option>`;
      toggleQrisBox(null);
      return;
    }

    select.innerHTML = `<option value="">-- Pilih Wilayah / Kegiatan (${filtered.length}) --</option>` +
      filtered.map(item => {
        return `<option value="${item.id}">[${item.target_wilayah}] - ${item.nama_kegiatan}</option>`;
      }).join("");

    toggleQrisBox(null);
  }

  function toggleQrisBox(selectedItem) {
    const qrisContainer = document.getElementById("qrisContainer");
    const qrisWrapper = document.getElementById("qrisImageWrapper");
    const inputBukti = document.getElementById("inputBuktiTransfer");
    const previewWrapper = document.getElementById("previewBuktiWrapper");
    const imgPreview = document.getElementById("imgPreviewBukti");

    if (!qrisContainer || !qrisWrapper) return;

    const kategori = document.getElementById("layananKategori")?.value;
    const baseBackend = window.API?.BASE_URL || "http://localhost:3000";

    if (kategori === "iuran") {
      qrisContainer.style.display = "block";
      if (selectedItem && selectedItem.gambar_qris) {
        qrisWrapper.innerHTML = `
          <img src="${baseBackend}/assets/galery/layanan/${selectedItem.gambar_qris}" 
               alt="QRIS ${selectedItem.nama_kegiatan}" 
               style="max-width: 170px; width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 6px auto; display: block;">
        `;
      } else {
        qrisWrapper.innerHTML = `<p style="font-size: 0.8rem; color: #94a3b8; margin: 4px 0;">QRIS belum diunggah pengurus.</p>`;
      }
    } else {
      qrisContainer.style.display = "none";
      qrisWrapper.innerHTML = "";
      if (inputBukti) inputBukti.value = "";
      if (previewWrapper) previewWrapper.style.display = "none";
      if (imgPreview) imgPreview.src = "";
    }
  }

  function setupFormEvents() {
    const kategoriSelect = document.getElementById("layananKategori");
    const tujuanSelect = document.getElementById("tujuanLayanan");
    const form = document.getElementById("formLayananWarga");
    const inputBukti = document.getElementById("inputBuktiTransfer");
    const previewWrapper = document.getElementById("previewBuktiWrapper");
    const imgPreview = document.getElementById("imgPreviewBukti");
    const btnSubmit = document.getElementById("btnSubmitLayanan");

    if (inputBukti) {
      inputBukti.addEventListener("change", function () {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            imgPreview.src = e.target.result;
            previewWrapper.style.display = "block";
          };
          reader.readAsDataURL(file);
        } else {
          previewWrapper.style.display = "none";
        }
      });
    }

    if (kategoriSelect) {
      kategoriSelect.addEventListener("change", () => {
        populateDropdownLayanan();
      });
    }

    if (tujuanSelect) {
      tujuanSelect.addEventListener("change", () => {
        const id = tujuanSelect.value;
        const item = listLayanan.find(l => l.id == id);
        toggleQrisBox(item);
      });
    }

  if (form && form.dataset.initialized !== "true") {
      form.dataset.initialized = "true";
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const selectedId = tujuanSelect.value;
        const item = listLayanan.find(l => l.id == selectedId);
        const catatan = document.getElementById("catatanWarga").value;
        const kategori = document.getElementById("layananKategori").value;

        if (!item) {
          alert("Silakan pilih Wilayah / Kegiatan terlebih dahulu!");
          tujuanSelect.focus();
          return;
        }

        const phone = formatWaNumber(item.nomor_telepon);
        let uploadedBuktiUrl = "";

        // PROSES UPLOAD BUKTI TRANSFER JIKA KATEGORI IURAN
        if (kategori === "iuran" && inputBukti && inputBukti.files.length > 0) {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah Bukti Bayar...`;

          try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            const uploadEndpoint = `${baseBackend}/api/public/upload-invoice`;

            const formData = new FormData();
            formData.append("bukti_transfer", inputBukti.files[0]);

            // Gunakan fetch native agar Browser mengatur header Content-Type & Multipart Boundary secara otomatis
            const uploadRes = await fetch(uploadEndpoint, {
              method: "POST",
              body: formData,
              headers: {
                "ngrok-skip-browser-warning": "69420"
              }
            });

            const uploadJson = await uploadRes.json();

            if (uploadJson.success && uploadJson.fileUrl) {
              uploadedBuktiUrl = uploadJson.fileUrl;
            } else {
              console.warn("Upload gagal:", uploadJson.message);
              alert("Gagal mengunggah bukti: " + (uploadJson.message || "Periksa server"));
            }
          } catch (uploadErr) {
            console.error("Error saat upload file:", uploadErr);
            alert("Gagal terhubung ke server untuk unggah bukti.");
          } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="fa-brands fa-whatsapp fa-xl"></i> Kirim ke WhatsApp Pengurus`;
          }
        }

        let pesan = "";

        if (kategori === "iuran") {
          pesan = `*KONFIRMASI PEMBAYARAN IURAN*\n` +
                  `*Wilayah/Kegiatan:* ${item.nama_kegiatan} (${item.target_wilayah})\n` +
                  `*Catatan:* ${catatan}\n`;

          if (uploadedBuktiUrl) {
            pesan += `*Link Bukti Pembayaran:*\n${uploadedBuktiUrl}\n\n`;
          } else {
            pesan += `*Bukti Pembayaran:* (Foto dilampirkan langsung di chat ini)\n\n`;
          }

          pesan += `Mohon dicek dan dikonfirmasi. Terima kasih.`;
        } else {
          pesan = `*PENGAJUAN SURAT & ADMINISTRASI*\n` +
                  `*Kegiatan/Wilayah:* ${item.nama_kegiatan} (${item.target_wilayah})\n` +
                  `*Catatan / Keperluan:*\n${catatan}\n\n` +
                  `Mohon dibantu proses lebih lanjut. Terima kasih.`;
        }

        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(pesan)}`;
        window.open(waUrl, "_blank");
      });
    }
  }

  function renderQuickCards() {
    const container = document.getElementById("quickCardsContainer");
    if (!container) return;

    const quickItems = listLayanan.filter(item => item.jenis_layanan === "layanan");

    if (quickItems.length === 0) {
      container.innerHTML = `
        <div class="quick-card-item security">
          <div class="quick-card-header">
            <i class="fa-solid fa-shield-halved fa-lg" style="color: #dc2626;"></i>
            <h4 class="quick-card-title">Pos Keamanan & Jaga</h4>
          </div>
          <p class="quick-card-desc">Laporan ketertiban dan situasi darurat lingkungan.</p>
          <a href="https://wa.me/6281234567890?text=${encodeURIComponent('Halo Pos Keamanan, saya butuh bantuan.')}" target="_blank" class="btn-quick-wa btn-quick-security">
            <i class="fa-brands fa-whatsapp"></i> Hubungi Pos Satpam
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = quickItems.map(item => {
      const isSecurity = (item.nama_kegiatan || "").toLowerCase().includes("aman") || (item.nama_kegiatan || "").toLowerCase().includes("satpam");
      const cardClass = isSecurity ? "security" : "health";
      const icon = isSecurity ? "fa-shield-halved" : "fa-heart-pulse";
      const iconColor = isSecurity ? "#dc2626" : "#16a34a";
      const btnClass = isSecurity ? "btn-quick-security" : "btn-quick-health";
      const phone = formatWaNumber(item.nomor_telepon);
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`Halo, saya ingin bertanya perihal: ${item.nama_kegiatan}`)}`;

      return `
        <div class="quick-card-item ${cardClass}">
          <div class="quick-card-header">
            <i class="fa-solid ${icon} fa-lg" style="color: ${iconColor};"></i>
            <h4 class="quick-card-title">${item.nama_kegiatan}</h4>
          </div>
          <p style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 4px;">
            <i class="fa-solid fa-location-dot"></i> ${item.target_wilayah}
          </p>
          <p class="quick-card-desc">${item.keterangan || 'Silakan hubungi kontak pengurus via WhatsApp.'}</p>
          <a href="${waUrl}" target="_blank" class="btn-quick-wa ${btnClass}">
            <i class="fa-brands fa-whatsapp"></i> Hubungi (${item.nomor_telepon})
          </a>
        </div>
      `;
    }).join("");
  }

  function checkAndInit() {
    if (document.getElementById("formLayananWarga") && document.getElementById("tujuanLayanan")) {
      setupFormEvents();
      fetchLayananData();
    } else {
      setTimeout(checkAndInit, 100);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAndInit);
  } else {
    checkAndInit();
  }
})();