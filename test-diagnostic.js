// Test each component individually
const http = require('http');

function testAPI(question, description) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ question });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      },
      timeout: 8000
    };

    console.log(`\n=== ${description} ===`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${responseData}`);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (e) => {
      console.error(`Error: ${e.message}`);
      reject(e);
    });

    req.on('timeout', () => {
      console.error('Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  try {
    // Test 1: Immediate response
    await testAPI('test-immediate', 'Test 1: Immediate Response');
    
    // Test 2: MSSQL only
    await testAPI('test-mssql', 'Test 2: MSSQL Only');
    
    // Test 3: OpenAI only
    await testAPI('test-openai', 'Test 3: OpenAI Only');
    
    // Test 4: Normal query
    await testAPI('vinho', 'Test 4: Normal Query (vinho)');
    
    console.log('\n=== All tests completed ===');
    process.exit(0);
    
  } catch (error) {
    console.error('\n=== Test failed ===');
    console.error(error.message);
    process.exit(1);
  }
}

// Set global timeout
setTimeout(() => {
  console.error('\n=== Global timeout after 30 seconds ===');
  process.exit(1);
}, 30000);

runTests();
