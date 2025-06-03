import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, TrendingUp, Clock, RefreshCw, Filter, Calendar, Download, Map, List, Search } from 'lucide-react';
import EnhancedStatsCards from '../../components/qurban/EnhancedStatsCards';
import ActivityFeed from '../../components/qurban/ActivityFeed';
import SimpleIndonesiaMap from '../../components/qurban/SimpleIndonesiaMap';
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
  
  const [distribusiData, setDistribusiData] = useState([]);
  const [filteredDistribusi, setFilteredDistribusi] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { 
    stats, 
    kabupatenData, 
    chartData, 
    recentActivities, 
    advancedStats,
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

  // Fetch distribusi data for table
  useEffect(() => {
    fetchDistribusiData();
  }, []);

  const fetchDistribusiData = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data, error } = await supabase
        .from('distribusi')
        .select(`
          id, nama_penerima, alamat_penerima, provinsi, kabupaten, 
          jenis_hewan, jumlah_daging, tanggal_distribusi, status,
          uploaders!inner(mitra_name)
        `)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setDistribusiData(data);
        setFilteredDistribusi(data);
      }
    } catch (err) {
      console.error('Error fetching distribusi:', err);
    }
  };

  // Filter distribusi data
  useEffect(() => {
    let filtered = distribusiData;
    
    if (filters.provinsi !== 'all') {
      filtered = filtered.filter(item => item.provinsi === filters.provinsi);
    }
    
    if (filters.mitra !== 'all') {
      filtered = filtered.filter(item => {
        const mitraMap = {
          'bmm': 'BMM',
          'lazismu': 'LAZIS_MUHAMMADIYAH', 
          'lazisnu': 'LAZIS_NU',
          'baznas': 'BAZNAS'
        };
        return item.uploaders.mitra_name === mitraMap[filters.mitra];
      });
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.nama_penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.alamat_penerima.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provinsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredDistribusi(filtered);
  }, [distribusiData, filters, searchTerm]);

  const handleRefresh = () => {
    refreshData();
    fetchDistribusiData();
  };

  const handleExportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      stats: stats,
      filters: filters,
      advancedStats: advancedStats,
      distribusi: filteredDistribusi
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
                    {chartData.provinsiBreakdown.slice(0, 5).map(provinsi => (
                      <option key={provinsi.provinsi} value={provinsi.provinsi}>
                        {provinsi.provinsi}
                      </option>
                    ))}
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
                    <option value="bmm">BMM</option>
                    <option value="lazismu">LAZIS Muhammadiyah</option>
                    <option value="lazisnu">LAZIS NU</option>
                    <option value="baznas">BAZNAS</option>
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

        {/* 1. Enhanced Statistics Cards */}
        <div className="mb-8">
          <EnhancedStatsCards stats={stats} loading={loading} />
        </div>

        {/* 2. Interactive Map Section */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Map className="w-5 h-5 mr-2 text-blue-500" />
                Peta Distribusi Indonesia
              </h2>
              <div className="text-sm text-gray-500">
                {stats.kabupaten_coverage} Kabupaten • {chartData.provinsiBreakdown.length} Provinsi
              </div>
            </div>
            
            {/* Interactive Map with Indonesia Heatmap */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Map Visualization */}
              <div className="lg:col-span-2">
                <SimpleIndonesiaMap 
                  data={chartData.provinsiBreakdown}
                  totalPenerima={stats.total_penerima}
                  kabupatenCoverage={stats.kabupaten_coverage}
                />
              </div>
              
              {/* Map Legend & Top Locations */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Provinsi</h3>
                  <div className="space-y-3">
                    {chartData.provinsiBreakdown.map((provinsi, index) => (
                      <div key={provinsi.provinsi} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: provinsi.color }}
                          ></div>
                          <span className="font-medium text-gray-900">
                            {provinsi.provinsi}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-gray-900">
                            {provinsi.count}
                          </div>
                          <div className="text-xs text-gray-500">
                            {provinsi.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Top Information & Analytics */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Progress Analytics */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Progress & Analytics
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {advancedStats.distribution_progress.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Progress Distribusi</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(advancedStats.distribution_progress, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {advancedStats.uploads_last_7_days}
                </div>
                <p className="text-sm text-gray-600">Upload 7 Hari Terakhir</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {advancedStats.active_mitras}
                </div>
                <p className="text-sm text-gray-600">Mitra Aktif</p>
              </div>
            </div>

            {/* Top Kabupaten */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Kabupaten</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {chartData.topKabupaten.slice(0, 4).map((kabupaten, index) => (
                  <div key={kabupaten.name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{kabupaten.name}</span>
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Penerima:</span>
                        <span className="font-medium">{kabupaten.penerima}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hewan:</span>
                        <span className="font-medium">{kabupaten.hewan}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simplified Recent Activities */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Aktivitas Terbaru
              </h2>
              
              {recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada aktivitas</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.mitra}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {activity.type === 'upload' ? '📤 Upload' : '🎯 Distribusi'} • {' '}
                        {new Date(activity.timestamp).toLocaleString('id-ID', { 
                          month: 'short', 
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Distribusi Table Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <List className="w-5 h-5 mr-2 text-green-500" />
              Data Distribusi Provinsi & Kabupaten
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari penerima, lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredDistribusi.length} dari {distribusiData.length} record
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Penerima
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lokasi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hewan & Daging
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mitra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDistribusi.slice(0, 20).map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.nama_penerima}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.alamat_penerima}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.kabupaten}</div>
                      <div className="text-sm text-gray-500">{item.provinsi}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.jenis_hewan}</div>
                      <div className="text-sm text-gray-500">{item.jumlah_daging} kg</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.tanggal_distribusi).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.uploaders.mitra_name.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status || 'Selesai'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredDistribusi.length > 20 && (
            <div className="mt-4 text-center">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                Load More ({filteredDistribusi.length - 20} records)
              </button>
            </div>
          )}
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