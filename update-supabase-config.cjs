const fs = require('fs');
const path = require('path');

console.log('🔧 UPDATING SUPABASE CONFIGURATION');
console.log('==================================');

// Read current .env file
const envPath = '.env';
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Current .env file found');
} catch (error) {
  console.log('❌ .env file not found, creating new one');
}

// Fix the SUPABASE_URL
const correctSupabaseUrl = 'https://wbseybltsgfstwqqnzxg.supabase.co';

// Update or add the correct SUPABASE_URL
if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
  // Replace existing URL
  envContent = envContent.replace(
    /NEXT_PUBLIC_SUPABASE_URL=.*/g,
    `NEXT_PUBLIC_SUPABASE_URL=${correctSupabaseUrl}`
  );
  console.log('✅ Updated existing NEXT_PUBLIC_SUPABASE_URL');
} else {
  // Add new URL
  envContent += `\nNEXT_PUBLIC_SUPABASE_URL=${correctSupabaseUrl}\n`;
  console.log('✅ Added NEXT_PUBLIC_SUPABASE_URL');
}

// Write back to .env file
try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated successfully');
} catch (error) {
  console.log('❌ Failed to write .env file:', error.message);
}

console.log('\n📋 NEXT STEPS:');
console.log('==============');
console.log('1. Get valid API keys from Supabase Dashboard');
console.log('2. Login to: https://supabase.com/dashboard');
console.log('3. Select project: wbseybltsgfstwqqnzxg');
console.log('4. Go to Settings > API');
console.log('5. Copy ANON_KEY and update .env file');
console.log('6. Test connection: node test-supabase-connection.js');

console.log('\n🔍 CURRENT CONFIGURATION:');
console.log('=========================');
console.log('NEXT_PUBLIC_SUPABASE_URL=' + correctSupabaseUrl);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEEDS_UPDATE_FROM_DASHBOARD]');
