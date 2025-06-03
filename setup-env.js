#!/usr/bin/env node

/**
 * Environment Setup Script for MTT Qurban Website
 * This script helps create the .env.local file with your Supabase credentials
 */

import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEnvironment() {
  console.log('🚀 MTT Qurban Website - Environment Setup\n');
  
  // Check if .env.local already exists
  const envPath = path.join(__dirname, '.env.local');
  const envExists = fs.existsSync(envPath);
  
  if (envExists) {
    console.log('✅ .env.local file already exists');
    const overwrite = await askQuestion('Do you want to overwrite it? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }
  
  console.log('📝 Please enter your Supabase credentials:\n');
  console.log('   You can find these in your Supabase Dashboard → Settings → API\n');
  
  const supabaseUrl = await askQuestion('Enter your Supabase URL: ');
  const supabaseAnonKey = await askQuestion('Enter your Supabase Anon Key: ');
  const serviceRoleKey = await askQuestion('Enter your Supabase Service Role Key (optional): ');
  
  // Validate inputs
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Supabase URL and Anon Key are required!');
    rl.close();
    return;
  }
  
  if (!supabaseUrl.includes('supabase.co')) {
    console.log('❌ Invalid Supabase URL format. Should be: https://your-project.supabase.co');
    rl.close();
    return;
  }
  
  // Create .env.local file
  const envContent = `# MTT Qurban Website Environment Variables
# Generated on ${new Date().toISOString()}

VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}
${serviceRoleKey ? `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}` : '# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here'}

# Note: Service Role Key is needed for admin operations like creating uploader accounts
# You can add it later if not available now
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env.local file created successfully!');
    
    console.log('\n📋 Next Steps:');
    console.log('   1. Restart your development server: npm run dev');
    console.log('   2. Setup database tables: Run SQL in Supabase Dashboard');
    console.log('   3. Create mitra accounts: node scripts/setup-uploader.js');
    console.log('   4. Test upload system: http://localhost:5173/service');
    
    console.log('\n🔗 Important Files:');
    console.log('   📄 Database Schema: database/setup-supabase-tables.sql');
    console.log('   🔑 Mitra Guide: MITRA_UPLOAD_GUIDE.md');
    console.log('   📊 Sample Data: docs/sample-data/');
    
    if (!serviceRoleKey) {
      console.log('\n⚠️  WARNING: Service Role Key not provided');
      console.log('   You will need to add it later for mitra account creation');
      console.log('   Add this line to .env.local when available:');
      console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    }
    
  } catch (error) {
    console.log('❌ Error creating .env.local file:', error.message);
  }
  
  rl.close();
}

setupEnvironment(); 