const https = require('https');

const data = JSON.stringify({
  question: 'vinho'
});

const options = {
  hostname: 'rotix-frc58oqfu-fernandos-projects-8346d0e1.vercel.app',
  port: 443,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('🧪 Testing Production MSSQL API...');
console.log('📝 Query: vinho');
console.log('🌐 URL: https://rotix-frc58oqfu-fernandos-projects-8346d0e1.vercel.app/api/chat');
console.log('');

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`✅ Status Code: ${res.statusCode}`);
    console.log('📊 Response:');
    
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
      
      if (parsed.answer && parsed.dbRecords !== undefined) {
        console.log('');
        console.log('🎉 SUCCESS: MSSQL API IS WORKING!');
        console.log(`💬 Answer: ${parsed.answer}`);
        console.log(`🔍 DB Records: ${parsed.dbRecords}`);
        console.log(`🔎 Search Type: ${parsed.searchType || 'N/A'}`);
        if (parsed.averagePrice) {
          console.log(`💰 Average Price: €${parsed.averagePrice}`);
        }
      } else {
        console.log('');
        console.log('⚠️ WARNING: Not MSSQL format response');
        console.log('This appears to be OpenAI or another provider');
      }
    } catch (e) {
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
});

req.setTimeout(15000, () => {
  console.error('❌ Request timeout');
  req.destroy();
});

req.write(data);
req.end();
