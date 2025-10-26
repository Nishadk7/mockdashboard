const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Database path
const dbPath = path.join(process.cwd(), 'data', 'fashion_dashboard.db');
const csvPath = path.join(process.cwd(), 'enhanced_fashion_data.csv');

// Check if database exists
if (!fs.existsSync(dbPath)) {
  console.error('❌ Database not found. Please run "npm run db:setup" first.');
  process.exit(1);
}

// Check if CSV file exists
if (!fs.existsSync(csvPath)) {
  console.error('❌ CSV file not found. Please ensure enhanced_fashion_data.csv exists.');
  process.exit(1);
}

// Initialize database connection
const db = new Database(dbPath);

// Read and parse CSV data
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    if (values.length >= 10) {
      data.push({
        category: values[0],
        url: values[1],
        source: values[2],
        time_spent_minutes: parseFloat(values[3]) || 0,
        upvotes: parseInt(values[4]) || 0,
        views: parseInt(values[5]) || 0,
        engagement_score: parseFloat(values[6]) || 0,
        content_type: values[7],
        difficulty_level: values[8],
        trending_score: parseFloat(values[9]) || 0
      });
    }
  }
  
  return data;
}

// Insert data into database
function insertData(data) {
  const insertSQL = `
    INSERT INTO content (
      category, url, source, time_spent_minutes, upvotes, views,
      engagement_score, content_type, difficulty_level, trending_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const insert = db.prepare(insertSQL);
  const insertMany = db.transaction((data) => {
    for (const item of data) {
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
  });
  
  return insertMany(data);
}

try {
  console.log('🔄 Starting data migration...');
  
  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  console.log('📄 CSV file read successfully');
  
  // Parse CSV data
  const data = parseCSV(csvContent);
  console.log(`📊 Parsed ${data.length} records from CSV`);
  
  // Clear existing data
  db.exec('DELETE FROM content');
  console.log('🗑️  Cleared existing data');
  
  // Insert new data
  insertData(data);
  console.log('✅ Data inserted successfully');
  
  // Verify insertion
  const count = db.prepare('SELECT COUNT(*) as count FROM content').get();
  console.log(`📈 Total records in database: ${count.count}`);
  
  // Show sample data
  const sample = db.prepare('SELECT * FROM content LIMIT 3').all();
  console.log('🔍 Sample data:');
  console.table(sample);
  
  console.log('🎉 Data migration completed successfully!');
  
} catch (error) {
  console.error('❌ Error during migration:', error);
  process.exit(1);
} finally {
  db.close();
}
