// ================= PARTICLE BACKGROUND =================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
const colors = ['#ff0080','#ff8c00','#00cccc','#ffffff'];

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
    if(this.x<0||this.x>canvas.width) this.speedX*=-1;
    if(this.y<0||this.y>canvas.height) this.speedY*=-1;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fill();
  }
}

function initParticles() {
  particlesArray=[];
  for(let i=0;i<120;i++){particlesArray.push(new Particle());}
}
initParticles();
function animateParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particlesArray.forEach(p=>{p.update();p.draw();});
  requestAnimationFrame(animateParticles);
}
animateParticles();

window.addEventListener('resize',()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});

function getRecommendations(prediction) {
    let recs = { natural: "", ingredients: "", professional: "" };

    if (prediction === "00_Random_Images") {
        recs.natural = "The image provided does not clearly show skin.";
        recs.ingredients = "N/A";
        recs.professional = "Please upload a clear, well-lit photo of the affected skin area.";
    } 
    else if (prediction === "Acne") {
        recs.natural = "Wash your face twice a day with a mild, soap-free cleanser. Avoid popping pimples.";
        recs.ingredients = "Look for products containing Salicylic Acid, Benzoyl Peroxide, or Tea Tree Oil.";
        recs.professional = "Consult a dermatologist if you see deep painful cysts or scarring.";
    }
    else if (prediction === "Chickenpox") {
        recs.natural = "Take lukewarm baths with uncooked oatmeal or baking soda. Keep fingernails short to prevent scratching.";
        recs.ingredients = "Calamine lotion for spots and Acetaminophen for fever (Avoid Aspirin).";
        recs.professional = "Seek medical advice immediately, especially if there is difficulty breathing or infected sores.";
    }
    else if (prediction === "Dyshidrotic Eczema") {
        recs.natural = "Apply cold compresses to the blisters. Avoid contact with irritating metals like nickel.";
        recs.ingredients = "Heavy-duty moisturizers (Ointments/Ceramides) and topical steroid creams.";
        recs.professional = "A doctor may prescribe light therapy or stronger corticosteroid ointments.";
    }
    else if (prediction === "Nail Fungus") {
        recs.natural = "Keep your nails trimmed short and dry. Disinfect nail clippers after every use.";
        recs.ingredients = "Antifungal nail lacquers or essential oils like Oregano oil.";
        recs.professional = "Consult a podiatrist or doctor for oral antifungal medications for deep-rooted infections.";
    }
    else if (prediction === "Normal skin") {
        recs.natural = "Maintain your current routine. Stay hydrated and use a light moisturizer.";
        recs.ingredients = "Daily SPF 30+ sunscreen and a gentle pH-balanced cleanser.";
        recs.professional = "Regular skin check-ups once a year are recommended to maintain health.";
    }
    else if (prediction === "Ringworm") {
        recs.natural = "Keep the infected area clean and dry. Change socks and underwear daily. Don't share towels.";
        recs.ingredients = "Over-the-counter antifungal creams like Clotrimazole or Terbinafine.";
        recs.professional = "See a doctor if the rash doesn't improve after 2 weeks of OTC treatment.";
    }
    else if (prediction === "Seborrheic Keratosis") {
        recs.natural = "These are harmless 'barnacles of aging'. Avoid picking or scratching them.";
        recs.ingredients = "N/A (Cremes won't remove them).";
        recs.professional = "If they become irritated or bleed, a dermatologist can remove them via cryotherapy (freezing).";
    }
    else if (prediction === "Squamous Cell Carcinoma") {
        recs.natural = "Protect the area from any further sun exposure. Do not apply home remedies to open sores.";
        recs.ingredients = "N/A (Requires medical intervention).";
        recs.professional = "CRITICAL: See a dermatologist immediately for a biopsy and surgical removal options.";
    }
    else if (prediction === "Vascular Lesion") {
        recs.natural = "Avoid harsh scrubbing on the area. Most birthmark-type lesions are harmless.";
        recs.ingredients = "N/A (Usually requires laser treatment for removal).";
        recs.professional = "Consult a specialist to confirm it's benign. Laser therapy is often used for cosmetic removal.";
    }
    else {
        recs.natural = "Unable to provide specific advice for this condition.";
        recs.ingredients = "Please try again with a clearer image.";
        recs.professional = "Consult a healthcare provider for any persistent skin issues.";
    }

    return recs;
}

