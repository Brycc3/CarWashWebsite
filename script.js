/* =====================================================================
   Refining Auto Detailing — Site Interactions
   - Cinematic intro car animation (once per session)
   - Mobile nav + scrolled state + active link highlighting
   - Scroll reveal animations
   - Gallery lightbox (click a car to browse all photos)
   - Contact form validation
   ===================================================================== */

/* ---------- Intro car animation (runs before content) ---------- */
(function intro() {
    if (sessionStorage.getItem("introPlayed")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        sessionStorage.setItem("introPlayed", "1");
        return;
    }

    const carSVG = `
        <svg class="intro-car" viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id="body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#f6d678"/>
                    <stop offset="0.5" stop-color="#d4af37"/>
                    <stop offset="1" stop-color="#9c7a1f"/>
                </linearGradient>
            </defs>
            <path d="M40 150 Q60 96 150 92 L210 60 Q300 24 410 54 L470 92 Q560 96 600 132 L606 150 Q610 166 592 168 L48 168 Q30 166 40 150 Z" fill="url(#body)"/>
            <path d="M220 70 Q300 44 392 66 L432 90 L240 90 Z" fill="#13161c" opacity="0.85"/>
            <path d="M250 72 L300 72 L300 88 L256 88 Z" fill="#76e7ff" opacity="0.7"/>
            <path d="M312 72 L388 72 L420 88 L312 88 Z" fill="#76e7ff" opacity="0.7"/>
            <rect x="566" y="120" width="34" height="14" rx="6" fill="#fff2c0"/>
            <g class="wheel"><circle cx="170" cy="168" r="40" fill="#111"/><circle cx="170" cy="168" r="18" fill="#3a3f49"/><rect x="166" y="130" width="8" height="76" fill="#5a606c"/><rect x="132" y="164" width="76" height="8" fill="#5a606c"/></g>
            <g class="wheel"><circle cx="470" cy="168" r="40" fill="#111"/><circle cx="470" cy="168" r="18" fill="#3a3f49"/><rect x="466" y="130" width="8" height="76" fill="#5a606c"/><rect x="432" y="164" width="76" height="8" fill="#5a606c"/></g>
        </svg>`;

    const overlay = document.createElement("div");
    overlay.className = "intro-overlay";
    overlay.innerHTML = `
        <div class="speedline" style="top:38%"></div>
        <div class="speedline" style="top:48%; animation-delay:.1s"></div>
        <div class="speedline" style="top:58%; animation-delay:.2s"></div>
        <div class="intro-brand">
            <div class="logo">REFINING<span class="logo-accent">AUTO</span></div>
            <p>Detailing</p>
        </div>
        <div class="intro-road"></div>
        ${carSVG}`;

    const start = () => {
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";
        setTimeout(() => {
            overlay.classList.add("is-hidden");
            document.body.style.overflow = "";
            sessionStorage.setItem("introPlayed", "1");
            overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
        }, 2600);
    };

    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
})();

/* ---------- DOM-ready interactions ---------- */
document.addEventListener("DOMContentLoaded", function () {

    /* Highlight active nav link + mobile toggle (header is injected async) */
    const initNav = () => {
        const nav = document.querySelector(".site-nav");
        if (!nav) return false;

        const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
        nav.querySelectorAll(".nav-links a").forEach((a) => {
            const href = (a.getAttribute("href") || "").toLowerCase();
            if (href === current || (current === "" && href === "index.html")) {
                a.classList.add("current-page");
            }
        });

        const toggle = nav.querySelector(".nav-toggle");
        const links = nav.querySelector(".nav-links");
        if (toggle && links) {
            toggle.addEventListener("click", () => links.classList.toggle("is-open"));
            links.querySelectorAll("a").forEach((a) =>
                a.addEventListener("click", () => links.classList.remove("is-open"))
            );
        }

        const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 10);
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return true;
    };

    if (!initNav()) {
        // Header loaded via fetch — wait for it to appear.
        const headerHost = document.getElementById("header-placeholder");
        if (headerHost) {
            const mo = new MutationObserver(() => {
                if (initNav()) mo.disconnect();
            });
            mo.observe(headerHost, { childList: true, subtree: true });
        }
    }

    /* Scroll reveal */
    const revealEls = document.querySelectorAll(".reveal");
    if (revealEls.length) {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        io.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12 }
        );
        revealEls.forEach((el) => io.observe(el));
    }

    /* Gallery lightbox */
    const gallery = document.querySelector("[data-gallery]");
    if (gallery) initLightbox(gallery);

    /* Contact form validation */
    const form = document.querySelector("form[data-validate]");
    if (form) {
        form.addEventListener("submit", function (event) {
            const required = form.querySelectorAll("[required]");
            let valid = true;
            required.forEach((field) => {
                if (!field.value.trim()) {
                    valid = false;
                    field.style.borderColor = "#e3342f";
                } else {
                    field.style.borderColor = "";
                }
            });
            if (!valid) {
                event.preventDefault();
                alert("Please fill in all required fields.");
            }
        });
    }

    /* Newsletter (footer) — friendly confirmation */
    document.addEventListener("submit", function (e) {
        const f = e.target;
        if (f.classList && f.classList.contains("email-form")) {
            e.preventDefault();
            const input = f.querySelector("input");
            if (input && input.value.trim()) {
                alert("Thanks! We'll be in touch soon.");
                f.reset();
            }
        }
    });
});

/* ---------- Lightbox implementation ---------- */
function initLightbox(gallery) {
    const items = Array.from(gallery.querySelectorAll(".gallery-item img"));
    if (!items.length) return;
    const sources = items.map((img) => ({ src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" }));

    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = `
        <button class="lightbox__close" aria-label="Close">&times;</button>
        <button class="lightbox__btn lightbox__btn--prev" aria-label="Previous">&#8249;</button>
        <img class="lightbox__img" src="" alt="">
        <button class="lightbox__btn lightbox__btn--next" aria-label="Next">&#8250;</button>
        <div class="lightbox__counter"></div>`;
    document.body.appendChild(box);

    const imgEl = box.querySelector(".lightbox__img");
    const counter = box.querySelector(".lightbox__counter");
    let index = 0;

    const render = () => {
        imgEl.src = sources[index].src;
        imgEl.alt = sources[index].alt;
        counter.textContent = `${index + 1} / ${sources.length}`;
    };
    const open = (i) => {
        index = i;
        render();
        box.classList.add("is-open");
        document.body.style.overflow = "hidden";
    };
    const close = () => {
        box.classList.remove("is-open");
        document.body.style.overflow = "";
    };
    const next = () => { index = (index + 1) % sources.length; render(); };
    const prev = () => { index = (index - 1 + sources.length) % sources.length; render(); };

    items.forEach((img, i) =>
        img.closest(".gallery-item").addEventListener("click", () => open(i))
    );
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__btn--next").addEventListener("click", next);
    box.querySelector(".lightbox__btn--prev").addEventListener("click", prev);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
        if (!box.classList.contains("is-open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
    });
}
