import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkReferenceData() {
  try {
    console.log('🔍 Checking reference tables and actual data...\n');

    // Check ref_provinsi
    const { data: provinces, error: provError } = await supabase
      .from('ref_provinsi')
      .select('*')
      .limit(5);
    
    if (!provError && provinces) {
      console.log('✅ Ref Provinsi sample:', provinces);
    } else {
      console.log('❌ Ref Provinsi error:', provError?.message);
    }

    // Check ref_kabupaten  
    const { data: kabupaten, error: kabError } = await supabase
      .from('ref_kabupaten')
      .select('*')
      .limit(5);
    
    if (!kabError && kabupaten) {
      console.log('✅ Ref Kabupaten sample:', kabupaten);
    } else {
      console.log('❌ Ref Kabupaten error:', kabError?.message);
    }

    // Check actual animal data
    const { data: hewan } = await supabase
      .from('muzakki')
      .select('jenis_hewan');
    
    if (hewan) {
      const hewanCounts = hewan.reduce((acc, item) => {
        acc[item.jenis_hewan] = (acc[item.jenis_hewan] || 0) + 1;
        return acc;
      }, {});
      console.log('📊 Actual Jenis Hewan breakdown:', hewanCounts);
    }

    // Check distribusi aggregation
    const { data: distribusi } = await supabase
      .from('distribusi')
      .select('provinsi, kabupaten, jenis_hewan');
    
    if (distribusi) {
      const kabCounts = distribusi.reduce((acc, item) => {
        const key = `${item.kabupaten}, ${item.provinsi}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📍 Top Kabupaten actual data:');
      Object.entries(kabCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([kab, count]) => {
          console.log(`  ${kab}: ${count} distribusi`);
        });
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkReferenceData(); 