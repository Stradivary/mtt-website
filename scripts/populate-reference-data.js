import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const provinsiData = [
  { kode_provinsi: '35', nama_provinsi: 'Jawa Timur' }
];

const kabupatenData = [
  { kode_kabupaten: '3578', kode_provinsi: '35', nama_kabupaten: 'Kota Surabaya' },
  { kode_kabupaten: '3525', kode_provinsi: '35', nama_kabupaten: 'Kabupaten Gresik' },
  { kode_kabupaten: '3515', kode_provinsi: '35', nama_kabupaten: 'Kabupaten Sidoarjo' },
  { kode_kabupaten: '3573', kode_provinsi: '35', nama_kabupaten: 'Kota Malang' }
];

async function populateReferenceData() {
  try {
    console.log('🚀 Populating reference data...');

    // Insert province data
    console.log('📍 Inserting province data...');
    const { data: provinsiResult, error: provinsiError } = await supabase
      .from('ref_provinsi')
      .upsert(provinsiData, { onConflict: 'kode_provinsi' });

    if (provinsiError) {
      console.error('❌ Province insert error:', provinsiError);
      return;
    }
    console.log('✅ Province data inserted successfully');

    // Insert kabupaten data
    console.log('🏛️ Inserting kabupaten data...');
    const { data: kabupatenResult, error: kabupatenError } = await supabase
      .from('ref_kabupaten')
      .upsert(kabupatenData, { onConflict: 'kode_kabupaten' });

    if (kabupatenError) {
      console.error('❌ Kabupaten insert error:', kabupatenError);
      return;
    }
    console.log('✅ Kabupaten data inserted successfully');

    // Verify data
    console.log('\n🔍 Verifying inserted data...');
    const { data: verifyKabupaten } = await supabase
      .from('ref_kabupaten')
      .select('*')
      .in('kode_kabupaten', ['3578', '3525', '3515', '3573']);

    console.log('📊 Inserted kabupaten data:', verifyKabupaten);
    console.log('\n✅ Reference data population completed!');

  } catch (error) {
    console.error('❌ Error populating reference data:', error);
  }
}

populateReferenceData(); 