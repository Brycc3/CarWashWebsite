/* =====================================================================
   Refining Auto Detailing — Site Interactions
   - Cinematic intro car animation (once per session)
   - Mobile nav + scrolled state + active link highlighting
   - Scroll reveal animations
   - Gallery lightbox (click a car to browse all photos)
   - Contact form validation
   ===================================================================== */

/* ---------- Photographic wheel intro (once per session) ---------- */
(function intro() {
    const key = "refining-wheel-intro-v2";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    try { if (sessionStorage.getItem(key)) return; } catch (_) { /* Storage is optional. */ }
    if (motion.matches) return;

    const start = () => {
        const overlay = document.createElement("div");
        overlay.className = "wheel-intro";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", "Refining Auto Detailing introduction");
        overlay.innerHTML = `
            <canvas class="wheel-intro__scene" aria-hidden="true"></canvas>
            <div class="wheel-intro__shade" aria-hidden="true"></div>
            <div class="wheel-intro__brand">
                <span class="wheel-intro__eyebrow">THE FINISH IS IN THE DETAILS</span>
                <div class="wheel-intro__title">REFINING <span>AUTO</span></div>
                <p>Exceptional care. Every angle.</p>
            </div>
            <button class="wheel-intro__skip" type="button">Skip intro <span aria-hidden="true">↗</span></button>
            <div class="wheel-intro__caption" aria-hidden="true"><span>BEAUMONT, TEXAS</span><span>MADE TO SHINE</span></div>
            <div class="wheel-intro__progress" aria-hidden="true"></div>`;
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        const siblings = Array.from(document.body.children).filter(el => !["SCRIPT", "STYLE"].includes(el.tagName));
        const inertStates = siblings.map(el => el.inert);
        let frame = 0, ended = false, startedAt = null;
        let width = 0, height = 0;
        const photo = new Image();
        let safety;
        const finish = () => {
            if (ended) return;
            ended = true;
            cancelAnimationFrame(frame);
            clearTimeout(safety);
            window.removeEventListener("resize", resize);
            document.removeEventListener("keydown", onKey);
            motion.removeEventListener("change", onMotion);
            photo.onload = photo.onerror = null;
            overlay.remove();
            document.body.style.overflow = previousOverflow;
            siblings.forEach((el, i) => { el.inert = inertStates[i]; });
            try { sessionStorage.setItem(key, "1"); } catch (_) { /* Keep navigation usable. */ }
            if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true });
        };
        const onKey = event => { if (event.key === "Escape") finish(); };
        const onMotion = () => { if (motion.matches) finish(); };
        const canvas = overlay.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const resize = () => {
            width = window.innerWidth; height = window.innerHeight;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = width * dpr; canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        document.body.appendChild(overlay);
        siblings.forEach(el => { el.inert = true; });
        document.body.style.overflow = "hidden";
        const skip = overlay.querySelector("button");
        skip.addEventListener("click", finish);
        skip.focus({ preventScroll: true });
        document.addEventListener("keydown", onKey);
        motion.addEventListener("change", onMotion);
        window.addEventListener("resize", resize, { passive: true });
        resize();
        safety = setTimeout(finish, 7000);
        photo.onerror = finish;
        photo.onload = () => {
            if (ended) return;
            // Sample the actual alloy rim, straighten its photographed ellipse,
            // rotate it in its own plane, then restore the camera perspective.
            const cx = 603, cy = 500, radius = 110, ratio = 0.51, tilt = -0.10;
            const rim = document.createElement("canvas");
            rim.width = rim.height = radius * 2;
            const rc = rim.getContext("2d");
            if (!rc) { finish(); return; }
            rc.translate(radius, radius);
            rc.scale(1 / ratio, 1);
            rc.rotate(-tilt);
            rc.drawImage(photo, -cx, -cy);
            const smooth = t => t * t * (3 - 2 * t);
            const draw = now => {
                if (ended) return;
                if (startedAt === null) startedAt = now;
                const elapsed = now - startedAt;
                if (elapsed >= 4200) { finish(); return; }
                const zoomT = Math.max(0, Math.min(1, (elapsed - 2300) / 1700));
                const zoom = 1 + 17 * Math.pow(zoomT, 3);
                const fit = Math.min(width * 0.96 / photo.width, height * 0.64 / photo.height, 1150 / photo.width);
                const x = (width - photo.width * fit) / 2;
                const y = (height - photo.height * fit) / 2 + height * 0.045;
                const wheelX = x + cx * fit, wheelY = y + cy * fit;
                const pan = smooth(zoomT);
                ctx.clearRect(0, 0, width, height);
                ctx.save();
                ctx.translate(wheelX + (width / 2 - wheelX) * pan, wheelY + (height / 2 - wheelY) * pan);
                ctx.scale(zoom * fit, zoom * fit);
                ctx.translate(-cx, -cy);
                ctx.drawImage(photo, 0, 0);
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(tilt);
                ctx.scale(ratio, 1);
                ctx.beginPath(); ctx.arc(0, 0, radius - 1, 0, Math.PI * 2); ctx.clip();
                // Accelerate gently before the camera approaches the hub.
                const spinTime = Math.max(0, elapsed - 350) / 1000;
                ctx.rotate(spinTime * spinTime * 4);
                ctx.drawImage(rim, -radius, -radius);
                ctx.restore(); ctx.restore();
                overlay.style.setProperty("--intro-progress", Math.min(elapsed / 4200, 1));
                overlay.style.setProperty("--intro-label-opacity", 1 - Math.min(zoomT * 3, 1));
                overlay.style.opacity = String(1 - Math.max(0, (elapsed - 3700) / 500));
                frame = requestAnimationFrame(draw);
            };
            frame = requestAnimationFrame(draw);
        };
        photo.src = "images/carr5.JPG";
    };
    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start, { once: true });
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

    /* Perspective cards and layered hero, with no motion on touch/reduced motion. */
    const depthMotion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    document.querySelectorAll(".card, .service-card, .testimonial, .gallery-item").forEach(card => {
        card.classList.add("depth-card");
        card.addEventListener("pointermove", event => {
            if (!depthMotion.matches) return;
            const rect = card.getBoundingClientRect();
            const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
            const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
            card.style.setProperty("--depth-x", `${(0.5 - y) * 9}deg`);
            card.style.setProperty("--depth-y", `${(x - 0.5) * 12}deg`);
            card.style.setProperty("--shine-x", `${x * 100}%`);
            card.style.setProperty("--shine-y", `${y * 100}%`);
        }, { passive: true });
        card.addEventListener("pointerleave", () => {
            card.style.removeProperty("--depth-x");
            card.style.removeProperty("--depth-y");
        });
    });
    const hero = document.querySelector(".hero");
    if (hero) {
        hero.addEventListener("pointermove", event => {
            if (!depthMotion.matches) return;
            const rect = hero.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            hero.style.setProperty("--hero-x", `${x * -18}px`);
            hero.style.setProperty("--hero-y", `${y * -12}px`);
            hero.style.setProperty("--hero-rx", `${y * -3}deg`);
            hero.style.setProperty("--hero-ry", `${x * 4}deg`);
        }, { passive: true });
        hero.addEventListener("pointerleave", () => {
            ["--hero-x", "--hero-y", "--hero-rx", "--hero-ry"].forEach(property => hero.style.removeProperty(property));
        });
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
