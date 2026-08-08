window.openRtModal = function() {
    const form = document.getElementById("rtForm");
    if (form) form.reset();
    const modal = document.getElementById("rtModal");
    if (modal) modal.style.display = "flex";
};

window.closeRtModal = function() {
    const modal = document.getElementById("rtModal");
    if (modal) modal.style.display = "none";
};

window.loadRtData = async function() {
    try {
        const res = await fetch("http://localhost:3000/api/admin/rt", { credentials: "include" });
        const result = await res.json();
        
        const tbody = document.getElementById("rtTableBody");
        if (!tbody) return;

        if (result.success) {
            tbody.innerHTML = "";
            result.data.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                        <td>RT ${String(item.nomor_rt).padStart(2, '0')}</td>
                        <td>
                            ${item.foto_utama 
                                ? `<img src="../assets/galery/rt/${item.foto_utama}" width="40" height="40">` 
                                : '-'}
                        </td>
                        <td>${item.nama_ketua}</td>
                        <td>${item.nomor_telepon}</td>
                        <td>
                            <button class="action-btn btn-delete" onclick="window.deleteRt(${item.id})">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch(err) {
        console.error("Error loading RT data:", err);
    }
};

window.deleteRt = async function(id) {
    if (confirm("Hapus data RT ini?")) {
        const res = await fetch(`http://localhost:3000/api/admin/rt/${id}`, {
            method: "DELETE",
            credentials: "include"
        });
        const result = await res.json();
        if (result.success) window.loadRtData();
    }
};

// Event listener submit form RT
document.addEventListener("submit", async (e) => {
    if (e.target && e.target.id === "rtForm") {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const res = await fetch("http://localhost:3000/api/admin/rt", {
                method: "POST",
                credentials: "include",
                body: formData
            });
            const result = await res.json();
            if (result.success) {
                alert(result.message);
                window.closeRtModal();
                window.loadRtData();
            } else {
                alert("Gagal: " + result.message);
            }
        } catch (err) {
            alert("Terjadi kesalahan pengiriman data.");
        }
    }
});