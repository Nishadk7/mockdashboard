# Database Setup Guide

This guide explains how to set up the Fashion Dashboard with a local SQLite database instead of CSV files.

## 🚀 Quick Setup

Run the automated setup script:

```bash
npm run setup
```

This will:
1. Install all dependencies
2. Create the SQLite database
3. Migrate CSV data to the database
4. Set up all necessary indexes

## 📋 Manual Setup

If you prefer to run each step manually:

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Database

```bash
npm run db:setup
```

### 3. Migrate Data

```bash
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

## 🗄️ Database Schema

The SQLite database contains a single `content` table with the following structure:

```sql
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
```

### Indexes

The following indexes are created for optimal performance:

- `idx_content_category` - For category filtering
- `idx_content_source` - For source filtering
- `idx_content_engagement` - For engagement score sorting
- `idx_content_trending` - For trending score sorting
- `idx_content_type` - For content type filtering
- `idx_content_difficulty` - For difficulty level filtering

## 📁 File Structure

```
fashion-dashboard/
├── data/
│   └── fashion_dashboard.db    # SQLite database file
├── lib/
│   └── database.js             # Database utility functions
├── scripts/
│   ├── setup-database.js       # Database creation script
│   ├── migrate-data.js         # CSV to SQLite migration
│   └── setup-all.js           # Complete setup script
└── app/api/
    ├── data/route.ts           # Main data API endpoint
    └── stats/route.ts          # Statistics API endpoint
```

## 🔧 API Endpoints

### GET /api/data

Fetches content data with optional filtering and search.

**Query Parameters:**
- `search` - Search query (searches category, source, content_type, difficulty_level)
- `category` - Filter by category
- `source` - Filter by source
- `contentType` - Filter by content type
- `difficultyLevel` - Filter by difficulty level
- `limit` - Limit number of results
- `offset` - Offset for pagination

**Example:**
```
GET /api/data?category=Style%20Principles&source=Instagram&limit=10
```

### GET /api/stats

Fetches dashboard statistics and metadata.

**Response:**
```json
{
  "stats": {
    "totalContent": 92,
    "avgTimeSpent": 12.45,
    "totalUpvotes": 12345,
    "totalViews": 234567
  },
  "categories": ["Assessing Fashion Needs", "Style Principles", ...],
  "sources": ["Instagram", "Tiktok", "Substack"]
}
```

## 🚨 Troubleshooting

### Database Not Found

If you get a "Database not found" error:

```bash
npm run db:setup
```

### Migration Failed

If data migration fails:

1. Ensure `enhanced_fashion_data.csv` exists in the project root
2. Check that the CSV file has the correct format
3. Run migration again:

```bash
npm run db:migrate
```

### Performance Issues

If the dashboard is slow:

1. Check that indexes are created properly
2. Consider adding more specific indexes for your queries
3. Use pagination with `limit` and `offset` parameters

## 🔄 Data Updates

To update the database with new data:

1. Replace the CSV file with new data
2. Run the migration script:

```bash
npm run db:migrate
```

The migration script will:
- Clear existing data
- Import new data from CSV
- Maintain data integrity

## 📊 Database Management

### View Database Contents

You can use any SQLite client to view the database:

```bash
# Using sqlite3 command line
sqlite3 data/fashion_dashboard.db

# Then run SQL queries
SELECT COUNT(*) FROM content;
SELECT * FROM content LIMIT 5;
```

### Backup Database

```bash
cp data/fashion_dashboard.db data/fashion_dashboard_backup.db
```

### Reset Database

```bash
rm data/fashion_dashboard.db
npm run db:setup
npm run db:migrate
```

## 🎯 Benefits of SQLite

- **Performance**: Much faster than CSV parsing
- **Querying**: SQL queries for complex filtering and searching
- **Indexing**: Optimized data retrieval
- **Scalability**: Can handle larger datasets efficiently
- **ACID Compliance**: Data integrity and consistency
- **Portability**: Single file database, easy to backup and move

## 🔮 Future Enhancements

- Real-time data updates
- Data validation and constraints
- Automated data processing
- Advanced analytics queries
- Data export functionality
- Database monitoring and logging
