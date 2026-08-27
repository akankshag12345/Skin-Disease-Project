# app.py
# Streamlit app for FastAI-trained skin infection detection

import streamlit as st
from fastai.vision.all import *
from PIL import Image
import numpy as np

# ---------------------------
# CONFIGURATION
# ---------------------------
MODEL_PATH = "C:/Users/gurav/OneDrive/Desktop/frontend/demo/trained_model.pkl" # FastAI exported model
IMAGE_SIZE = (128, 128)

CLASS_NAMES = ['Acne', 'Eczema', 'Healthy', 'Psoriasis', 'Ringworm', 'Other']

# Recommendations per skin condition
RECOMMENDATIONS = {
    "Acne": [
        "Keep your skin clean and wash your face twice daily.",
        "Avoid touching or squeezing pimples.",
        "Use non-comedogenic skincare products.",
        "Maintain a healthy diet and drink plenty of water."
    ],
    "Eczema": [
        "Moisturize your skin frequently.",
        "Avoid harsh soaps and detergents.",
        "Wear soft, breathable clothing.",
        "Identify and avoid triggers that cause flare-ups."
    ],
    "Healthy": [
        "Maintain a balanced skincare routine.",
        "Protect your skin from excessive sun exposure.",
        "Stay hydrated and eat nutrient-rich foods."
    ],
    "Psoriasis": [
        "Use medicated creams or ointments as prescribed by a dermatologist.",
        "Avoid scratching affected areas.",
        "Take warm baths with gentle cleansers.",
        "Manage stress to prevent flare-ups."
    ],
    "Ringworm": [
        "Keep the affected area clean and dry.",
        "Avoid sharing personal items like towels.",
        "Use antifungal creams as recommended.",
        "Consult a dermatologist if it spreads."
    ],
    "Other": [
        "Consult a dermatologist for a precise diagnosis.",
        "Avoid self-medication for unknown skin conditions."
    ]
}

# ---------------------------
# Load FastAI Model
# ---------------------------
@st.cache_resource
def load_model(path):
    try:
        learn = load_learner(path)
        return learn
    except Exception as e:
        st.error(f"Error loading model: {e}")
        return None

# ---------------------------
# Image Processing & Prediction
# ---------------------------
def prepare_image(img_file):
    img = Image.open(img_file).convert('RGB')
    img = img.resize(IMAGE_SIZE)
    return img

def predict(learn, img):
    pred, pred_idx, probs = learn.predict(img)
    confidence = float(probs[pred_idx]) * 100
    return str(pred), confidence, dict(zip(CLASS_NAMES, [float(p * 100) for p in probs]))

# ---------------------------
# Streamlit App
# ---------------------------
def main():
    st.set_page_config(page_title="Skin Infection Detector", layout="wide")
    st.title("🔬 AI-Powered Skin Infection Detector")
    st.markdown("""
        Upload a skin image to classify.
        **Disclaimer:** Informational only. Consult a dermatologist for diagnosis.
    """)

    # Load model
    learn = load_model(MODEL_PATH)
    if learn is None:
        st.stop()

    uploaded_file = st.sidebar.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

    if uploaded_file:
        st.header("Uploaded Image")
        col1, col2 = st.columns([1, 2])
        with col1:
            st.image(uploaded_file, use_column_width=True)
        with col2:
            st.header("Prediction Result")
            img = prepare_image(uploaded_file)
            label, confidence, all_probs = predict(learn, img)

            # Display confidence
            if confidence >= 70:
                st.success(f"PREDICTION: {label}")
            elif confidence >= 50:
                st.warning(f"PREDICTION: {label}")
            else:
                st.error("Low confidence. Try a clearer image.")

            st.metric("Confidence Level", f"{confidence:.2f}%")

            st.subheader("Confidence Breakdown")
            sorted_probs = dict(sorted(all_probs.items(), key=lambda item: item[1], reverse=True))
            st.bar_chart(sorted_probs)

            # ---------------------------
            # Suggestions / Recommendations
            # ---------------------------
            st.subheader("Recommendations & Tips")
            tips = RECOMMENDATIONS.get(label, RECOMMENDATIONS["Other"])
            for tip in tips:
                st.write(f"✅ {tip}")

    else:
        st.info("Upload an image in the sidebar to begin detection.")

if __name__ == "__main__":
    main()
