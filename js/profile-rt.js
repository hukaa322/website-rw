document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 [PROFILE RT] Inisialisasi Smooth Infinite Slider RT.");
  initProfileRtLoader();
});

let animationFrameId = null;
let isPaused = false;
let pressTimer = null;

function initProfileRtLoader() {
  let attempts = 0;
  const maxAttempts = 30;

  const checkExist = setInterval(() => {
    const rtContainer = document.getElementById("rtContainer");
    if (rtContainer) {
      clearInterval(checkExist);
      fetchProfileRt(rtContainer);
    } else if (++attempts >= maxAttempts) {
      clearInterval(checkExist);
    }
  }, 100);
}

async function fetchProfileRt(rtContainer) {
  const targetUrl =
    window.API && window.API.RT && window.API.RT.GET_PUBLIC
      ? window.API.RT.GET_PUBLIC
      : "http://localhost:3000/api/public/rt";

  try {
    const fetcher = typeof window.apiFetch === "function" ? window.apiFetch : fetch;
    const response = await fetcher(targetUrl);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    const rawData = Array.isArray(result) ? result : result.data || [];

    if (Array.isArray(rawData) && rawData.length > 0) {
      rtContainer.innerHTML = "";

      const backendUrl =
        window.API && window.API.BASE_URL
          ? window.API.BASE_URL
          : "http://localhost:3000";

      // Template Card Modern Portrait
      const createCardHtml = (item) => {
        const noRt = String(item.nomor_rt).padStart(2, "0");
        let foto = "assets/img/default-avatar.png";
        if (item.foto_utama) {
          foto = /^https?:\/\//i.test(item.foto_utama)
            ? item.foto_utama
            : `${backendUrl}/assets/galery/rt/${item.foto_utama}`;
        }

        return `
          <div class="member-card-modern">
              <div class="rt-card-img-wrap">
                  <span class="rt-banner-badge">RT ${noRt} /  RW 11</span>
                  <img src="${foto}" 
                       alt="Foto Ketua RT ${noRt}" 
                       class="rt-portrait-img"
                       onerror="this.onerror=null; this.src='assets/img/default-avatar.png';">
              </div>
              <div class="rt-card-body">
                  <h3 class="rt-card-title">RT ${noRt}</h3>
                  <h4 class="rt-leader-name">${item.nama_ketua || "Nama Belum Terdata"}</h4>
                  
                  <a href="${item.nomor_telepon ? 'https://wa.me/' + cleanPhone(item.nomor_telepon) : '#'}" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     class="rt-contact-pill">
                      <i class="fa-brands fa-whatsapp"></i> ${item.nomor_telepon ? formatPhone(item.nomor_telepon) : "Kontak Belum Ada"}
                  </a>

                  <a href="detail-rt.html?id=${item.id}" class="rt-card-btn">
                      Detail Profil <i class="fa-solid fa-arrow-right"></i>
                  </a>
              </div>
          </div>
        `;
      };

      // Gandakan elemen kartu agar looping continuous tidak pernah putus
      let cardsHtml = rawData.map(createCardHtml).join("");
      rtContainer.innerHTML = cardsHtml + cardsHtml;

      startInfiniteGlide(rtContainer, rawData.length);
    } else {
      rtContainer.innerHTML = `<p style="padding: 30px; text-align: center; color: var(--rt-text-muted);">Belum ada data RT yang aktif.</p>`;
    }
  } catch (error) {
    console.error("❌ [ERROR PROFILE RT]:", error);
    rtContainer.innerHTML = `<p style="padding: 30px; text-align: center; color: #ef4444;">Gagal memuat data RT dari server.</p>`;
  }
}

/**
 * Mesin Infinite Glide dengan Logika Hold to Pause 0.5s
 */
function startInfiniteGlide(track, originalItemCount) {
  const viewport = document.getElementById("rtCarouselViewport");
  if (!viewport || originalItemCount <= 0) return;

  let currentTranslate = 0;
  const speed = 0.75; // Kecepatan glide pelan dan halus

  function getSingleCycleWidth() {
    return track.scrollWidth / 2;
  }

  function animate() {
    if (!isPaused) {
      currentTranslate += speed;
      const cycleWidth = getSingleCycleWidth();

      // Reset ke awal tanpa patahan saat 1 siklus terlewati
      if (currentTranslate >= cycleWidth) {
        currentTranslate = 0;
      }

      track.style.transform = `translateX(-${currentTranslate}px)`;
    }
    animationFrameId = requestAnimationFrame(animate);
  }

  // --- LOGIKA PRESS AND HOLD 0.5 DETIK ---
  function startHoldTimer() {
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      isPaused = true; // Berhenti hanya jika sudah ditekan selama 500ms (0.5 detik)
    }, 500);
  }

  function releaseHold() {
    clearTimeout(pressTimer);
    isPaused = false; // Lanjut bergerak saat tekanan/klik dilepas
  }

  // Event Mouse (Desktop)
  viewport.addEventListener("mousedown", startHoldTimer);
  window.addEventListener("mouseup", releaseHold);

  // Event Touch (Smartphone / Tablet)
  viewport.addEventListener("touchstart", startHoldTimer, { passive: true });
  window.addEventListener("touchend", releaseHold);
  window.addEventListener("touchcancel", releaseHold);

  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(animate);
}

function cleanPhone(phone) {
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "62" + cleaned.slice(1);
  return cleaned;
}

function formatPhone(phone) {
  let cleaned = ("" + phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    return cleaned.replace(/(\d{4})(\d{4})(\d+)/, "$1-$2-$3");
  }
  return phone;
}