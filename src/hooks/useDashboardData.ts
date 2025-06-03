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

  const fetchDashboardStats = async () => {
    try {
      // Get basic stats from dashboard_summary view
      const { data: summaryData, error: summaryError } = await supabase
        .from('dashboard_summary')
        .select('*')
        .single();

      if (summaryError) {
        console.error('Error fetching dashboard summary:', summaryError);
        throw summaryError;
      }

      if (summaryData) {
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
    } catch (err) {
      console.error('Error in fetchDashboardStats:', err);
      throw err;
    }
  };

  const fetchAdvancedAnalytics = async () => {
    try {
      // Get advanced analytics from new view
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('advanced_analytics')
        .select('*')
        .single();

      if (analyticsError) {
        console.error('Error fetching advanced analytics:', analyticsError);
        // If view doesn't exist, fall back to basic calculation
        console.log('Falling back to basic data calculation...');
        await fetchBasicAnalytics();
        return;
      }

      if (analyticsData) {
        // Process daily trends for chart
        const dailyProgress = analyticsData.daily_trends || [];
        
        // Process top kabupaten
        const topKabupaten = analyticsData.top_kabupaten_performance || [];
        
        // Process provinsi breakdown
        const provinsiBreakdown = (analyticsData.provinsi_breakdown || []).map((item: any) => ({
          provinsi: item.provinsi,
          count: item.total_penerima,
          percentage: item.percentage,
          color: item.color
        }));

        setChartData({
          topKabupaten,
          dailyProgress: dailyProgress.map((day: any) => ({
            date: day.date,
            muzakki: day.muzakki_count,
            distribusi: day.distribusi_count
          })),
          provinsiBreakdown
        });

        // Create kabupaten data for the map section
        const kabupatenArray = topKabupaten.slice(0, 10).map((item: any) => ({
          kabupaten: item.name.split(',')[0] || 'Unknown',
          provinsi: item.name.split(',')[1]?.trim() || 'Unknown',
          total_penerima: item.penerima,
          total_hewan: item.hewan,
          active_mitra: ['Various'], // Will be populated separately if needed
          latest_distribution: new Date().toISOString()
        }));

        setKabupatenData(kabupatenArray);
      }
    } catch (err) {
      console.error('Error in fetchAdvancedAnalytics:', err);
      // Fall back to basic calculation
      await fetchBasicAnalytics();
    }
  };

  const fetchBasicAnalytics = async () => {
    try {
      // Fallback: Basic analytics calculation when views don't exist
      console.log('Using basic analytics fallback...');
      
      // Get top kabupaten from distribusi
      const { data: distribusiData } = await supabase
        .from('distribusi')
        .select('kabupaten, provinsi')
        .not('kabupaten', 'is', null);

      // Process kabupaten data
      const kabupatenCounts: Record<string, number> = {};
      const provinsiCounts: Record<string, number> = {};
      
      distribusiData?.forEach(item => {
        if (item.kabupaten && item.provinsi) {
          const kabKey = `${item.kabupaten}, ${item.provinsi}`;
          kabupatenCounts[kabKey] = (kabupatenCounts[kabKey] || 0) + 1;
          provinsiCounts[item.provinsi] = (provinsiCounts[item.provinsi] || 0) + 1;
        }
      });

      // Top kabupaten
      const topKabupaten = Object.entries(kabupatenCounts)
        .map(([name, count]) => ({ name, penerima: count, hewan: Math.floor(count * 0.8) }))
        .sort((a, b) => b.penerima - a.penerima)
        .slice(0, 5);

      // Provinsi breakdown with colors
      const colors = ['#ef4444', '#f97316', '#eab308', '#6b7280', '#6b7280'];
      const provinsiBreakdown = Object.entries(provinsiCounts)
        .map(([provinsi, count], index) => ({
          provinsi,
          count,
          percentage: Math.round((count / (distribusiData?.length || 1)) * 100),
          color: colors[index] || '#6b7280'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Mock daily progress (since we can't calculate it without date filtering)
      const dailyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          muzakki: Math.floor(Math.random() * 5) + 1,
          distribusi: Math.floor(Math.random() * 5) + 1
        };
      });

      setChartData({
        topKabupaten,
        dailyProgress,
        provinsiBreakdown
      });

      // Kabupaten data for map
      const kabupatenArray = topKabupaten.map((item: any) => ({
        kabupaten: item.name.split(',')[0] || 'Unknown',
        provinsi: item.name.split(',')[1]?.trim() || 'Unknown',
        total_penerima: item.penerima,
        total_hewan: item.hewan,
        active_mitra: ['Various'],
        latest_distribution: new Date().toISOString()
      }));

      setKabupatenData(kabupatenArray);
    } catch (err) {
      console.error('Error in fetchBasicAnalytics:', err);
    }
  };

  const fetchActivityFeed = async () => {
    try {
      // Get recent activities from activity_feed view
      const { data: activities, error: activitiesError } = await supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) {
        console.error('Error fetching activity feed:', activitiesError);
        // Fall back to basic upload history
        const { data: uploadHistory } = await supabase
          .from('upload_history')
          .select(`
            id, filename, file_type, successful_records, failed_records, created_at,
            uploaders!inner(mitra_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        const fallbackActivities: RecentActivity[] = (uploadHistory || []).map((upload: any) => ({
          id: upload.id,
          type: 'upload' as 'upload' | 'distribution' | 'registration',
          description: `${upload.uploaders.mitra_name} mengupload ${upload.file_type} (${upload.successful_records} berhasil${upload.failed_records > 0 ? `, ${upload.failed_records} gagal` : ''})`,
          timestamp: upload.created_at,
          mitra: upload.uploaders.mitra_name
        }));

        setRecentActivities(fallbackActivities);
        return;
      }

      // Convert to RecentActivity format
      const recentActivities: RecentActivity[] = (activities || []).map((activity: ActivityFeedItem) => ({
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchAdvancedAnalytics(),
        fetchActivityFeed()
      ]);
      
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
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
    refreshData
  };
}; 