(async function checkAdminAuth() {
    // Konsisten gunakan localhost:3000 agar Cookie HTTP-Only terkirim dengan benar
    const apiUrl = "http://localhost:3000/api/admin/dashboard-data";

    try {
        const res = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include" // Wajib agar Cookie HTTP-Only ikut terkirim
        });

        if (!res.ok) {
            console.warn("Sesi admin tidak valid atau kadaluwarsa.");
            // Redirect kembali ke halaman login (bukan ke root)
            window.location.href = "../login/index.html";
            return;
        }

        const data = await res.json();
        console.log("Autentikasi Admin Berhasil:", data.message);

    } catch (err) {
        console.error("Gagal verifikasi autentikasi ke server:", err);
        window.location.href = "../login/index.html";
    }
})();