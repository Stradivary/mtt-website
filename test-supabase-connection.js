import { supabaseAdmin, testConnection } from './src/lib/supabase.js';

console.log('🔍 Testing Supabase Connection...\n');

async function testSupabaseConnection() {
  try {
    // Test environment variables
    console.log('Environment Variables:');
    console.log('- VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
    console.log('');

    // Test connection
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Connection successful!');
      
      // Test uploaders table access
      console.log('\n🔍 Testing uploaders table...');
      const { data: uploaders, error } = await supabaseAdmin
        .from('uploaders')
        .select('id, name, mitra_name')
        .limit(5);
      
      if (error) {
        console.error('❌ Uploaders query failed:', error.message);
      } else {
        console.log(`✅ Found ${uploaders?.length || 0} uploaders`);
        uploaders?.forEach(u => {
          console.log(`  - ${u.name} (${u.mitra_name})`);
        });
      }
    } else {
      console.log('❌ Connection failed!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupabaseConnection(); 