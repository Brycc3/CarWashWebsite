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
function toggleDetails(id) {
    const allDetails = document.querySelectorAll('.service-details');
    allDetails.forEach(detail => {
      if (detail.id === id) {
        detail.style.display = detail.style.display === 'flex' ? 'none' : 'flex';
      } else {
        detail.style.display = 'none';
      }
    });
  }
// Array of video filenames
const videos = ["videos/vid1.MP4", "videos/vid2.MP4", "videos/vid3.MP4", "videos/vid4.MP4"];
let videoIndex = 0;
const videoElement = document.getElementById('hero-video');

// Automatically switch videos every 10 seconds
function changeVideo() {
    videoIndex = (videoIndex + 1) % videos.length;
    videoElement.src = videos[videoIndex];
    videoElement.play();
}

setInterval(changeVideo, 10000); // Change video every 10 seconds
  

