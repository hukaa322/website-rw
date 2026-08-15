(async function checkAdminAuth() {
    try {
        // Ambil URL dari API.CHECK_AUTH jika ada, fallback ke localhost
        const apiUrl = (window.API && window.API.CHECK_AUTH) 
            ? window.API.CHECK_AUTH 
            : "http://localhost:3000/api/admin/dashboard-data";
        
        const fetcher = typeof window.apiFetch === "function" ? window.apiFetch : fetch;

        const res = await fetcher(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) {
            console.warn("Sesi admin tidak valid atau kadaluwarsa.");
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