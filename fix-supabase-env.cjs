require('dotenv').config();
const fs = require('fs');

console.log('🔧 FIXING SUPABASE ENVIRONMENT VARIABLES');
console.log('=====================================');

// Current environment variables
console.log('\n1️⃣ Current Environment Variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'Missing');
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');

// Identify the issue
console.log('\n2️⃣ Issue Analysis:');
const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (currentUrl && currentUrl.includes('pooler.supabase.com')) {
  console.log('❌ ISSUE: Using pooler URL as SUPABASE_URL');
  console.log('Current:', currentUrl);
  console.log('Should be: https://wbseybltsgfstwqqnzxg.supabase.co');
} else if (currentUrl && !currentUrl.startsWith('https://')) {
  console.log('❌ ISSUE: Missing https:// protocol');
  console.log('Current:', currentUrl);
} else {
  console.log('✅ URL format looks correct');
}

// Provide the correct configuration
console.log('\n3️⃣ CORRECT CONFIGURATION NEEDED:');
console.log('=====================================');
console.log('# Supabase Configuration');
console.log('NEXT_PUBLIC_SUPABASE_URL=https://wbseybltsgfstwqqnzxg.supabase.co');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=[GET_FROM_SUPABASE_DASHBOARD]');
console.log('SUPABASE_SERVICE_ROLE_KEY=[GET_FROM_SUPABASE_DASHBOARD]');
console.log('');
console.log('# Database Connection (keep existing)');
console.log('DATABASE_URL=' + (process.env.DATABASE_URL || '[KEEP_EXISTING]'));

console.log('\n4️⃣ NEXT STEPS:');
console.log('=====================================');
console.log('1. Login to Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select project: wbseybltsgfstwqqnzxg');
console.log('3. Go to Settings > API');
console.log('4. Copy the ANON_KEY and SERVICE_ROLE_KEY');
console.log('5. Update your .env file with correct values');
console.log('6. Run: node test-supabase-connection.js');

console.log('\n5️⃣ TESTING CURRENT PROJECT:');
console.log('=====================================');

// Test if project is accessible
const https = require('https');
const testUrl = 'https://wbseybltsgfstwqqnzxg.supabase.co/rest/v1/';

console.log('Testing project accessibility...');
const req = https.request(testUrl, { method: 'GET' }, (res) => {
  console.log('Project Status:', res.statusCode);
  if (res.statusCode === 401) {
    console.log('✅ Project is ACTIVE - needs valid API key');
    console.log('✅ URL is correct: https://wbseybltsgfstwqqnzxg.supabase.co');
  } else if (res.statusCode === 404) {
    console.log('❌ Project not found or deleted');
  } else {
    console.log('Response code:', res.statusCode);
  }
});

req.on('error', (err) => {
  console.log('❌ Network error:', err.message);
});

req.setTimeout(5000, () => {
  console.log('❌ Timeout - check internet connection');
  req.destroy();
});

req.end();
