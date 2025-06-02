import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, TrendingUp, Clock, RefreshCw, Database, Filter, Calendar, Download } from 'lucide-react';
import EnhancedStatsCards from '../../components/qurban/EnhancedStatsCards';
import AdvancedIndonesiaMap from '../../components/qurban/AdvancedIndonesiaMap';
import AnalyticsCharts from '../../components/qurban/AnalyticsCharts';
import RecentActivityFeed from '../../components/qurban/RecentActivityFeed';
import SupabaseTest from '../../components/qurban/SupabaseTest';
import { useDashboardData } from '../../hooks/useDashboardData';

const Dashboard = () => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showSupabaseTest, setShowSupabaseTest] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    period: '2025',
    provinsi: 'all',
    mitra: 'all',
    dateRange: 'last30days'
  });
  
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

  const handleExportData = () => {
    // Export functionality placeholder
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: stats,
      filters: filters
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
        {/* Enhanced Header with Filters */}
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
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>

              <button
                onClick={handleExportData}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={() => setShowSupabaseTest(true)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Database className="w-4 h-4" />
                <span>Test DB</span>
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

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-500" />
                Filter & Analisis Data
              </h3>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
                  <select
                    value={filters.period}
                    onChange={(e) => setFilters({...filters, period: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="2025">2025 (1446H)</option>
                    <option value="2024">2024 (1445H)</option>
                    <option value="2023">2023 (1444H)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Provinsi</label>
                  <select
                    value={filters.provinsi}
                    onChange={(e) => setFilters({...filters, provinsi: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Semua Provinsi</option>
                    <option value="dki">DKI Jakarta</option>
                    <option value="jabar">Jawa Barat</option>
                    <option value="jatim">Jawa Timur</option>
                    <option value="jateng">Jawa Tengah</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mitra</label>
                  <select
                    value={filters.mitra}
                    onChange={(e) => setFilters({...filters, mitra: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">Semua Mitra</option>
                    <option value="lazis">LAZIS MTT</option>
                    <option value="baznas">BAZNAS</option>
                    <option value="mtt">MTT Pusat</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Waktu</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="last7days">7 Hari Terakhir</option>
                    <option value="last30days">30 Hari Terakhir</option>
                    <option value="thismonth">Bulan Ini</option>
                    <option value="thisyear">Tahun Ini</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Filter aktif: {Object.values(filters).filter(v => v !== 'all').length} dari 4
                </div>
                <button
                  onClick={() => setFilters({ period: '2025', provinsi: 'all', mitra: 'all', dateRange: 'last30days' })}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Reset Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="mb-8">
          <EnhancedStatsCards stats={stats} loading={loading} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Advanced Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                  Peta Distribusi Indonesia (Advanced)
                </h2>
                <div className="text-sm text-gray-500">
                  Interactive map dengan filter real-time
                </div>
              </div>
              
              <AdvancedIndonesiaMap 
                data={kabupatenData} 
                loading={loading}
                onKabupatenClick={(kabupaten) => {
                  console.log('Clicked:', kabupaten);
                }}
              />
            </div>

            {/* Charts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Analisis Data & Tren
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

        {/* Enhanced Footer Info - Single Section Only */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Ringkasan Program Qurban 1446H</h3>
            <p className="text-sm text-gray-600">Update real-time distribusi qurban MTT</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {stats?.kabupaten_coverage || 20}
              </div>
              <div className="text-sm text-gray-600">Kabupaten Terjangkau</div>
              <div className="text-xs text-gray-500 mt-1">dari 514 total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {stats?.total_hewan || 521}
              </div>
              <div className="text-sm text-gray-600">Total Hewan Qurban</div>
              <div className="text-xs text-gray-500 mt-1">sapi, kambing, domba</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {stats?.total_penerima?.toLocaleString('id-ID') || '5,625'}
              </div>
              <div className="text-sm text-gray-600">Keluarga Penerima</div>
              <div className="text-xs text-gray-500 mt-1">verified beneficiaries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                Rp 2.8B
              </div>
              <div className="text-sm text-gray-600">Total Nilai Qurban</div>
              <div className="text-xs text-gray-500 mt-1">dalam rupiah</div>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Test Modal */}
      {showSupabaseTest && (
        <SupabaseTest onClose={() => setShowSupabaseTest(false)} />
      )}
    </div>
  );
};

export default Dashboard; 