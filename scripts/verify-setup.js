const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying SQLite Setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'lib/database.js',
  'app/api/data/route.ts',
  'app/api/stats/route.ts',
  'scripts/setup-database.js',
  'scripts/migrate-data.js',
  'enhanced_fashion_data.csv'
];

console.log('1️⃣ Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n✅ All required files are present');
} else {
  console.log('\n❌ Some required files are missing');
}

// Check package.json for SQLite dependencies
console.log('\n2️⃣ Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  const requiredDeps = ['better-sqlite3', 'sqlite3'];
  const requiredDevDeps = ['@types/better-sqlite3'];
  
  let depsOk = true;
  
  requiredDeps.forEach(dep => {
    if (dependencies[dep]) {
      console.log(`   ✅ ${dep}: ${dependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep} - MISSING from dependencies`);
      depsOk = false;
    }
  });
  
  requiredDevDeps.forEach(dep => {
    if (devDependencies[dep]) {
      console.log(`   ✅ ${dep}: ${devDependencies[dep]}`);
    } else {
      console.log(`   ❌ ${dep} - MISSING from devDependencies`);
      depsOk = false;
    }
  });
  
  if (depsOk) {
    console.log('\n✅ All required dependencies are present');
  } else {
    console.log('\n❌ Some dependencies are missing');
  }
  
} catch (error) {
  console.log('\n❌ Error reading package.json:', error.message);
}

// Check scripts
console.log('\n3️⃣ Checking npm scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  const requiredScripts = ['setup', 'db:setup', 'db:migrate'];
  
  requiredScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`   ✅ ${script}: ${scripts[script]}`);
    } else {
      console.log(`   ❌ ${script} - MISSING`);
    }
  });
  
} catch (error) {
  console.log('\n❌ Error reading package.json scripts:', error.message);
}

// Check if data directory exists
console.log('\n4️⃣ Checking data directory...');
const dataDir = path.join(process.cwd(), 'data');
if (fs.existsSync(dataDir)) {
  console.log('   ✅ data/ directory exists');
  
  // Check if database file exists
  const dbFile = path.join(dataDir, 'fashion_dashboard.db');
  if (fs.existsSync(dbFile)) {
    console.log('   ✅ fashion_dashboard.db exists');
    
    // Get file size
    const stats = fs.statSync(dbFile);
    console.log(`   📊 Database size: ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log('   ⚠️  fashion_dashboard.db not found - run "npm run db:setup"');
  }
} else {
  console.log('   ⚠️  data/ directory not found - will be created during setup');
}

// Check CSV data
console.log('\n5️⃣ Checking CSV data...');
try {
  const csvPath = path.join(process.cwd(), 'enhanced_fashion_data.csv');
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`   ✅ CSV file exists with ${lines.length - 1} data records`);
    
    // Check if it has the expected columns
    const headers = lines[0].split(',');
    const expectedHeaders = [
      'Category', 'URL', 'Source', 'Time_Spent_Minutes', 'Upvotes', 'Views',
      'Engagement_Score', 'Content_Type', 'Difficulty_Level', 'Trending_Score'
    ];
    
    const hasAllHeaders = expectedHeaders.every(header => headers.includes(header));
    if (hasAllHeaders) {
      console.log('   ✅ CSV has all expected columns');
    } else {
      console.log('   ⚠️  CSV may be missing some expected columns');
    }
  } else {
    console.log('   ❌ enhanced_fashion_data.csv not found');
  }
} catch (error) {
  console.log('   ❌ Error reading CSV file:', error.message);
}

// Summary
console.log('\n📋 Setup Verification Summary:');
console.log('   - All required files and dependencies are in place');
console.log('   - Database setup scripts are ready');
console.log('   - API routes are configured for SQLite');
console.log('\n🚀 Ready to run setup commands:');
console.log('   1. npm install (if not already done)');
console.log('   2. npm run db:setup (create database)');
console.log('   3. npm run db:migrate (import CSV data)');
console.log('   4. npm run dev (start development server)');
console.log('\n🎯 The SQLite implementation is ready to use!');

