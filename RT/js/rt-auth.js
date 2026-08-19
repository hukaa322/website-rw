window.RTAuth = {
    render: function(targetContainer) {
        targetContainer.innerHTML = `
            <div class="rt-login-wrapper">
                <div class="rt-login-card">
                    <div class="rt-brand-header">
                        <div class="rt-brand-icon">
                            <i class="fa-solid fa-stamp"></i>
                        </div>
                        <h3>Portal Pengesahan RT</h3>
                        <p>Masuk untuk mengesahkan permohonan administrasi warga.</p>
                    </div>

                    <form id="formAuthRT" onsubmit="window.RTAuth.handleSubmit(event)">
                        <div class="rt-form-group">
                            <label class="rt-form-label">Username Pengurus RT</label>
                            <div class="rt-input-icon-wrap">
                                <i class="fa-solid fa-user-shield"></i>
                                <input type="text" id="rtAuthUser" class="rt-input-control" placeholder="Contoh: rt01" required>
                            </div>
                        </div>

                        <div class="rt-form-group">
                            <label class="rt-form-label">Password</label>
                            <div class="rt-input-icon-wrap">
                                <i class="fa-solid fa-lock"></i>
                                <input type="password" id="rtAuthPass" class="rt-input-control" placeholder="••••••••" required>
                            </div>
                        </div>

                        <button type="submit" id="btnSubmitAuth" class="rt-btn-primary">
                            <i class="fa-solid fa-right-to-bracket"></i> Masuk ke Dashboard
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    handleSubmit: async function(event) {
        event.preventDefault();
        const username = document.getElementById("rtAuthUser").value;
        const password = document.getElementById("rtAuthPass").value;
        const btn = document.getElementById("btnSubmitAuth");

        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Memverifikasi...`;

        try {
            const res = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password })
            });
            const result = await res.json();

            if (result.success) {
                if (result.user.role !== 'pengurus' && result.user.role !== 'admin') {
                    alert("Akses ditolak: Akun Anda tidak memiliki hak akses Pengurus RT.");
                    return;
                }

                localStorage.setItem("rt_auth_token", "logged_in");
                localStorage.setItem("rt_user_info", JSON.stringify(result.user));
                window.RTApp.init();
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (err) {
            alert("Gagal menghubungi server API di http://localhost:3000");
        } finally {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> Masuk ke Dashboard`;
        }
    }
};