// js/hero.js

// 1. Array File Gambar dari assets/hero/
const heroImages = [
    "IMG_2882.webp",
    "IMG_2884.webp",
    "IMG_2887.webp",
    "IMG_2893.webp",
    "IMG_2911.webp",
    "IMG_2912.webp",
    "masjid daruttawabin.webp",
    "pos keamanan rt1-2.webp"
];

// 2. Fungsi Mengontrol Muncul / Hilangnya Navbar
function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    const handleScroll = () => {
        if (window.innerWidth > 992) {
            if (window.scrollY > 80) {
                navbar.classList.add("navbar-scrolled");
            } else {
                navbar.classList.remove("navbar-scrolled");
            }
        } else {
            navbar.classList.remove("navbar-scrolled");
        }
    };

    window.removeEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
}

// 3. Fungsi Render & Animasi Carousel
function initHeroCarousel() {
    const carousel = document.getElementById("heroCarousel");
    const indicatorsContainer = document.getElementById("heroIndicators");
    const basePath = "assets/hero/";

    if (!carousel || heroImages.length === 0) return;

    // Bersihkan elemen slide lama jika ada
    carousel.querySelectorAll(".hero-slide").forEach(el => el.remove());

    // Render Tag IMG Dinamis
    heroImages.forEach((imgName, index) => {
        const slide = document.createElement("div");
        slide.className = `hero-slide ${index === 0 ? "active" : ""}`;
        
        const img = document.createElement("img");
        img.src = `${basePath}${encodeURIComponent(imgName)}`;
        img.alt = `Vireta 2 Panorama ${index + 1}`;
        img.loading = index === 0 ? "eager" : "lazy";

        slide.appendChild(img);
        carousel.insertBefore(slide, carousel.firstChild);
    });

    const slides = carousel.querySelectorAll(".hero-slide");
    const prevBtn = document.getElementById("heroPrevBtn");
    const nextBtn = document.getElementById("heroNextBtn");
    let currentSlide = 0;
    let slideInterval = null;

    if (indicatorsContainer) {
        indicatorsContainer.innerHTML = "";
        heroImages.forEach((_, idx) => {
            const dot = document.createElement("div");
            dot.className = `hero-dot ${idx === 0 ? "active" : ""}`;
            dot.addEventListener("click", () => goToSlide(idx));
            indicatorsContainer.appendChild(dot);
        });
    }

    const updateSlider = (index) => {
        slides.forEach((slide, idx) => {
            slide.classList.toggle("active", idx === index);
        });

        const dots = indicatorsContainer ? indicatorsContainer.querySelectorAll(".hero-dot") : [];
        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === index);
        });
    };

    const nextSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlider(currentSlide);
    };

    const prevSlide = () => {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlider(currentSlide);
    };

    const goToSlide = (index) => {
        currentSlide = index;
        updateSlider(currentSlide);
        restartAutoSlide();
    };

    const startAutoSlide = () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    };

    const restartAutoSlide = () => {
        clearInterval(slideInterval);
        startAutoSlide();
    };

    if (nextBtn) nextBtn.onclick = () => { nextSlide(); restartAutoSlide(); };
    if (prevBtn) prevBtn.onclick = () => { prevSlide(); restartAutoSlide(); };

    startAutoSlide();
}

// 4. Inisialisasi Otomatis (Aman untuk Komponen Dynamic / Fetch HTML)
function setupHeroModule() {
    initNavbarScroll();
    initHeroCarousel();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupHeroModule);
} else {
    setupHeroModule();
}

// Polling fallback jika komponen hero dimuat via fetch di components.js
const heroCheckInterval = setInterval(() => {
    if (document.getElementById("heroCarousel") && document.getElementById("heroCarousel").children.length <= 4) {
        setupHeroModule();
        clearInterval(heroCheckInterval);
    }
}, 300);

setTimeout(() => clearInterval(heroCheckInterval), 5000);