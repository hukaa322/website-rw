/**
 * Logic Section Pengumuman & Berita - Single Screen Showcase Slider
 */

document.addEventListener("DOMContentLoaded", () => {
  loadHomeNews();
});

let currentNewsIndex = 0;
let newsItems = [];
let newsSliderInterval = null;

async function loadHomeNews() {
  const newsContainer = document.getElementById("newsContainer");
  if (!newsContainer) return;

  try {
    newsContainer.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; color: var(--news-text-muted);">
          <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p style="margin-top: 12px; font-weight: 600;">Memuat warta berita...</p>
      </div>
    `;

    const res = await window.apiFetch(window.API.BERITA.GET_PUBLIC);
    const response = await res.json();

    if (!res.ok || !response.success) {
      throw new Error(response.message || "Gagal mengambil data dari server.");
    }

    const dataList = response.data || [];

    if (dataList.length === 0) {
      newsContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: var(--news-text-muted);">
            <i class="fa-regular fa-folder-open fa-3x" style="margin-bottom: 12px;"></i>
            <p style="font-weight: 600;">Belum ada berita atau pengumuman yang dipublikasikan.</p>
        </div>
      `;
      return;
    }

    // Ambil 5 berita terbaru
    newsItems = dataList.slice(0, 5);

    const backendUrl =
      window.API && window.API.BASE_URL
        ? window.API.BASE_URL
        : "http://localhost:3000";

    const fallbackImage =
      "https://placehold.co/800x600/00468B/FFFFFF?text=Berita+Vireta+2";

    newsContainer.innerHTML = newsItems
      .map((item, index) => {
        const formattedDate = new Date(item.tanggal).toLocaleDateString(
          "id-ID",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        );

        let imageUrl = fallbackImage;
        if (item.foto_utama) {
          const foto = String(item.foto_utama).trim();
          if (/^https?:\/\//i.test(foto)) {
            imageUrl = foto;
          } else if (foto.startsWith("/")) {
            imageUrl = `${backendUrl}${foto}`;
          } else {
            imageUrl = `${backendUrl}/assets/galery/berita/${foto}`;
          }
        }

        // Teks snippet yang dibatasi untuk card kiri
        const snippetText = item.isi_berita
          ? item.isi_berita.replace(/<[^>]*>?/gm, "")
          : "Informasi dan detail kegiatan warga dapat dibaca selengkapnya melalui tautan di bawah ini.";

        const activeClass = index === 0 ? "active" : "";

        return `
          <div class="news-screen-item ${activeClass}" data-index="${index}">
              <!-- BAGIAN KIRI: CARD DETAIL TERBATAS -->
              <div class="news-col-left">
                  <div class="news-meta-row">
                      <span class="news-category-tag">${escapeHtml(item.kategori || "Kegiatan")}</span>
                      <span class="news-date-text">
                          <i class="fa-regular fa-calendar"></i> ${formattedDate}
                      </span>
                  </div>

                  <div class="news-detail-card">
                      <p class="news-snippet-text">${escapeHtml(snippetText)}</p>
                  </div>

                  <a href="detail-berita.html?id=${item.id}" class="news-readmore-btn">
                      Baca Selengkapnya <i class="fa-solid fa-arrow-right"></i>
                  </a>
              </div>

              <!-- BAGIAN KANAN: FOTO + JUDUL DI ATAS FOTO -->
              <div class="news-col-right">
                  <img src="${escapeHtml(imageUrl)}" 
                       alt="${escapeHtml(item.judul)}" 
                       class="news-feature-img"
                       onerror="this.onerror=null; this.src='${fallbackImage}';">
                  
                  <div class="news-img-overlay">
                      <span class="news-overlay-badge">AGENDA & BERITA UTAMA</span>
                      <h3 class="news-overlay-title">${escapeHtml(item.judul)}</h3>
                  </div>
              </div>
          </div>
        `;
      })
      .join("");

    initNewsControls();
  } catch (err) {
    console.error("Error loading home news:", err);
    newsContainer.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #DC3545;">
          <i class="fa-solid fa-circle-exclamation fa-2x"></i>
          <p style="margin-top: 12px; font-weight: 600;">Gagal memuat berita: ${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

/**
 * Controller Navigasi Panah & Auto Slide
 */
function initNewsControls() {
  const slides = document.querySelectorAll(".news-screen-item");
  const prevBtn = document.getElementById("newsPrevBtn");
  const nextBtn = document.getElementById("newsNextBtn");
  const viewport = document.querySelector(".news-showcase-viewport");

  if (slides.length <= 1) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    return;
  }

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    currentNewsIndex = index;
  }

  function nextSlide() {
    const nextIdx = (currentNewsIndex + 1) % slides.length;
    showSlide(nextIdx);
  }

  function prevSlide() {
    const prevIdx = (currentNewsIndex - 1 + slides.length) % slides.length;
    showSlide(prevIdx);
  }

  function startAutoPlay() {
    clearInterval(newsSliderInterval);
    newsSliderInterval = setInterval(nextSlide, 5000); // Berganti per 5 detik
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      startAutoPlay();
    });
  }

  if (viewport) {
    viewport.addEventListener("mouseenter", () => clearInterval(newsSliderInterval));
    viewport.addEventListener("mouseleave", startAutoPlay);
  }

  startAutoPlay();
}

function escapeHtml(str) {
  return (str || "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m])
  );
}