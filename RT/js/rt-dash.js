window.RTDash = {
    currentQueue: [],
    currentUser: null,
    savedSignature: null,
    selectedSurat: null,

    render: function(targetContainer, user) {
        this.currentUser = user;
        targetContainer.innerHTML = `
            <div class="rt-dashboard-view">
                <header class="rt-topbar">
                    <div class="rt-topbar-title">
                        <h3 style="margin:0; font-size:1.1rem; font-weight:800;">Panel Pengesahan RT</h3>
                        <span class="rt-badge-wilayah">${user.nama || user.username}</span>
                    </div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button onclick="window.RTDash.openSignatureModal()" class="rt-btn-primary" style="padding: 8px 14px; font-size: 0.85rem;">
                            <i class="fa-solid fa-pen-nib"></i> Atur TTD Digital RT
                        </button>
                        <button onclick="window.RTDash.handleLogout()" class="rt-btn-logout">
                            <i class="fa-solid fa-right-from-bracket"></i> Keluar
                        </button>
                    </div>
                </header>

                <main class="rt-main-container">
                    <div class="rt-content-card">
                        <div class="rt-card-header">
                            <div>
                                <h3 style="margin:0;">Antrean Permohonan Surat Masuk</h3>
                                <p style="margin:4px 0 0 0; color:#64748b; font-size:0.85rem;">Periksa data pemohon dan bubuhkan tanda tangan digital sebelum diteruskan ke Admin RW.</p>
                            </div>
                            <button onclick="window.RTDash.loadQueueData()" class="rt-btn-primary" style="padding: 6px 12px; font-size: 0.8rem; background: #64748b;">
                                <i class="fa-solid fa-rotate"></i> Refresh
                            </button>
                        </div>

                        <div class="table-responsive" style="margin-top: 15px;">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Tanggal Pengajuan</th>
                                        <th>Nama Pemohon</th>
                                        <th>NIK</th>
                                        <th>Alamat</th>
                                        <th>Keperluan</th>
                                        <th style="text-align: center;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="rt-table-queue">
                                    <tr>
                                        <td colspan="7" style="text-align: center; padding: 30px; color: #64748b;">
                                            <i class="fa-solid fa-spinner fa-spin"></i> Memuat antrean permohonan...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            <!-- MODAL 1: PREVIEW SURAT PENGANTAR A5 & APPROVAL -->
            <div id="modalPreviewSurat" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:9999; justify-content:center; align-items:center; overflow-y:auto; padding:20px;">
                <div style="background:#fff; width:100%; max-width:680px; border-radius:12px; padding:24px; max-height:90vh; overflow-y:auto; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
                        <h4 style="margin:0; font-size:1.1rem; font-weight:700;"><i class="fa-solid fa-file-contract" style="color:#2563eb;"></i> Pratinjau Surat Pengantar (A5)</h4>
                        <button onclick="window.RTDash.closePreviewModal()" style="border:none; background:transparent; font-size:1.5rem; cursor:pointer; color:#64748b;">&times;</button>
                    </div>

                    <!-- TEMPLATE RENDER SURAT A5 -->
                    <div id="a5PaperPreview" style="background:#fff; border:1px solid #cbd5e1; padding:24px; font-family:'Times New Roman', Times, serif; font-size:12.5px; line-height:1.4; color:#000;">
                        <!-- Konten surat dibuat dinamis -->
                    </div>

                    <!-- PENGATURAN TTD SEBELUM ACC -->
                    <div style="margin-top:16px; background:#f8fafc; padding:14px; border-radius:8px; border:1px solid #e2e8f0;">
                        <span style="font-weight:700; font-size:0.85rem; color:#1e293b; display:block; margin-bottom:8px;">
                            <i class="fa-solid fa-stamp"></i> Tanda Tangan Digital Pengurus RT:
                        </span>
                        <div id="ttdStatusBox" style="font-size:0.85rem; color:#475569; display:flex; align-items:center; justify-content:space-between;">
                            <!-- Status TTD -->
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                        <button onclick="window.RTDash.closePreviewModal()" style="padding:9px 16px; border-radius:6px; border:1px solid #cbd5e1; background:#f1f5f9; cursor:pointer; font-weight:600;">Tutup</button>
                        <button id="btnApproveSurat" onclick="window.RTDash.handleApproveSurat()" style="padding:9px 18px; border-radius:6px; border:none; background:#16a34a; color:#fff; cursor:pointer; font-weight:700;">
                            <i class="fa-solid fa-signature"></i> Setujui & Bubuhkan Tanda Tangan
                        </button>
                    </div>
                </div>
            </div>

            <!-- MODAL 2: KELOLA TTD DIGITAL RT -->
            <div id="modalSignature" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:10000; justify-content:center; align-items:center; padding:20px;">
                <div style="background:#fff; width:100%; max-width:480px; border-radius:12px; padding:20px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:14px;">
                        <h4 style="margin:0; font-size:1rem; font-weight:700;"><i class="fa-solid fa-pen-nib" style="color:#2563eb;"></i> Kelola Tanda Tangan Digital RT</h4>
                        <button onclick="window.RTDash.closeSignatureModal()" style="border:none; background:transparent; font-size:1.3rem; cursor:pointer; color:#64748b;">&times;</button>
                    </div>

                    <div style="display:flex; gap:10px; margin-bottom:12px;">
                        <button id="tabDrawTtd" onclick="window.RTDash.switchTtdTab('draw')" style="flex:1; padding:8px; border-radius:6px; border:1px solid #2563eb; background:#eff6ff; color:#2563eb; font-weight:700; cursor:pointer; font-size:0.85rem;">
                            <i class="fa-solid fa-pen-fancy"></i> Gores TTD (Draw)
                        </button>
                        <button id="tabUploadTtd" onclick="window.RTDash.switchTtdTab('upload')" style="flex:1; padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; color:#64748b; font-weight:700; cursor:pointer; font-size:0.85rem;">
                            <i class="fa-solid fa-upload"></i> Unggah Gambar
                        </button>
                    </div>

                    <div id="areaDrawTtd">
                        <canvas id="canvasTtd" width="440" height="180" style="border:1.5px dashed #94a3b8; border-radius:8px; width:100%; background:#fafafa; cursor:crosshair; touch-action:none;"></canvas>
                        <button onclick="window.RTDash.clearCanvas()" style="margin-top:6px; font-size:0.75rem; background:transparent; border:none; color:#dc2626; cursor:pointer; font-weight:600;">
                            <i class="fa-solid fa-eraser"></i> Bersihkan Coretan
                        </button>
                    </div>

                    <div id="areaUploadTtd" style="display:none;">
                        <input type="file" id="inputTtdFile" accept="image/*" style="width:100%; padding:8px; border:1px solid #cbd5e1; border-radius:6px;" onchange="window.RTDash.handleTtdUploadPreview(this)">
                        <div id="previewUploadedTtd" style="margin-top:10px; text-align:center; display:none;">
                            <img id="imgTtdUploaded" src="" alt="Preview TTD" style="max-height:120px; border:1px solid #e2e8f0; border-radius:6px; padding:6px; background:#fff;">
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:16px;">
                        <button onclick="window.RTDash.closeSignatureModal()" style="padding:8px 14px; border-radius:6px; border:1px solid #cbd5e1; background:#f1f5f9; cursor:pointer;">Batal</button>
                        <button onclick="window.RTDash.saveSignatureToStorage()" style="padding:8px 16px; border-radius:6px; border:none; background:#2563eb; color:#fff; font-weight:700; cursor:pointer;">
                            <i class="fa-solid fa-floppy-disk"></i> Simpan ke JSON
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.initCanvas();
        this.fetchSavedSignature();
        this.loadQueueData();
    },

    initCanvas: function() {
        const canvas = document.getElementById("canvasTtd");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        let isDrawing = false;

        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (canvas.width / rect.width),
                y: (clientY - rect.top) * (canvas.height / rect.height)
            };
        };

        const start = (e) => {
            isDrawing = true;
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            e.preventDefault();
        };

        const draw = (e) => {
            if (!isDrawing) return;
            const pos = getPos(e);
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#0f172a";
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
            e.preventDefault();
        };

        const stop = () => { isDrawing = false; };

        canvas.addEventListener("mousedown", start);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stop);
        canvas.addEventListener("touchstart", start);
        canvas.addEventListener("touchmove", draw);
        canvas.addEventListener("touchend", stop);
    },

    clearCanvas: function() {
        const canvas = document.getElementById("canvasTtd");
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    },

    switchTtdTab: function(mode) {
        const tabDraw = document.getElementById("tabDrawTtd");
        const tabUpload = document.getElementById("tabUploadTtd");
        const areaDraw = document.getElementById("areaDrawTtd");
        const areaUpload = document.getElementById("areaUploadTtd");

        if (mode === "draw") {
            tabDraw.style.background = "#eff6ff"; tabDraw.style.color = "#2563eb"; tabDraw.style.borderColor = "#2563eb";
            tabUpload.style.background = "#fff"; tabUpload.style.color = "#64748b"; tabUpload.style.borderColor = "#cbd5e1";
            areaDraw.style.display = "block"; areaUpload.style.display = "none";
        } else {
            tabUpload.style.background = "#eff6ff"; tabUpload.style.color = "#2563eb"; tabUpload.style.borderColor = "#2563eb";
            tabDraw.style.background = "#fff"; tabDraw.style.color = "#64748b"; tabDraw.style.borderColor = "#cbd5e1";
            areaDraw.style.display = "none"; areaUpload.style.display = "block";
        }
    },

    handleTtdUploadPreview: function(input) {
        const file = input.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById("previewUploadedTtd");
                const img = document.getElementById("imgTtdUploaded");
                img.src = e.target.result;
                preview.style.display = "block";
            };
            reader.readAsDataURL(file);
        }
    },

    openSignatureModal: function() {
        document.getElementById("modalSignature").style.display = "flex";
    },

    closeSignatureModal: function() {
        document.getElementById("modalSignature").style.display = "none";
    },

    fetchSavedSignature: async function() {
        try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            const res = await window.apiFetch(`${baseBackend}/api/rt/saved-signature`);
            const json = await res.json();
            if (json.success && json.data) {
                this.savedSignature = json.data.signature;
            }
        } catch (e) {
            console.error("Gagal mengambil TTD profil JSON:", e);
        }
    },

    saveSignatureToStorage: async function() {
        let base64Result = "";
        const areaDraw = document.getElementById("areaDrawTtd");

        if (areaDraw.style.display !== "none") {
            const canvas = document.getElementById("canvasTtd");
            base64Result = canvas.toDataURL("image/png");
        } else {
            const img = document.getElementById("imgTtdUploaded");
            base64Result = img.src;
        }

        if (!base64Result || base64Result.length < 50) {
            alert("Harap goreskan tanda tangan atau pilih file gambar terlebih dahulu!");
            return;
        }

        try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            const res = await window.apiFetch(`${baseBackend}/api/rt/save-signature`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signature: base64Result })
            });
            const result = await res.json();
            if (result.success) {
                this.savedSignature = base64Result;
                alert("Tanda tangan RT berhasil disimpan.");
                this.closeSignatureModal();
                if (this.selectedSurat) this.renderPreviewSurat(this.selectedSurat);
            }
        } catch (e) {
            alert("Gagal menyimpan tanda tangan ke server.");
        }
    },

    loadQueueData: async function() {
        const tbody = document.getElementById("rt-table-queue");
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat antrean...</td></tr>`;

        try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            const res = await window.apiFetch(`${baseBackend}/api/rt/surat-antrean`);
            const result = await res.json();

            if (result.success && result.data && result.data.length > 0) {
                this.currentQueue = result.data;
                tbody.innerHTML = result.data.map((item, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${new Date(item.created_at).toLocaleDateString('id-ID')}</td>
                        <td><strong>${item.nama_lengkap}</strong></td>
                        <td>${item.nik}</td>
                        <td>${item.alamat_blok_no}</td>
                        <td><span class="rt-badge-wilayah">${item.keperluan_opsi}</span></td>
                        <td style="text-align:center;">
                            <button onclick="window.RTDash.openPreviewModal(${item.id})" class="rt-btn-primary" style="padding:6px 12px; font-size:0.8rem;">
                                <i class="fa-solid fa-eye"></i> Periksa & Sahkan
                            </button>
                        </td>
                    </tr>
                `).join("");
            } else {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#64748b;">Tidak ada permohonan surat masuk yang menunggu pengesahan.</td></tr>`;
            }
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#dc2626;">Gagal memuat antrean surat.</td></tr>`;
        }
    },

    openPreviewModal: function(id) {
        const surat = this.currentQueue.find(s => s.id == id);
        if (!surat) return;
        this.selectedSurat = surat;
        this.renderPreviewSurat(surat);
        document.getElementById("modalPreviewSurat").style.display = "flex";
    },

    closePreviewModal: function() {
        document.getElementById("modalPreviewSurat").style.display = "none";
    },

    renderPreviewSurat: function(s) {
        const paper = document.getElementById("a5PaperPreview");
        const statusBox = document.getElementById("ttdStatusBox");
        const padRt = String(s.rt_target).padStart(2, "0");
        const dateStr = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

        const options = [
            "1. Surat Pengantar Kerja",
            "2. Keterangan Domisili / Surat Pindah",
            "3. Surat Kelakuan Baik (SKCK)",
            "4. Keterangan Tidak Mampu",
            "5. Perpanjangan KTP/KTP Baru / KTP Sementara",
            "6. Pembuatan Akte Lahir / Pembuatan Kartu Keluarga",
            "7. Surat Pengantar Nikah / Numpang Nikah",
            "8. Keperluan Lainnya"
        ];

        const renderChecklist = options.map(opt => {
            const optNumber = opt.split(".")[0].trim();
            const isChecked = s.keperluan_opsi && (
                s.keperluan_opsi.trim() === opt.trim() || 
                s.keperluan_opsi.startsWith(optNumber + ".")
            );

            return `
                <div style="width: 48%; display: flex; align-items: flex-start; gap: 6px; margin-bottom: 3px;">
                    <span style="border: 1px solid #000; width: 12px; height: 12px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; margin-top: 1px;">
                        ${isChecked ? '&#10003;' : ''}
                    </span>
                    <span>${opt}</span>
                </div>
            `;
        }).join("");

        const ttdImgHtml = this.savedSignature 
            ? `<img src="${this.savedSignature}" style="max-height:55px; max-width:130px; display:block; margin:0 auto;" alt="TTD RT">`
            : `<div style="height:55px; line-height:55px; color:#94a3b8; font-style:italic; font-size:11px;">[Belum ada TTD]</div>`;

        paper.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #000; padding-bottom: 6px; margin-bottom: 10px;">
                <div style="width: 60px; text-align: left;">
                    <img src="../assets/Kabupaten Tangerang [koleksilogo.com].webp" 
                         alt="Logo Kab Tangerang" 
                         style="width: 52px; height: auto; display: block;"
                         onerror="this.style.display='none'">
                </div>

                <div style="flex: 1; text-align: center; padding: 0 10px;">
                    <h4 style="margin:0; font-size: 13px; font-weight: 800; text-transform: uppercase;">PEMERINTAH KABUPATEN TANGERANG</h4>
                    <h4 style="margin:2px 0 0 0; font-size: 13.5px; font-weight: 800;">RUKUN TETANGGA (RT) ${padRt} RW. 011</h4>
                    <h5 style="margin:2px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase;">DESA GELAM JAYA KEC. PASAR KEMIS</h5>
                    <p style="margin:2px 0 0 0; font-size: 9px; line-height: 1.2;">Jl. Danau Agung Raya, Villa Regensi Tangerang 2 Desa Gelam Jaya, Kec. Pasar Kemis Kab. Tangerang - Banten 15562</p>
                </div>

                <div style="width: 60px; text-align: right;">
                    <img src="../assets/logo.webp" 
                         alt="Logo RW 011" 
                         style="width: 52px; height: auto; border-radius: 50%; display: inline-block;"
                         onerror="this.style.display='none'">
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 8px;">
                <h4 style="margin:0; font-size: 13px; text-decoration: underline; font-weight: 800;">SURAT PENGANTAR</h4>
                <p style="margin:0; font-size: 11px;">Nomor: ${s.nomor_surat || `.../SP/RT.${padRt}/RW.011/2026`}</p>
            </div>

            <p style="margin:0 0 6px 0; text-align: justify;">Yang bertanda tangan dibawah ini Ketua RT. ${padRt} RW. 011 Villa Regensi Tangerang II Desa Gelam Jaya Kecamatan Pasar Kemis Kabupaten Tangerang menerangkan bahwa :</p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
                <tr><td style="width: 32%;">Nama</td><td style="width: 3%;">:</td><td style="font-weight: bold;">${s.nama_lengkap}</td></tr>
                <tr><td>Jenis Kelamin</td><td>:</td><td>${s.jenis_kelamin}</td></tr>
                <tr><td>Tempat / Tgl. Lahir</td><td>:</td><td>${s.tempat_tgl_lahir}</td></tr>
                <tr><td>Status Perkawinan</td><td>:</td><td>${s.status_perkawinan}</td></tr>
                <tr><td>Kewarganegaraan / Agama</td><td>:</td><td>${s.kewarganegaraan} / ${s.agama}</td></tr>
                <tr><td>Pekerjaan / Pendidikan</td><td>:</td><td>${s.pekerjaan} / ${s.pendidikan_terakhir || '-'}</td></tr>
                <tr><td>Alamat Sekarang</td><td>:</td><td>${s.alamat_blok_no}, RT. ${padRt} RW. 011</td></tr>
            </table>

            <p style="margin: 0 0 4px 0;">Mohon dibuatkan surat - surat sebagai berikut :</p>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; margin-bottom: 6px; font-size: 11px;">
                ${renderChecklist}
            </div>

            <p style="margin: 0 0 10px 0;">Demikian Surat Pengantar ini kami buat dengan benar untuk dipergunakan sesuai keperluannya.</p>

            <div style="display: flex; justify-content: space-between; text-align: center; margin-top: 10px;">
                <div style="width: 45%;">
                    <p style="margin:0 0 4px 0;">Dibuat oleh,</p>
                    <p style="margin:0 0 2px 0; font-weight: bold;">Ketua RT. ${padRt} RW. 011</p>
                    ${ttdImgHtml}
                    <p style="margin:2px 0 0 0; text-decoration: underline; font-weight: bold;">( ${this.currentUser.nama || 'Pengurus RT'} )</p>
                </div>
                <div style="width: 45%;">
                    <p style="margin:0 0 4px 0;">Gelam Jaya, ${dateStr}</p>
                    <p style="margin:0 0 2px 0; font-weight: bold;">Mengetahui, Ketua RW. 011</p>
                    <div style="height:55px; line-height:55px; color:#94a3b8; font-style:italic; font-size:11px;">[Menunggu RW]</div>
                    <p style="margin:2px 0 0 0; text-decoration: underline; font-weight: bold;">( KASWADI )</p>
                </div>
            </div>
        `;

        if (this.savedSignature) {
            statusBox.innerHTML = `
                <span style="color:#16a34a; font-weight:600;"><i class="fa-solid fa-circle-check"></i> TTD Digital Siap Digunakan</span>
                <button onclick="window.RTDash.openSignatureModal()" style="border:none; background:transparent; color:#2563eb; cursor:pointer; text-decoration:underline;">Ubah TTD</button>
            `;
        } else {
            statusBox.innerHTML = `
                <span style="color:#dc2626; font-weight:600;"><i class="fa-solid fa-circle-exclamation"></i> Belum ada TTD tersimpan</span>
                <button onclick="window.RTDash.openSignatureModal()" style="padding:4px 10px; background:#2563eb; color:#fff; border:none; border-radius:4px; cursor:pointer;">Buat TTD Sekarang</button>
            `;
        }
    },

    handleApproveSurat: async function() {
        if (!this.selectedSurat) return;

        if (!this.savedSignature) {
            alert("Anda belum memiliki tanda tangan digital! Silakan klik 'Atur TTD Digital RT' terlebih dahulu.");
            this.openSignatureModal();
            return;
        }

        if (!confirm(`Sahkan permohonan surat pengantar an. ${this.selectedSurat.nama_lengkap}?`)) return;

        const btn = document.getElementById("btnApproveSurat");
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyahkan...`;

        try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            const res = await window.apiFetch(`${baseBackend}/api/rt/surat/${this.selectedSurat.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signature: this.savedSignature })
            });

            const result = await res.json();
            if (result.success) {
                alert(result.message);
                this.closePreviewModal();
                this.loadQueueData();
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (e) {
            alert("Terjadi kesalahan saat menyetujui surat.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-signature"></i> Setujui & Bubuhkan Tanda Tangan`;
        }
    },

    handleLogout: async function() {
        if (!confirm("Apakah Anda yakin ingin keluar dari sesi RT?")) return;
        try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            await fetch(`${baseBackend}/api/logout`, { method: "POST", credentials: "include" });
        } catch (e) {
            console.error(e);
        } finally {
            localStorage.removeItem("rt_auth_token");
            localStorage.removeItem("rt_user_info");
            window.RTApp.init();
        }
    }
};