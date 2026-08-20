(function () {
  let listLayanan = [];

  function formatWaNumber(phone) {
    if (!phone) return "";
    let clean = phone.toString().replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "62" + clean.slice(1);
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
      select.innerHTML = `<option value="">-- Belum ada layanan terdaftar untuk kategori ini --</option>`;
      toggleViewByKategori(kategori, null);
      return;
    }

    select.innerHTML = `<option value="">-- Pilih Wilayah / RT Tujuan (${filtered.length}) --</option>` +
      filtered.map(item => `<option value="${item.id}">[${item.target_wilayah}] - ${item.nama_kegiatan}</option>`).join("");

    toggleViewByKategori(kategori, null);
  }

  function toggleViewByKategori(kategori, selectedItem) {
    const secSurat = document.getElementById("sectionSuratPengantar");
    const secIuran = document.getElementById("sectionIuran");
    const btnSubmit = document.getElementById("btnSubmitLayanan");
    const qrisWrapper = document.getElementById("qrisImageWrapper");
    const baseBackend = window.API?.BASE_URL || "http://localhost:3000";

    if (kategori === "surat") {
      if (secSurat) secSurat.style.display = "block";
      if (secIuran) secIuran.style.display = "none";
      if (btnSubmit) {
        btnSubmit.style.background = "#2563eb";
        btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Ajukan Surat & Beri Tahu RT`;
      }
    } else {
      if (secSurat) secSurat.style.display = "none";
      if (secIuran) secIuran.style.display = "block";
      if (btnSubmit) {
        btnSubmit.style.background = "#16a34a";
        btnSubmit.innerHTML = `<i class="fa-brands fa-whatsapp fa-xl"></i> Kirim Konfirmasi via WhatsApp`;
      }

      if (selectedItem && selectedItem.gambar_qris && qrisWrapper) {
        qrisWrapper.innerHTML = `
          <img src="${baseBackend}/assets/galery/layanan/${selectedItem.gambar_qris}" 
               alt="QRIS ${selectedItem.nama_kegiatan}" 
               style="max-width: 170px; width: 100%; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 6px auto; display: block;">
        `;
      } else if (qrisWrapper) {
        qrisWrapper.innerHTML = `<p style="font-size: 0.8rem; color: #94a3b8; margin: 4px 0;">QRIS belum diunggah pengurus.</p>`;
      }
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
        const selectedId = tujuanSelect.value;
        const item = listLayanan.find(l => l.id == selectedId);
        toggleViewByKategori(kategoriSelect.value, item);
      });
    }

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();

        const kategori = kategoriSelect.value;
        const selectedLayananId = tujuanSelect.value;

        if (!selectedLayananId) {
          alert("Silakan pilih RT / Layanan tujuan terlebih dahulu!");
          tujuanSelect.focus();
          return;
        }

        const selectedLayanan = listLayanan.find(l => l.id == selectedLayananId);
        if (!selectedLayanan) {
          alert("Data layanan RT tidak valid.");
          return;
        }

        const rtNumber = parseInt(selectedLayanan.target_wilayah.replace(/[^0-9]/g, ''), 10) || 1;
        const waRT = formatWaNumber(selectedLayanan.nomor_telepon);

        // ================= FLOW SURAT ADMINISTRASI =================
        if (kategori === "surat") {
          const payload = {
            rt_target: rtNumber,
            nama_lengkap: document.getElementById("suratNama").value.trim(),
            nik: document.getElementById("suratNik").value.trim(),
            no_wa: document.getElementById("suratWa").value.trim(),
            jenis_kelamin: document.getElementById("suratJk").value,
            tempat_tgl_lahir: document.getElementById("suratTtl").value.trim(),
            status_perkawinan: document.getElementById("suratStatusKawin").value,
            kewarganegaraan: document.getElementById("suratWargaNegara").value.trim(),
            agama: document.getElementById("suratAgama").value,
            pekerjaan: document.getElementById("suratPekerjaan").value.trim(),
            pendidikan_terakhir: document.getElementById("suratPendidikan").value.trim(),
            alamat_blok_no: document.getElementById("suratAlamat").value.trim(),
            keperluan_opsi: document.getElementById("suratKeperluanOpsi").value,
            keperluan_keterangan: document.getElementById("suratKeperluanDetail").value.trim()
          };

          if (!payload.nama_lengkap || !payload.nik || !payload.no_wa || !payload.tempat_tgl_lahir || !payload.alamat_blok_no) {
            alert("Harap lengkapi seluruh field data pemohon bertanda bintang (*)");
            return;
          }

          btnSubmit.disabled = true;
          btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Database...`;

          try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            const endpoint = (window.API && window.API.SURAT && window.API.SURAT.SUBMIT_PUBLIC) 
                              ? window.API.SURAT.SUBMIT_PUBLIC 
                              : `${baseBackend}/api/public/surat-pengantar`;

            const res = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
              },
              body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (result.success) {
              const pesanWA = `*PENGAJUAN SURAT PENGANTAR (PORTAL WARGA)*\n\n` +
                `Halo Pengurus ${selectedLayanan.target_wilayah},\n` +
                `Terdapat permohonan surat baru yang masuk dan menunggu pengesahan:\n\n` +
                `• *No. Permohonan:* #${result.insertId}\n` +
                `• *Nama Pemohon:* ${payload.nama_lengkap}\n` +
                `• *NIK:* ${payload.nik}\n` +
                `• *Alamat:* ${payload.alamat_blok_no}\n` +
                `• *Keperluan:* ${payload.keperluan_opsi}\n\n` +
                `Mohon login ke *Portal Pengesahan RT* untuk memeriksa berkas dan membubuhkan tanda tangan digital. Terima kasih.`;

              alert(`Pengajuan berhasil disimpan ke database (ID: #${result.insertId})!\n\nAnda akan diarahkan ke WhatsApp RT untuk mengirimkan notifikasi pengingat.`);
              
              form.reset();
              populateDropdownLayanan();
              window.open(`https://wa.me/${waRT}?text=${encodeURIComponent(pesanWA)}`, "_blank");
            } else {
              alert("Gagal mengajukan surat: " + (result.message || "Terjadi kesalahan"));
            }
          } catch (err) {
            console.error("Error submit surat:", err);
            alert("Gagal terhubung ke server backend.");
          } finally {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Ajukan Surat & Beri Tahu RT`;
          }
          return;
        }

        // ================= FLOW PEMBAYARAN IURAN =================
        const catatan = document.getElementById("catatanWarga")?.value || "";
        let uploadedBuktiUrl = "";

        if (inputBukti && inputBukti.files.length > 0) {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah Bukti...`;

          try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            const formData = new FormData();
            formData.append("bukti_transfer", inputBukti.files[0]);

            const uploadRes = await fetch(`${baseBackend}/api/public/upload-invoice`, {
              method: "POST",
              body: formData,
              headers: { "ngrok-skip-browser-warning": "69420" }
            });
            const uploadJson = await uploadRes.json();
            if (uploadJson.success && uploadJson.fileUrl) {
              uploadedBuktiUrl = uploadJson.fileUrl;
            }
          } catch (uploadErr) {
            console.warn("Upload gagal:", uploadErr);
          } finally {
            btnSubmit.disabled = false;
          }
        }

        let pesanIuran = `*KONFIRMASI PEMBAYARAN IURAN*\n` +
                         `*Wilayah/Kegiatan:* ${selectedLayanan.nama_kegiatan} (${selectedLayanan.target_wilayah})\n` +
                         `*Catatan:* ${catatan}\n`;

        if (uploadedBuktiUrl) pesanIuran += `*Link Bukti Pembayaran:*\n${uploadedBuktiUrl}\n\n`;
        pesanIuran += `Mohon dicek dan dikonfirmasi. Terima kasih.`;

        window.open(`https://wa.me/${waRT}?text=${encodeURIComponent(pesanIuran)}`, "_blank");
      };
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

  window.initLayananPage = function () {
    const form = document.getElementById("formLayananWarga");
    if (form) {
      setupFormEvents();
      fetchLayananData();
    }
  };
})();