document.addEventListener("DOMContentLoaded", () => {
    // १. दोन्ही ठिकाणचा डेटा चेक करा
    const directAIData = JSON.parse(localStorage.getItem("skincareAIResults"));
    const questionnaireData = JSON.parse(localStorage.getItem("skincareResults"));

    const resultContent = document.getElementById("resultContent"); 
    const recommendationSection = document.getElementById("recommendation");
    const pText = document.getElementById("predictionText");
    const cText = document.getElementById("confidenceText");

    // --- CASE A: जर 'Open Skin AI Detector' कडून आला असेल ---
    if (directAIData && directAIData.isDirectAI) {
        // खालचे ३ बॉक्सेस लपवा
        if (recommendationSection) recommendationSection.style.display = "none";
        
        // फक्त आजाराचे नाव आणि स्कोअर दाखवणारा बॉक्स सुरू करा
        if (resultContent) resultContent.style.display = "block";

        const condition = directAIData.prediction;
        if (pText) pText.innerText = condition === "00_Random_Images" ? "Not a Skin Image" : condition;
        if (cText) cText.innerText = "AI Confidence Score: " + (directAIData.confidence || "0") + "%";
        
        // काम झाल्यावर direct AI चा डेटा क्लियर करा
        localStorage.removeItem("skincareAIResults");
    } 
    
    // --- CASE B: जर 'Questionnaire' कडून आला असेल (यात कोणताही बदल नाही) ---
    else if (questionnaireData) {
        // स्कोअर वाला बॉक्स लपवा
        if (resultContent) resultContent.style.display = "none";
        
        // ३ बॉक्सेस वाला जुना सेक्शन दाखवा
        if (recommendationSection) recommendationSection.style.display = "block";

        const condition = questionnaireData.aiPrediction || questionnaireData.concerns || "Normal skin";
        
        // तुमचं जुनं Recommendations लॉजिक
        const tips = getRecommendations(condition);
        document.getElementById("naturalRemedyText").innerText = tips.natural;
        document.getElementById("ingredientText").innerText = tips.ingredients;
        document.getElementById("adviceText").innerText = tips.professional;
    }
});

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

// Particle Background चा कोड आणि getRecommendations फंक्शन या खाली तसंच ठेवा...


function getRecommendations(prediction) {
    let recs = { natural: "", ingredients: "", professional: "" };

    if (prediction === "Acne") {
        recs.natural = "Wash your face twice a day with a mild, soap-free cleanser. Use neem paste or aloe vera gel to soothe inflammation.";
        recs.ingredients = "Look for products containing Salicylic Acid, Niacinamide, or Tea Tree Oil.";
        recs.professional = "Consult a dermatologist if you see deep painful cysts or persistent scarring.";
    } 
    else if (prediction === "Chickenpox") {
        recs.natural = "Take lukewarm baths with uncooked oatmeal. Keep fingernails short to prevent scratching and secondary infections.";
        recs.ingredients = "Calamine lotion for itchy spots and Paracetamol for fever (Avoid Aspirin).";
        recs.professional = "Seek medical advice immediately if there is difficulty breathing or if sores become very red and warm.";
    } 
    else if (prediction === "Dyshidrotic Eczema") {
        recs.natural = "Apply cold compresses to the blisters. Use thick, fragrance-free moisturizers regularly.";
        recs.ingredients = "Corticosteroid creams, Ceramides, and barrier repair ointments.";
        recs.professional = "A doctor may prescribe light therapy or stronger corticosteroid ointments if OTC options fail.";
    } 
    else if (prediction === "Nail Fungus") {
        recs.natural = "Keep your nails trimmed short and completely dry. Soak nails in diluted apple cider vinegar.";
        recs.ingredients = "Antifungal nail lacquers (Amorolfine) or essential oils like Oregano oil.";
        recs.professional = "Consult a podiatrist for oral antifungal medications as topical treatments often take a long time.";
    } 
    else if (prediction === "Normal skin") {
        recs.natural = "Maintain your current routine. Stay hydrated and use rose water for refreshment.";
        recs.ingredients = "Daily SPF 30+ sunscreen, Hyaluronic Acid, and a gentle pH-balanced cleanser.";
        recs.professional = "Regular skin check-ups once a year are recommended to maintain long-term skin health.";
    } 
    else if (prediction === "Ringworm") {
        recs.natural = "Keep the infected area clean and dry. Change socks and underwear daily. Avoid sharing personal items.";
        recs.ingredients = "Over-the-counter antifungal creams like Clotrimazole, Miconazole, or Terbinafine.";
        recs.professional = "See a doctor if the rash doesn't improve after 2 weeks of consistent OTC treatment.";
    } 
    else if (prediction === "Seborrheic Keratosis") {
        recs.natural = "These are harmless growth. Avoid picking or scratching them to prevent irritation or bleeding.";
        recs.ingredients = "N/A (Topical creams won't remove these growths).";
        recs.professional = "If they become itchy or bleed, a dermatologist can remove them via cryotherapy or electrosurgery.";
    } 
    else if (prediction === "Squamous Cell Carcinoma") {
        recs.natural = "Avoid all home remedies. Protect the area from any further sun exposure using clothing.";
        recs.ingredients = "N/A (Requires professional medical intervention).";
        recs.professional = "CRITICAL: See a dermatologist immediately for a biopsy and surgical removal options.";
    } 
    else if (prediction === "Vascular Lesion") {
        recs.natural = "Avoid harsh scrubbing on the area. Most vascular birthmarks are harmless.";
        recs.ingredients = "Vitamin K creams may help reduce the appearance in some cases.";
        recs.professional = "Consult a specialist to confirm the lesion is benign. Laser therapy is the standard for removal.";
    } 
    else if (prediction === "00_Random_Images") {
        recs.natural = "The image provided does not clearly show skin.";
        recs.ingredients = "N/A";
        recs.professional = "Please upload a clear, well-lit photo of the affected skin area for a better analysis.";
    }
    else {
        recs.natural = "Keep the area clean and avoid using harsh chemicals until identified.";
        recs.ingredients = "Use a basic, fragrance-free moisturizer.";
        recs.professional = "Consult a healthcare provider for any persistent or changing skin issues.";
    }

    return recs;
}