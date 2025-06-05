import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, RefreshCw, Filter, Download, MapPin, BarChart3 } from 'lucide-react';
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
      <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 max-w-md mx-auto text-center w-full">
          <div className="text-red-500 mb-4">
            <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            Gagal Memuat Data
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Terjadi kesalahan saat memuat data dashboard. Silakan coba lagi.
          </p>
          <button
            onClick={handleRefresh}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50 main-content">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 dashboard-container">
        
        {/* Header - Mobile Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 min-w-0">
              <Link 
                to="/service" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors touch-manipulation"
              >
                <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Kembali ke Layanan</span>
              </Link>
            </div>
            
            {/* Control Section - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-start">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 flex-shrink-0" />
                <span>Update: {lastUpdate.toLocaleTimeString('id-ID')}</span>
              </div>
              
              {/* Auto-refresh Toggle */}
              <div className="flex items-center justify-center space-x-2">
                <label className="text-xs sm:text-sm text-gray-600">Auto-refresh</label>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`w-8 h-4 rounded-full transition-colors touch-manipulation ${
                    autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
                    autoRefresh ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>

              {/* Action Buttons - Mobile Responsive */}
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <button
                  onClick={handleExportData}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Export</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation text-xs sm:text-sm"
                >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Dashboard Qurban MTT 1446H
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed">
              Monitoring distribusi qurban secara real-time di seluruh Indonesia
            </p>
          </div>
        </div>

        {/* 1. Statistics Cards */}
        <div className="mb-6 sm:mb-8">
          <StatsCards 
            stats={stats} 
            loading={loading}
            animalBreakdown={animalBreakdown}
          />
        </div>

        {/* 2. Indonesia Map - Auto-responsive */}
        <div className="mb-6 sm:mb-8">
          {chartData?.provinsiBreakdown && (
            <IndonesiaMap 
              data={chartData.provinsiBreakdown}
              totalPenerima={stats?.total_penerima || 0}
              kabupatenCoverage={stats?.kabupaten_coverage || 0}
            />
          )}
        </div>

        {/* 3. Quick Statistics - Moved from side to full width */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full overflow-hidden responsive-card">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
              Ringkasan Cepat
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-blue-600">
                  {stats?.total_muzakki || 0}
                </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium text-center">Total Muzakki</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-green-600">
                  {stats?.total_penerima || 0}
                </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium text-center">Total Penerima</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-purple-600">
                  {stats?.kabupaten_coverage || 0}
                </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium text-center">Kab/Kota</span>
              </div>
              
              <div className="flex flex-col items-center justify-center p-3 bg-orange-50 rounded-lg">
                <span className="text-base sm:text-lg font-bold text-orange-600">
                  {stats?.total_hewan || 0}
                </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium text-center">Total Hewan</span>
              </div>
            </div>

            {/* Animal breakdown if available */}
            {Object.keys(animalBreakdown).length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Breakdown Jenis Hewan</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(animalBreakdown).map(([jenis, count]) => (
                    <div key={jenis} className="flex justify-between items-center text-xs sm:text-sm p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 truncate mr-2">{jenis}</span>
                      <span className="font-medium flex-shrink-0">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Distribution Table */}
        <div className="mb-6 sm:mb-8">
          <DistributionTable refreshTrigger={refreshTrigger} />
        </div>

        {/* 5. Activity Feed - Moved to bottom */}
        <div className="mb-6 sm:mb-8">
          <ActivityFeed 
            activities={recentActivities} 
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 