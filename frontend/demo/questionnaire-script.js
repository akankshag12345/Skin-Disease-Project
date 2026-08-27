// Particle Background
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const colors = ['#ff0080', '#ff8c00', '#00cccc', '#ffffff'];

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
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
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray = [];
  for (let i = 0; i < 120; i++) { particlesArray.push(new Particle()); }
}
initParticles();
function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particlesArray.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

// ======================= AI PREDICTION LOGIC =======================
async function getAIPrediction() {
  const fileInput = document.getElementById('imageUpload');
  // Check if your HTML actually has an imageUpload field
  if (!fileInput || !fileInput.files[0]) return null;

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error("AI Service Error:", error);
  }
  return null;
}

// ======================= FORM SUBMISSION =======================
document.addEventListener('DOMContentLoaded', function() {
  // Get email from localStorage or from hidden field
  const storedEmail = localStorage.getItem('userEmail');
  const emailField = document.getElementById('userEmail');
  if (storedEmail && emailField) {
    emailField.value = storedEmail;
  }
});

document.getElementById('questionnaireForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // 1. GET EMAIL
  let email = localStorage.getItem('userEmail');
  if (!email) {
    const emailField = document.getElementById('userEmail');
    email = emailField?.value;
  }
  
  if (!email) {
    alert("Please log in first before filling the questionnaire.");
    window.location.href = 'login.html';
    return;
  }

  // 2. AGE VALIDATION
  const ageInput = document.getElementById('age');
  const age = parseInt(ageInput.value);

  if (age < 1 || age > 100 || isNaN(age)) {
    alert("Please enter a valid age between 1 and 100.");
    ageInput.focus();
    return;
  }

  // 3. COLLECT OTHER DATA
  const gender = document.getElementById('gender').value;
  const marital = document.getElementById('marital').value;
  const addiction = document.getElementById('addiction').value;
  const skinType = document.getElementById('skinType').value;
  const concerns = document.getElementById('concerns').value;
  const sleep = document.getElementById('sleepingHours').value;
  const sun = document.getElementById('sunExposure').value;

  // 4. GET AI PREDICTION (OPTIONAL)
  let aiPrediction = null;
  let aiConfidence = null;
  const fileInput = document.getElementById('imageUpload');
  
  if (fileInput && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log("🤖 Sending image to AI service...");
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const aiData = await response.json();
        if (aiData.success) {
          aiPrediction = aiData.prediction;
          aiConfidence = aiData.confidence;
          console.log("✅ AI Prediction:", aiPrediction, aiConfidence);
        }
      }
    } catch (error) {
      console.error("⚠️ AI Service Error (continuing without prediction):", error);
    }
  }

  // 5. GENERATE RECOMMENDATIONS
  let natural = "", ingredients = "", professional = "";

  if (concerns === "Acne") {
    natural = "Use neem paste, aloe vera gel, turmeric face masks 2-3 times a week.";
    ingredients = "Salicylic Acid, Niacinamide, Tea Tree Oil.";
    professional = "Consult a dermatologist if severe; chemical peels or light therapy.";
  } else if (concerns === "Dark Spots") {
    natural = "Lemon + honey masks and aloe vera overnight gel.";
    ingredients = "Vitamin C, Niacinamide, Licorice Extract, Retinol.";
    professional = "Laser treatments or hydroquinone creams by dermatologist.";
  } else if (concerns === "Dark Circles") {
    natural = "Potato or cucumber slices, cold tea bags, aloe vera gel overnight.";
    ingredients = "Caffeine, Retinol, Vitamin K, Peptides.";
    professional = "Professional treatments: under-eye fillers or laser therapy.";
  } else if (concerns === "Pigmentation") {
    natural = "Turmeric + yogurt mask weekly; lemon juice with honey.";
    ingredients = "Vitamin C, Kojic Acid, Azelaic Acid, Niacinamide.";
    professional = "Dermatologist peels, laser treatment, or prescription creams.";
  } else if (concerns === "Wrinkles") {
    natural = "Aloe vera gel, coconut oil massage, green tea daily.";
    ingredients = "Retinol, Hyaluronic Acid, Peptides, Vitamin C.";
    professional = "Micro-needling, Botox, or anti-aging treatments under guidance.";
  } else if (concerns === "Uneven Tone") {
    natural = "Gram flour + turmeric + curd mask weekly; stay hydrated.";
    ingredients = "Vitamin C, Alpha Arbutin, Kojic Acid.";
    professional = "Chemical exfoliation or dermatologist peels.";
  } else if (concerns === "Redness") {
    natural = "Cucumber slices and cold aloe vera gel to calm skin.";
    ingredients = "Centella Asiatica, Niacinamide, Green Tea Extract.";
    professional = "Seek medical advice if persists; could be rosacea.";
  } else if (concerns === "Eczema") {
    natural = "Coconut oil, oatmeal baths, keep skin moisturized.";
    ingredients = "Ceramides, Colloidal Oatmeal, Shea Butter.";
    professional = "Dermatologist consultation; medicated creams may be needed.";
  } else if (concerns === "Pimples") {
    natural = "Clean face twice daily; apply benzoyl peroxide with aloe vera.";
    ingredients = "Benzoyl Peroxide, Salicylic Acid, Sulfur.";
    professional = "Prescription retinoids or professional extraction if severe.";
  } else {
    natural = "Maintain hydration and a balanced diet. Cleanse twice daily.";
    ingredients = "Basic moisturizers with ceramides and hyaluronic acid.";
    professional = "Visit a dermatologist for personalized advice.";
  }

  // 6. ADJUST FOR SLEEP & SUN
  if (sleep === "Less than 5 hours" || sleep === "5 - 7 hours") {
    natural += " 💤 Try to improve your sleep (min 7-8 hrs).";
    professional += " Lack of sleep can worsen skin aging and acne.";
  }
  if (sun === "More than 2 hours") {
    natural += " 🌞 Limit sun exposure during peak hours (10am-4pm).";
    ingredients += " Always apply SPF 30+ sunscreen.";
    professional += " Consider consulting for pigmentation due to sun damage.";
  }

  // 7. PREPARE DATA OBJECT
  const results = {
    email,  
    age, 
    gender, 
    marital, 
    addiction, 
    skinType, 
    concerns, 
    sleepingHours: sleep, 
    sunExposure: sun,
    aiPrediction: aiPrediction || null,
    aiConfidence: aiConfidence || null,
    predictionDate: new Date().toISOString(),
    recommendations: { 
      natural, 
      ingredients, 
      professional 
    }
  };

  try {
    // 8. SAVE DATA TO MONGODB
    console.log("💾 Saving to database...", results);
    const response = await fetch('http://localhost:5000/api/save-questionnaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    });

    const dbResult = await response.json();

    if (dbResult.success) {
      console.log("✅ Data saved successfully!");
      // 9. REDIRECT AFTER SUCCESSFUL SAVE
      localStorage.setItem("skincareResults", JSON.stringify(results));
      window.location.href = "result.html";
    } else {
      alert("Failed to save data: " + dbResult.message);
    }
  } catch (error) {
    console.error("Connection Error:", error);
    alert("Could not connect to server. Make sure backend is running on port 5000.");
  }
});


// Tumchya submit function madhe he add kara
if (dbResult.success) {
    console.log("✅ Data saved successfully!");
    
    // Flag set kara ki ha data questionnaire madhun aala aahe
    results.fromQuestionnaire = true; 
    
    localStorage.setItem("skincareResults", JSON.stringify(results));
    window.location.href = "result.html"; 
}
