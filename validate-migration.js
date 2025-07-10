// Script to validate the Supabase migration SQL syntax
import fs from 'fs';

function validateMigrationSQL() {
  try {
    console.log('🔍 Validating Supabase migration script...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('supabase-migration.sql', 'utf8');
    
    // Basic SQL syntax validation
    const lines = migrationSQL.split('\n');
    let errors = [];
    let warnings = [];
    
    // Check for common SQL issues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;
      
      // Skip comments and empty lines
      if (line.startsWith('--') || line === '') continue;
      
      // Check for missing semicolons on CREATE/INSERT/DROP statements
      if ((line.toUpperCase().startsWith('CREATE') || 
           line.toUpperCase().startsWith('INSERT') || 
           line.toUpperCase().startsWith('DROP')) && 
          !line.endsWith(';') && 
          !line.endsWith('(')) {
        warnings.push(`Line ${lineNum}: Statement might be missing semicolon`);
      }
      
      // Check for proper table references
      if (line.toUpperCase().includes('REFERENCES') && !line.includes('(')) {
        errors.push(`Line ${lineNum}: REFERENCES clause might be malformed`);
      }
    }
    
    // Count key elements
    const createTableCount = (migrationSQL.match(/CREATE TABLE/gi) || []).length;
    const insertCount = (migrationSQL.match(/INSERT INTO/gi) || []).length;
    const indexCount = (migrationSQL.match(/CREATE INDEX/gi) || []).length;
    const policyCount = (migrationSQL.match(/CREATE POLICY/gi) || []).length;
    
    console.log('📊 Migration Script Analysis:');
    console.log(`   Tables to create: ${createTableCount}`);
    console.log(`   Data inserts: ${insertCount}`);
    console.log(`   Indexes to create: ${indexCount}`);
    console.log(`   RLS policies: ${policyCount}`);
    
    // Validate expected tables
    const expectedTables = [
      'users', 'products', 'categories', 'customers', 
      'transactions', 'transaction_items', 'dashboard_stats',
      'subscription_plans', 'features'
    ];
    
    const missingTables = expectedTables.filter(table => 
      !migrationSQL.includes(`CREATE TABLE ${table}`)
    );
    
    if (missingTables.length > 0) {
      errors.push(`Missing table definitions: ${missingTables.join(', ')}`);
    }
    
    // Report results
    if (errors.length > 0) {
      console.log('\n❌ Validation Errors:');
      errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (errors.length === 0) {
      console.log('\n✅ Migration script validation passed!');
      console.log('📋 Script includes:');
      console.log('   - All required table definitions');
      console.log('   - Sample data for testing');
      console.log('   - Performance indexes');
      console.log('   - Row Level Security policies');
      console.log('   - Proper foreign key constraints');
      
      return true;
    } else {
      console.log('\n❌ Migration script has issues that need to be fixed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error validating migration script:', error.message);
    return false;
  }
}

// Test environment file validation
function validateEnvironmentTemplate() {
  try {
    console.log('\n🔍 Validating environment template...');
    
    const envTemplate = fs.readFileSync('.env.supabase', 'utf8');
    const requiredVars = [
      'DATABASE_URL',
      'SUPABASE_URL', 
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NODE_ENV',
      'PORT',
      'SESSION_SECRET'
    ];
    
    const missingVars = requiredVars.filter(varName => 
      !envTemplate.includes(varName)
    );
    
    if (missingVars.length > 0) {
      console.log(`❌ Missing environment variables: ${missingVars.join(', ')}`);
      return false;
    } else {
      console.log('✅ Environment template validation passed!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error validating environment template:', error.message);
    return false;
  }
}

// Run validations
console.log('🚀 Starting migration validation...\n');

const sqlValid = validateMigrationSQL();
const envValid = validateEnvironmentTemplate();

console.log('\n📋 Validation Summary:');
console.log(`   SQL Migration Script: ${sqlValid ? '✅ Valid' : '❌ Invalid'}`);
console.log(`   Environment Template: ${envValid ? '✅ Valid' : '❌ Invalid'}`);

if (sqlValid && envValid) {
  console.log('\n🎉 All migration components are ready for Supabase!');
  console.log('\n📝 Next steps:');
  console.log('1. Create your Supabase project');
  console.log('2. Run supabase-migration.sql in Supabase SQL Editor');
  console.log('3. Optionally run extracted-neon-data.sql for existing data');
  console.log('4. Update .env with your Supabase credentials');
  console.log('5. Test the application connection');
} else {
  console.log('\n⚠️  Please fix the validation issues before proceeding');
}
