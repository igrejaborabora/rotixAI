// Test production API directly
const https = require('https');

function testProductionAPI(url, question) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ question });
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log(`🧪 Testing Production API: ${url}`);
    console.log(`📝 Query: "${question}"`);

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📊 Response:`, parsed);
          
          if (parsed.answer && parsed.dbRecords !== undefined) {
            console.log('🎉 MSSQL API WORKING IN PRODUCTION!');
            console.log(`💬 Answer: ${parsed.answer}`);
            console.log(`🔍 DB Records: ${parsed.dbRecords}`);
          } else {
            console.log('⚠️ Not MSSQL response format');
          }
          resolve(parsed);
        } catch (e) {
          console.log('📄 Raw response:', data);
          resolve({ raw: data });
        }
      });
    });

    req.on('error', (e) => {
      console.error(`❌ Error: ${e.message}`);
      reject(e);
    });

    req.setTimeout(10000, () => {
      console.error('❌ Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.write(postData);
    req.end();
  });
}

async function runProductionTest() {
  try {
    console.log('='.repeat(60));
    console.log('🌐 PRODUCTION API TEST - ROTIXAI');
    console.log('='.repeat(60));
    
    // Replace with actual Vercel URL
    const productionUrl = 'https://rotix-frc58oqfu-fernandos-projects-8346d0e1.vercel.app/api/chat';
    
    await testProductionAPI(productionUrl, 'vinho');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ PRODUCTION TEST COMPLETED!');
    console.log('='.repeat(60));
    
    process.exit(0);
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.error('❌ PRODUCTION TEST FAILED');
    console.error(`Error: ${error.message}`);
    console.log('='.repeat(60));
    process.exit(1);
  }
}

runProductionTest();
