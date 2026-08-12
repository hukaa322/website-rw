/**
 * Dark Mode Controller - Vireta 2
 */
(function () {
    // 1. Fungsi Penerapan Tema ke HTML Element
    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        // Update semua icon pada tombol sakelar yang ada di DOM
        const toggleButtons = document.querySelectorAll(".themeToggleBtn, .btn-theme-toggle");
        toggleButtons.forEach((btn) => {
            const icon = btn.querySelector("i");
            if (icon) {
                if (theme === "dark") {
                    icon.className = "fa-solid fa-sun";
                } else {
                    icon.className = "fa-solid fa-moon";
                }
            }
        });
    }

    // 2. Eksekusi Tema Awal Secepat Mungkin (Mencegah Flashing)
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    // 3. Tangkap Klik Tombol Secara Dinamis (Event Delegation)
    document.addEventListener("click", function (event) {
        const btn = event.target.closest(".themeToggleBtn, .btn-theme-toggle");
        if (btn) {
            event.preventDefault();
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            applyTheme(newTheme);
        }
    });
})();