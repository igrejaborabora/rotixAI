// Direct API test with shorter timeout
const http = require('http');

const postData = JSON.stringify({ question: 'agua' });

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

console.log('🧪 Direct API Test - Query: "agua"');

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
      console.log(`Search Type: ${parsed.searchType}`);
      if (parsed.products) {
        console.log(`Products: ${parsed.products.length} found`);
      }
    } catch (e) {
      console.log('Response:', data);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});

req.setTimeout(3000, () => {
  console.error('Timeout after 3 seconds');
  req.destroy();
  process.exit(1);
});

req.write(postData);
req.end();
