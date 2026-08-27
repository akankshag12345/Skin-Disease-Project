const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb' }));

// ======================= 1. DATABASE CONNECTION =======================
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas!"))
  .catch(err => console.error("❌ Connection error:", err));

// ======================= 2. UNIFIED USER MODEL =======================
// Using User model from models/User.js (see file for schema definition)

// ======================= 3. AUTH ENDPOINTS =======================

// SIGNUP
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }
  
  // Validate password (min 8 chars)
  if (password.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ success: true, message: "Signup successful! Please login." });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }
    res.status(400).json({ success: false, message: "Signup failed: " + err.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password." });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      res.status(200).json({ success: true, message: "Login successful!", email: user.email });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// ======================= 4. QUESTIONNAIRE & DATA ENDPOINTS =======================

// SAVE QUESTIONNAIRE & AI PREDICTIONS
app.post('/api/save-questionnaire', async (req, res) => {
  const { email, ...questionnaireData } = req.body;
  try {
    const profile = await User.findOneAndUpdate(
      { email: email },
      { $set: questionnaireData },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: "Profile saved successfully!", profile });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not save profile: " + err.message });
  }
});

// FETCH USER DATA
app.get('/api/user/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching user data: " + err.message });
  }
});

// CONTACT FORM
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: "Message saved!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error saving message." });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));