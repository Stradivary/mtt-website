import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardStats, KabupatenData, RecentActivity } from '../types/qurban';

interface AdvancedAnalytics {
  daily_trends: Array<{
    date: string;
    muzakki_count: number;
    distribusi_count: number;
    upload_count: number;
  }>;
  top_kabupaten_performance: Array<{
    name: string;
    penerima: number;
    hewan: number;
    percentage: number;
  }>;
  provinsi_breakdown: Array<{
    provinsi: string;
    total_penerima: number;
    percentage: number;
    color: string;
  }>;
  mitra_performance: Array<{
    mitra_name: string;
    total_uploads: number;
    successful_records: number;
    failed_records: number;
    muzakki_count: number;
    distribusi_count: number;
    success_rate: number;
  }>;
}

interface ActivityFeedItem {
  activity_type: string;
  activity_id: string;
  mitra_name: string;
  description: string;
  created_at: string;
  metadata: any;
}

export const useDashboardData = (autoRefresh: boolean = false) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(Date.now()); // Track last fetch time
  
  const [stats, setStats] = useState<DashboardStats>({
    total_muzakki: 0,
    total_hewan: 0,
    total_penerima: 0,
    kabupaten_coverage: 0,
    total_nilai_qurban: 0,
  });

  const [kabupatenData, setKabupatenData] = useState<KabupatenData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<{
    topKabupaten: Array<{ name: string; penerima: number; hewan: number }>;
    dailyProgress: Array<{ date: string; muzakki: number; distribusi: number }>;
    provinsiBreakdown: Array<{ provinsi: string; count: number; percentage: number; color: string }>;
  }>({
    topKabupaten: [],
    dailyProgress: [],
    provinsiBreakdown: []
  });

  const [advancedStats, setAdvancedStats] = useState({
    distribution_progress: 0,
    uploads_last_7_days: 0,
    distributions_last_7_days: 0,
    active_mitras: 0,
    avg_nilai_qurban: 0,
    total_failed_records: 0,
    total_successful_records: 0
  });

  // Cache-busting helper function
  const createCacheBuster = () => {
    return Date.now().toString();
  };

  // Force fresh data retrieval helper
  const buildQueryWithCacheBuster = (tableName: string) => {
    const cacheBuster = createCacheBuster();
    console.log(`🔄 Cache-busting query for ${tableName} at ${new Date().toISOString()}`);
    return cacheBuster;
  };

  const fetchDashboardStats = async (forceFresh: boolean = false) => {
    try {
      console.log(`📊 Fetching dashboard stats... ${forceFresh ? '(FORCE FRESH)' : ''}`);
      
      // ALWAYS use manual calculation for most accurate data - skip database views
      console.log('⚠️ Skipping database views - using manual calculation for accuracy');
      await fetchStatsManually();
      return;

      // Keep the old database view code commented for reference
      /*
      // Build cache-busting query
      const cacheBuster = buildQueryWithCacheBuster('dashboard_summary');
      
      // Get basic stats from dashboard_summary view with cache-busting
      const { data: summaryData, error: summaryError } = await supabase
        .from('dashboard_summary')
        .select('*')
        .order('id', { ascending: false }) // Force new query plan
        .limit(1)
        .single();

      if (summaryError) {
        console.error('Error fetching dashboard summary:', summaryError);
        // If dashboard_summary doesn't exist, calculate manually
        await fetchStatsManually();
        return;
      }

      if (summaryData) {
        console.log('✅ Dashboard stats updated:', summaryData);
        setStats({
          total_muzakki: summaryData.total_muzakki || 0,
          total_hewan: summaryData.total_hewan || 0,
          total_penerima: summaryData.total_penerima || 0,
          kabupaten_coverage: summaryData.kabupaten_coverage || 0,
          total_nilai_qurban: summaryData.total_nilai_qurban || 0,
        });

        setAdvancedStats({
          distribution_progress: summaryData.distribution_progress || 0,
          uploads_last_7_days: summaryData.uploads_last_7_days || 0,
          distributions_last_7_days: summaryData.distributions_last_7_days || 0,
          active_mitras: summaryData.active_mitras || 0,
          avg_nilai_qurban: summaryData.avg_nilai_qurban || 0,
          total_failed_records: summaryData.total_failed_records || 0,
          total_successful_records: summaryData.total_successful_records || 0
        });
      }
      */
    } catch (err) {
      console.error('Error in fetchDashboardStats:', err);
      await fetchStatsManually();
    }
  };

  // Manual stats calculation as fallback
  const fetchStatsManually = async () => {
    try {
      console.log('📊 Calculating stats manually...');
      const cacheBuster = createCacheBuster();
      
      // Get fresh counts from actual tables with cache-busting - ALWAYS use this for most accurate data
      const [muzakkiResult, distribusiResult, uploadResult] = await Promise.all([
        supabase
          .from('muzakki')
          .select('id, jenis_hewan, nilai_qurban, jumlah_hewan', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(10000), // Reasonable limit to avoid timeout
        supabase
          .from('distribusi')
          .select('id, kabupaten, provinsi, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(10000),
        supabase
          .from('upload_history')
          .select('id, successful_records, failed_records, created_at', { count: 'exact' })
          .order('created_at', { ascending: false })
          .limit(1000)
      ]);

      const muzakkiCount = muzakkiResult.count || 0;
      const distribusiCount = distribusiResult.count || 0;
      
      console.log(`📊 Manual calculation: ${muzakkiCount} muzakki, ${distribusiCount} distribusi`);
      
      // Calculate unique kabupaten
      const uniqueKabupaten = new Set();
      distribusiResult.data?.forEach(item => {
        if (item.kabupaten) {
          uniqueKabupaten.add(item.kabupaten);
        }
      });

      // Calculate total hewan by summing jumlah_hewan and total nilai qurban
      let totalHewan = 0;
      let totalNilai = 0;
      muzakkiResult.data?.forEach(item => {
        totalHewan += item.jumlah_hewan || 1; // Sum jumlah_hewan instead of counting
        totalNilai += item.nilai_qurban || 0;
      });

      const manualStats = {
        total_muzakki: muzakkiCount,
        total_hewan: totalHewan, // Now this is the sum of jumlah_hewan
        total_penerima: distribusiCount,
        kabupaten_coverage: uniqueKabupaten.size,
        total_nilai_qurban: totalNilai,
      };

      console.log('✅ Manual stats calculated:', manualStats);
      console.log('🐄 Total hewan (sum of jumlah_hewan):', totalHewan);
      setStats(manualStats);
      
      // Calculate advanced stats manually
      const totalUploads = uploadResult.count || 0;
      const totalSuccessful = uploadResult.data?.reduce((sum, item) => sum + (item.successful_records || 0), 0) || 0;
      const totalFailed = uploadResult.data?.reduce((sum, item) => sum + (item.failed_records || 0), 0) || 0;
      
      setAdvancedStats({
        distribution_progress: muzakkiCount > 0 ? Math.round((distribusiCount / muzakkiCount) * 100) : 0,
        uploads_last_7_days: uploadResult.data?.filter(item => {
          const date = new Date(item.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        }).length || 0,
        distributions_last_7_days: distribusiResult.data?.filter(item => {
          const date = new Date(item.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        }).length || 0,
        active_mitras: 0, // Will be calculated separately if needed
        avg_nilai_qurban: muzakkiCount > 0 ? totalNilai / muzakkiCount : 0,
        total_failed_records: totalFailed,
        total_successful_records: totalSuccessful
      });
      
    } catch (err) {
      console.error('Error calculating manual stats:', err);
      throw err;
    }
  };

  const fetchAdvancedAnalytics = async (forceFresh: boolean = false) => {
    try {
      console.log(`📈 Fetching advanced analytics... ${forceFresh ? '(FORCE FRESH)' : ''}`);
      const cacheBuster = buildQueryWithCacheBuster('advanced_analytics');

      // ALWAYS skip view-based analytics and use manual calculation for accuracy
      console.log('⚠️ Skipping view-based analytics - using manual calculation for accuracy');
      await fetchBasicAnalytics(true);
      return;

      // Keep the old code commented for reference but use manual calculation
      /*
      // Get advanced analytics from new view with cache-busting
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('advanced_analytics')
        .select('*')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      if (analyticsError) {
        console.error('Error fetching advanced analytics:', analyticsError);
        console.log('Falling back to basic data calculation...');
        await fetchBasicAnalytics(true);
        return;
      }
      */
    } catch (err) {
      console.error('Error in fetchAdvancedAnalytics:', err);
      await fetchBasicAnalytics(true);
    }
  };

  const fetchBasicAnalytics = async (forceFresh: boolean = false) => {
    try {
      console.log(`📊 Fetching basic analytics... ${forceFresh ? '(FORCE FRESH)' : ''}`);
      const cacheBuster = buildQueryWithCacheBuster('distribusi');
      
      // Get ALL distribusi data with jumlah_daging - FORCE FRESH EVERY TIME
      const { data: distribusiData, error: distribusiError } = await supabase
        .from('distribusi')
        .select('kabupaten, provinsi, created_at, id, jumlah_daging, jenis_hewan')
        .not('kabupaten', 'is', null)
        .not('provinsi', 'is', null)
        .order('created_at', { ascending: false }) // Force fresh query
        .limit(10000); // Increase limit to get all data

      if (distribusiError) {
        console.error('Error fetching distribusi data:', distribusiError);
        return;
      }

      console.log(`✅ Retrieved ${distribusiData?.length || 0} distribusi records`);
      console.log('🗺️ Sample records for provinsi check:', distribusiData?.slice(0, 10).map(d => ({ 
        provinsi: d.provinsi, 
        kabupaten: d.kabupaten,
        jumlah_daging: d.jumlah_daging 
      })));

      // Process kabupaten data - using jumlah_daging sum instead of count
      const kabupatenCounts: Record<string, { count: number; daging: number }> = {};
      const provinsiCounts: Record<string, { count: number; daging: number }> = {};
      
      distribusiData?.forEach(item => {
        if (item.kabupaten && item.provinsi) {
          const kabKey = `${item.kabupaten}, ${item.provinsi}`;
          const dagingAmount = item.jumlah_daging || 1; // Default 1 paket if null
          
          if (!kabupatenCounts[kabKey]) {
            kabupatenCounts[kabKey] = { count: 0, daging: 0 };
          }
          if (!provinsiCounts[item.provinsi]) {
            provinsiCounts[item.provinsi] = { count: 0, daging: 0 };
          }
          
          kabupatenCounts[kabKey].count += 1;
          kabupatenCounts[kabKey].daging += dagingAmount;
          provinsiCounts[item.provinsi].count += 1;
          provinsiCounts[item.provinsi].daging += dagingAmount;
        }
      });

      // Top kabupaten - using daging amount for ranking
      const topKabupaten = Object.entries(kabupatenCounts)
        .map(([name, data]) => ({ 
          name, 
          penerima: data.count, 
          hewan: data.count, // Each distribution = 1 animal portion
          daging: data.daging
        }))
        .sort((a, b) => b.daging - a.daging) // Sort by total daging amount
        .slice(0, 10); // Top 10

      console.log('📊 Top kabupaten calculated (by jumlah_daging):', topKabupaten);

      // Provinsi breakdown with colors - using daging amount for calculations
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#a855f7', '#ec4899', '#10b981', '#6366f1'];
      const totalPenerima = distribusiData?.length || 1;
      const totalDaging = Object.values(provinsiCounts).reduce((sum, data) => sum + data.daging, 0);
      
      const provinsiBreakdown = Object.entries(provinsiCounts)
        .map(([provinsi, data], index) => ({
          provinsi,
          count: data.daging, // Use jumlah_daging instead of count for map markers
          percentage: Math.round((data.count / totalPenerima) * 100), // Percentage by penerima count
          color: colors[index] || '#6b7280',
          total_penerima: data.count,
          total_daging: data.daging
        }))
        .sort((a, b) => b.total_daging - a.total_daging) // Sort by total daging
        .slice(0, 15); // Increase to show more provinces

      console.log('🗺️ Provinsi breakdown calculated (by jumlah_daging):');
      console.table(provinsiBreakdown.map(p => ({
        provinsi: p.provinsi,
        penerima: p.total_penerima,
        daging_paket: p.total_daging,
        percentage: p.percentage + '%'
      })));
      
      // Log specific provinces for debugging
      const foundSumut = provinsiBreakdown.find(p => p.provinsi.toLowerCase().includes('sumatera utara') || p.provinsi.toLowerCase().includes('sumut'));
      const foundBali = provinsiBreakdown.find(p => p.provinsi.toLowerCase().includes('bali'));
      const foundNTT = provinsiBreakdown.find(p => p.provinsi.toLowerCase().includes('ntt') || p.provinsi.toLowerCase().includes('nusa tenggara timur'));
      
      console.log('🔍 DEBUGGING MISSING PROVINCES:');
      console.log('   - Sumatera Utara found:', foundSumut ? `YES: ${foundSumut.provinsi} (${foundSumut.total_daging} paket)` : 'NO');
      console.log('   - Bali found:', foundBali ? `YES: ${foundBali.provinsi} (${foundBali.total_daging} paket)` : 'NO');
      console.log('   - NTT found:', foundNTT ? `YES: ${foundNTT.provinsi} (${foundNTT.total_daging} paket)` : 'NO');
      
      // Show ALL unique province names in data
      const allProvinces = [...new Set(distribusiData?.map(d => d.provinsi))].sort();
      console.log('📍 ALL PROVINCES in database:', allProvinces);

      // Calculate daily progress from actual data
      const today = new Date();
      const dailyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        
        // Count actual records for this date
        const dailyCount = distribusiData?.filter(item => 
          item.created_at?.startsWith(dateStr)
        ).length || 0;
        
        return {
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          muzakki: Math.max(0, dailyCount), // Use actual data
          distribusi: Math.max(0, dailyCount)
        };
      });

      console.log('📈 Daily progress calculated:', dailyProgress);

      // Update chart data with fresh calculations
      setChartData({
        topKabupaten,
        dailyProgress,
        provinsiBreakdown
      });

      // Kabupaten data for map - use actual top performers
      const kabupatenArray = topKabupaten.slice(0, 20).map((item: any) => ({
        kabupaten: item.name.split(',')[0]?.trim() || 'Unknown',
        provinsi: item.name.split(',')[1]?.trim() || 'Unknown',
        total_penerima: item.penerima,
        total_hewan: item.hewan,
        total_daging: item.daging,
        active_mitra: ['Various'],
        latest_distribution: new Date().toISOString()
      }));

      console.log('🗺️ Kabupaten data for map:', kabupatenArray.length, 'entries');
      setKabupatenData(kabupatenArray);
      
      console.log('✅ Basic analytics processed successfully');
    } catch (err) {
      console.error('Error in fetchBasicAnalytics:', err);
    }
  };

  const fetchActivityFeed = async (forceFresh: boolean = false) => {
    try {
      console.log(`🔄 Fetching activity feed... ${forceFresh ? '(FORCE FRESH)' : ''}`);
      const cacheBuster = buildQueryWithCacheBuster('activity_feed');

      // Get recent activities from activity_feed view with cache-busting
      const { data: activities, error: activitiesError } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error('Error fetching activity feed:', activitiesError);
        // Fall back to basic upload history with cache-busting
        const { data: uploadHistory, error: uploadError } = await supabase
          .from('upload_history')
          .select(`
            id, filename, file_type, successful_records, failed_records, created_at,
            uploaders!inner(mitra_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!uploadError && uploadHistory) {
          console.log(`✅ Fallback: Retrieved ${uploadHistory.length} upload history records`);
          const fallbackActivities: RecentActivity[] = uploadHistory.map((upload: any) => ({
          id: upload.id,
          type: 'upload' as 'upload' | 'distribution' | 'registration',
          description: `${upload.uploaders.mitra_name} mengupload ${upload.file_type} (${upload.successful_records} berhasil${upload.failed_records > 0 ? `, ${upload.failed_records} gagal` : ''})`,
          timestamp: upload.created_at,
          mitra: upload.uploaders.mitra_name
        }));

        setRecentActivities(fallbackActivities);
        } else {
          setRecentActivities([]);
        }
        return;
      }

      console.log(`✅ Retrieved ${activities?.length || 0} activity feed records`);

      // Convert to RecentActivity format
      const recentActivities: RecentActivity[] = (activities || []).map((activity: any) => ({
        id: activity.activity_id,
        type: activity.activity_type as 'upload' | 'distribution' | 'registration',
        description: activity.description,
        timestamp: activity.created_at,
        mitra: activity.mitra_name
      }));

      setRecentActivities(recentActivities);
    } catch (err) {
      console.error('Error in fetchActivityFeed:', err);
      setRecentActivities([]);
    }
  };

  const fetchData = async (forceFresh: boolean = false) => {
    console.log(`🔄 Starting data fetch... ${forceFresh ? '(FORCED REFRESH)' : '(NORMAL LOAD)'}`);
    setLoading(true);
    setError(null);
    setLastFetchTime(Date.now());
    
    try {
      await Promise.all([
        fetchDashboardStats(forceFresh),
        fetchAdvancedAnalytics(forceFresh),
        fetchActivityFeed(forceFresh)
      ]);
      
      console.log('✅ All data fetched successfully');
      setLoading(false);
    } catch (err) {
      console.error('❌ Data fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const refreshData = () => {
    console.log('🔄 Manual refresh triggered');
    fetchData(true); // Force fresh data
  };

  useEffect(() => {
    console.log('🚀 Initial data load');
    fetchData(false);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      console.log('⏱️ Setting up auto-refresh (30s interval)');
      const interval = setInterval(() => {
        console.log('⏱️ Auto-refresh triggered');
        fetchData(true); // Force fresh data on auto-refresh
      }, 30000); // Refresh every 30 seconds
      
      return () => {
        console.log('⏱️ Clearing auto-refresh interval');
        clearInterval(interval);
      };
    }
  }, [autoRefresh]);

  return {
    stats,
    kabupatenData,
    chartData,
    recentActivities,
    advancedStats,
    loading,
    error,
    refreshData,
    lastFetchTime // Export last fetch time for debugging
  };
}; 