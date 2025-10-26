const http = require('http');

console.log('🔍 Testing Search and Filtering Functionality...\n');

// Test configuration
const baseUrl = 'http://localhost:3000';

// Test cases
const testCases = [
  {
    name: 'Basic data fetch',
    url: '/api/data',
    expectedMinRecords: 90
  },
  {
    name: 'Search for "fashion"',
    url: '/api/data?search=fashion',
    expectedMinRecords: 1
  },
  {
    name: 'Search for "instagram"',
    url: '/api/data?search=instagram',
    expectedMinRecords: 1
  },
  {
    name: 'Filter by Style Principles category',
    url: '/api/data?category=Style%20Principles',
    expectedMinRecords: 1
  },
  {
    name: 'Filter by Instagram source',
    url: '/api/data?source=Instagram',
    expectedMinRecords: 1
  },
  {
    name: 'Combined search and filter',
    url: '/api/data?search=fashion&category=Understanding%20Sustainable%20Fashion',
    expectedMinRecords: 1
  },
  {
    name: 'Filter by TikTok source',
    url: '/api/data?source=Tiktok',
    expectedMinRecords: 1
  },
  {
    name: 'Filter by Substack source',
    url: '/api/data?source=Substack',
    expectedMinRecords: 1
  },
  {
    name: 'Pagination test',
    url: '/api/data?limit=5',
    expectedMinRecords: 5,
    expectedMaxRecords: 5
  },
  {
    name: 'Statistics endpoint',
    url: '/api/stats',
    expectedMinRecords: 0 // This returns stats, not records
  }
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
            success: res.statusCode === 200
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            success: false,
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

// Run tests
async function runTests() {
  console.log('⚠️  Make sure the development server is running (npm run dev)');
  console.log('   If not running, start it in another terminal and run this test again.\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const url = `${baseUrl}${testCase.url}`;
    
    console.log(`${i + 1}️⃣ Testing: ${testCase.name}`);
    console.log(`   URL: ${testCase.url}`);
    
    try {
      const response = await makeRequest(url);
      
      if (response.success) {
        console.log(`   ✅ Status: ${response.status}`);
        
        if (testCase.url === '/api/stats') {
          // Special handling for stats endpoint
          if (response.data.stats && response.data.categories && response.data.sources) {
            console.log(`   📊 Stats: ${response.data.stats.totalContent} content items`);
            console.log(`   📋 Categories: ${response.data.categories.length} categories`);
            console.log(`   📱 Sources: ${response.data.sources.length} sources`);
            console.log(`   ✅ Test PASSED`);
            passedTests++;
          } else {
            console.log(`   ❌ Invalid stats response structure`);
          }
        } else {
          // Regular data endpoint
          const recordCount = Array.isArray(response.data) ? response.data.length : 0;
          console.log(`   📊 Records returned: ${recordCount}`);
          
          if (recordCount >= testCase.expectedMinRecords) {
            if (testCase.expectedMaxRecords && recordCount > testCase.expectedMaxRecords) {
              console.log(`   ❌ Too many records: expected max ${testCase.expectedMaxRecords}, got ${recordCount}`);
            } else {
              console.log(`   ✅ Test PASSED`);
              passedTests++;
              
              // Show sample data for some tests
              if (recordCount > 0 && recordCount <= 3) {
                console.log(`   🔍 Sample data:`);
                response.data.slice(0, 2).forEach((item, index) => {
                  console.log(`      ${index + 1}. ${item.Category} - ${item.Source} (Score: ${item.Engagement_Score})`);
                });
              }
            }
          } else {
            console.log(`   ❌ Not enough records: expected min ${testCase.expectedMinRecords}, got ${recordCount}`);
          }
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
  
  // Summary
  console.log('🎯 Test Summary:');
  console.log(`   ✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`   ❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Search functionality is working correctly');
    console.log('✅ Filtering functionality is working correctly');
    console.log('✅ API endpoints are responding properly');
    console.log('✅ The dashboard should now work with search and filters');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server and database setup.');
  }
}

// Run the tests
runTests().catch(console.error);
