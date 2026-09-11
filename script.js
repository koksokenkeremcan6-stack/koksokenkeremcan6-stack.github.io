const WHATSAPP_NUMBER = "905372204004";

/* =========================
   ELEMENTLER
========================= */

const loader = document.getElementById("loader");
const navbar = document.getElementById("navbar");

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.getElementById("modalClose");

const scrollTopButton = document.getElementById("scrollTop");

const galleryPreview = document.getElementById("galleryPreview");
const galleryAllBtn = document.getElementById("galleryAllBtn");

const galleryModal = document.getElementById("galleryModal");
const galleryModalClose = document.getElementById("galleryModalClose");

const allGalleryGrid = document.getElementById("allGalleryGrid");


/* =========================
   SCROLL KİLİDİ
========================= */

let scrollLockCount = 0;
let savedScrollY = 0;

function lockScroll() {
    if (scrollLockCount === 0) {
        savedScrollY = window.scrollY;

        document.body.style.top = `-${savedScrollY}px`;
        document.body.classList.add("no-scroll");
    }

    scrollLockCount++;
}

function unlockScroll() {
    if (scrollLockCount === 0) return;

    scrollLockCount--;

    if (scrollLockCount === 0) {
        document.body.classList.remove("no-scroll");
        document.body.style.top = "";

        window.scrollTo(0, savedScrollY);
    }
}


/* =========================
   GALERİ FOTOĞRAFLARI
========================= */

const galleryImages = Array.from(
    { length: 15 },
    (_, index) => `images/tras${index + 1}.png`
);


/* =========================
   RASTGELE SIRALAMA
========================= */

function shuffled(array) {
    return [...array].sort(() => Math.random() - 0.5);
}


/* =========================
   FOTOĞRAF YÜKLEME
========================= */

function addImageFallback(img, src) {
    const base = src.replace(/\.(png|jpg|jpeg)$/i, "");

    const extensions = [
        ".png",
        ".jpg",
        ".jpeg"
    ];

    let attempt = 0;

    img.onerror = () => {
        attempt++;

        if (attempt < extensions.length) {
            img.src = base + extensions[attempt];
        } else {
            img.onerror = null;
        }
    };
}


/* =========================
   ANA GALERİ
   4 FOTOĞRAF / 2 x 2
========================= */

function renderPreviewGallery() {
    if (!galleryPreview) return;

    galleryPreview.innerHTML = "";

    const selected = shuffled(galleryImages).slice(0, 4);

    selected.forEach((src, index) => {
        const item = document.createElement("div");

        item.className = "gallery-item reveal active";

        const img = document.createElement("img");

        img.src = src;
        img.alt = `Berber Mustafa çalışması ${index + 1}`;

        /*
           Fotoğrafı tarayıcıya yeniden çizdirmiyoruz.
           Orijinal dosya kullanılıyor.
        */
        img.loading = "eager";
        img.decoding = "async";

        addImageFallback(img, src);

        const overlay = document.createElement("div");

        overlay.className = "gallery-overlay";

        overlay.innerHTML = `
            <span>
                ${String(index + 1).padStart(2, "0")}
            </span>

            <span>
                Yakından İncele ↗
            </span>
        `;

        item.appendChild(img);
        item.appendChild(overlay);

        item.addEventListener("click", () => {
            openImage(img.src);
        });

        galleryPreview.appendChild(item);
    });
}


/* =========================
   TÜM GALERİ
========================= */

function renderAllGallery() {
    if (!allGalleryGrid) return;

    allGalleryGrid.innerHTML = "";

    galleryImages.forEach((src, index) => {
        const item = document.createElement("div");

        item.className = "all-gallery-item";

        const img = document.createElement("img");

        img.src = src;
        img.alt = `Berber Mustafa çalışması ${index + 1}`;

        img.loading = "lazy";
        img.decoding = "async";

        addImageFallback(img, src);

        item.appendChild(img);

        item.addEventListener("click", () => {
            openImage(img.src);
        });

        allGalleryGrid.appendChild(item);
    });
}


/* =========================
   SAYFA YÜKLENDİ
========================= */

window.addEventListener("load", () => {
    setTimeout(() => {
        loader?.classList.add("hide");
    }, 500);

    renderPreviewGallery();
    renderAllGallery();
    handleNavbar();
});


/* =========================
   NAVBAR
========================= */

function handleNavbar() {
    navbar?.classList.toggle(
        "scrolled",
        window.scrollY > 50
    );

    scrollTopButton?.classList.toggle(
        "show",
        window.scrollY > 500
    );
}

