/**
 * ==========================================================================
 * STRUKTUR KEPEMIMPINAN RW - ORBIT & DETAIL PAGE ENGINE
 * ==========================================================================
 */

// State Global
let rwGlobalData = [];
let activeCenterLeader = null;
let centerSlides = [];
let centerSliderInterval = null;
let isSwapping = false;
let backendBaseUrl = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 [RW ENGINE] DOMContentLoaded.");
  if (document.getElementById("rwContainer") || document.getElementById("profil-rw")) {
    console.log("🎯 [RW ENGINE] Elemen Orbit RW terdeteksi.");
    initProfileRwLoader();
  }
  if (document.getElementById("rwDetailWrapper")) {
    console.log("🎯 [RW ENGINE] Elemen Detail RW terdeteksi.");
    initDetailRwPage();
  }
});

// Listener jika komponen dimuat dinamis via components.js
window.addEventListener("componentLoaded", (e) => {
  console.log("🔄 [RW ENGINE] Event componentLoaded diterima:", e.detail);
  if (e.detail && e.detail.name === "profil-rw") {
    initProfileRwLoader();
  }
  if (e.detail && e.detail.name === "detail-rw") {
    initDetailRwPage();
  }
});

/**
 * Polling DOM untuk kontainer Orbit
 */
function initProfileRwLoader() {
  let attempts = 0;
  const maxAttempts = 30;

  const checkExist = setInterval(() => {
    const rwContainer = document.getElementById("rwContainer");
    if (rwContainer) {
      clearInterval(checkExist);
      console.log("✅ [PROFILE RW] Container #rwContainer ditemukan.");
      fetchProfileRw(rwContainer);
    } else if (++attempts >= maxAttempts) {
      clearInterval(checkExist);
      console.warn("⚠️ [PROFILE RW] Container #rwContainer tidak ditemukan setelah polling.");
    }
  }, 100);
}

/**
 * Fetch Data Orbit RW
 */
async function fetchProfileRw(rwContainer) {
  try {
    const targetUrl =
      window.API && window.API.RW && window.API.RW.GET_PUBLIC
        ? window.API.RW.GET_PUBLIC
        : "http://localhost:3000/api/public/rw";
    backendBaseUrl =
      window.API && window.API.BASE_URL
        ? window.API.BASE_URL
        : "http://localhost:3000";
    const fetcher =
      typeof window.apiFetch === "function" ? window.apiFetch : fetch;

    console.log(`🌐 [PROFILE RW] Fetching orbit data from: ${targetUrl}`);
    const response = await fetcher(targetUrl);

    console.log(`📡 [PROFILE RW] HTTP Status: ${response.status} (${response.statusText})`);

    if (response.status === 401 || response.status === 403) {
      console.error("🔒 [PROFILE RW] Error Autentikasi: Endpoint publik tidak dapat diakses!");
    }

    const result = await response.json();
    console.log("📦 [PROFILE RW] Response JSON:", result);

    const rawData = Array.isArray(result) ? result : result.data || [];

    if (Array.isArray(rawData) && rawData.length > 0) {
      rwGlobalData = rawData;
      console.log(`📊 [PROFILE RW] Memproses ${rwGlobalData.length} data pengurus RW.`);

      activeCenterLeader =
        rwGlobalData.find((d) => d.is_aktif == 1 || d.is_aktif == "1") ||
        rwGlobalData[0];

      console.log("👑 [PROFILE RW] Active Leader:", activeCenterLeader);
      renderOrbitStage(rwContainer);
    } else {
      console.warn("⚠️ [PROFILE RW] Data kosong dari endpoint RW.");
      rwContainer.innerHTML = `<p style="text-align: center; color: #718096; padding: 30px;">Belum ada data kepengurusan RW.</p>`;
    }
  } catch (err) {
    console.error("❌ [ERROR PROFILE RW]:", err);
    rwContainer.innerHTML = `<p style="text-align: center; color: #ef4444; padding: 30px;">Gagal memuat data struktur RW.</p>`;
  }
}

/**
 * Helper Status Leader
 */
function resolveLeaderStatus(item) {
  const isAktif = item.is_aktif == 1 || item.is_aktif == "1";
  let statusText = item.status
    ? item.status.toUpperCase()
    : isAktif
      ? "PENGURUS AKTIF"
      : "DEMISIONER";

  return {
    isAktif: isAktif,
    badgeText: statusText,
    badgeClass: isAktif ? "" : "is-demisioner",
  };
}

