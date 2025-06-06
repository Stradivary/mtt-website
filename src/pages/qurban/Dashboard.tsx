import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, RefreshCw, Filter, Download, MapPin, BarChart3 } from 'lucide-react';
import StatsCards from '../../components/qurban/StatsCards';
import IndonesiaMap from '../../components/qurban/IndonesiaMap';
import DistributionTable from '../../components/qurban/DistributionTable';
import ActivityFeed from '../../components/qurban/ActivityFeed';
import { useDashboardData } from '../../hooks/useDashboardData';
import { clearAllCaches, markCacheCleared } from '../../utils/cacheUtils';

const Dashboard = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [animalBreakdown, setAnimalBreakdown] = useState<Record<string, number>>({});
  const [mitraCount, setMitraCount] = useState(0);
  const [debugMode, setDebugMode] = useState(false); // Debug mode toggle
  const [totalDagingPaket, setTotalDagingPaket] = useState(0); // Add total daging paket state
  
  const { 
    stats, 
    chartData, 
    recentActivities, 
    loading, 
    error, 
    refreshData,
    lastFetchTime // Get last fetch time for debugging
  } = useDashboardData(autoRefresh);

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!loading) {
      setLastUpdate(new Date());
    }
  }, [loading]);

  // Fetch real animal breakdown data with cache-busting
  useEffect(() => {
    fetchAnimalBreakdown();
    fetchMitraCount();
    fetchTotalDagingPaket(); // Add total daging calculation
  }, [refreshTrigger]);

  const fetchAnimalBreakdown = async () => {
    try {
      console.log('🐄 Fetching animal breakdown...');
      const { supabase } = await import('../../lib/supabase');
      
      // Add cache-busting to animal breakdown query
      const { data: muzakki, error } = await supabase
        .from('muzakki')
        .select('jenis_hewan, jumlah_hewan')
        .order('created_at', { ascending: false }) // Force fresh query
        .limit(10000);

      if (error) {
        console.error('❌ Error fetching muzakki data:', error);
        return;
      }

      console.log(`📊 Retrieved ${muzakki?.length || 0} muzakki records`);
      
      if (muzakki && muzakki.length > 0) {
        // Log first few records to see what we have
        console.log('📋 Sample muzakki records:', muzakki.slice(0, 5).map(m => `${m.jenis_hewan}(${m.jumlah_hewan})`));
        
        // Sum jumlah_hewan instead of counting rows
        const breakdown = muzakki.reduce((acc, item) => {
          const jumlah = item.jumlah_hewan || 1;
          acc[item.jenis_hewan] = (acc[item.jenis_hewan] || 0) + jumlah;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('✅ Animal breakdown updated (sum of jumlah_hewan):', breakdown);
        console.log('🔍 Animal types found:', Object.keys(breakdown));
        console.log('📊 Total animal count:', Object.values(breakdown).reduce((a, b) => a + b, 0));
        
        setAnimalBreakdown(breakdown);
      } else {
        console.log('⚠️ No muzakki data found');
        setAnimalBreakdown({});
      }
    } catch (error) {
      console.error('❌ Error fetching animal breakdown:', error);
    }
  };

  const fetchMitraCount = async () => {
    try {
      console.log('👥 Fetching mitra count...');
      const { supabase } = await import('../../lib/supabase');
      
      // Get unique mitra from distribusi table via uploader relationship
      const { data: uploaders, error } = await supabase
        .from('uploaders')
        .select('mitra_name')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching mitra data:', error);
        return;
      }

      if (uploaders && uploaders.length > 0) {
        // Extract unique mitra names
        const uniqueMitra = new Set();
        uploaders.forEach(uploader => {
          if (uploader.mitra_name) {
            uniqueMitra.add(uploader.mitra_name);
          }
        });
        
        console.log('✅ Mitra count updated:', uniqueMitra.size);
        console.log('🏢 Unique mitra:', Array.from(uniqueMitra));
        
        setMitraCount(uniqueMitra.size);
      } else {
        console.log('⚠️ No uploader data found');
        setMitraCount(0);
      }
    } catch (error) {
      console.error('❌ Error fetching mitra count:', error);
    }
  };

  const fetchTotalDagingPaket = async () => {
    try {
      console.log('📦 Fetching total daging paket...');
      const { supabase } = await import('../../lib/supabase');
      
      const { data: distribusi, error } = await supabase
        .from('distribusi')
        .select('jumlah_daging')
        .order('created_at', { ascending: false })
        .limit(10000);

      if (error) {
        console.error('❌ Error fetching distribusi data:', error);
        return;
      }

      if (distribusi && distribusi.length > 0) {
        const totalDaging = distribusi.reduce((sum, item) => sum + (item.jumlah_daging || 1), 0);
        console.log('✅ Total daging paket calculated:', totalDaging);
        setTotalDagingPaket(totalDaging);
      } else {
        console.log('⚠️ No distribusi data found');
        setTotalDagingPaket(0);
      }
    } catch (error) {
      console.error('❌ Error calculating total daging paket:', error);
    }
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh initiated from Dashboard');
    refreshData();
    setRefreshTrigger(prev => prev + 1);
    fetchAnimalBreakdown();
    fetchMitraCount();
    fetchTotalDagingPaket(); // Refresh total daging
  };

  const handleHardRefresh = async () => {
    console.log('💪 HARD REFRESH initiated - clearing all caches');
    
    try {
      // Use utility function to clear all caches
      await clearAllCaches();
      
      // Mark that cache was cleared
      markCacheCleared();
      
      // Force refresh data
      handleRefresh();
      
      // Show notification
      alert('Cache cleared! Data will be refreshed from the database.');
    } catch (error) {
      console.error('Error clearing caches:', error);
      alert('Cache clearing encountered an issue, but data will still be refreshed.');
      handleRefresh();
    }
  };

  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      lastFetchTime: lastFetchTime,
      lastUpdate: lastUpdate.toISOString(),
      stats: stats,
      animalBreakdown: animalBreakdown,
      chartData: chartData,
      recentActivities: recentActivities
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qurban-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Debug info component
  const DebugInfo = () => {
    if (!debugMode) return null;
    
    return (
      <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
        <h3 className="font-bold mb-2">🐛 Debug Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div><strong>Last Fetch:</strong> {new Date(lastFetchTime).toLocaleString()}</div>
          <div><strong>Last Update:</strong> {lastUpdate.toLocaleString()}</div>
          <div><strong>Auto Refresh:</strong> {autoRefresh ? 'ON' : 'OFF'}</div>
          <div><strong>Loading:</strong> {loading ? 'YES' : 'NO'}</div>
          <div><strong>Error:</strong> {error || 'None'}</div>
          <div><strong>Stats:</strong> {Object.values(stats).some(v => v > 0) ? 'Valid' : 'Empty'}</div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={handleHardRefresh}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
          >
            🔥 Hard Refresh
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
          >
            🔄 Page Reload
          </button>
          <button
            onClick={() => console.log({ stats, chartData, animalBreakdown, recentActivities })}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
          >
            📊 Log Data
          </button>
        </div>
      </div>
    );
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
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50 main-content">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 dashboard-container">
        
        {/* Header - Mobile Responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <Link 
                to="/service" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors touch-manipulation text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Kembali ke Layanan</span>
              </Link>
            </div>
            
            {/* Control Section - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Update: {lastUpdate.toLocaleTimeString('id-ID')}</span>
                </div>
                
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-400' : 'bg-green-400'}`}></div>
                  <span>{loading ? 'Loading...' : error ? 'Error' : 'Live'}</span>
              </div>
              
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors touch-manipulation ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Auto: {autoRefresh ? 'ON' : 'OFF'}
                </button>

                {/* Debug toggle */}
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 hover:bg-red-200 transition-colors touch-manipulation"
                  title="Toggle debug mode"
                >
                  🐛
                </button>
              </div>

              {/* Action Buttons - Mobile Responsive */}
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
              <button
                onClick={handleExportData}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation text-xs sm:text-sm"
              >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={handleRefresh}
                disabled={loading}
                  className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation text-xs sm:text-sm"
              >
                  <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

                <button
                  onClick={handleHardRefresh}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 touch-manipulation text-xs sm:text-sm"
                  title="Clear cache and force refresh"
                >
                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Hard</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-4 lg:mt-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
              Dashboard Qurban MTT 1446H
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 sm:mt-2 leading-relaxed">
              Monitoring distribusi qurban secara real-time di seluruh Indonesia
            </p>
          </div>
        </div>

        {/* Debug Information */}
        <DebugInfo />

        {/* 1. Statistics Cards */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <StatsCards 
            stats={stats} 
            loading={loading}
            animalBreakdown={animalBreakdown}
            mitraCount={mitraCount}
            totalDagingPaket={totalDagingPaket}
          />
        </div>

        {/* 2. Indonesia Map - Auto-responsive */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          {chartData?.provinsiBreakdown && (
          <IndonesiaMap 
            data={chartData.provinsiBreakdown}
            totalPenerima={stats?.total_penerima || 0}
            kabupatenCoverage={stats?.kabupaten_coverage || 0}
            totalDagingPaket={totalDagingPaket}
          />
          )}
        </div>

        {/* 3. Quick Statistics - Mobile optimized */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 w-full overflow-hidden responsive-card">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                Ringkasan Cepat
              </h3>
              
            {/* Mobile optimized grid - 2 columns on mobile, 4 on larger screens (removed Total Paket) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 bg-red-50 rounded-md sm:rounded-lg">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-red-600">
                    {stats?.total_muzakki || 0}
                  </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium text-center leading-tight">Total Pequrban</span>
              </div>
                
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 bg-red-50 rounded-md sm:rounded-lg">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-red-600">
                  {stats?.kabupaten_coverage || 0}
                  </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium text-center leading-tight">Kab/Kota</span>
                </div>
                
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 bg-red-50 rounded-md sm:rounded-lg">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-red-600">
                  {Math.round(chartData?.provinsiBreakdown?.reduce((sum, item) => sum + (item.total_daging || item.count || 0), 0) || 0)}
                  </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium text-center leading-tight">Paket Distribusi</span>
                </div>
                
              <div className="flex flex-col items-center justify-center p-2 sm:p-3 bg-red-50 rounded-md sm:rounded-lg">
                <span className="text-sm sm:text-base lg:text-lg font-bold text-red-600">
                  {mitraCount || 0}
                  </span>
                <span className="text-xs sm:text-sm text-gray-700 font-medium text-center leading-tight">Total Mitra</span>
              </div>
                </div>

            {/* Animal breakdown if available - Mobile optimized */}
                {Object.keys(animalBreakdown).length > 0 && (
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Breakdown Jenis Hewan</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(animalBreakdown)
                    .sort(([a], [b]) => {
                      // Sort by custom order: Sapi, Sapi 1/7, Domba
                      const order = ['sapi', 'sapi 1/7', 'domba'];
                      const indexA = order.findIndex(item => item.toLowerCase() === a.toLowerCase());
                      const indexB = order.findIndex(item => item.toLowerCase() === b.toLowerCase());
                      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                    })
                    .map(([jenis, count]) => (
                    <div key={jenis} className="flex justify-between items-center text-xs sm:text-sm p-1.5 sm:p-2 bg-gray-50 rounded">
                      <span className="text-gray-600 truncate mr-1 sm:mr-2">{jenis}</span>
                      <span className="font-medium flex-shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Distribution Table */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <DistributionTable refreshTrigger={refreshTrigger} />
        </div>

        {/* 5. Activity Feed - Moved to bottom */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
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