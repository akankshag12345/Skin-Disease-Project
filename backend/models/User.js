const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // Questionnaire data
  age: Number,
  gender: String,
  skinType: String,
  concerns: String,
  marital: String,
  addiction: String,
  sleepingHours: String,
  sunExposure: String,
  // AI Predictions
  aiPrediction: String,
  aiConfidence: String,
  predictionImage: String,
  predictionDate: Date,
  // Recommendations
  recommendations: {
    natural: String,
    ingredients: String,
    professional: String
  }
}, { collection: 'users' });

// Prevent OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;