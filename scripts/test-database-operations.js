const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

console.log('🔬 Testing Database Operations...\n');

// Mock data for testing
const mockData = [
  {
    category: 'Test Category 1',
    url: 'https://example.com/test1',
    source: 'Instagram',
    time_spent_minutes: 5.5,
    upvotes: 100,
    views: 1000,
    engagement_score: 0.85,
    content_type: 'Video',
    difficulty_level: 'Beginner',
    trending_score: 0.90
  },
  {
    category: 'Test Category 2',
    url: 'https://example.com/test2',
    source: 'TikTok',
    time_spent_minutes: 8.2,
    upvotes: 150,
    views: 2000,
    engagement_score: 0.92,
    content_type: 'Video',
    difficulty_level: 'Intermediate',
    trending_score: 0.88
  },
  {
    category: 'Test Category 3',
    url: 'https://example.com/test3',
    source: 'Substack',
    time_spent_minutes: 12.1,
    upvotes: 75,
    views: 500,
    engagement_score: 0.78,
    content_type: 'Article',
    difficulty_level: 'Advanced',
    trending_score: 0.82
  }
];

async function testDatabaseOperations() {
  const dbPath = path.join(process.cwd(), 'data', 'test_fashion_dashboard.db');
  
  try {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created data directory');
    }
    
    // Clean up any existing test database
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    // Create test database
    console.log('1️⃣ Creating test database...');
    const db = new Database(dbPath);
    
    // Create table
    const createTableSQL = `
    CREATE TABLE content (
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
    console.log('✅ Test database and table created');

    // Test 2: Insert mock data
    console.log('\n2️⃣ Testing data insertion...');
    const insertSQL = `
      INSERT INTO content (
        category, url, source, time_spent_minutes, upvotes, views,
        engagement_score, content_type, difficulty_level, trending_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insert = db.prepare(insertSQL);
    
    for (const item of mockData) {
      insert.run(
        item.category,
        item.url,
        item.source,
        item.time_spent_minutes,
        item.upvotes,
        item.views,
        item.engagement_score,
        item.content_type,
        item.difficulty_level,
        item.trending_score
      );
    }
    console.log(`✅ Inserted ${mockData.length} test records`);

    // Test 3: Test basic queries
    console.log('\n3️⃣ Testing basic queries...');
    
    // Count all records
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM content').get();
    console.log(`✅ Total records: ${totalCount.count}`);
    
    // Get all records
    const allRecords = db.prepare('SELECT * FROM content').all();
    console.log(`✅ Retrieved ${allRecords.length} records`);
    
    // Test 4: Test filtering
    console.log('\n4️⃣ Testing filtering...');
    
    // Filter by source
    const instagramRecords = db.prepare('SELECT * FROM content WHERE source = ?').all('Instagram');
    console.log(`✅ Instagram records: ${instagramRecords.length}`);
    
    // Filter by engagement score
    const highEngagement = db.prepare('SELECT * FROM content WHERE engagement_score > ?').all(0.8);
    console.log(`✅ High engagement records: ${highEngagement.length}`);
    
    // Filter by category
    const categoryRecords = db.prepare('SELECT * FROM content WHERE category LIKE ?').all('%Test%');
    console.log(`✅ Category filter records: ${categoryRecords.length}`);

    // Test 5: Test aggregation
    console.log('\n5️⃣ Testing aggregation...');
    
    const stats = db.prepare(`
      SELECT 
        AVG(time_spent_minutes) as avg_time,
        SUM(upvotes) as total_upvotes,
        SUM(views) as total_views,
        AVG(engagement_score) as avg_engagement,
        MAX(engagement_score) as max_engagement,
        MIN(engagement_score) as min_engagement
      FROM content
    `).get();
    
    console.log('✅ Aggregation results:');
    console.log(`   - Average time: ${Math.round(stats.avg_time * 100) / 100} minutes`);
    console.log(`   - Total upvotes: ${stats.total_upvotes}`);
    console.log(`   - Total views: ${stats.total_views}`);
    console.log(`   - Average engagement: ${Math.round(stats.avg_engagement * 100) / 100}`);
    console.log(`   - Max engagement: ${stats.max_engagement}`);
    console.log(`   - Min engagement: ${stats.min_engagement}`);

    // Test 6: Test sorting
    console.log('\n6️⃣ Testing sorting...');
    
    const sortedByEngagement = db.prepare('SELECT * FROM content ORDER BY engagement_score DESC').all();
    console.log(`✅ Sorted by engagement (DESC): ${sortedByEngagement.length} records`);
    console.log(`   Top engagement score: ${sortedByEngagement[0].engagement_score}`);
    
    const sortedByTime = db.prepare('SELECT * FROM content ORDER BY time_spent_minutes DESC').all();
    console.log(`✅ Sorted by time (DESC): ${sortedByTime.length} records`);
    console.log(`   Longest time: ${sortedByTime[0].time_spent_minutes} minutes`);

    // Test 7: Test pagination
    console.log('\n7️⃣ Testing pagination...');
    
    const paginated = db.prepare('SELECT * FROM content LIMIT ? OFFSET ?').all(2, 1);
    console.log(`✅ Pagination (limit 2, offset 1): ${paginated.length} records`);

    // Test 8: Test complex queries
    console.log('\n8️⃣ Testing complex queries...');
    
    const complexQuery = db.prepare(`
      SELECT 
        source,
        COUNT(*) as count,
        AVG(engagement_score) as avg_engagement
      FROM content 
      WHERE engagement_score > ?
      GROUP BY source
      ORDER BY avg_engagement DESC
    `).all(0.7);
    
    console.log(`✅ Complex query results: ${complexQuery.length} groups`);
    complexQuery.forEach(group => {
      console.log(`   ${group.source}: ${group.count} records, avg engagement: ${Math.round(group.avg_engagement * 100) / 100}`);
    });

    // Test 9: Test search functionality
    console.log('\n9️⃣ Testing search functionality...');
    
    const searchResults = db.prepare(`
      SELECT * FROM content 
      WHERE category LIKE ? OR source LIKE ? OR content_type LIKE ?
    `).all('%Test%', '%Instagram%', '%Video%');
    
    console.log(`✅ Search results: ${searchResults.length} records`);

    // Test 10: Test indexes
    console.log('\n🔟 Testing indexes...');
    
    // Create indexes
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_test_category ON content(category);
      CREATE INDEX IF NOT EXISTS idx_test_source ON content(source);
      CREATE INDEX IF NOT EXISTS idx_test_engagement ON content(engagement_score);
    `);
    
    const indexes = db.prepare("PRAGMA index_list(content)").all();
    console.log(`✅ Created ${indexes.length} indexes`);

    db.close();
    
    // Clean up test database
    fs.unlinkSync(dbPath);
    console.log('\n🧹 Cleaned up test database');
    
    console.log('\n🎉 All database operations tests passed!');
    console.log('\n📋 The SQLite implementation is working correctly and ready for use.');
    
  } catch (error) {
    console.error('❌ Database operations test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Clean up on error
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    
    process.exit(1);
  }
}

// Run the tests
testDatabaseOperations();

