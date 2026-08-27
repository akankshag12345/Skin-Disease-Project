from flask import Flask, request, jsonify
from fastai.vision.all import *
from flask_cors import CORS
import io

app = Flask(__name__)
CORS(app) # This allows your frontend to talk to this Python server

# Load the model you just trained
# Ensure trained_model.pkl is in the same folder as app.py
learn = load_learner('trained_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image'].read()
    img = PILImage.create(io.BytesIO(file))
    
    # Get prediction from the model
    pred, pred_idx, probs = learn.predict(img)
    
    return jsonify({
        "prediction": str(pred),
        "confidence": float(probs[pred_idx]) * 100
    })

if __name__ == '__main__':
    print("AI Service running on http://localhost:8000")
    app.run(port=8000)