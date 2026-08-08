document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMsg = document.getElementById("errorMsg");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            try {
                // Gunakan origin yang sama dengan lokasi browser Anda berjalan
                const response = await fetch("http://localhost:3000/api/login", {
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
                    // Redirect ke admin/index.html
                    window.location.href = "../admin/index.html";
                } else {
                    errorMsg.innerText = data.message;
                    errorMsg.style.display = "block";
                }
            } catch (error) {
                console.error("Detail Error Fetching:", error);
                errorMsg.innerText = "Gagal terhubung ke server! Periksa koneksi backend.";
                errorMsg.style.display = "block";
            }
        });
    }
});