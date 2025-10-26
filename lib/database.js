const Database = require('better-sqlite3');
const path = require('path');

// Database configuration
const DB_PATH = path.join(process.cwd(), 'data', 'fashion_dashboard.db');

// Singleton database instance
let dbInstance = null;

/**
 * Get database instance (singleton pattern)
 * @returns {Database} SQLite database instance
 */
function getDatabase() {
  if (!dbInstance) {
    try {
      dbInstance = new Database(DB_PATH);
      // Enable foreign keys and optimize for performance
      dbInstance.pragma('foreign_keys = ON');
      dbInstance.pragma('journal_mode = WAL');
      dbInstance.pragma('synchronous = NORMAL');
      dbInstance.pragma('cache_size = 1000');
      dbInstance.pragma('temp_store = MEMORY');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw new Error('Database connection failed');
    }
  }
  return dbInstance;
}

/**
 * Get all content data with optional filtering
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {string} filters.source - Filter by source
 * @param {string} filters.contentType - Filter by content type
 * @param {string} filters.difficultyLevel - Filter by difficulty level
 * @param {number} filters.limit - Limit number of results
 * @param {number} filters.offset - Offset for pagination
 * @returns {Array} Array of content objects
 */
function getAllContent(filters = {}) {
  const db = getDatabase();
  
  let sql = `
    SELECT 
      id,
      category,
      url,
      source,
      time_spent_minutes,
      upvotes,
      views,
      engagement_score,
      content_type,
      difficulty_level,
      trending_score,
      created_at,
      updated_at
    FROM content
  `;
  
  const conditions = [];
  const params = [];
  
  // Apply filters
  if (filters.category && filters.category !== 'All') {
    conditions.push('category = ?');
    params.push(filters.category);
  }
  
  if (filters.source && filters.source !== 'All') {
    conditions.push('source = ?');
    params.push(filters.source);
  }
  
  if (filters.contentType) {
    conditions.push('content_type = ?');
    params.push(filters.contentType);
  }
  
  if (filters.difficultyLevel) {
    conditions.push('difficulty_level = ?');
    params.push(filters.difficultyLevel);
  }
  
  // Add WHERE clause if filters exist
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  
  // Add ordering
  sql += ' ORDER BY engagement_score DESC, trending_score DESC';
  
  // Add pagination
  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
    
    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }
  }
  
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('Error fetching content:', error);
    throw new Error('Failed to fetch content data');
  }
}

/**
 * Search content by text query
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Array} Array of matching content objects
 */
function searchContent(query, filters = {}) {
  const db = getDatabase();
  
  let sql = `
    SELECT 
      id,
      category,
      url,
      source,
      time_spent_minutes,
      upvotes,
      views,
      engagement_score,
      content_type,
      difficulty_level,
      trending_score,
      created_at,
      updated_at
    FROM content
    WHERE (
      category LIKE ? OR 
      source LIKE ? OR 
      content_type LIKE ? OR
      difficulty_level LIKE ?
    )
  `;
  
  const params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];
  
  // Apply additional filters
  if (filters.category && filters.category !== 'All') {
    sql += ' AND category = ?';
    params.push(filters.category);
  }
  
  if (filters.source && filters.source !== 'All') {
    sql += ' AND source = ?';
    params.push(filters.source);
  }
  
  sql += ' ORDER BY engagement_score DESC, trending_score DESC';
  
  try {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  } catch (error) {
    console.error('Error searching content:', error);
    throw new Error('Failed to search content');
  }
}

/**
 * Get content statistics
 * @returns {Object} Statistics object
 */
function getContentStats() {
  const db = getDatabase();
  
  try {
    const totalContent = db.prepare('SELECT COUNT(*) as count FROM content').get();
    const avgTimeSpent = db.prepare('SELECT AVG(time_spent_minutes) as avg FROM content').get();
    const totalUpvotes = db.prepare('SELECT SUM(upvotes) as total FROM content').get();
    const totalViews = db.prepare('SELECT SUM(views) as total FROM content').get();
    
    return {
      totalContent: totalContent.count,
      avgTimeSpent: Math.round(avgTimeSpent.avg * 100) / 100,
      totalUpvotes: totalUpvotes.total,
      totalViews: totalViews.total
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw new Error('Failed to fetch content statistics');
  }
}

/**
 * Get unique categories
 * @returns {Array} Array of unique categories
 */
function getCategories() {
  const db = getDatabase();
  
  try {
    const result = db.prepare('SELECT DISTINCT category FROM content ORDER BY category').all();
    return result.map(row => row.category);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

/**
 * Get unique sources
 * @returns {Array} Array of unique sources
 */
function getSources() {
  const db = getDatabase();
  
  try {
    const result = db.prepare('SELECT DISTINCT source FROM content ORDER BY source').all();
    return result.map(row => row.source);
  } catch (error) {
    console.error('Error fetching sources:', error);
    throw new Error('Failed to fetch sources');
  }
}

/**
 * Close database connection
 */
function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  getDatabase,
  getAllContent,
  searchContent,
  getContentStats,
  getCategories,
  getSources,
  closeDatabase
};
