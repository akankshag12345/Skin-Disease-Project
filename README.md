# 🩺 Skin Disease Detector - AI-Powered Skincare Solution

A full-stack web application that uses AI to detect skin diseases and provide personalized skincare recommendations.

---

## 📋 Project Structure

```
FINAL YEAR PROJECT/
├── backend/
│   ├── app.py                  # Flask AI prediction service (Port 8000)
│   ├── server.js               # Express.js authentication & data API (Port 5000)
│   ├── models/
│   │   ├── User.js             # Unified user database schema
│   │   └── Message.js          # Contact form messages
│   ├── model10class.keras      # Trained TensorFlow/Keras model
│   ├── requirements.txt         # Python dependencies
│   ├── package.json            # Node.js dependencies
│   ├── .env                    # MongoDB connection string
│   └── node_modules/
│
├── frontend/
│   └── demo/
│       ├── index.html          # Homepage
│       ├── login.html          # User login page
│       ├── signup.html         # User signup page
│       ├── questionnaire.html  # Skin assessment form
│       ├── result.html         # Results & recommendations page
│       ├── infection.html      # AI analysis demo page
│       ├── *.js                # Frontend scripts
│       └── *.css               # Stylesheets
│
└── ai_services/
    └── app1.py                 # Alternative FastAI service (not used)
```

---

## ✅ Prerequisites

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **Python** (v3.8+) - [Download](https://www.python.org/)
- **MongoDB Atlas** account - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** (optional)

---

## 🚀 Installation & Setup

### Step 1: Clone/Download Project
```bash
cd "FINAL YEAR PROJECT"
```

### Step 2: Install Backend Dependencies

#### A. Install Node.js packages (for Express server)
```bash
cd backend
npm install
cd ..
```

#### B. Install Python packages (for AI service)
```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r backend/requirements.txt
```

### Step 3: Configure MongoDB

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create account and new project
3. Create cluster (free tier available)
4. Get connection string
5. Update `backend/.env`:
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=project-name
```

---

## 🎯 Running the Project

### ⭐ RECOMMENDED: Web-Based Control Dashboard (Easiest)

Simply run one command to start everything with a web interface:

```bash
cd backend
npm run control
```

This opens **Control Dashboard** at `http://localhost:3000` where you can:
- ✅ Start/Stop Express Backend
- ✅ Start/Stop Flask AI Service  
- ✅ View real-time service logs
- ✅ Monitor service health
- ✅ Quick links to all pages

**Services auto-start!** Just manage them from your browser.

### Alternative: Manual Terminal Setup (Advanced)

**Terminal 1: Run Express.js Backend (Port 5000)**
```bash
cd backend
npm start
```

Expected output:
```
✅ Successfully connected to MongoDB Atlas!
🚀 Server running on port 5000
```

**Terminal 2: Run Flask AI Service (Port 8000)**
```bash
cd backend
python app.py
```

Expected output:
```
🔄 Loading model...
✅ Model loaded successfully!
🚀 AI Prediction Service starting on port 8000...
```

**Terminal 3: View Frontend**
```bash
cd frontend/demo
python -m http.server 5500
```

Then open browser: `http://localhost:5500`

---

## 📖 How to Use

1. **Homepage** (`index.html`):
   - View project details
   - Upload image for quick AI analysis

2. **Sign Up** (`signup.html`):
   - Create account with email & password
   - Password must be at least 8 characters

3. **Log In** (`login.html`):
   - Enter registered email & password
   - Goes to questionnaire page

4. **Questionnaire** (`questionnaire.html`):
   - Fill out skin assessment form
   - Upload a skin image (optional, for AI analysis)
   - Submit for personalized recommendations

5. **Results** (`result.html`):
   - View AI prediction (if image uploaded)
   - See personalized skincare recommendations:
     - Natural remedies
     - Effective ingredients
     - Professional treatments

---

## 🧠 AI Model Details

- **Model File**: `model10class.keras`
- **Input Size**: 224x224 pixels (RGB)
- **Classes Detected** (10):
  1. Acne
  2. Pimple
  3. Dark Circles
  4. Pigmentation
  5. Wrinkles
  6. Normal Skin
  7. Oily Skin
  8. Dry Skin
  9. Sensitive Skin
  10. Combination Skin

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (bcrypt hashed),
  age: Number,
  gender: String,
  skinType: String,
  concerns: String,
  marital: String,
  addiction: String,
  sleepingHours: String,
  sunExposure: String,
  aiPrediction: String,
  aiConfidence: String,
  recommendations: {
    natural: String,
    ingredients: String,
    professional: String
  },
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - Login user
- `GET /api/user/:email` - Get user profile

### Data Management
- `POST /api/save-questionnaire` - Save assessment & recommendations
- `POST /api/contact` - Submit contact form

### AI Service (Flask)
- `GET /health` - Check service status
- `POST /predict` - Get skin disease prediction

---

## 🐛 Troubleshooting

### Error: "Could not connect to the server"
- Ensure Express.js is running on port 5000 ✅
- Check that MongoDB URL in `.env` is correct

### Error: "Model not loaded yet"
- Flask service is still loading model (wait 10-15 seconds)
- Ensure `model10class.keras` exists in `backend/` folder

### Error: "Cannot POST /predict"
- Make sure Flask is running on port 8000 (not Express)
- Check CORS is enabled in Flask (`flask-cors` installed)

### MongoDB Connection Error
- Verify MongoDB URI in `.env` is correct
- Check IP whitelist allows your connection
- Ensure MongoDB cluster is running

---

## 📱 Deployment

For production deployment:

1. **Backend**: Deploy Express.js to Heroku, AWS, or Railway
2. **Frontend**: Deploy to Vercel, Netlify, or GitHub Pages
3. **AI Service**: Run as separate microservice on cloud platform
4. **Database**: Use MongoDB Atlas (already cloud-hosted)

---

## 👨‍💻 Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Particle.js animations
- Canvas API

**Backend:**
- Node.js + Express.js
- Python + Flask
- MongoDB + Mongoose

**AI/ML:**
- TensorFlow/Keras
- OpenCV (image processing)
- NumPy

**Security:**
- bcryptjs (password hashing)
- CORS enabled

---

## 📝 Notes

- All user passwords are securely hashed with bcryptjs
- AI predictions are saved to user profile
- Recommendations are generated based on skin condition & lifestyle
- Frontend stores email in localStorage after login
- All data synced with MongoDB Atlas

---

## 📧 Support

For issues or questions:
1. Check console errors (F12 → Console tab)
2. Verify all services are running (ports 5000 & 8000)
3. Check `.env` file has correct MongoDB URI
4. Ensure `model10class.keras` file exists in `backend/`

---

**Happy Skincare! 🌟**
