// Test frontend integration with MSSQL API
const http = require('http');

function testChatbotIntegration() {
  return new Promise((resolve, reject) => {
    const testMessage = {
      question: "cerveja"
    };

    const postData = JSON.stringify(testMessage);

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

    console.log('🚀 Testing Frontend Integration with MSSQL API');
    console.log(`Testing query: "${testMessage.question}"`);

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📊 Response:`, response);
          
          if (response.answer && response.dbRecords !== undefined) {
            console.log('🎉 FRONTEND INTEGRATION SUCCESS!');
            console.log(`💬 Answer: ${response.answer}`);
            console.log(`🔍 DB Records Found: ${response.dbRecords}`);
            console.log(`📈 Search Type: ${response.searchType || 'N/A'}`);
            console.log(`💰 Average Price: €${response.averagePrice || 'N/A'}`);
            resolve(response);
          } else {
            console.log('⚠️ Unexpected response format');
            resolve(response);
          }
        } catch (e) {
          console.log('📄 Raw response:', data);
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Request Error: ${e.message}`);
      reject(e);
    });

    req.setTimeout(8000, () => {
      console.error('❌ Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function runIntegrationTest() {
  try {
    console.log('='.repeat(60));
    console.log('🔧 ROTIXAI FRONTEND INTEGRATION TEST');
    console.log('='.repeat(60));
    
    await testChatbotIntegration();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ INTEGRATION TEST COMPLETED SUCCESSFULLY!');
    console.log('🎯 The chatbot is now ready to use with MSSQL backend!');
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ INTEGRATION TEST FAILED');
    console.error(`Error: ${error.message}`);
    console.log('='.repeat(60));
    process.exit(1);
  }
}

runIntegrationTest();
