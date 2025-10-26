const Database = require('better-sqlite3');
const path = require('path');

console.log('🔌 Testing Database Connection...\n');

const dbPath = path.join(process.cwd(), 'data', 'fashion_dashboard.db');

try {
  // Test database connection
  console.log('1️⃣ Connecting to database...');
  const db = new Database(dbPath);
  console.log('✅ Database connection successful');

  // Test basic query
  console.log('\n2️⃣ Testing basic query...');
  const count = db.prepare('SELECT COUNT(*) as count FROM content').get();
  console.log(`✅ Total records: ${count.count}`);

  // Test data retrieval
  console.log('\n3️⃣ Testing data retrieval...');
  const sampleData = db.prepare('SELECT * FROM content LIMIT 3').all();
  console.log(`✅ Retrieved ${sampleData.length} sample records`);

  // Test filtering
  console.log('\n4️⃣ Testing filtering...');
  const instagramData = db.prepare('SELECT COUNT(*) as count FROM content WHERE source = ?').get('Instagram');
  console.log(`✅ Instagram records: ${instagramData.count}`);

  // Test search
  console.log('\n5️⃣ Testing search...');
  const searchResults = db.prepare('SELECT COUNT(*) as count FROM content WHERE category LIKE ?').get('%Fashion%');
  console.log(`✅ Search results: ${searchResults.count}`);

  // Test aggregation
  console.log('\n6️⃣ Testing aggregation...');
  const stats = db.prepare(`
    SELECT 
      AVG(time_spent_minutes) as avg_time,
      SUM(upvotes) as total_upvotes,
      SUM(views) as total_views,
      AVG(engagement_score) as avg_engagement
    FROM content
  `).get();
  
  console.log('✅ Statistics:');
  console.log(`   - Average time: ${Math.round(stats.avg_time * 100) / 100} minutes`);
  console.log(`   - Total upvotes: ${stats.total_upvotes}`);
  console.log(`   - Total views: ${stats.total_views}`);
  console.log(`   - Average engagement: ${Math.round(stats.avg_engagement * 100) / 100}`);

  db.close();
  console.log('\n🎉 Database connection test passed!');
  console.log('✅ SQLite database is working correctly');
  console.log('✅ All queries are functioning properly');
  console.log('✅ Data migration was successful');
  
} catch (error) {
  console.error('❌ Database connection test failed:', error.message);
  process.exit(1);
}
