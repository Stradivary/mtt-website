import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DashboardStats, KabupatenData, RecentActivity } from '../types/qurban';

interface DistribusiWithUploader {
  kabupaten: string | null;
  provinsi: string | null;
  created_at: string;
  uploader_id: string;
  uploaders: {
    name: string;
    mitra_name: string;
  } | null;
}

interface UploadHistoryWithUploader {
  id: string;
  filename: string;
  file_type: string;
  successful_records: number;
  duplicates?: number;
  created_at: string;
  uploaders: {
    name: string;
    mitra_name: string;
  };
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
  }>({
    topKabupaten: [],
    dailyProgress: []
  });

  const fetchDashboardStats = async () => {
    try {
      // Get summary data from dashboard_summary view
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
      }
    } catch (err) {
      console.error('Error in fetchDashboardStats:', err);
      throw err;
    }
  };

  const fetchKabupatenData = async () => {
    try {
      // Get kabupaten breakdown from distribusi table
      const { data: kabupatenStats, error: kabupatenError } = await supabase
        .from('distribusi')
        .select(`
          kabupaten,
          provinsi,
          created_at,
          uploader_id,
          uploaders!inner(name, mitra_name)
        `)
        .order('created_at', { ascending: false });

      if (kabupatenError) {
        console.error('Error fetching kabupaten data:', kabupatenError);
        throw kabupatenError;
      }

      // Process kabupaten data
      const kabupatenMap = new Map<string, {
        kabupaten: string;
        provinsi: string;
        total_penerima: number;
        total_hewan: number;
        active_mitra: Set<string>;
        latest_distribution: string;
      }>();

      (kabupatenStats as DistribusiWithUploader[])?.forEach(item => {
        const key = `${item.kabupaten}_${item.provinsi}`;
        if (!kabupatenMap.has(key)) {
          kabupatenMap.set(key, {
            kabupaten: item.kabupaten || 'Tidak Diketahui',
            provinsi: item.provinsi || 'Tidak Diketahui',
            total_penerima: 0,
            total_hewan: 0,
            active_mitra: new Set(),
            latest_distribution: item.created_at
          });
        }
        
        const existing = kabupatenMap.get(key)!;
        existing.total_penerima += 1;
        existing.active_mitra.add(item.uploaders?.mitra_name || 'Unknown');
        
        if (new Date(item.created_at) > new Date(existing.latest_distribution)) {
          existing.latest_distribution = item.created_at;
        }
      });

      // Convert to array and sort by total_penerima
      const kabupatenArray = Array.from(kabupatenMap.values())
        .map(item => ({
          ...item,
          active_mitra: Array.from(item.active_mitra)
        }))
        .sort((a, b) => b.total_penerima - a.total_penerima)
        .slice(0, 10); // Top 10 kabupaten

      setKabupatenData(kabupatenArray);
    } catch (err) {
      console.error('Error in fetchKabupatenData:', err);
      throw err;
    }
  };

  const fetchRecentActivities = async () => {
    try {
      // Get recent upload activities from upload_history
      const { data: uploadHistory, error: uploadError } = await supabase
        .from('upload_history')
        .select(`
          *,
          uploaders!inner(name, mitra_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (uploadError) {
        console.error('Error fetching upload history:', uploadError);
        throw uploadError;
      }

      // Convert upload history to activities
      const activities: RecentActivity[] = (uploadHistory as UploadHistoryWithUploader[])?.map(upload => ({
        id: upload.id,
        type: 'upload',
        description: `${upload.uploaders.mitra_name} mengupload ${upload.file_type} (${upload.successful_records} record berhasil${upload.duplicates && upload.duplicates > 0 ? `, ${upload.duplicates} duplikat` : ''})`,
        timestamp: upload.created_at,
        mitra: upload.uploaders.mitra_name
      })) || [];

      setRecentActivities(activities);
    } catch (err) {
      console.error('Error in fetchRecentActivities:', err);
      throw err;
    }
  };

  const fetchChartData = async () => {
    try {
      // Get top kabupaten data for charts
      const { data: topKabupatenData, error: chartError } = await supabase
        .from('distribusi')
        .select('kabupaten, provinsi')
        .not('kabupaten', 'is', null);

      if (chartError) {
        console.error('Error fetching chart data:', chartError);
        throw chartError;
      }

      // Process for top kabupaten chart
      const kabupatenCounts: Record<string, number> = {};
      topKabupatenData?.forEach(item => {
        const key = item.kabupaten || 'Unknown';
        kabupatenCounts[key] = (kabupatenCounts[key] || 0) + 1;
      });

      const topKabupaten = Object.entries(kabupatenCounts)
        .map(([name, count]) => ({ name, penerima: count, hewan: Math.floor(count * 0.7) }))
        .sort((a, b) => b.penerima - a.penerima)
        .slice(0, 5);

      // Generate daily progress data (mock for now)
      const today = new Date();
      const dailyProgress = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          muzakki: Math.floor(Math.random() * 50) + 20,
          distribusi: Math.floor(Math.random() * 40) + 15
        };
      });

      setChartData({
        topKabupaten,
        dailyProgress
      });
    } catch (err) {
      console.error('Error in fetchChartData:', err);
      throw err;
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchKabupatenData(),
        fetchRecentActivities(),
        fetchChartData()
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
    loading,
    error,
    refreshData
  };
}; 