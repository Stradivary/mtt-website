import { createClient } from '@supabase/supabase-js';
import { saveMuzakkiData, saveDistribusiData } from '../src/lib/supabase.js';
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

async function testDuplicates() {
  try {
    console.log('🧪 Testing duplicate detection...\n');
    
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
    console.log(`Using uploader: ${uploader.name}`);
    
    // Test records
    const testMuzakki = [
      {
        uploader_id: uploader.id,
        nama_muzakki: 'Test Duplikat 1',
        telepon: '081111111111',
        jenis_hewan: 'Sapi',
        jumlah_hewan: 1,
        nilai_qurban: 5000000
      },
      {
        uploader_id: uploader.id,
        nama_muzakki: 'Test Duplikat 2',
        telepon: '081222222222',
        jenis_hewan: 'Kambing',
        jumlah_hewan: 2,
        nilai_qurban: 3000000
      }
    ];
    
    console.log('\n1️⃣ First upload (should succeed)...');
    const result1 = await saveMuzakkiData(testMuzakki);
    console.log(`Result: ${result1.success} success, ${result1.duplicates} duplicates, ${result1.errors.length} errors`);
    
    console.log('\n2️⃣ Second upload (same data - should detect duplicates)...');
    const result2 = await saveMuzakkiData(testMuzakki);
    console.log(`Result: ${result2.success} success, ${result2.duplicates} duplicates, ${result2.errors.length} errors`);
    
    console.log('\n3️⃣ Mixed upload (1 new, 1 duplicate)...');
    const mixedMuzakki = [
      testMuzakki[0], // duplicate
      {
        uploader_id: uploader.id,
        nama_muzakki: 'Test Duplikat 3',
        telepon: '081333333333',
        jenis_hewan: 'Domba',
        jumlah_hewan: 1,
        nilai_qurban: 2500000
      } // new
    ];
    
    const result3 = await saveMuzakkiData(mixedMuzakki);
    console.log(`Result: ${result3.success} success, ${result3.duplicates} duplicates, ${result3.errors.length} errors`);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('muzakki')
      .delete()
      .like('nama_muzakki', 'Test Duplikat%');
      
    console.log('✅ Test completed and cleaned up!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDuplicates(); 