/**
 * Render Panggung Orbit Utama
 */
function renderOrbitStage(rwContainer) {
  if (!rwContainer || !activeCenterLeader) return;

  const leaderStatus = resolveLeaderStatus(activeCenterLeader);

  centerSlides = [
    {
      badgeText: leaderStatus.badgeText,
      badgeClass: leaderStatus.badgeClass,
      name: activeCenterLeader.nama_ketua || "Ketua RW",
      role: "Ketua RW 11",
      periode: activeCenterLeader.periode
        ? `Periode ${activeCenterLeader.periode}`
        : "Masa Jabatan Aktif",
      foto: activeCenterLeader.foto_utama,
    },
  ];

  if (activeCenterLeader.nama_wakil || activeCenterLeader.foto_wakil) {
    centerSlides.push({
      badgeText: leaderStatus.badgeText,
      badgeClass: leaderStatus.badgeClass,
      name: activeCenterLeader.nama_wakil || "Wakil Ketua RW",
      role: "Wakil Ketua RW 11",
      periode: activeCenterLeader.periode
        ? `Periode ${activeCenterLeader.periode}`
        : "Masa Jabatan Aktif",
      foto: activeCenterLeader.foto_wakil || activeCenterLeader.foto_utama,
    });
  }

  const orbitItems =
    rwGlobalData.length > 1
      ? rwGlobalData.filter(
          (d) => String(d.id) !== String(activeCenterLeader.id),
        )
      : [activeCenterLeader];

  const totalSatellites = orbitItems.length;
  const angleStep = 360 / totalSatellites;

  const satellitesHtml = orbitItems
    .map((item, index) => {
      const currentAngle = Math.round(index * angleStep);
      const itemStatus = resolveLeaderStatus(item);

      const imgUrl = item.foto_utama
        ? item.foto_utama.startsWith("http")
          ? item.foto_utama
          : `${backendBaseUrl}/assets/galery/rw/${item.foto_utama}`
        : "assets/img/default-avatar.png";

      return `
            <div class="orbit-satellite-anchor" 
                 id="satAnchor-${item.id}"
                 style="--orbit-angle: ${currentAngle}deg;">
                <div class="orbit-satellite-card" 
                     data-id="${item.id}" 
                     title="Klik untuk menampilkan ${item.nama_ketua || "Pengurus"}">
                    <img src="${imgUrl}" 
                         alt="${item.nama_ketua || "Pengurus"}" 
                         class="orbit-satellite-img"
                         onerror="this.onerror=null; this.src='assets/img/default-avatar.png';">
                    <h5 class="orbit-satellite-name">${item.nama_ketua || "Pengurus"}</h5>
                    <span class="orbit-satellite-periode">${item.periode || (itemStatus.isAktif ? "Aktif" : "Histori")}</span>
                </div>
            </div>
        `;
    })
    .join("");

  const initialCenter = centerSlides[0];
  const initialCenterImg = initialCenter.foto
    ? initialCenter.foto.startsWith("http")
      ? initialCenter.foto
      : `${backendBaseUrl}/assets/galery/rw/${initialCenter.foto}`
    : "assets/img/default-avatar.png";

  rwContainer.innerHTML = `
        <div class="rw-orbit-stage" id="rwOrbitStage">
            <div class="orbit-track"></div>

            <!-- CENTER HUB JUMBO -->
            <div class="rw-center-hub glow-active" id="rwCenterHub">
                <div class="rw-center-img-wrap">
                    <img id="rwCenterImg" src="${initialCenterImg}" alt="Foto Profil RW" onerror="this.onerror=null; this.src='assets/img/default-avatar.png';">
                </div>
                <span id="rwCenterBadge" class="rw-center-badge ${initialCenter.badgeClass}">${initialCenter.badgeText}</span>
                <h4 id="rwCenterName" class="rw-center-name">${initialCenter.name}</h4>
                <span id="rwCenterRole" class="rw-center-role">${initialCenter.role}</span>
                <span id="rwCenterPeriode" class="rw-center-periode">${initialCenter.periode}</span>
            </div>

            <!-- ROTATING SATELLITES -->
            <div class="orbit-rotator" id="orbitRotator">
                ${satellitesHtml}
            </div>
        </div>
    `;

  attachSatelliteClickEvents(rwContainer);
  startCenterAutoSlider();
}

