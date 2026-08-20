let currentJenisLayanan = 'pengesahan_rw';
let allLayananData = [];
let rwSuratQueue = [];
let savedRwSignature = null;
let activeSuratItem = null;

window.LayananModule = {
    init: function() {
        currentJenisLayanan = 'pengesahan_rw';
        fetchRwSavedSignature();
        initRwCanvas();
        loadActiveTabData();
    },

    openPreviewRwModal: function(id) {
        const surat = rwSuratQueue.find(s => s.id == id);
        if (!surat) return;
        activeSuratItem = surat;
        this.renderPreviewDocument(surat);
        document.getElementById("modalRwPreviewSurat").style.display = "flex";
    },

    renderPreviewDocument: function(s) {
        const paper = document.getElementById("printAreaSurat");
        const statusBox = document.getElementById("rwSignatureStatusBox");
        const padRt = String(s.rt_target).padStart(2, "0");
        const dateStr = new Date(s.tgl_ttd_rw || Date.now()).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

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

        // TTD RT (dari Database)
        const ttdRtHtml = s.ttd_rt_image 
            ? `<img src="${s.ttd_rt_image}" style="max-height:55px; max-width:130px; display:block; margin:0 auto;" alt="TTD RT">`
            : `<div style="height:55px; line-height:55px; color:#94a3b8; font-style:italic;">[TTD RT Kosong]</div>`;

        // TTD RW (Jika sudah sahkan pakai database, jika belum preview dari JSON)
        const effectiveRwSignature = s.ttd_rw_image || savedRwSignature;
        const ttdRwHtml = effectiveRwSignature 
            ? `<img src="${effectiveRwSignature}" style="max-height:55px; max-width:130px; display:block; margin:0 auto;" alt="TTD RW">`
            : `<div style="height:55px; line-height:55px; color:#94a3b8; font-style:italic;">[Belum ada TTD RW]</div>`;

        paper.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #000; padding-bottom: 6px; margin-bottom: 10px;">
                <div style="width: 60px; text-align: left;">
                    <img src="../assets/Kabupaten Tangerang [koleksilogo.com].webp" alt="Logo Kab Tangerang" style="width: 52px; height: auto; display: block;">
                </div>
                <div style="flex: 1; text-align: center; padding: 0 10px;">
                    <h4 style="margin:0; font-size: 13px; font-weight: 800; text-transform: uppercase;">PEMERINTAH KABUPATEN TANGERANG</h4>
                    <h4 style="margin:2px 0 0 0; font-size: 13.5px; font-weight: 800;">RUKUN TETANGGA (RT) ${padRt} RW. 011</h4>
                    <h5 style="margin:2px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase;">DESA GELAM JAYA KEC. PASAR KEMIS</h5>
                    <p style="margin:2px 0 0 0; font-size: 9px; line-height: 1.2;">Jl. Danau Agung Raya, Villa Regensi Tangerang 2 Desa Gelam Jaya, Kec. Pasar Kemis Kab. Tangerang - Banten 15562</p>
                </div>
                <div style="width: 60px; text-align: right;">
                    <img src="../assets/logo.webp" alt="Logo RW 011" style="width: 52px; height: auto; border-radius: 50%; display: inline-block;">
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
                    ${ttdRtHtml}
                    <p style="margin:2px 0 0 0; text-decoration: underline; font-weight: bold;">( Pengurus RT.${padRt} )</p>
                </div>
                <div style="width: 45%;">
                    <p style="margin:0 0 4px 0;">Gelam Jaya, ${dateStr}</p>
                    <p style="margin:0 0 2px 0; font-weight: bold;">Mengetahui, Ketua RW. 011</p>
                    ${ttdRwHtml}
                    <p style="margin:2px 0 0 0; text-decoration: underline; font-weight: bold;">( KASWADI )</p>
                </div>
            </div>
        `;

        const btnSahkan = document.getElementById("btnSahkanRw");
        if (s.status === 'selesai') {
            btnSahkan.style.display = "none";
            statusBox.innerHTML = `<span style="color:#16a34a; font-weight:700;"><i class="fa-solid fa-check-double"></i> Surat ini telah disahkan resmi oleh Ketua RW 011.</span>`;
        } else {
            btnSahkan.style.display = "inline-block";
            statusBox.innerHTML = savedRwSignature 
                ? `<span style="color:#16a34a; font-weight:600;"><i class="fa-solid fa-circle-check"></i> TTD Digital Ketua RW Siap Dibubuhkan</span>`
                : `<span style="color:#dc2626; font-weight:600;"><i class="fa-solid fa-circle-exclamation"></i> TTD Ketua RW Belum Dikonfigurasi!</span> <button onclick="openRwSignatureModal()" style="padding:2px 8px; margin-left:8px;" class="btn btn-sm btn-primary">Atur TTD</button>`;
        }
    },

    approveSuratRw: async function() {
        if (!activeSuratItem) return;
        if (!savedRwSignature) {
            alert("Harap atur tanda tangan digital Ketua RW terlebih dahulu!");
            openRwSignatureModal();
            return;
        }

        if (!confirm(`Sahkan surat pengantar an. ${activeSuratItem.nama_lengkap}?`)) return;

        const btn = document.getElementById("btnSahkanRw");
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyahkan...`;

        try {
            const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
            const res = await apiFetch(`${baseBackend}/api/rw/surat/${activeSuratItem.id}/approve`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ signature: savedRwSignature })
            });
            const result = await res.json();
            if (result.success) {
                alert(result.message);
                closeRwPreviewModal();
                loadActiveTabData();
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (e) {
            alert("Terjadi kesalahan sistem.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-stamp"></i> Sahkan & Bubuhkan TTD RW`;
        }
    },

    downloadPDF: function() {
        const printContent = document.getElementById("printAreaSurat").innerHTML;
        const win = window.open("", "_blank");
        win.document.write(`
            <html>
                <head>
                    <title>Surat Pengantar RT RW 011</title>
                    <style>
                        @page { size: A5 portrait; margin: 12mm 15mm; }
                        body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 0; }
                    </style>
                </head>
                <body onload="window.print(); window.close();">
                    ${printContent}
                </body>
            </html>
        `);
        win.document.close();
    }
};

// --- LOGIKA TABEL & TAB TRANSISI ---
function switchTab(jenis, btnElement) {
    currentJenisLayanan = jenis;
    document.querySelectorAll('.gallery-pill-filter .pill-btn').forEach(btn => btn.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const btnAturTtd = document.getElementById("btnAturTtdRw");
    const btnTambah = document.getElementById("btnTambahLayananMaster");
    const titles = {
        'pengesahan_rw': 'Antrean Permohonan Surat dari RT',
        'surat': 'Master Kontak Layanan Surat',
        'iuran': 'Master Pembayaran Iuran',
        'layanan': 'Master Kontak Siaga & Keamanan'
    };
    
    document.getElementById('tab-title').innerText = titles[jenis] || 'Daftar Layanan';

    if (jenis === 'pengesahan_rw') {
        btnAturTtd.style.display = "inline-block";
        btnTambah.style.display = "none";
    } else {
        btnAturTtd.style.display = "none";
        btnTambah.style.display = "inline-block";
    }

    loadActiveTabData();
}

async function loadActiveTabData() {
    if (currentJenisLayanan === 'pengesahan_rw') {
        loadRwQueueData();
    } else {
        loadMasterLayananData();
    }
}

async function loadRwQueueData() {
    const thead = document.getElementById('layanan-table-head');
    const tbody = document.getElementById('layanan-table-body');
    const totalElem = document.getElementById('total-count');

    thead.innerHTML = `
        <tr>
            <th>No</th>
            <th>No. Surat</th>
            <th>Wilayah Asal</th>
            <th>Nama Pemohon</th>
            <th>Keperluan</th>
            <th>Status</th>
            <th style="text-align:center;">Aksi</th>
        </tr>
    `;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat permohonan surat dari RT...</td></tr>`;

    try {
        const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
        const res = await apiFetch(`${baseBackend}/api/rw/surat-antrean`);
        const result = await res.json();

        if (result.success) {
            rwSuratQueue = result.data || [];
            totalElem.innerText = `${rwSuratQueue.length} Surat`;

            if (rwSuratQueue.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada surat masuk dari RT yang menunggu pengesahan RW.</td></tr>`;
                return;
            }

            tbody.innerHTML = rwSuratQueue.map((item, idx) => {
                const isSelesai = item.status === 'selesai';
                const statusBadge = isSelesai 
                    ? `<span style="background:#dcfce7; color:#15803d; padding:4px 10px; border-radius:6px; font-weight:700; font-size:0.75rem;">Selesai (ACC RW)</span>`
                    : `<span style="background:#fef3c7; color:#b45309; padding:4px 10px; border-radius:6px; font-weight:700; font-size:0.75rem;">Menunggu ACC RW</span>`;

                return `
                    <tr>
                        <td>${idx + 1}</td>
                        <td><strong>${item.nomor_surat || '-'}</strong></td>
                        <td><span class="badge-count">RT ${String(item.rt_target).padStart(2, '0')}</span></td>
                        <td>${item.nama_lengkap}</td>
                        <td>${item.keperluan_opsi}</td>
                        <td>${statusBadge}</td>
                        <td style="text-align:center;">
                            <button class="btn btn-sm btn-primary" onclick="window.LayananModule.openPreviewRwModal(${item.id})">
                                <i class="fa-solid fa-eye"></i> Periksa / Cetak
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger-color);">Gagal terhubung ke backend.</td></tr>`;
    }
}

async function loadMasterLayananData() {
    const thead = document.getElementById('layanan-table-head');
    const tbody = document.getElementById('layanan-table-body');
    const totalElem = document.getElementById('total-count');

    thead.innerHTML = `
        <tr>
            <th>No</th>
            <th>Nama Kegiatan / Layanan</th>
            <th>Target Wilayah</th>
            <th>No. WhatsApp</th>
            <th>Gambar / QRIS</th>
            <th>Keterangan</th>
            <th style="text-align:center;">Aksi</th>
        </tr>
    `;

    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat data master...</td></tr>`;

    try {
        const response = await apiFetch(`${window.API.LAYANAN.GET_ALL}?jenis_layanan=${currentJenisLayanan}`);
        const result = await response.json();
        if (result.success) {
            allLayananData = result.data || [];
            totalElem.innerText = `${allLayananData.length} Data`;
            if (allLayananData.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px;">Belum ada master kontak untuk kategori ini.</td></tr>`;
                return;
            }

            const baseUrl = window.API?.BASE_URL || '..';
            tbody.innerHTML = allLayananData.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${item.nama_kegiatan}</strong></td>
                    <td><span class="badge-count">${item.target_wilayah}</span></td>
                    <td><a href="https://wa.me/${item.nomor_telepon}" target="_blank" style="color:#25D366; font-weight:700;">${item.nomor_telepon}</a></td>
                    <td>${item.gambar_umum ? 'Ada' : '-'}</td>
                    <td>${item.keterangan || '-'}</td>
                    <td style="text-align:center;">
                        <button class="btn btn-sm btn-secondary" onclick="editLayanan(${item.id})">Edit</button>
                        <button class="btn btn-sm btn-secondary" style="color:var(--danger-color);" onclick="deleteLayanan(${item.id})">Hapus</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger-color);">Gagal memuat data.</td></tr>`;
    }
}

