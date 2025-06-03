import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkNilaiQurban() {
  try {
    const { data: muzakki } = await supabase.from('muzakki').select('nilai_qurban');
    
    console.log('📊 Checking Nilai Qurban Data...');
    console.log(`Total muzakki records: ${muzakki?.length || 0}`);
    
    if (muzakki && muzakki.length > 0) {
      const total = muzakki.reduce((sum, item) => sum + (item.nilai_qurban || 0), 0);
      console.log(`Total Nilai Qurban: Rp ${total.toLocaleString('id-ID')}`);
      console.log(`Total in Billions: Rp ${(total / 1000000000).toFixed(1)}B`);
      
      console.log('\nSample values:');
      muzakki.slice(0, 5).forEach((item, i) => {
        console.log(`${i+1}. Rp ${item.nilai_qurban?.toLocaleString('id-ID') || '0'}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkNilaiQurban(); 