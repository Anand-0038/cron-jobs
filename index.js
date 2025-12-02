const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Target URL to keep alive
const TARGET_URL = 'https://unframed-9znt.onrender.com/health';
const INTERVAL = 15000; // 15 seconds

// Ping function
async function pingBackend() {
  try {
    const start = Date.now();
    const response = await axios.get(TARGET_URL, { timeout: 10000 });
    const latency = Date.now() - start;
    const timestamp = new Date().toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false 
    });
    console.log(`[${timestamp}] ✓ ${response.status} (${latency}ms)`);
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false 
    });
    console.error(`[${timestamp}] ✗ ${error.code || error.message}`);
  }
}

// Start pinging immediately
pingBackend();
setInterval(pingBackend, INTERVAL);

// Health endpoint for Render
app.get('/', (req, res) => {
  res.json({ 
    status: 'alive', 
    target: TARGET_URL,
    interval: `${INTERVAL/1000}s`
  });
});

app.listen(PORT, () => {
  console.log(`Keep-alive service running on port ${PORT}`);
  console.log(`Pinging ${TARGET_URL} every ${INTERVAL/1000} seconds`);
});

