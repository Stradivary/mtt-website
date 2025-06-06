import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, TrendingUp, Users, ChevronLeft, ChevronRight } from 'lucide-react';

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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Filter and search with pagination reset
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
    setCurrentPage(1); // Reset to first page when filters change
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full overflow-hidden responsive-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
            Distribusi per Kabupaten
          </h2>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kabupaten/provinsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-48"
            />
          </div>

          <select
            value={selectedProvinsi}
            onChange={(e) => setSelectedProvinsi(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="all">Semua Provinsi</option>
            {getUniqueProvinsi().map(provinsi => (
              <option key={provinsi} value={provinsi}>{provinsi}</option>
            ))}
          </select>
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
              {currentData.map((item, index) => (
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-700">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredData.length)} dari {filteredData.length} kabupaten
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Prev
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 text-sm font-medium border rounded-md ${
                      currentPage === pageNumber
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
      </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

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