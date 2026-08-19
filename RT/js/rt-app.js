window.RTApp = {
    init: function() {
        const token = localStorage.getItem("rt_auth_token");
        const userJson = localStorage.getItem("rt_user_info");
        const root = document.getElementById("rt-app-root");

        if (!token || !userJson) {
            // Belum login -> Render modul Auth
            window.RTAuth.render(root);
        } else {
            // Sudah login -> Render modul Dashboard
            const userData = JSON.parse(userJson);
            window.RTDash.render(root, userData);
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.RTApp.init();
});