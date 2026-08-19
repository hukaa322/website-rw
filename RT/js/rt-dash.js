window.RTDash = {
    render: function(targetContainer, user) {
        targetContainer.innerHTML = `
            <div class="rt-dashboard-view">
                <header class="rt-topbar">
                    <div class="rt-topbar-title">
                        <h3 style="margin:0; font-size:17px; font-weight:800;">Panel Pengesahan RT</h3>
                        <span class="rt-badge-wilayah">${user.nama || user.username}</span>
                    </div>
                    <button onclick="window.RTDash.handleLogout()" class="rt-btn-logout">
                        <i class="fa-solid fa-right-from-bracket"></i> Keluar
                    </button>
                </header>

                <main class="rt-main-container">
                    <div class="rt-content-card">
                        <div class="rt-card-header">
                            <h3>Antrean Permohonan Surat Masuk</h3>
                            <p>Validasi berkas permohonan warga sebelum diteruskan ke Admin RW.</p>
                        </div>

                        <div class="table-responsive">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Tanggal Pengajuan</th>
                                        <th>Nama Pemohon</th>
                                        <th>Layanan Surat</th>
                                        <th>Keperluan</th>
                                        <th>Status</th>
                                        <th style="text-align: center;">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody id="rt-table-queue">
                                    <tr>
                                        <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                                            <i class="fa-solid fa-spinner fa-spin"></i> Memuat antrean permohonan...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        `;

        this.loadQueueData();
    },

    loadQueueData: async function() {
        const tbody = document.getElementById("rt-table-queue");
        if (!tbody) return;

        setTimeout(() => {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
                        Belum ada permohonan surat masuk yang menunggu pengesahan.
                    </td>
                </tr>
            `;
        }, 400);
    },

    handleLogout: async function() {
        if (!confirm("Apakah Anda yakin ingin keluar dari sesi RT?")) return;

        try {
            await fetch("http://localhost:3000/api/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch (e) {
            console.error("Gagal logout:", e);
        } finally {
            localStorage.removeItem("rt_auth_token");
            localStorage.removeItem("rt_user_info");
            window.RTApp.init();
        }
    }
};