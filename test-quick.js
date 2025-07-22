// Quick test to verify API is working
const http = require('http');

const postData = JSON.stringify({ question: 'test-mssql' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing API with test-mssql...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});

// Set a 5 second timeout
req.setTimeout(5000, () => {
  console.error('Request timeout');
  req.destroy();
  process.exit(1);
});

req.write(postData);
req.end();
