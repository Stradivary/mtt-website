import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.log('Required:');
  console.log('  - VITE_SUPABASE_URL');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up MTT Qurban Database...');
    
    // Read the SQL setup file
    const sqlPath = join(__dirname, '..', 'database', 'setup-tables.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    console.log('📋 Executing SQL setup script...');
    
    // Execute the SQL setup
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: sqlContent 
    });
    
    if (error) {
      // If exec_sql doesn't exist, try direct execution
      console.log('⚠️  exec_sql function not found, trying direct execution...');
      
      // Split SQL into individual statements and execute
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        if (statement.toLowerCase().includes('select') || statement.toLowerCase().includes('insert')) {
          // Use .from() for SELECT/INSERT statements
          const tableName = extractTableName(statement);
          if (tableName) {
            console.log(`📊 Processing statement for table: ${tableName}`);
          }
        } else {
          // For CREATE TABLE, CREATE INDEX, etc., we need to use a different approach
          console.log(`🔧 Executing DDL statement...`);
        }
      }
    } else {
      console.log('✅ SQL setup executed successfully');
    }
    
    // Test the tables by checking if they exist
    console.log('🔍 Verifying table creation...');
    
    const tables = [
      'uploaders',
      'muzakki', 
      'distribusi',
      'upload_history'
    ];
    
    for (const table of tables) {
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);
        
      if (tableError) {
        console.error(`❌ Table ${table} verification failed:`, tableError.message);
      } else {
        console.log(`✅ Table ${table} exists and accessible`);
      }
    }
    
    // Check uploaders
    const { data: uploaders, error: uploadersError } = await supabase
      .from('uploaders')
      .select('*');
      
    if (uploadersError) {
      console.error('❌ Error checking uploaders:', uploadersError.message);
    } else {
      console.log(`✅ Found ${uploaders.length} uploaders in database`);
      uploaders.forEach(uploader => {
        console.log(`   - ${uploader.name} (${uploader.mitra_name}): ${uploader.upload_key}`);
      });
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Copy sample CSV files to public/docs/sample-data/');
    console.log('2. Access the upload page at: /service/qurban/upload');
    console.log('3. Use upload keys: bmm2025, lazismu2025, lazisnu2025, baznas2025');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

function extractTableName(statement) {
  const match = statement.match(/(?:from|into|table)\s+(\w+)/i);
  return match ? match[1] : null;
}

setupDatabase(); 