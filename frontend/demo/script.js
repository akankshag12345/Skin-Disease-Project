// ================== PARTICLES ==================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const colors = ['#ff0080', '#ff8c00', '#00cccc', '#00ffcc'];

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 1 - 0.5;
    this.speedY = Math.random() * 1 - 0.5;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
  }
  draw() {
    ctx.fillStyle = this.color + '33';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    particlesArray.push(new Particle(x, y));
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

function triggerFileInput() {
    document.getElementById("imageInput").click();
}

const imageInput = document.getElementById("imageInput");

if (imageInput) {
    imageInput.addEventListener("change", () => {
        if (imageInput.files.length > 0) {
            uploadImage();
        }
    });
}





// ================== SCROLL REVEAL + FADE IN ==================
const reveals = document.querySelectorAll('.reveal');
window.addEventListener('scroll', () => {
  reveals.forEach(el => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = 150;

    if (elementTop < windowHeight - revealPoint) {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
      el.style.transition = 'all 1s ease-out';
    } else {
      el.style.opacity = 0;
      el.style.transform = 'translateY(50px)';
    }
  });
});

// ================== HERO FADE-IN ON LOAD ==================
window.addEventListener('load', () => {
  const heroElements = document.querySelectorAll('.hero-content, .hero-image');
  heroElements.forEach((el, i) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(50px)';
    setTimeout(() => {
      el.style.transition = 'all 1s ease-out';
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }, 200 * i);
  });
});

// ================== NAVBAR SCROLL EFFECT ==================
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ================== SMOOTH SCROLL FOR NAV LINKS ==================
document.querySelectorAll('.nav-links a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = target.offsetTop - 70; // adjust for navbar height
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    }
  });
});

// ================== BUTTON RIPPLE EFFECT ==================
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const circle = document.createElement('span');
    circle.classList.add('ripple-circle');
    this.appendChild(circle);

    const d = Math.max(this.clientWidth, this.clientHeight);
    circle.style.width = circle.style.height = d + 'px';
    circle.style.left = e.clientX - this.getBoundingClientRect().left - d / 2 + 'px';
    circle.style.top = e.clientY - this.getBoundingClientRect().top - d / 2 + 'px';

    circle.classList.add('ripple-animate');
    setTimeout(() => {
      circle.remove();
    }, 600);
  });
});


document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const message = document.getElementById('contactMessage').value;

  try {
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message })
    });

    const data = await response.json();

    if (data.success) {
      alert("Thank you! Your message has been sent.");
      document.getElementById('contactForm').reset(); // Clear the form
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Could not connect to the server.");
  }
});





// Upload button click
/* const uploadBtn = document.querySelector('.upload-btn');
uploadBtn.addEventListener('click', (e) => {
  e.preventDefault(); // page reload na ho
  alert("Upload Image Feature Coming Soon!"); // ya modal open karna
});
*/
async function uploadImage() {
    const input = document.getElementById("imageInput");
    const result = document.getElementById("result");

    if (input.files.length === 0) {
        alert("Please select an image");
        return;
    }

    if (result) result.innerText = "⏳ Analyzing image...";

    const formData = new FormData();
    formData.append("image", input.files[0]);

    try {
        const response = await fetch("http://localhost:8000/predict", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        // Check the success flag from your Python code
        if (data.success) {
            // १. रिझल्ट डेटा एका ऑब्जेक्टमध्ये तयार करा
            const aiResults = {
                prediction: data.prediction,
                confidence: data.confidence,
                isDirectAI: true  // हा फ्लॅग result-script.js ला ओळखण्यासाठी आहे
            };

            // २. LocalStorage मध्ये डेटा सेव्ह करा
            localStorage.setItem("skincareAIResults", JSON.stringify(aiResults));

            // ३. रिझल्ट पेजवर रिडायरेक्ट करा
            window.location.href = "result.html";

        } else {
            const displayMessage = data.prediction || data.message || "Unknown Error";
            if (result) result.innerText = `❌ ${displayMessage}`;
            alert("Error: " + displayMessage);
        }
    } catch (error) {
        console.error(error);
        if (result) result.innerText = "❌ Connection Error. Is your Flask server running?";
    }
}


// 📷 Start Camera Automatically
window.addEventListener("DOMContentLoaded", async () => {
    const video = document.getElementById("camera");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (error) {
        alert("Camera access denied or not working!");
        console.error(error);
    }
});

// 📸 Capture Image
async function captureImage() {
    const video = document.getElementById("camera");
    const canvas = document.getElementById("snapshot");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // convert to blob
    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("image", blob, "capture.jpg");

        try {
            const response = await fetch("http://localhost:8000/predict", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                const aiResults = {
                    prediction: data.prediction,
                    confidence: data.confidence,
                    isDirectAI: true
                };

                localStorage.setItem("skincareAIResults", JSON.stringify(aiResults));
                window.location.href = "result.html";
            } else {
                alert("Error: " + data.prediction);
            }

        } catch (error) {
            alert("Server error! Check Flask.");
        }
    }, "image/jpeg");
}