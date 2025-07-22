// Simple test with timeout
const http = require('http');

const data = JSON.stringify({
  question: 'test'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  },
  timeout: 10000 // 10 second timeout
};

console.log('Testing API route with timeout...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Request timeout');
  req.destroy();
  process.exit(1);
});

req.write(data);
req.end();

// Force exit after 15 seconds
setTimeout(() => {
  console.error('Force exit after 15 seconds');
  process.exit(1);
}, 15000);
