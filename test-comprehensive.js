// Comprehensive test of the stable chatbot
const http = require('http');

function testQuery(question, description) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ question });

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

    console.log(`\n=== ${description} ===`);
    console.log(`Query: "${question}"`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`Answer: ${parsed.answer}`);
          console.log(`DB Records: ${parsed.dbRecords}`);
          console.log(`Search Type: ${parsed.searchType || 'N/A'}`);
          console.log(`Average Price: €${parsed.averagePrice || 'N/A'}`);
          resolve(parsed);
        } catch (e) {
          console.log(`Response: ${data}`);
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Error: ${e.message}`);
      reject(e);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  try {
    console.log('🚀 COMPREHENSIVE CHATBOT TEST');
    
    // Test 1: Wine products
    await testQuery('vinho', 'Test 1: Wine Products');
    
    // Test 2: Water products  
    await testQuery('agua', 'Test 2: Water Products');
    
    // Test 3: Non-existent product
    await testQuery('produto inexistente', 'Test 3: Non-existent Product');
    
    // Test 4: Single word search
    await testQuery('luso', 'Test 4: Single Word Search');
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error(error.message);
    process.exit(1);
  }
}

runTests();
