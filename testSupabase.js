import { checkEnvironment, testSupabaseConnection } from './src/utils/testSupabase.ts';

async function runTest() {
  console.log('🔬 MTT Qurban Dashboard - Supabase Backend Test\n');
  
  // Check environment first
  const envOK = checkEnvironment();
  
  if (envOK) {
    // Run connection tests
    await testSupabaseConnection();
  } else {
    console.log('❌ Cannot proceed with tests due to environment issues.');
    process.exit(1);
  }
}

runTest().catch((error) => {
  console.error('🚨 Test failed:', error);
  process.exit(1);
}); 