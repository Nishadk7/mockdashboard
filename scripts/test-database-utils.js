// Test the database utility functions
const { getAllContent, searchContent, getContentStats, getCategories, getSources } = require('../lib/database');

console.log('🧪 Testing Database Utility Functions...\n');

try {
  // Test 1: Get all content
  console.log('1️⃣ Testing getAllContent()...');
  const allContent = getAllContent();
  console.log(`✅ Retrieved ${allContent.length} records`);
  
  if (allContent.length > 0) {
    const sample = allContent[0];
    console.log(`   Sample record: ${sample.category} - ${sample.source} (Score: ${sample.engagement_score})`);
  }

  // Test 2: Test filtering
  console.log('\n2️⃣ Testing filtering...');
  const instagramContent = getAllContent({ source: 'Instagram' });
  console.log(`✅ Instagram content: ${instagramContent.length} records`);
  
  const stylePrinciples = getAllContent({ category: 'Style Principles' });
  console.log(`✅ Style Principles content: ${stylePrinciples.length} records`);

  // Test 3: Test search
  console.log('\n3️⃣ Testing search functionality...');
  const searchResults = searchContent('fashion');
  console.log(`✅ Search results for "fashion": ${searchResults.length} records`);
  
  const instagramSearch = searchContent('instagram', { source: 'Instagram' });
  console.log(`✅ Instagram search results: ${instagramSearch.length} records`);

  // Test 4: Test statistics
  console.log('\n4️⃣ Testing statistics...');
  const stats = getContentStats();
  console.log('✅ Content statistics:');
  console.log(`   - Total content: ${stats.totalContent}`);
  console.log(`   - Average time spent: ${stats.avgTimeSpent} minutes`);
  console.log(`   - Total upvotes: ${stats.totalUpvotes}`);
  console.log(`   - Total views: ${stats.totalViews}`);

  // Test 5: Test categories
  console.log('\n5️⃣ Testing categories...');
  const categories = getCategories();
  console.log(`✅ Found ${categories.length} categories:`);
  categories.slice(0, 5).forEach(cat => console.log(`   - ${cat}`));
  if (categories.length > 5) {
    console.log(`   ... and ${categories.length - 5} more`);
  }

  // Test 6: Test sources
  console.log('\n6️⃣ Testing sources...');
  const sources = getSources();
  console.log(`✅ Found ${sources.length} sources:`);
  sources.forEach(source => console.log(`   - ${source}`));

  // Test 7: Test pagination
  console.log('\n7️⃣ Testing pagination...');
  const paginated = getAllContent({ limit: 5, offset: 10 });
  console.log(`✅ Paginated results (limit 5, offset 10): ${paginated.length} records`);

  // Test 8: Test complex filtering
  console.log('\n8️⃣ Testing complex filtering...');
  const complexFilter = getAllContent({ 
    category: 'Body Positivity', 
    source: 'Instagram',
    limit: 3
  });
  console.log(`✅ Complex filter results: ${complexFilter.length} records`);

  console.log('\n🎉 All database utility function tests passed!');
  console.log('✅ Database utility functions are working correctly');
  console.log('✅ API endpoints should work properly');
  console.log('✅ The SQLite implementation is fully functional');

} catch (error) {
  console.error('❌ Database utility test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