/**
 * Event Klik Satelit
 */
function attachSatelliteClickEvents(rwContainer) {
  const satelliteCards = rwContainer.querySelectorAll(".orbit-satellite-card");

  satelliteCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isSwapping) return;

      const targetId = card.getAttribute("data-id");
      const selectedItem = rwGlobalData.find(
        (d) => String(d.id) === String(targetId),
      );

      if (
        !selectedItem ||
        String(selectedItem.id) === String(activeCenterLeader.id)
      )
        return;

      executeDampAndGlideSwap(targetId, selectedItem, rwContainer);
    });
  });
}

function executeDampAndGlideSwap(targetId, selectedItem, rwContainer) {
  isSwapping = true;
  clearInterval(centerSliderInterval);

  const targetAnchor = document.getElementById(`satAnchor-${targetId}`);
  const centerHub = document.getElementById("rwCenterHub");

  if (targetAnchor && centerHub) {
    targetAnchor.classList.add("is-swapping-to-center");
    centerHub.classList.add("is-swapping-to-orbit");

    setTimeout(() => {
      activeCenterLeader = selectedItem;
      renderOrbitStage(rwContainer);
      isSwapping = false;
    }, 800);
  } else {
    activeCenterLeader = selectedItem;
    renderOrbitStage(rwContainer);
    isSwapping = false;
  }
}

function startCenterAutoSlider() {
  if (centerSliderInterval) clearInterval(centerSliderInterval);
  if (centerSlides.length <= 1) return;

  let currentIndex = 0;
  const hub = document.getElementById("rwCenterHub");
  const imgElem = document.getElementById("rwCenterImg");
  const badgeElem = document.getElementById("rwCenterBadge");
  const nameElem = document.getElementById("rwCenterName");
  const roleElem = document.getElementById("rwCenterRole");
  const periodeElem = document.getElementById("rwCenterPeriode");

  centerSliderInterval = setInterval(() => {
    if (isSwapping) return;

    currentIndex = (currentIndex + 1) % centerSlides.length;
    const current = centerSlides[currentIndex];

    if (hub && imgElem) {
      imgElem.style.opacity = "0";
      hub.classList.remove("glow-active");

      setTimeout(() => {
        const newImgSrc = current.foto
          ? current.foto.startsWith("http")
            ? current.foto
            : `${backendBaseUrl}/assets/galery/rw/${current.foto}`
          : "assets/img/default-avatar.png";

        imgElem.src = newImgSrc;
        if (badgeElem) {
          badgeElem.textContent = current.badgeText;
          badgeElem.className = `rw-center-badge ${current.badgeClass}`;
        }
        if (nameElem) nameElem.textContent = current.name;
        if (roleElem) roleElem.textContent = current.role;
        if (periodeElem) periodeElem.textContent = current.periode;

        imgElem.style.opacity = "1";
        hub.classList.add("glow-active");
      }, 300);
    }
  }, 3000);
}

/**
 * Fetch Detail Page RW
 */
function initDetailRwPage() {
  let attempts = 0;
  const maxAttempts = 30;

  const checkExist = setInterval(() => {
    const detailWrapper = document.getElementById("rwDetailWrapper");
    if (detailWrapper) {
      clearInterval(checkExist);
      console.log("✅ [DETAIL RW] Container #rwDetailWrapper ditemukan.");
      fetchDetailRwPage(detailWrapper);
    } else if (++attempts >= maxAttempts) {
      clearInterval(checkExist);
      console.warn("⚠️ [DETAIL RW] Container #rwDetailWrapper tidak ditemukan setelah polling.");
    }
  }, 100);
}

