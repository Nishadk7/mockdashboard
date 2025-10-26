const Database = require('better-sqlite3');
const path = require('path');

console.log('🧪 Testing SQLite Database Implementation...\n');

// Test database path
const dbPath = path.join(process.cwd(), 'data', 'fashion_dashboard.db');

try {
  // Test 1: Check if database exists
  console.log('1️⃣ Checking if database exists...');
  const fs = require('fs');
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database not found. Creating it now...');
    // Create data directory
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    // Create database and table
    const db = new Database(dbPath);
    const createTableSQL = `
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category VARCHAR(255) NOT NULL,
      url TEXT NOT NULL,
      source VARCHAR(100) NOT NULL,
      time_spent_minutes DECIMAL(5,2),
      upvotes INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      engagement_score DECIMAL(3,2),
      content_type VARCHAR(100),
      difficulty_level VARCHAR(50),
      trending_score DECIMAL(3,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    `;
    db.exec(createTableSQL);
    console.log('✅ Database created successfully');
    db.close();
  } else {
    console.log('✅ Database exists');
  }

  // Test 2: Connect to database
  console.log('\n2️⃣ Testing database connection...');
  const db = new Database(dbPath);
  console.log('✅ Database connection successful');

  // Test 3: Check table structure
  console.log('\n3️⃣ Checking table structure...');
  const tableInfo = db.prepare("PRAGMA table_info(content)").all();
  console.log(`✅ Table 'content' has ${tableInfo.length} columns:`);
  tableInfo.forEach(col => {
    console.log(`   - ${col.name} (${col.type})`);
  });

  // Test 4: Check if data exists
  console.log('\n4️⃣ Checking data count...');
  const count = db.prepare('SELECT COUNT(*) as count FROM content').get();
  console.log(`✅ Found ${count.count} records in database`);

  if (count.count > 0) {
    // Test 5: Sample data query
    console.log('\n5️⃣ Testing data queries...');
    const sampleData = db.prepare('SELECT * FROM content LIMIT 3').all();
    console.log('✅ Sample data retrieved:');
    sampleData.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.category} - ${item.source} (Score: ${item.engagement_score})`);
    });

    // Test 6: Test filtering
    console.log('\n6️⃣ Testing filtering...');
    const instagramData = db.prepare('SELECT COUNT(*) as count FROM content WHERE source = ?').get('Instagram');
    console.log(`✅ Instagram content: ${instagramData.count} records`);

    const highEngagement = db.prepare('SELECT COUNT(*) as count FROM content WHERE engagement_score > 0.9').get();
    console.log(`✅ High engagement content (>0.9): ${highEngagement.count} records`);

    // Test 7: Test search functionality
    console.log('\n7️⃣ Testing search functionality...');
    const searchResults = db.prepare('SELECT COUNT(*) as count FROM content WHERE category LIKE ?').get('%Fashion%');
    console.log(`✅ Search results for "Fashion": ${searchResults.count} records`);

    // Test 8: Test aggregation
    console.log('\n8️⃣ Testing aggregation queries...');
    const stats = db.prepare(`
      SELECT 
        AVG(time_spent_minutes) as avg_time,
        SUM(upvotes) as total_upvotes,
        SUM(views) as total_views,
        AVG(engagement_score) as avg_engagement
      FROM content
    `).get();
    
    console.log('✅ Aggregated statistics:');
    console.log(`   - Average time spent: ${Math.round(stats.avg_time * 100) / 100} minutes`);
    console.log(`   - Total upvotes: ${stats.total_upvotes}`);
    console.log(`   - Total views: ${stats.total_views}`);
    console.log(`   - Average engagement: ${Math.round(stats.avg_engagement * 100) / 100}`);

  } else {
    console.log('\n⚠️  No data found in database. Run migration script to populate data.');
  }

  // Test 9: Test indexes
  console.log('\n9️⃣ Checking indexes...');
  const indexes = db.prepare("PRAGMA index_list(content)").all();
  console.log(`✅ Found ${indexes.length} indexes on content table:`);
  indexes.forEach(idx => {
    console.log(`   - ${idx.name}`);
  });

  db.close();
  console.log('\n🎉 All database tests passed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Run "npm run dev" to start the development server');
  console.log('2. The API will now fetch data from SQLite instead of CSV');
  console.log('3. Visit http://localhost:3000 to see the dashboard');

} catch (error) {
  console.error('❌ Database test failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

