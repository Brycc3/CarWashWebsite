document.addEventListener("DOMContentLoaded", function() {
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll("nav ul li a").forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
        });
    });


    // Fade-in Animations on Scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll(".content-section, .service, .gallery-grid img").forEach(section => {
        observer.observe(section);
    });

    // Contact Form Validation
    document.querySelector("form").addEventListener("submit", function(event) {
        event.preventDefault();
        const name = this.querySelector("input[type='text']").value.trim();
        const email = this.querySelector("input[type='email']").value.trim();
        if (name === "" || email === "") {
            alert("Please fill in all required fields.");
        } else {
            alert("Thank you for contacting us! We will get back to you soon.");
            this.reset();
        }
    });

    // FAQ Toggle
    document.querySelectorAll("details").forEach(detail => {
        detail.addEventListener("click", function() {
            this.open = !this.open;
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Make sure all links work by preventing double loading issues
    document.querySelectorAll("nav ul li a").forEach(link => {
        link.addEventListener("click", function () {
            window.location.href = this.getAttribute("href");
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll("nav ul li a").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            const targetId = this.getAttribute("href").substring(1);
            document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
        });
    });

    // Fade-in Animations on Scroll
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll(".content-section, .service, .gallery-grid img").forEach(section => {
        observer.observe(section);
    });

    // Contact Form Validation
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();
        const name = this.querySelector("input[type='text']").value.trim();
        const email = this.querySelector("input[type='email']").value.trim();
        if (name === "" || email === "") {
            alert("Please fill in all required fields.");
        } else {
            alert("Thank you for contacting us! We will get back to you soon.");
            this.reset();
        }
    });

    // FAQ Toggle
    document.querySelectorAll("details").forEach(detail => {
        detail.addEventListener("click", function () {
            this.open = !this.open;
        });
    });
});


