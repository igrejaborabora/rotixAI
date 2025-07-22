// Final test to verify the complete integration
const http = require('http');

function testWithTimeout(question, timeout = 10000) {
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
      }
    };

    console.log(`Testing: "${question}"`);
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          console.log(`✅ Success: ${res.statusCode}`);
          console.log(`Answer: ${parsed.answer}`);
          console.log(`DB Records: ${parsed.dbRecords}`);
          console.log(`AI Enhanced: ${parsed.aiEnhanced}`);
          resolve(parsed);
        } catch (e) {
          console.log(`Response: ${responseData}`);
          resolve({ raw: responseData });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Error: ${e.message}`);
      reject(e);
    });

    // Set timeout
    const timer = setTimeout(() => {
      console.error(`❌ Timeout after ${timeout}ms`);
      req.destroy();
      reject(new Error('Timeout'));
    }, timeout);

    req.on('close', () => clearTimeout(timer));

    req.write(data);
    req.end();
  });
}

async function runFinalTest() {
  try {
    console.log('=== FINAL INTEGRATION TEST ===\n');
    
    // Test with shorter timeout first
    await testWithTimeout('vinho', 8000);
    
    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===');
    process.exit(0);
    
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error(error.message);
    process.exit(1);
  }
}

runFinalTest();
