@echo off
REM ============================================
REM Skin Disease Detector - Startup Script
REM ============================================

echo.
echo 🩺 SKIN DISEASE DETECTOR STARTUP
echo ============================================

REM Check if required programs are installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Python not found. Please install Python from https://www.python.org/
    pause
    exit /b 1
)

echo ✅ Node.js and Python found

REM Check if model file exists
if not exist "backend\model10class.keras" (
    echo ❌ ERROR: model10class.keras not found!
    echo Please ensure the file exists in the backend folder
    pause
    exit /b 1
)
echo ✅ AI Model found

REM Check if .env file exists
if not exist "backend\.env" (
    echo ⚠️  WARNING: .env file not found!
    echo Please create backend\.env with MONGO_URI
    pause
)

echo.
echo 📋 Starting services...
echo.
echo This will open 3 terminal windows:
echo   1. Express.js Backend (Port 5000)
echo   2. Flask AI Service (Port 8000)
echo   3. Frontend Server (Port 5500)
echo.
echo Press ENTER to continue...
pause

REM Terminal 1: Express Backend
echo 🚀 Starting Express.js Backend...
start "Express Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak

REM Terminal 2: Flask AI Service
echo 🤖 Starting Flask AI Service...
start "Flask AI Service" cmd /k "cd backend && python app.py"
timeout /t 3 /nobreak

REM Terminal 3: Frontend
echo 🌐 Starting Frontend Server...
cd frontend\demo
start "Frontend" cmd /k "python -m http.server 5500"

echo.
echo ============================================
echo ✅ All services started!
echo ============================================
echo.
echo 📍 Access URLs:
echo   Frontend:     http://localhost:5500
echo   Backend API:  http://localhost:5000
echo   AI Service:   http://localhost:8000
echo.
echo 💡 Tips:
echo   - All 3 terminal windows should stay open
echo   - First load may take 10-15 seconds (model loading)
echo   - Check console for any errors
echo.
echo Press any key to close this window...
pause
