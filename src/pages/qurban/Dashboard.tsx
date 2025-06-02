import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import StatsCards from '../../components/qurban/StatsCards';
import IndonesiaMap from '../../components/qurban/IndonesiaMap';
import AnalyticsCharts from '../../components/qurban/AnalyticsCharts';
import RecentActivityFeed from '../../components/qurban/RecentActivityFeed';
import { useDashboardData } from '../../hooks/useDashboardData';

const Dashboard = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { 
    stats, 
    kabupatenData, 
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

  const handleRefresh = () => {
    refreshData();
  };

  if (error) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
          <div className="text-red-500 mb-4">
            <TrendingUp className="w-12 h-12 mx-auto" />
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
                Update terakhir: {lastUpdate.toLocaleTimeString('id-ID')}
              </div>
              
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

        {/* Statistics Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} loading={loading} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                  Peta Distribusi Indonesia
                </h2>
                <div className="text-sm text-gray-500">
                  Klik kabupaten untuk detail
                </div>
              </div>
              
              <IndonesiaMap 
                data={kabupatenData} 
                loading={loading}
                onKabupatenClick={(kabupaten) => {
                  // Handle kabupaten click for detail modal
                  console.log('Clicked:', kabupaten);
                }}
              />
            </div>

            {/* Charts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Analisis Data
              </h2>
              
              <AnalyticsCharts 
                chartData={chartData} 
                loading={loading}
              />
            </div>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-500" />
                Aktivitas Terkini
              </h2>
              
              <RecentActivityFeed 
                activities={recentActivities} 
                loading={loading}
              />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.kabupaten_coverage || 0}
              </div>
              <div className="text-sm text-gray-600">Kabupaten Terjangkau</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.total_hewan || 0}
              </div>
              <div className="text-sm text-gray-600">Total Hewan Qurban</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.total_penerima?.toLocaleString('id-ID') || 0}
              </div>
              <div className="text-sm text-gray-600">Keluarga Penerima</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 