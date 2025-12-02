const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Target URLs
const TARGETS = [
  'https://unframed-9znt.onrender.com/health',
  'https://cron-jobs-39jq.onrender.com/'  // Self-ping to stay awake
];

const INTERVAL = 15000; // 15 seconds

async function pingURL(url) {
  try {
    const start = Date.now();
    const response = await axios.get(url, { 
      timeout: 10000,
      validateStatus: () => true,  // Accept all status codes
      headers: {
        'User-Agent': 'Render-KeepAlive/1.0'
      }
    });
    const latency = Date.now() - start;
    const timestamp = new Date().toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false 
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`[${timestamp}] ✓ ${response.status} | ${url} (${latency}ms)`);
    } else {
      console.error(`[${timestamp}] ✗ ${response.status} | ${url}`);
      console.error(`Error: ${response.statusText} - ${JSON.stringify(response.data).slice(0, 100)}`);
    }
  } catch (error) {
    const timestamp = new Date().toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false 
    });
    console.error(`[${timestamp}] ✗ ${error.code} | ${url} - ${error.message}`);
  }
}

async function pingAll() {
  for (const url of TARGETS) {
    await pingURL(url);
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between pings
  }
}

// Start immediately
pingAll();
setInterval(pingAll, INTERVAL);

// Health endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'alive',
    service: 'keep-alive-cron',
    targets: TARGETS,
    interval: `${INTERVAL/1000}s`,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`✓ Keep-alive service running on port ${PORT}`);
  console.log(`✓ Pinging ${TARGETS.length} endpoints every ${INTERVAL/1000}s`);
  TARGETS.forEach(url => console.log(`  → ${url}`));
});
