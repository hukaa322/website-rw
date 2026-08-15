document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            // Ambil endpoint dari API config jika tersedia, fallback ke localhost
            const targetUrl = (window.API && window.API.LOGIN) ? window.API.LOGIN : "http://localhost:3000/api/login";
            const fetchFn = typeof window.apiFetch === "function" ? window.apiFetch : fetch;

            try {
                const response = await fetchFn(targetUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    errorMsg.style.display = "none";
                    alert(data.message);
                    window.location.href = "../admin/index.html";
                } else {
                    errorMsg.innerText = data.message;
                    errorMsg.style.display = "block";
                }
            } catch (error) {
                console.error("Detail Error Fetching:", error);
                errorMsg.innerText = "Gagal terhubung ke server! Periksa koneksi Ngrok / Backend.";
                errorMsg.style.display = "block";
            }
        });
    }
});