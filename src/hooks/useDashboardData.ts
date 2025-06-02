import { useState, useEffect } from 'react';
import { DashboardStats, KabupatenData, RecentActivity } from '../types/qurban';

export const useDashboardData = (autoRefresh: boolean = false) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data - will be replaced with real Supabase queries
  const [stats] = useState<DashboardStats>({
    total_muzakki: 1247,
    total_hewan: 89,
    total_penerima: 3420,
    kabupaten_coverage: 45,
    total_nilai_qurban: 2800000000, // 2.8 billion rupiah
  });

  const [kabupatenData] = useState<KabupatenData[]>([
    {
      kabupaten: 'Jakarta Pusat',
      total_penerima: 450,
      total_hewan: 85,
      active_mitra: ['LAZIS Jakarta', 'BAZNAS DKI'],
      latest_distribution: '2025-06-02T10:30:00Z'
    },
    {
      kabupaten: 'Surabaya',
      total_penerima: 320,
      total_hewan: 62,
      active_mitra: ['BAZNAS Surabaya'],
      latest_distribution: '2025-06-02T09:15:00Z'
    },
    // Add more mock data...
  ]);

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'upload',
      description: 'LAZIS Jakarta mengupload data muzakki (125 record)',
      timestamp: '2025-06-02T10:30:00Z',
      mitra: 'LAZIS Jakarta'
    },
    {
      id: '2',
      type: 'distribution',
      description: 'Distribusi qurban di Bandung (85 penerima)',
      timestamp: '2025-06-02T09:15:00Z',
      mitra: 'BAZNAS Bandung'
    },
    // Add more activities...
  ]);

  const [chartData] = useState({
    topKabupaten: [
      { name: 'Jakarta Pusat', penerima: 450, hewan: 85 },
      { name: 'Surabaya', penerima: 320, hewan: 62 },
      { name: 'Bandung', penerima: 280, hewan: 48 },
    ],
    dailyProgress: [
      { date: '16 Jun', muzakki: 240, distribusi: 210 },
      { date: '17 Jun', muzakki: 280, distribusi: 265 },
      { date: '18 Jun', muzakki: 320, distribusi: 295 },
    ]
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real implementation, this would fetch from Supabase:
      // const { data: statsData } = await supabase.rpc('get_dashboard_stats');
      // const { data: kabupatenData } = await supabase.rpc('get_kabupaten_summary');
      // etc.
      
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