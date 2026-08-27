import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
os.environ["KERAS_BACKEND"] = "tensorflow" 

import numpy as np
import cv2
import keras 
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure max file size (10MB)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024

# ======================= MODEL LOADING =======================
MODEL_PATH = "model10class.keras"
model = None
model_loaded = False

try:
    print("🔄 Loading model...")
    model = keras.models.load_model(MODEL_PATH, compile=False)
    model_loaded = True
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")

# Class names for skin diseases
class_names = [
    "00_Random_Images", "Acne", "Chickenpox", "Dyshidrotic Eczema", "Nail Fungus", "Normal skin", "Ringworm", "Seborrheic Keratosis", "Squamous Cell Carcinoma", "Vascular Lesion"
]
# ======================= HELPER FUNCTIONS =======================

def is_skin_image(img_bgr):
    # HSV color space madhye convert kara
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
    
    # 1. Standard Skin Range (Natural skin tones)
    lower_skin = np.array([0, 15, 60], dtype=np.uint8) 
    upper_skin = np.array([25, 255, 255], dtype=np.uint8)
    
    # 2. Dyshidrotic Eczema/Pale Skin Range (Shiny blisters sathi)
    # He blisters kadachit pandhri kiva fiki distat
    lower_pale = np.array([0, 0, 160], dtype=np.uint8)
    upper_pale = np.array([180, 50, 255], dtype=np.uint8)
    
    mask_skin = cv2.inRange(hsv, lower_skin, upper_skin)
    mask_pale = cv2.inRange(hsv, lower_pale, upper_pale)
    
    # Donhi ranges ekatra kara
    combined_mask = cv2.bitwise_or(mask_skin, mask_pale)
    
    # Total pixels calculate kara
    total_pixels = img_bgr.shape[0] * img_bgr.shape[1]
    skin_pixels = np.count_nonzero(combined_mask)
    percentage = (skin_pixels / total_pixels) * 100
    
    # Threshold 25% varun 8-10% var ana
    # Karan Eczema blisters lahan asu shaktat
    return percentage > 8

# ======================= ROUTES =======================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok", 
        "model_loaded": model_loaded,
        "dataset_link": "C:\\Users\\gurav\\Downloads\\archive (1)"
    })

@app.route("/predict", methods=["POST"])
def predict():
    if not model_loaded:
        return jsonify({"success": False, "prediction": "Error", "message": "Model not ready"}), 503
    
    if "image" not in request.files:
        return jsonify({"success": False, "prediction": "No Image", "message": "No image uploaded"}), 400

    file = request.files["image"]
    
    try:
        img_bytes = file.read()
        nparr = np.frombuffer(img_bytes, np.uint8)
        img_raw = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img_raw is None:
            return jsonify({"success": False, "prediction": "Invalid Format"}), 400
        
        # --- FIX FOR "UNDEFINED" ---
       # --- GATE 1: Skin Detection ---
        if not is_skin_image(img_raw):
            return jsonify({
                "success": False,
                "prediction": "This is not a skin image",  # Key for frontend
                "message": "Please upload a clear photo of skin."
            }), 200  # Return 200 so the frontend 'sees' the message
        
        # Preprocessing
        img = cv2.resize(img_raw, (224, 224))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = img.astype("float32") / 255.0
        img = np.expand_dims(img, axis=0)
        
        # Model Prediction
        predictions = model.predict(img, verbose=0)
        predicted_idx = np.argmax(predictions[0])
        confidence = float(np.max(predictions[0]))
        
        # GATE 2: Confidence Threshold
        THRESHOLD = 0.85 
        if confidence < THRESHOLD:
            return jsonify({
                "success": False,
                "prediction": "Unclear Image", # This replaces 'undefined'
                "message": "AI is unsure. Use better lighting and try again.",
                "confidence_value": confidence
            }), 200 

        # Success Response
        return jsonify({
            "success": True,
            "prediction": class_names[predicted_idx],
            "confidence": f"{confidence*100:.2f}%"
        })
        
    except Exception as e:
        return jsonify({"success": False, "prediction": "Error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000, host="0.0.0.0")