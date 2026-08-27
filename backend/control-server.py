#!/usr/bin/env python3
"""
🩺 Skin Disease Detector - Python Control Server
Alternative to Node.js control-server.js
Manages services and provides web dashboard
"""

import subprocess
import threading
import time
import json
from pathlib import Path
import sys
import os

try:
    from flask import Flask, jsonify, send_file
    from flask_cors import CORS
except ImportError:
    print("❌ Flask not installed. Install with: pip install flask flask-cors")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

class ServiceManager:
    def __init__(self):
        self.express_process = None
        self.flask_process = None
        self.express_logs = []
        self.flask_logs = []
        self.max_logs = 100

    def add_log(self, service, message):
        timestamp = time.strftime('%H:%M:%S')
        log_entry = f"[{timestamp}] {message}"
        
        if service == 'express':
            self.express_logs.append(log_entry)
            if len(self.express_logs) > self.max_logs:
                self.express_logs.pop(0)
        elif service == 'flask':
            self.flask_logs.append(log_entry)
            if len(self.flask_logs) > self.max_logs:
                self.flask_logs.pop(0)

    def start_express(self):
        if self.express_process:
            return False, "Express already running"
        
        self.add_log('express', '🔄 Starting Express Backend...')
        try:
            self.express_process = subprocess.Popen(
                ['node', 'server.js'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            def read_output():
                for line in self.express_process.stdout:
                    self.add_log('express', line.strip())
                for line in self.express_process.stderr:
                    self.add_log('express', f"❌ {line.strip()}")
            
            threading.Thread(target=read_output, daemon=True).start()
            self.add_log('express', '✅ Express started on port 5000')
            return True, "Express started"
        except Exception as e:
            self.add_log('express', f"❌ Error: {str(e)}")
            return False, str(e)

    def stop_express(self):
        if self.express_process:
            self.express_process.terminate()
            self.add_log('express', '⏹️  Express stopped')
            self.express_process = None
            return True, "Express stopped"
        return False, "Express not running"

    def start_flask(self):
        if self.flask_process:
            return False, "Flask already running"
        
        self.add_log('flask', '🔄 Starting Flask AI Service...')
        try:
            self.flask_process = subprocess.Popen(
                ['python', 'app.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1
            )
            
            def read_output():
                for line in self.flask_process.stdout:
                    self.add_log('flask', line.strip())
                for line in self.flask_process.stderr:
                    self.add_log('flask', f"⚠️  {line.strip()}")
            
            threading.Thread(target=read_output, daemon=True).start()
            self.add_log('flask', '✅ Flask started on port 8000')
            return True, "Flask started"
        except Exception as e:
            self.add_log('flask', f"❌ Error: {str(e)}")
            return False, str(e)

    def stop_flask(self):
        if self.flask_process:
            self.flask_process.terminate()
            self.add_log('flask', '⏹️  Flask stopped')
            self.flask_process = None
            return True, "Flask stopped"
        return False, "Flask not running"

# Initialize manager
manager = ServiceManager()

# REST API Endpoints
@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        'express': {
            'status': 'running' if manager.express_process else 'stopped',
            'logs': manager.express_logs[-20:]
        },
        'flask': {
            'status': 'running' if manager.flask_process else 'stopped',
            'logs': manager.flask_logs[-20:]
        }
    })

@app.route('/api/start-express', methods=['POST'])
def start_express():
    success, message = manager.start_express()
    return jsonify({'success': success, 'message': message})

@app.route('/api/stop-express', methods=['POST'])
def stop_express():
    success, message = manager.stop_express()
    return jsonify({'success': success, 'message': message})

@app.route('/api/start-flask', methods=['POST'])
def start_flask():
    success, message = manager.start_flask()
    return jsonify({'success': success, 'message': message})

@app.route('/api/stop-flask', methods=['POST'])
def stop_flask():
    success, message = manager.stop_flask()
    return jsonify({'success': success, 'message': message})

@app.route('/api/start-all', methods=['POST'])
def start_all():
    manager.start_express()
    manager.start_flask()
    time.sleep(2)
    return jsonify({'success': True, 'message': 'All services started'})

@app.route('/api/stop-all', methods=['POST'])
def stop_all():
    manager.stop_express()
    manager.stop_flask()
    return jsonify({'success': True, 'message': 'All services stopped'})

# Dashboard route
@app.route('/')
def dashboard():
    dashboard_path = Path(__file__).parent / 'dashboard.html'
    if dashboard_path.exists():
        return send_file(dashboard_path)
    return "Dashboard HTML not found", 404

if __name__ == '__main__':
    print("""
╔════════════════════════════════════════════════════════════════╗
║    🩺 SKIN DISEASE DETECTOR - CONTROL SERVER 🩺               ║
╚════════════════════════════════════════════════════════════════╝

📊 CONTROL DASHBOARD: http://localhost:3000

🚀 Starting services...
    """)
    
    # Auto-start services
    time.sleep(1)
    manager.start_express()
    manager.start_flask()
    
    # Start Flask server
    app.run(host='0.0.0.0', port=3000, debug=False)
