const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Create database directory if it doesn't exist
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const db = new Database(path.join(dbDir, 'fashion_dashboard.db'));

// Create the content table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_category ON content(category);
CREATE INDEX IF NOT EXISTS idx_content_source ON content(source);
CREATE INDEX IF NOT EXISTS idx_content_engagement ON content(engagement_score);
CREATE INDEX IF NOT EXISTS idx_content_trending ON content(trending_score);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content(difficulty_level);
`;

try {
  // Execute the table creation
  db.exec(createTableSQL);
  console.log('✅ Database setup completed successfully!');
  console.log('📊 Created table: content');
  console.log('🔍 Created indexes for better performance');
  console.log(`📁 Database location: ${path.join(dbDir, 'fashion_dashboard.db')}`);
} catch (error) {
  console.error('❌ Error setting up database:', error);
  process.exit(1);
} finally {
  db.close();
}
