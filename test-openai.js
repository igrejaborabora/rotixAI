// Test OpenAI API directly
require('dotenv').config({ path: '.env.local' });

const openaiKey = process.env.OPENAI_API_KEY;

console.log('Testing OpenAI API...');
console.log('API Key present:', openaiKey ? 'YES' : 'NO');
console.log('API Key preview:', openaiKey ? openaiKey.substring(0, 10) + '...' : 'N/A');

async function testOpenAI() {
  try {
    console.log('Making request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Hello, respond with just "OpenAI working!"'
          }
        ],
        max_tokens: 50
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      process.exit(1);
    }

    const data = await response.json();
    console.log('OpenAI response:', data.choices[0]?.message?.content);
    console.log('Test successful!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Set timeout
setTimeout(() => {
  console.error('Test timeout after 15 seconds');
  process.exit(1);
}, 15000);

if (!openaiKey) {
  console.error('OpenAI API key not found in environment variables');
  process.exit(1);
}

testOpenAI();
