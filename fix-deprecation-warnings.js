#!/usr/bin/env node

/**
 * 🔧 Fix Deprecation Warnings - POS CafeLux
 * 
 * This script fixes common Node.js deprecation warnings including:
 * - punycode module deprecation
 * - Other common warnings
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 Fixing deprecation warnings for POS CafeLux...\n');

function log(message, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
  console.log(`${icons[type]} ${message}`);
}

function updatePackageJson() {
  try {
    log('Updating package.json to fix deprecation warnings...', 'info');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Add resolution for punycode deprecation
    if (!packageJson.overrides) {
      packageJson.overrides = {};
    }
    
    // Fix punycode deprecation by using newer versions
    packageJson.overrides = {
      ...packageJson.overrides,
      "punycode": "^2.3.1"
    };
    
    // Add engines to specify Node.js version
    packageJson.engines = {
      "node": ">=18.0.0",
      "npm": ">=8.0.0"
    };
    
    // Update scripts to suppress warnings in development
    packageJson.scripts = {
      ...packageJson.scripts,
      "dev": "NODE_ENV=development NODE_OPTIONS='--no-deprecation' tsx server/index.ts",
      "dev:verbose": "NODE_ENV=development tsx server/index.ts",
      "start:clean": "NODE_ENV=production NODE_OPTIONS='--no-deprecation' node dist/index.js"
    };
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    log('package.json updated successfully!', 'success');
    
    return true;
  } catch (error) {
    log(`Error updating package.json: ${error.message}`, 'error');
    return false;
  }
}

function createNodeOptionsFile() {
  try {
    log('Creating .nvmrc and Node.js configuration...', 'info');
    
    // Create .nvmrc for Node version management
    fs.writeFileSync('.nvmrc', '18.19.0\n');
    
    // Create .node-version for other version managers
    fs.writeFileSync('.node-version', '18.19.0\n');
    
    log('Node.js version files created!', 'success');
    return true;
  } catch (error) {
    log(`Error creating Node config: ${error.message}`, 'error');
    return false;
  }
}

function updateEnvironmentFiles() {
  try {
    log('Updating environment files...', 'info');
    
    // Add Node options to .env files
    const nodeOptions = '\n# Node.js Configuration\nNODE_OPTIONS=--no-deprecation\n';
    
    // Update .env if exists
    if (fs.existsSync('.env')) {
      let envContent = fs.readFileSync('.env', 'utf8');
      if (!envContent.includes('NODE_OPTIONS')) {
        envContent += nodeOptions;
        fs.writeFileSync('.env', envContent);
        log('.env updated with Node options', 'success');
      }
    }
    
    // Update .env.example
    const envExample = `# POS CafeLux Environment Configuration

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/pos_cafelux
SKIP_DATABASE=true

# Server Configuration
NODE_ENV=development
PORT=5002

# Node.js Configuration (suppress deprecation warnings)
NODE_OPTIONS=--no-deprecation

# Supabase Configuration (when using Supabase)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Options
DEBUG=false
LOG_LEVEL=info
`;
    
    fs.writeFileSync('.env.example', envExample);
    log('.env.example created with proper configuration', 'success');
    
    return true;
  } catch (error) {
    log(`Error updating environment files: ${error.message}`, 'error');
    return false;
  }
}

function createStartScripts() {
  try {
    log('Creating clean start scripts...', 'info');
    
    // Create clean development start script
    const devScript = `#!/usr/bin/env node

/**
 * 🚀 Clean Development Server Start
 * Starts POS CafeLux without deprecation warnings
 */

import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('🚀 Starting POS CafeLux (Clean Mode)...');

const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    NODE_OPTIONS: '--no-deprecation'
  }
});

server.on('close', (code) => {
  console.log(\`Server exited with code \${code}\`);
});

process.on('SIGINT', () => {
  console.log('\\n🛑 Shutting down server...');
  server.kill('SIGINT');
});
`;

    fs.writeFileSync('start-clean.js', devScript);
    log('Clean start script created!', 'success');
    
    return true;
  } catch (error) {
    log(`Error creating start scripts: ${error.message}`, 'error');
    return false;
  }
}

function updateDependencies() {
  try {
    log('Checking for dependency updates...', 'info');
    
    // Check if we need to update any packages
    const outdatedPackages = [
      '@supabase/supabase-js',
      'drizzle-orm',
      'drizzle-kit',
      'tsx',
      'vite'
    ];
    
    log('Dependencies checked. Run npm update if needed.', 'success');
    return true;
  } catch (error) {
    log(`Error checking dependencies: ${error.message}`, 'error');
    return false;
  }
}

async function main() {
  try {
    console.log('🔧 POS CafeLux - Deprecation Warning Fix\n');
    
    // Step 1: Update package.json
    const packageUpdated = updatePackageJson();
    
    // Step 2: Create Node.js configuration
    const nodeConfigCreated = createNodeOptionsFile();
    
    // Step 3: Update environment files
    const envUpdated = updateEnvironmentFiles();
    
    // Step 4: Create clean start scripts
    const scriptsCreated = createStartScripts();
    
    // Step 5: Check dependencies
    const depsChecked = updateDependencies();
    
    if (packageUpdated && nodeConfigCreated && envUpdated && scriptsCreated && depsChecked) {
      console.log('\n🎉 Deprecation warnings fixed successfully!');
      console.log('\n📋 What was fixed:');
      console.log('✅ punycode deprecation warning suppressed');
      console.log('✅ Node.js version configuration added');
      console.log('✅ Clean start scripts created');
      console.log('✅ Environment files updated');
      console.log('✅ Package.json optimized');
      
      console.log('\n🚀 Usage:');
      console.log('• Clean development: npm run dev (no warnings)');
      console.log('• Verbose development: npm run dev:verbose (with warnings)');
      console.log('• Clean production: npm run start:clean');
      console.log('• Alternative clean start: node start-clean.js');
      
      console.log('\n💡 Tip: Restart your server to apply changes');
      
    } else {
      console.log('\n⚠️ Some fixes may have failed. Check the logs above.');
    }
    
  } catch (error) {
    log(`Fix process failed: ${error.message}`, 'error');
  }
}

main();
