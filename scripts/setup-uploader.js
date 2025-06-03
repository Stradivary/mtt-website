import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local or .env file
const envPath = path.resolve(__dirname, '../.env.local');
const envBackupPath = path.resolve(__dirname, '../.env');

try {
  dotenv.config({ path: envPath });
  console.log('📄 Loaded .env.local file');
} catch (error) {
  try {
    dotenv.config({ path: envBackupPath });
    console.log('📄 Loaded .env file');
  } catch (backupError) {
    console.log('📄 Using process.env variables');
  }
}

// Support both .env and .env.local
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔧 Environment check:');
console.log('   Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('   Supabase Key:', supabaseKey ? '✅ Found' : '❌ Missing');
console.log('   Service Role Key:', serviceRoleKey ? '✅ Found' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Please check your .env or .env.local file contains:');
  console.error('   VITE_SUPABASE_URL=your-url');
  console.error('   VITE_SUPABASE_ANON_KEY=your-key');
  process.exit(1);
}

// Use service role key for admin operations, fallback to anon key
const finalKey = serviceRoleKey || supabaseKey;
const supabase = createClient(supabaseUrl, finalKey);

console.log('🔑 Using:', serviceRoleKey ? 'Service Role (Admin)' : 'Anonymous Key (Limited)');

// Define 4 new uploaders as requested
const uploaders = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@bmm.or.id',
    name: 'Admin BMM',
    mitra_name: 'BMM_MASJID',
    upload_key: 'bmm_2025_1',
    is_active: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'admin@lazismu.or.id',
    name: 'Admin LAZIS MU',
    mitra_name: 'LAZIS_MUHAMMADIYAH',
    upload_key: 'lazismu_2025_2',
    is_active: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    email: 'admin@lazisnu.or.id',
    name: 'Admin LAZIS NU',
    mitra_name: 'LAZIS_NAHDLATUL_ULAMA',
    upload_key: 'lazis_nu2025_3',
    is_active: true
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    email: 'admin@baznas.go.id',
    name: 'Admin BAZNAS',
    mitra_name: 'BAZNAS_PUSAT',
    upload_key: 'baznas_2025_4',
    is_active: true
  }
];

async function setupUploaders() {
  console.log('\n🔧 Setting up 4 new uploaders...\n');

  try {
    let createdCount = 0;
    let existingCount = 0;

    for (const uploaderData of uploaders) {
      // Check if uploader already exists
      const { data: existingUploader, error: checkError } = await supabase
        .from('uploaders')
        .select('*')
        .eq('upload_key', uploaderData.upload_key)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error(`❌ Error checking uploader ${uploaderData.upload_key}:`, checkError.message);
        continue;
      }

      if (existingUploader) {
        console.log(`✅ ${uploaderData.name} already exists (${uploaderData.upload_key})`);
        existingCount++;
        continue;
      }

      // Insert new uploader
      const { data, error } = await supabase
        .from('uploaders')
        .insert([uploaderData])
        .select();

      if (error) {
        console.error(`❌ Error creating ${uploaderData.name}:`, error.message);
        continue;
      }

      console.log(`✅ Created: ${data[0].name} (${data[0].upload_key})`);
      createdCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`   Created: ${createdCount} new uploaders`);
    console.log(`   Existing: ${existingCount} uploaders`);
    console.log(`   Total: ${createdCount + existingCount} uploaders`);

    console.log('\n🔑 Upload Keys:');
    uploaders.forEach(uploader => {
      console.log(`   ${uploader.mitra_name}: ${uploader.upload_key}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupUploaders(); 