// --- MODAL TTD RW LOGIC ---
function initRwCanvas() {
    const canvas = document.getElementById("canvasRwTtd");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let isDrawing = false;

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    canvas.onmousedown = (e) => { isDrawing = true; ctx.beginPath(); const p = getPos(e); ctx.moveTo(p.x, p.y); };
    canvas.onmousemove = (e) => { if (!isDrawing) return; const p = getPos(e); ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.strokeStyle = "#0f172a"; ctx.lineTo(p.x, p.y); ctx.stroke(); };
    window.onmouseup = () => { isDrawing = false; };
}

function clearRwCanvas() {
    const c = document.getElementById("canvasRwTtd");
    if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
}

function switchRwTtdMode(mode) {
    document.getElementById("boxRwDraw").style.display = mode === 'draw' ? 'block' : 'none';
    document.getElementById("boxRwUpload").style.display = mode === 'upload' ? 'block' : 'none';
}

function previewRwTtdUpload(input) {
    const f = input.files[0];
    if (f) {
        const r = new FileReader();
        r.onload = (e) => {
            document.getElementById("imgRwUploaded").src = e.target.result;
            document.getElementById("previewRwUploadWrapper").style.display = "block";
        };
        r.readAsDataURL(f);
    }
}

async function fetchRwSavedSignature() {
    try {
        const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
        const res = await apiFetch(`${baseBackend}/api/rw/saved-signature`);
        const json = await res.json();
        if (json.success && json.data) savedRwSignature = json.data.signature;
    } catch (e) {}
}

async function saveRwSignature() {
    let b64 = "";
    if (document.getElementById("boxRwDraw").style.display !== 'none') {
        b64 = document.getElementById("canvasRwTtd").toDataURL("image/png");
    } else {
        b64 = document.getElementById("imgRwUploaded").src;
    }

    if (!b64 || b64.length < 50) return alert("Tanda tangan kosong.");

    try {
        const baseBackend = window.API?.BASE_URL || "http://localhost:3000";
        const res = await apiFetch(`${baseBackend}/api/rw/save-signature`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ signature: b64 })
        });
        const result = await res.json();
        if (result.success) {
            savedRwSignature = b64;
            alert("Tanda tangan Ketua RW berhasil disimpan ke JSON.");
            closeRwSignatureModal();
            if (activeSuratItem) window.LayananModule.renderPreviewDocument(activeSuratItem);
        }
    } catch (e) {
        alert("Gagal simpan TTD.");
    }
}

function openRwSignatureModal() { document.getElementById("modalRwSignature").style.display = "flex"; }
function closeRwSignatureModal() { document.getElementById("modalRwSignature").style.display = "none"; }
function closeRwPreviewModal() { document.getElementById("modalRwPreviewSurat").style.display = "none"; }