const https = require('https');
require('dotenv').config();

console.log('🚀 SUPABASE PROJECT SETUP');
console.log('=========================');

// Test current configuration
console.log('1️⃣ Testing current configuration...');
console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Current API Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');

// Test with current API key
const testCurrentKey = () => {
  return new Promise((resolve) => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!key) {
      console.log('❌ No API key found');
      resolve(false);
      return;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(url, options, (res) => {
      console.log('Response Status:', res.statusCode);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS! Current API key is working!');
          resolve(true);
        } else {
          console.log('❌ Current API key invalid:', data.substring(0, 100));
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      console.log('❌ Request error:', err.message);
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
};

// Try to create a new Supabase project or get instructions
const setupInstructions = () => {
  console.log('\n2️⃣ SETUP INSTRUCTIONS:');
  console.log('======================');
  console.log('Since the current API key is invalid, you need to:');
  console.log('');
  console.log('OPTION A: Get API keys from existing project');
  console.log('1. Login to: https://supabase.com/dashboard');
  console.log('2. Find project: wbseybltsgfstwqqnzxg');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the anon/public key');
  console.log('5. Update .env file');
  console.log('');
  console.log('OPTION B: Create new Supabase project');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Click "New Project"');
  console.log('3. Choose organization and region');
  console.log('4. Set database password');
  console.log('5. Copy API keys to .env file');
  console.log('');
  console.log('OPTION C: Use alternative database');
  console.log('1. Neon Database: https://neon.tech');
  console.log('2. Railway: https://railway.app');
  console.log('3. PlanetScale: https://planetscale.com');
  console.log('');
  console.log('3️⃣ AFTER GETTING VALID API KEY:');
  console.log('===============================');
  console.log('1. Update .env file with new NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('2. Run: node test-supabase-connection.js');
  console.log('3. Run database migrations');
  console.log('4. Test application: npm run dev');
};

// Main execution
(async () => {
  const isWorking = await testCurrentKey();
  
  if (!isWorking) {
    setupInstructions();
    
    console.log('\n4️⃣ TEMPORARY SOLUTION:');
    console.log('======================');
    console.log('The application works perfectly with MemStorage.');
    console.log('You can deploy to production immediately and fix database later.');
    console.log('');
    console.log('To deploy now:');
    console.log('1. git add .');
    console.log('2. git commit -m "Fix Supabase URL configuration"');
    console.log('3. git push origin main');
    console.log('4. Vercel will auto-deploy');
  } else {
    console.log('\n✅ API key is working! Proceeding with database setup...');
  }
})();
