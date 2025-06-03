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

async function testEnhancedAnalytics() {
  try {
    console.log('🔬 Testing Enhanced Analytics Views...\n');
    
    // Test dashboard_summary
    console.log('📊 Dashboard Summary:');
    const { data: summary, error: summaryError } = await supabase
      .from('dashboard_summary')
      .select('*')
      .single();
    
    if (summaryError) {
      console.log('❌ Summary error:', summaryError.message);
    } else {
      console.log('✅ Summary data:', {
        total_muzakki: summary.total_muzakki,
        total_penerima: summary.total_penerima,
        total_hewan: summary.total_hewan,
        kabupaten_coverage: summary.kabupaten_coverage,
        distribution_progress: summary.distribution_progress,
        uploads_last_7_days: summary.uploads_last_7_days,
        active_mitras: summary.active_mitras
      });
    }
    
    console.log('\n📈 Advanced Analytics:');
    const { data: analytics, error: analyticsError } = await supabase
      .from('advanced_analytics')
      .select('*')
      .single();
    
    if (analyticsError) {
      console.log('❌ Analytics error:', analyticsError.message);
    } else {
      console.log('✅ Daily trends sample:', analytics.daily_trends?.slice(0, 3));
      console.log('✅ Top kabupaten sample:', analytics.top_kabupaten_performance?.slice(0, 3));
      console.log('✅ Provinsi breakdown sample:', analytics.provinsi_breakdown?.slice(0, 3));
    }
    
    console.log('\n⚡ Activity Feed:');
    const { data: activities, error: activitiesError } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (activitiesError) {
      console.log('❌ Activities error:', activitiesError.message);
    } else {
      console.log('✅ Recent activities count:', activities?.length || 0);
      activities?.forEach((activity, index) => {
        console.log(`  ${index + 1}. ${activity.activity_type}: ${activity.description.substring(0, 60)}...`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEnhancedAnalytics(); 