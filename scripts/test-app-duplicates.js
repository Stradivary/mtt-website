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

// Simplified duplicate check function
async function saveMuzakkiWithDupCheck(records) {
  let successCount = 0;
  let duplicateCount = 0;
  const errors = [];

  for (const record of records) {
    try {
      // Check if record already exists
      const { data: existing, error: checkError } = await supabase
        .from('muzakki')
        .select('id')
        .eq('nama_muzakki', record.nama_muzakki)
        .eq('telepon', record.telepon || '')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        errors.push(checkError);
        continue;
      }

      if (existing) {
        duplicateCount++;
        console.log(`⚠️ Duplicate skipped: ${record.nama_muzakki} (${record.telepon})`);
        continue;
      }

      // Insert new record
      const { data, error } = await supabase
        .from('muzakki')
        .insert([record])
        .select();

      if (error) {
        errors.push(error);
      } else if (data && data.length > 0) {
        successCount++;
        console.log(`✅ Inserted: ${record.nama_muzakki}`);
      }
    } catch (err) {
      errors.push(err);
    }
  }

  return { success: successCount, duplicates: duplicateCount, errors };
}

async function testDuplicateDetection() {
  try {
    console.log('🧪 Testing application-level duplicate detection...\n');
    
    // Get first uploader
    const { data: uploaders } = await supabase
      .from('uploaders')
      .select('*')
      .limit(1);
      
    if (!uploaders || uploaders.length === 0) {
      console.error('❌ No uploaders found');
      return;
    }
    
    const uploader = uploaders[0];
    console.log(`Using uploader: ${uploader.name}\n`);
    
    // Test records
    const testRecords = [
      {
        uploader_id: uploader.id,
        nama_muzakki: 'Test Duplicate A',
        telepon: '081000000001',
        jenis_hewan: 'Sapi',
        jumlah_hewan: 1,
        nilai_qurban: 5000000
      },
      {
        uploader_id: uploader.id,
        nama_muzakki: 'Test Duplicate B',
        telepon: '081000000002',
        jenis_hewan: 'Kambing',
        jumlah_hewan: 1,
        nilai_qurban: 2000000
      }
    ];
    
    console.log('1️⃣ First upload (should all succeed):');
    const result1 = await saveMuzakkiWithDupCheck(testRecords);
    console.log(`   Result: ${result1.success} success, ${result1.duplicates} duplicates\n`);
    
    console.log('2️⃣ Second upload (same data - should all be duplicates):');
    const result2 = await saveMuzakkiWithDupCheck(testRecords);
    console.log(`   Result: ${result2.success} success, ${result2.duplicates} duplicates\n`);
    
    console.log('3️⃣ Mixed upload (1 duplicate + 1 new):');
    const mixedRecords = [
      testRecords[0], // duplicate
      {
        uploader_id: uploader.id,
        nama_muzakki: 'Test Duplicate C',
        telepon: '081000000003',
        jenis_hewan: 'Domba',
        jumlah_hewan: 1,
        nilai_qurban: 3000000
      } // new
    ];
    
    const result3 = await saveMuzakkiWithDupCheck(mixedRecords);
    console.log(`   Result: ${result3.success} success, ${result3.duplicates} duplicates\n`);
    
    // Clean up
    console.log('🧹 Cleaning up test data...');
    await supabase
      .from('muzakki')
      .delete()
      .like('nama_muzakki', 'Test Duplicate%');
      
    console.log('✅ Test completed and cleaned up!\n');
    
    if (result1.success === 2 && result2.duplicates === 2 && result3.success === 1 && result3.duplicates === 1) {
      console.log('🎉 Duplicate detection is working correctly!');
    } else {
      console.log('❌ Duplicate detection has issues - check results above');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDuplicateDetection(); 