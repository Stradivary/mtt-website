import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraints() {
  try {
    console.log('🔍 Checking database constraints...\n');
    
    // Check muzakki table structure
    console.log('📋 MUZAKKI Table:');
    const { data: muzakkiData, error: muzakkiError } = await supabase
      .from('muzakki')
      .select('*')
      .limit(3);
      
    if (muzakkiError) {
      console.error('Error:', muzakkiError.message);
    } else {
      console.log(`✅ ${muzakkiData.length} records found`);
      if (muzakkiData.length > 0) {
        console.log('Sample record keys:', Object.keys(muzakkiData[0]));
      }
    }
    
    // Check distribusi table structure  
    console.log('\n📋 DISTRIBUSI Table:');
    const { data: distribusiData, error: distribusiError } = await supabase
      .from('distribusi')
      .select('*')
      .limit(3);
      
    if (distribusiError) {
      console.error('Error:', distribusiError.message);
    } else {
      console.log(`✅ ${distribusiData.length} records found`);
      if (distribusiData.length > 0) {
        console.log('Sample record keys:', Object.keys(distribusiData[0]));
      }
    }
    
    // Test duplicate insertion
    console.log('\n🧪 Testing duplicate detection...');
    
    // Get first uploader
    const { data: uploaders } = await supabase
      .from('uploaders')
      .select('*')
      .limit(1);
      
    if (uploaders && uploaders.length > 0) {
      const testRecord = {
        uploader_id: uploaders[0].id,
        nama_muzakki: 'Test Duplicate',
        telepon: '081234567890',
        jenis_hewan: 'Sapi',
        jumlah_hewan: 1,
        nilai_qurban: 1000000
      };
      
      console.log('Inserting test record...');
      const { data: insert1, error: error1 } = await supabase
        .from('muzakki')
        .insert([testRecord])
        .select();
        
      if (error1) {
        console.log('First insert error:', error1.message);
      } else {
        console.log('✅ First insert successful');
        
        // Try duplicate
        console.log('Trying duplicate insert...');
        const { data: insert2, error: error2 } = await supabase
          .from('muzakki')
          .insert([testRecord])
          .select();
          
        if (error2) {
          console.log('🔄 Duplicate properly blocked:', error2.message);
          console.log('Error code:', error2.code);
        } else {
          console.log('❌ Duplicate NOT blocked - constraint missing!');
        }
        
        // Clean up test record
        await supabase
          .from('muzakki')
          .delete()
          .eq('nama_muzakki', 'Test Duplicate');
      }
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkConstraints(); 