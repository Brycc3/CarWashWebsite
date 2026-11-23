/* =====================================================================
   Refining Auto Detailing — Site Interactions
   - Cinematic intro car animation (once per session)
   - Mobile nav + scrolled state + active link highlighting
   - Scroll reveal animations
   - Gallery lightbox (click a car to browse all photos)
   - Contact form validation
   ===================================================================== */

/* Cinematic wheel intro removed for a clean, direct arrival. */

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

    /* Flat, calm presentation: no perspective or pointer-tilt effects. */

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


/* Water-rinse transitions for internal page navigation */
(function waterPageTransitions() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const createOverlay = (entering) => {
        const overlay = document.createElement("div");
        overlay.className = "water-transition " + (entering ? "is-entering" : "is-exiting");
        overlay.setAttribute("aria-hidden", "true");
        const bubbles = Array.from({ length: 9 }, (_, i) => {
            const x = 5 + i * 11;
            const size = 14 + (i % 4) * 9;
            const y = 18 + (i % 5) * 14;
            const delay = (i % 4) * 55;
            return '<i style="--x:' + x + '%;--size:' + size + 'px;--y:' + y + '%;--delay:' + delay + 'ms"></i>';
        }).join("");
        overlay.innerHTML = '<div class="water-transition__hose"></div><div class="water-transition__spray"></div><div class="water-transition__bubbles">' + bubbles + '</div>';
        return overlay;
    };

    document.addEventListener("DOMContentLoaded", () => {
        let enteredAt = 0;
        try {
            enteredAt = Number(sessionStorage.getItem("refining-water-entry") || 0);
            sessionStorage.removeItem("refining-water-entry");
        } catch (_) {}
        if (!enteredAt || Date.now() - enteredAt > 1800 || reducedMotion.matches) return;
        document.body.appendChild(createOverlay(true));
        document.body.classList.add("page-entering");
        window.setTimeout(() => {
            document.querySelector(".water-transition.is-entering")?.remove();
            document.body.classList.remove("page-entering");
        }, 760);
    });

    document.addEventListener("click", event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || reducedMotion.matches) return;
        const link = event.target.closest("a[href]");
        if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
        let destination;
        try { destination = new URL(link.href, location.href); } catch (_) { return; }
        if (destination.origin !== location.origin || destination.pathname === location.pathname) return;
        event.preventDefault();
        document.querySelector(".water-transition")?.remove();
        document.body.appendChild(createOverlay(false));
        try { sessionStorage.setItem("refining-water-entry", String(Date.now())); } catch (_) {}
        window.setTimeout(() => { location.assign(destination.href); }, 560);
    });
})();
