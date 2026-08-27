const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Store service processes
let services = {
  expressServer: null,
  flaskApp: null,
  nodeStatus: 'stopped',
  pythonStatus: 'stopped',
  expressLogs: [],
  pythonLogs: []
};

// Utility: Add log entry
function addLog(service, message) {
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;
  
  if (service === 'express') {
    services.expressLogs.push(logEntry);
    if (services.expressLogs.length > 100) services.expressLogs.shift();
  } else if (service === 'python') {
    services.pythonLogs.push(logEntry);
    if (services.pythonLogs.length > 100) services.pythonLogs.shift();
  }
}

// ==================== START EXPRESS BACKEND ====================
function startExpressServer() {
  if (services.nodeStatus === 'running') {
    return { success: false, message: 'Express already running' };
  }

  addLog('express', '🔄 Starting Express Backend...');
  services.nodeStatus = 'starting';

  const serverPath = path.join(__dirname, 'server.js');
  services.expressServer = spawn('node', [serverPath], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  services.expressServer.stdout.on('data', (data) => {
    const message = data.toString().trim();
    addLog('express', message);
  });

  services.expressServer.stderr.on('data', (data) => {
    const message = data.toString().trim();
    addLog('express', `❌ ${message}`);
  });

  services.expressServer.on('close', (code) => {
    addLog('express', `⏹️  Express stopped (code: ${code})`);
    services.nodeStatus = 'stopped';
    services.expressServer = null;
  });

  services.nodeStatus = 'running';
  addLog('express', '✅ Express Backend started on port 5000');
  return { success: true, message: 'Express started' };
}

// ==================== START FLASK APP ====================
function startFlaskApp() {
  if (services.pythonStatus === 'running') {
    return { success: false, message: 'Flask already running' };
  }

  addLog('python', '🔄 Starting Flask AI Service...');
  services.pythonStatus = 'starting';

  const appPath = path.join(__dirname, 'app.py');
  services.flaskApp = spawn('python', [appPath], {
    cwd: __dirname,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  services.flaskApp.stdout.on('data', (data) => {
    const message = data.toString().trim();
    addLog('python', message);
  });

  services.flaskApp.stderr.on('data', (data) => {
    const message = data.toString().trim();
    addLog('python', `⚠️  ${message}`);
  });

  services.flaskApp.on('close', (code) => {
    addLog('python', `⏹️  Flask stopped (code: ${code})`);
    services.pythonStatus = 'stopped';
    services.flaskApp = null;
  });

  services.pythonStatus = 'running';
  addLog('python', '✅ Flask AI Service started on port 8000');
  return { success: true, message: 'Flask started' };
}

// ==================== STOP SERVICES ====================
function stopExpressServer() {
  if (services.expressServer) {
    services.expressServer.kill('SIGTERM');
    addLog('express', '⛔ Express stopped');
    return { success: true };
  }
  return { success: false };
}

function stopFlaskApp() {
  if (services.flaskApp) {
    services.flaskApp.kill('SIGTERM');
    addLog('python', '⛔ Flask stopped');
    return { success: true };
  }
  return { success: false };
}

// ==================== CHECK SERVICE HEALTH ====================
async function checkServiceHealth(port) {
  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      method: 'GET',
      timeout: 3000
    }).catch(() => null);
    return response?.ok || false;
  } catch {
    return false;
  }
}

// ==================== API ENDPOINTS ====================

// Serve static dashboard
app.use(express.static(path.join(__dirname, '../frontend/demo')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Get services status
app.get('/api/status', async (req, res) => {
  const expressHealth = await checkServiceHealth(5000);
  const flaskHealth = await checkServiceHealth(8000);

  res.json({
    express: {
      status: services.nodeStatus,
      healthy: expressHealth,
      logs: services.expressLogs.slice(-20)
    },
    flask: {
      status: services.pythonStatus,
      healthy: flaskHealth,
      logs: services.pythonLogs.slice(-20)
    },
    frontend: {
      status: 'running',
      healthy: true,
      url: 'http://localhost:5500'
    }
  });
});

// Start Express
app.post('/api/start-express', (req, res) => {
  const result = startExpressServer();
  res.json(result);
});

// Stop Express
app.post('/api/stop-express', (req, res) => {
  const result = stopExpressServer();
  res.json(result);
});

// Start Flask
app.post('/api/start-flask', (req, res) => {
  const result = startFlaskApp();
  res.json(result);
});

// Stop Flask
app.post('/api/stop-flask', (req, res) => {
  const result = stopFlaskApp();
  res.json(result);
});

// Start all services
app.post('/api/start-all', async (req, res) => {
  startExpressServer();
  startFlaskApp();
  
  // Wait a bit for services to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  res.json({ 
    success: true, 
    message: 'All services started. Check status below.',
    nextUrl: 'http://localhost:5500'
  });
});

// Stop all services
app.post('/api/stop-all', (req, res) => {
  stopExpressServer();
  stopFlaskApp();
  res.json({ success: true });
});

// ==================== START CONTROL SERVER ====================
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║         🩺 SKIN DISEASE DETECTOR - CONTROL DASHBOARD 🩺       ║
╚════════════════════════════════════════════════════════════════╝

📊 CONTROL DASHBOARD: http://localhost:3000
🌐 FRONTEND: http://localhost:5500
🔌 EXPRESS API: http://localhost:5000
🤖 AI SERVICE: http://localhost:8000

Press ENTER to open dashboard in browser...
  `);

  // Auto-start services after delay
  setTimeout(() => {
    console.log('Auto-starting services...\n');
    startExpressServer();
    startFlaskApp();
  }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Shutting down...');
  stopExpressServer();
  stopFlaskApp();
  setTimeout(() => process.exit(0), 1000);
});