async function fetchDetailRwPage(container) {
  try {
    const targetUrl =
      window.API && window.API.RW && window.API.RW.GET_PUBLIC
        ? window.API.RW.GET_PUBLIC
        : "http://localhost:3000/api/public/rw";
    const backendUrl =
      window.API && window.API.BASE_URL
        ? window.API.BASE_URL
        : "http://localhost:3000";
    const fetcher =
      typeof window.apiFetch === "function" ? window.apiFetch : fetch;

    console.log(`🌐 [DETAIL RW] Fetching detail data from: ${targetUrl}`);
    const response = await fetcher(targetUrl);

    console.log(`📡 [DETAIL RW] HTTP Status: ${response.status} (${response.statusText})`);

    if (response.status === 401 || response.status === 403) {
      console.error("🔒 [DETAIL RW] Error Autentikasi: Endpoint publik tidak dapat diakses!");
    }

    const result = await response.json();
    console.log("📦 [DETAIL RW] Response JSON:", result);

    const rawData = Array.isArray(result) ? result : result.data || [];

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.warn("⚠️ [DETAIL RW] Data detail RW kosong.");
      container.innerHTML = `
        <div class="rw-empty-state">
            <i class="fa-solid fa-folder-open fa-3x"></i>
            <p>Belum ada data kepengurusan RW yang tersimpan.</p>
        </div>`;
      return;
    }

    const sortedData = [...rawData].sort(
      (a, b) => (b.is_aktif || 0) - (a.is_aktif || 0),
    );

    const cardsHtml = sortedData
      .map((item) => {
        const isAktif = item.is_aktif == 1 || item.is_aktif == "1";
        const statusText = item.status
          ? item.status.toUpperCase()
          : isAktif
            ? "PENGURUS AKTIF"
            : "DEMISIONER";
        const badgeClass = isAktif ? "status-active" : "status-demis";

        const imgUrl = item.foto_utama
          ? item.foto_utama.startsWith("http")
            ? item.foto_utama
            : `${backendUrl}/assets/galery/rw/${item.foto_utama}`
          : "assets/img/default-avatar.png";

        const phoneNumber =
          item.nomor_telepon || item.no_wa || item.telepon || item.hp;

        let waButtonHtml = `<span class="rw-card-no-contact"><i class="fa-solid fa-phone-slash"></i> Kontak Tidak Tersedia</span>`;

        if (phoneNumber && String(phoneNumber).trim() !== "") {
          const rawPhone = String(phoneNumber).replace(/[^0-9]/g, "");
          const cleanPhone = rawPhone.startsWith("0")
            ? "62" + rawPhone.slice(1)
            : rawPhone;

          waButtonHtml = `
            <a href="https://wa.me/${cleanPhone}?text=Halo%20Bapak/Ibu%20Pengurus%20RW" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="rw-card-wa-btn">
                <i class="fa-brands fa-whatsapp"></i> Hubungi WhatsApp
            </a>
          `;
        }

        return `
          <div class="rw-detail-card ${isAktif ? "is-active-card" : ""}">
              <div class="rw-card-img-box">
                  <img src="${imgUrl}" alt="${item.nama_ketua || "Pengurus RW"}" onerror="this.onerror=null; this.src='assets/img/default-avatar.png';">
                  <span class="rw-card-badge ${badgeClass}">${statusText}</span>
              </div>
              <div class="rw-card-content">
                  <h3 class="rw-card-name" title="${item.nama_ketua || "Nama Pengurus"}">
                      ${item.nama_ketua || "Nama Pengurus"}
                  </h3>
                  <div class="rw-card-meta">
                      <span class="rw-card-role">
                          <i class="fa-solid fa-user-tie"></i> ${item.jabatan || "Ketua RW"}
                      </span>
                      <span class="rw-card-period">
                          <i class="fa-solid fa-calendar-check"></i> ${item.periode ? `Periode ${item.periode}` : "Periode -"}
                      </span>
                  </div>
                  <div class="rw-card-desc-box">
                      <p class="rw-card-desc">
                          ${item.deskripsi || item.visi_misi || "Pengurus yang senantiasa berdedikasi dalam membangun kerukunan, keterbukaan informasi, dan pelayanan terpadu bagi warga RW."}
                      </p>
                  </div>
                  <div class="rw-card-action">
                      ${waButtonHtml}
                  </div>
              </div>
          </div>
        `;
      })
      .join("");

    container.innerHTML = `<div class="rw-detail-grid">${cardsHtml}</div>`;
    console.log("✨ [DETAIL RW] Render grid kepengurusan RW selesai.");
  } catch (err) {
    console.error("❌ [ERROR DETAIL RW]:", err);
    container.innerHTML = `
      <div class="rw-empty-state text-danger">
          <i class="fa-solid fa-triangle-exclamation fa-3x"></i>
          <p>Gagal memuat data histori RW dari database.</p>
      </div>`;
  }
}