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

async function checkData() {
  try {
    console.log('📊 Checking database data for dashboard...\n');
    
    // Check muzakki
    const { data: muzakki, error: muzakkiError } = await supabase
      .from('muzakki')
      .select('*');
    
    console.log(`📋 Muzakki records: ${muzakki?.length || 0}`);
    if (muzakkiError) {
      console.log('Muzakki error:', muzakkiError.message);
    }
    
    // Check distribusi  
    const { data: distribusi, error: distribusiError } = await supabase
      .from('distribusi')
      .select('*');
    
    console.log(`📋 Distribusi records: ${distribusi?.length || 0}`);
    if (distribusiError) {
      console.log('Distribusi error:', distribusiError.message);
    }
    
    // Check upload_history
    const { data: uploadHistory, error: uploadError } = await supabase
      .from('upload_history')
      .select('*');
    
    console.log(`📋 Upload history records: ${uploadHistory?.length || 0}`);
    if (uploadError) {
      console.log('Upload history error:', uploadError.message);
    }
    
    // Check dashboard_summary view
    const { data: summary, error: summaryError } = await supabase
      .from('dashboard_summary')
      .select('*')
      .single();
    
    console.log('\n📊 Dashboard summary:');
    if (summaryError) {
      console.log('Summary error:', summaryError.message);
    } else {
      console.log(summary);
    }
    
    // Show sample data
    if (distribusi && distribusi.length > 0) {
      console.log('\n📍 Sample distribusi locations:');
      const locations = distribusi.slice(0, 5).map(d => `${d.kabupaten}, ${d.provinsi}`);
      console.log(locations);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkData(); 