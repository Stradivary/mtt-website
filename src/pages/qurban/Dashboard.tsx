import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, RefreshCw, Filter, Download } from 'lucide-react';
import StatsCards from '../../components/qurban/StatsCards';
import IndonesiaMap from '../../components/qurban/IndonesiaMap';
import DistributionTable from '../../components/qurban/DistributionTable';
import ActivityFeed from '../../components/qurban/ActivityFeed';
import { useDashboardData } from '../../hooks/useDashboardData';

const Dashboard = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [animalBreakdown, setAnimalBreakdown] = useState<Record<string, number>>({});
  
  const { 
    stats, 
    chartData, 
    recentActivities, 
    loading, 
    error, 
    refreshData 
  } = useDashboardData(autoRefresh);

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!loading) {
      setLastUpdate(new Date());
    }
  }, [loading]);

  // Fetch real animal breakdown data
  useEffect(() => {
    fetchAnimalBreakdown();
  }, [refreshTrigger]);

  const fetchAnimalBreakdown = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data: muzakki } = await supabase
        .from('muzakki')
        .select('jenis_hewan');

      if (muzakki) {
        const breakdown = muzakki.reduce((acc, item) => {
          acc[item.jenis_hewan] = (acc[item.jenis_hewan] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setAnimalBreakdown(breakdown);
      }
    } catch (error) {
      console.error('Error fetching animal breakdown:', error);
    }
  };

  const handleRefresh = () => {
    refreshData();
    setRefreshTrigger(prev => prev + 1);
    fetchAnimalBreakdown();
  };

  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: stats,
      animalBreakdown: animalBreakdown,
      chartData: chartData
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qurban-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (error) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 mb-4">
            <Clock className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-gray-600 mb-4">
            Terjadi kesalahan saat memuat data dashboard. Silakan coba lagi.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to="/service" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Layanan
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                Update: {lastUpdate.toLocaleTimeString('id-ID')}
              </div>
              
              {/* Auto-refresh Toggle */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Auto-refresh</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-8 h-4 rounded-full transition-colors ${
                    autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    autoRefresh ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              <button
                onClick={handleExportData}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Qurban MTT 1446H
            </h1>
            <p className="text-gray-600 mt-2">
              Monitoring distribusi qurban secara real-time di seluruh Indonesia
            </p>
          </div>
        </div>

        {/* 1. Statistics Cards */}
        <div className="mb-8">
          <StatsCards 
            stats={stats} 
            loading={loading}
            animalBreakdown={animalBreakdown}
          />
        </div>

        {/* 2. Indonesia Map */}
        <div className="mb-8">
          <IndonesiaMap 
            data={chartData.provinsiBreakdown}
            totalPenerima={stats?.total_penerima || 0}
            kabupatenCoverage={stats?.kabupaten_coverage || 0}
          />
        </div>

        {/* 3. Two Column Layout: Activities + Quick Stats */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed 
              activities={recentActivities} 
              loading={loading}
            />
          </div>

          {/* Quick Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Ringkasan Cepat
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Total Muzakki</span>
                  <span className="text-lg font-bold text-blue-600">
                    {stats?.total_muzakki || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">Total Penerima</span>
                  <span className="text-lg font-bold text-green-600">
                    {stats?.total_penerima || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">Wilayah Jangkauan</span>
                  <span className="text-lg font-bold text-purple-600">
                    {stats?.kabupaten_coverage || 0} kab
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-700">Total Hewan</span>
                  <span className="text-lg font-bold text-orange-600">
                    {stats?.total_hewan || 0} ekor
                  </span>
                </div>

                {/* Animal breakdown if available */}
                {Object.keys(animalBreakdown).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Jenis Hewan</h4>
                    {Object.entries(animalBreakdown).map(([jenis, count]) => (
                      <div key={jenis} className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">{jenis}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Distribution Table */}
        <div className="mb-8">
          <DistributionTable refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 