window.addEventListener("scroll", handleNavbar);

handleNavbar();


/* =========================
   YUKARI ÇIK
========================= */

scrollTopButton?.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


/* =========================
   MOBİL MENÜ
========================= */

function openMenu() {
    navLinks?.classList.add("active");
    menuToggle?.classList.add("active");
    navbar?.classList.add("menu-open");

    menuToggle?.setAttribute(
        "aria-expanded",
        "true"
    );

    lockScroll();
}

function closeMenu() {
    const wasActive =
        navLinks?.classList.contains("active");

    navLinks?.classList.remove("active");
    menuToggle?.classList.remove("active");
    navbar?.classList.remove("menu-open");

    menuToggle?.setAttribute(
        "aria-expanded",
        "false"
    );

    if (wasActive) {
        unlockScroll();
    }
}

menuToggle?.addEventListener("click", () => {
    const isOpen =
        navLinks?.classList.contains("active");

    if (isOpen) {
        closeMenu();
    } else {
        openMenu();
    }
});


/* =========================
   MENÜ LİNKLERİ
========================= */

document
    .querySelectorAll(".nav-links a")
    .forEach(link => {
        link.addEventListener("click", closeMenu);
    });


/* =========================
   SCROLL ANİMASYONU
========================= */

const revealObserver =
    new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");

                    revealObserver.unobserve(
                        entry.target
                    );
                }
            });
        },
        {
            threshold: 0.12
        }
    );

document
    .querySelectorAll(".reveal")
    .forEach(element => {
        revealObserver.observe(element);
    });


/* =========================
   FOTOĞRAF BÜYÜTME
========================= */

function openImage(src) {

    if (!imageModal || !modalImage || !src) return;

    /*
       Fotoğrafın doğrudan gerçek dosya yolunu kullan.
       currentSrc kullanılmıyor.
       Böylece küçük galerideki görüntü ne olursa olsun
       modal doğrudan orijinal dosyayı açar.
    */

    modalImage.src = src;

    modalImage.removeAttribute("srcset");
    modalImage.removeAttribute("sizes");

    imageModal.classList.add("active");

    imageModal.setAttribute(
        "aria-hidden",
        "false"
    );

    lockScroll();
}

function closeImage() {
    if (!imageModal || !modalImage) return;

    imageModal.classList.remove("active");

    imageModal.setAttribute(
        "aria-hidden",
        "true"
    );

    /*
       Fotoğrafı hemen silmiyoruz.
       Böylece kapanış sırasında görüntü
       bozulmuyor.
    */
    setTimeout(() => {
        if (!imageModal.classList.contains("active")) {
            modalImage.removeAttribute("src");
        }
    }, 350);

    unlockScroll();
}


/* =========================
   FOTOĞRAF KAPAT
========================= */

modalClose?.addEventListener(
    "click",
    closeImage
);

imageModal?.addEventListener(
    "click",
    event => {
        if (event.target === imageModal) {
            closeImage();
        }
    }
);


/* =========================
   TÜM GALERİYİ AÇ
========================= */

galleryAllBtn?.addEventListener(
    "click",
    () => {
        renderAllGallery();

        galleryModal?.classList.add("active");

        galleryModal?.setAttribute(
            "aria-hidden",
            "false"
        );

        lockScroll();
    }
);


/* =========================
   TÜM GALERİYİ KAPAT
========================= */

function closeGallery() {
    if (!galleryModal) return;

    galleryModal.classList.remove("active");

    galleryModal.setAttribute(
        "aria-hidden",
        "true"
    );

    unlockScroll();
}

galleryModalClose?.addEventListener(
    "click",
    closeGallery
);

galleryModal?.addEventListener(
    "click",
    event => {
        if (event.target === galleryModal) {
            closeGallery();
        }
    }
);


/* =========================
   ESC
========================= */

document.addEventListener(
    "keydown",
    event => {
        if (event.key !== "Escape") return;

        /*
           Önce büyük fotoğraf
        */
        if (
            imageModal?.classList.contains("active")
        ) {
            closeImage();
            return;
        }

        /*
           Sonra tüm galeri
        */
        if (
            galleryModal?.classList.contains("active")
        ) {
            closeGallery();
            return;
        }

        /*
           En son mobil menü
        */
        if (
            navLinks?.classList.contains("active")
        ) {
            closeMenu();
        }
    }
);