import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, TrendingUp, Users } from 'lucide-react';

interface KabupatenSummary {
  kabupaten: string;
  provinsi: string;
  total_penerima: number;
  total_hewan: number;
  total_daging: number;
  mitras: string[];
  latest_distribution: string;
}

interface DistributionTableProps {
  refreshTrigger?: number;
}

const DistributionTable: React.FC<DistributionTableProps> = ({
  refreshTrigger = 0
}) => {
  const [data, setData] = useState<KabupatenSummary[]>([]);
  const [filteredData, setFilteredData] = useState<KabupatenSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvinsi, setSelectedProvinsi] = useState('all');
  const [sortBy, setSortBy] = useState('total_penerima');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch aggregated data
  const fetchAggregatedData = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../../lib/supabase');
      
      // Get aggregated distribution data
      const { data: distribusi, error } = await supabase
        .from('distribusi')
        .select(`
          kabupaten, 
          provinsi, 
          jenis_hewan,
          jumlah_daging,
          tanggal_distribusi,
          uploaders!inner(mitra_name)
        `);

      if (error) throw error;

      // Aggregate by kabupaten
      const aggregated = distribusi?.reduce((acc, item) => {
        const key = `${item.kabupaten}_${item.provinsi}`;
        
        if (!acc[key]) {
          acc[key] = {
            kabupaten: item.kabupaten,
            provinsi: item.provinsi,
            total_penerima: 0,
            total_hewan: 0,
            total_daging: 0,
            mitras: new Set(),
            latest_distribution: item.tanggal_distribusi
          };
        }

        acc[key].total_penerima += 1;
        acc[key].total_hewan += 1; // Each record represents one animal
        acc[key].total_daging += item.jumlah_daging || 0;
        acc[key].mitras.add(item.uploaders.mitra_name);
        
        // Update latest date
        if (new Date(item.tanggal_distribusi) > new Date(acc[key].latest_distribution)) {
          acc[key].latest_distribution = item.tanggal_distribusi;
        }

        return acc;
      }, {} as Record<string, any>) || {};

      // Convert to array and format
      const result = Object.values(aggregated).map((item: any) => ({
        ...item,
        mitras: Array.from(item.mitras)
      })) as KabupatenSummary[];

      setData(result);
      setFilteredData(result);
    } catch (error) {
      console.error('Error fetching aggregated data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAggregatedData();
  }, [refreshTrigger]);

  // Filter and search
  useEffect(() => {
    let filtered = data;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.kabupaten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.provinsi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Province filter
    if (selectedProvinsi !== 'all') {
      filtered = filtered.filter(item => item.provinsi === selectedProvinsi);
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof KabupatenSummary];
      const bVal = b[sortBy as keyof KabupatenSummary];
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortOrder === 'desc' ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
    });

    setFilteredData(filtered);
  }, [data, searchTerm, selectedProvinsi, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getUniqueProvinsi = () => {
    return [...new Set(data.map(item => item.provinsi))].sort();
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'desc' ? '↓' : '↑';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 responsive-card">
        <div className="loading-skeleton">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 responsive-card mobile-container">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500 flex-shrink-0" />
            <span className="truncate">Distribusi per Kabupaten</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Summary distribusi qurban berdasarkan wilayah kabupaten/kota
          </p>
        </div>

        {/* Mobile Responsive Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kabupaten/provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto text-base sm:text-sm"
            />
          </div>

          {/* Province Filter */}
          <select
            value={selectedProvinsi}
            onChange={(e) => setSelectedProvinsi(e.target.value)}
            className="px-3 py-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto text-base sm:text-sm"
          >
            <option value="all">Semua Provinsi</option>
            {getUniqueProvinsi().map(provinsi => (
              <option key={provinsi} value={provinsi}>
                {provinsi}
              </option>
            ))}
          </select>

          {/* Results count */}
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            {filteredData.length} dari {data.length} kabupaten
          </div>
        </div>
      </div>

      {/* Summary Stats - Mobile Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {filteredData.reduce((sum, item) => sum + item.total_penerima, 0)}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Penerima</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {filteredData.reduce((sum, item) => sum + item.total_hewan, 0)}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Total Hewan</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-lg font-bold text-emerald-600">
            {filteredData.reduce((sum, item) => sum + item.total_daging, 0).toFixed(1)} paket
          </div>
          <div className="text-sm text-gray-600">Total Daging</div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="table-scroll overflow-x-auto -mx-2 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[120px]"
                  onClick={() => handleSort('kabupaten')}
                >
                  Kabupaten/Kota {getSortIcon('kabupaten')}
                </th>
                <th 
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[100px]"
                  onClick={() => handleSort('provinsi')}
                >
                  Provinsi {getSortIcon('provinsi')}
                </th>
                <th 
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[80px]"
                  onClick={() => handleSort('total_penerima')}
                >
                  Penerima {getSortIcon('total_penerima')}
                </th>
                <th 
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[80px]"
                  onClick={() => handleSort('total_hewan')}
                >
                  Hewan {getSortIcon('total_hewan')}
                </th>
                <th 
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[100px]"
                  onClick={() => handleSort('total_daging')}
                >
                  Total Daging {getSortIcon('total_daging')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] hidden-mobile">
                  Mitra
                </th>
                <th 
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[120px]"
                  onClick={() => handleSort('latest_distribution')}
                >
                  Distribusi Terakhir {getSortIcon('latest_distribution')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={`${item.kabupaten}-${item.provinsi}`} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {item.kabupaten}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{item.provinsi}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-1 sm:mr-2" />
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        {item.total_penerima}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{item.total_hewan} ekor</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm text-gray-900">{item.total_daging.toFixed(1)} paket</div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden-mobile">
                    <div className="flex flex-wrap gap-1">
                      {item.mitras.map((mitra, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {mitra.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {new Date(item.latest_distribution).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredData.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-500">Tidak ada data distribusi ditemukan</p>
        </div>
      )}
    </div>
  );
};

export default DistributionTable; 