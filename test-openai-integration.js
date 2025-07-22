// Test OpenAI integration with proper timeout
const http = require('http');

const postData = JSON.stringify({ question: 'vinho' });

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

console.log('Testing MSSQL + OpenAI integration with "vinho"...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('✅ SUCCESS!');
      console.log(`Answer: ${parsed.answer}`);
      console.log(`DB Records: ${parsed.dbRecords}`);
      console.log(`AI Enhanced: ${parsed.aiEnhanced}`);
      console.log(`Products found: ${parsed.products?.length || 0}`);
    } catch (e) {
      console.log('Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  process.exit(1);
});

// Set a reasonable timeout for OpenAI calls
req.setTimeout(8000, () => {
  console.error('❌ Request timeout (8s)');
  req.destroy();
  process.exit(1);
});

req.write(postData);
req.end();
