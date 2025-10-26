const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Setting up Fashion Dashboard with SQLite database...\n');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed\n');
  
  // Step 2: Setup database
  console.log('🗄️  Setting up database...');
  execSync('npm run db:setup', { stdio: 'inherit' });
  console.log('✅ Database setup completed\n');
  
  // Step 3: Migrate data
  console.log('📊 Migrating CSV data to database...');
  execSync('npm run db:migrate', { stdio: 'inherit' });
  console.log('✅ Data migration completed\n');
  
  console.log('🎉 Setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Run "npm run dev" to start the development server');
  console.log('2. Open http://localhost:3000 in your browser');
  console.log('3. The dashboard will now fetch data from SQLite database');
  
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
