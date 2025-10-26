const http = require('http');

console.log('🌐 Testing API Endpoints...\n');

// Test configuration
const baseUrl = 'http://localhost:3000';
const endpoints = [
  '/api/data',
  '/api/data?category=Style%20Principles',
  '/api/data?source=Instagram',
  '/api/data?search=fashion',
  '/api/data?limit=5',
  '/api/stats'
];

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test function
async function testEndpoints() {
  console.log('⚠️  Note: Make sure the development server is running (npm run dev)');
  console.log('   If not running, start it in another terminal and run this test again.\n');
  
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`${i + 1}️⃣ Testing: ${endpoint}`);
    
    try {
      const response = await makeRequest(url);
      
      if (response.status === 200) {
        console.log(`   ✅ Status: ${response.status}`);
        
        if (Array.isArray(response.data)) {
          console.log(`   📊 Records returned: ${response.data.length}`);
          if (response.data.length > 0) {
            const sample = response.data[0];
            console.log(`   🔍 Sample record keys: ${Object.keys(sample).join(', ')}`);
          }
        } else if (response.data.stats) {
          console.log(`   📈 Statistics: ${JSON.stringify(response.data.stats)}`);
        } else {
          console.log(`   📄 Response type: ${typeof response.data}`);
        }
      } else {
        console.log(`   ❌ Status: ${response.status}`);
        if (response.error) {
          console.log(`   ❌ Error: ${response.error}`);
        }
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`   ⚠️  Connection refused - server not running`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    
    console.log('');
  }
  
  console.log('🎯 API Test Summary:');
  console.log('   - If all tests show ✅, the API is working correctly');
  console.log('   - If you see ⚠️ Connection refused, start the dev server first');
  console.log('   - If you see ❌ errors, check the database setup');
}

// Run tests
testEndpoints().catch(console.error);

