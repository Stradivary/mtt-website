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

async function checkTableStructure() {
  try {
    console.log('🔍 Checking actual table structures in Supabase...\n');
    
    // Check upload_history table structure
    console.log('📊 Upload History table structure:');
    const { data: uploadHistory, error: uploadError } = await supabase
      .from('upload_history')
      .select('*')
      .limit(1);
    
    if (uploadError) {
      console.log('❌ Upload history error:', uploadError.message);
    } else if (uploadHistory && uploadHistory.length > 0) {
      console.log('✅ Upload history columns:', Object.keys(uploadHistory[0]));
      console.log('   Sample data:', uploadHistory[0]);
    } else {
      console.log('⚠️  Upload history table is empty, checking via SQL...');
    }
    
    // Check muzakki table structure
    console.log('\n📊 Muzakki table structure:');
    const { data: muzakki, error: muzakkiError } = await supabase
      .from('muzakki')
      .select('*')
      .limit(1);
    
    if (!muzakkiError && muzakki && muzakki.length > 0) {
      console.log('✅ Muzakki columns:', Object.keys(muzakki[0]));
    } else {
      console.log('⚠️  Muzakki table:', muzakkiError?.message || 'empty');
    }
    
    // Check distribusi table structure
    console.log('\n📊 Distribusi table structure:');
    const { data: distribusi, error: distribusiError } = await supabase
      .from('distribusi')
      .select('*')
      .limit(1);
    
    if (!distribusiError && distribusi && distribusi.length > 0) {
      console.log('✅ Distribusi columns:', Object.keys(distribusi[0]));
    } else {
      console.log('⚠️  Distribusi table:', distribusiError?.message || 'empty');
    }
    
    // Check uploaders table structure
    console.log('\n📊 Uploaders table structure:');
    const { data: uploaders, error: uploadersError } = await supabase
      .from('uploaders')
      .select('*')
      .limit(1);
    
    if (!uploadersError && uploaders && uploaders.length > 0) {
      console.log('✅ Uploaders columns:', Object.keys(uploaders[0]));
    } else {
      console.log('⚠️  Uploaders table:', uploadersError?.message || 'empty');
    }
    
    // Check what views currently exist
    console.log('\n📊 Checking existing views:');
    
    const { data: dashboardSummary, error: dashboardError } = await supabase
      .from('dashboard_summary')
      .select('*')
      .limit(1);
    
    if (!dashboardError) {
      console.log('✅ dashboard_summary view exists');
      if (dashboardSummary && dashboardSummary.length > 0) {
        console.log('   Columns:', Object.keys(dashboardSummary[0]));
      }
    } else {
      console.log('❌ dashboard_summary view error:', dashboardError.message);
    }
    
    const { data: analytics, error: analyticsError } = await supabase
      .from('advanced_analytics')
      .select('*')
      .limit(1);
    
    if (!analyticsError) {
      console.log('✅ advanced_analytics view exists');
    } else {
      console.log('❌ advanced_analytics view error:', analyticsError.message);
    }
    
    const { data: activities, error: activitiesError } = await supabase
      .from('activity_feed')
      .select('*')
      .limit(1);
    
    if (!activitiesError) {
      console.log('✅ activity_feed view exists');
    } else {
      console.log('❌ activity_feed view error:', activitiesError.message);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkTableStructure(); 