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

async function addConstraints() {
  try {
    console.log('🔧 Adding unique constraints to tables...\n');
    
    // Add constraint to muzakki table
    console.log('1. Adding constraint to muzakki table...');
    const { data: constraint1, error: error1 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE muzakki 
        ADD CONSTRAINT muzakki_nama_telepon_unique 
        UNIQUE (nama_muzakki, telepon);
      `
    });
    
    if (error1) {
      console.log('⚠️ Error adding muzakki constraint:', error1.message);
      if (error1.message.includes('already exists')) {
        console.log('✅ Constraint already exists');
      }
    } else {
      console.log('✅ Muzakki constraint added successfully');
    }
    
    // Add constraint to distribusi table
    console.log('\n2. Adding constraint to distribusi table...');
    const { data: constraint2, error: error2 } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE distribusi 
        ADD CONSTRAINT distribusi_nama_alamat_unique 
        UNIQUE (nama_penerima, alamat_penerima);
      `
    });
    
    if (error2) {
      console.log('⚠️ Error adding distribusi constraint:', error2.message);
      if (error2.message.includes('already exists')) {
        console.log('✅ Constraint already exists');
      }
    } else {
      console.log('✅ Distribusi constraint added successfully');
    }
    
    // Test the constraints
    console.log('\n🧪 Testing constraints...');
    
    // Get first uploader
    const { data: uploaders } = await supabase
      .from('uploaders')
      .select('*')
      .limit(1);
      
    if (uploaders && uploaders.length > 0) {
      const testRecord = {
        uploader_id: uploaders[0].id,
        nama_muzakki: 'Test Constraint',
        telepon: '081999888777',
        jenis_hewan: 'Sapi',
        jumlah_hewan: 1,
        nilai_qurban: 1000000
      };
      
      console.log('Testing muzakki constraint...');
      
      // First insert
      const { error: error1 } = await supabase
        .from('muzakki')
        .insert([testRecord]);
        
      if (error1) {
        console.log('First insert failed:', error1.message);
      } else {
        console.log('✅ First insert successful');
        
        // Try duplicate
        const { error: error2 } = await supabase
          .from('muzakki')
          .insert([testRecord]);
          
        if (error2) {
          console.log('🔄 Duplicate properly blocked:', error2.code);
        } else {
          console.log('❌ Duplicate NOT blocked');
        }
        
        // Clean up
        await supabase
          .from('muzakki')
          .delete()
          .eq('nama_muzakki', 'Test Constraint');
      }
    }
    
    console.log('\n🎉 Constraint setup completed!');
    
  } catch (error) {
    console.error('❌ Failed to add constraints:', error);
  }
}

addConstraints(); 