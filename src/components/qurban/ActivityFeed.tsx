import React, { useState } from 'react';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface Activity {
  id: string;
  mitra: string;
  type: 'upload' | 'distribusi';
  timestamp: string;
  description?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination calculations
  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);

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
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
        Aktivitas Terbaru
      </h2>
        <div className="text-sm text-gray-600">
          {activities.length} total aktivitas
        </div>
      </div>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Belum ada aktivitas</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto table-scroll">
            <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Mitra
                </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                    Deskripsi
                  </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">
                  Aktivitas
                </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Waktu
                </th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px] hidden sm:table-cell">
                    Status
                  </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {currentActivities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 text-sm font-medium text-gray-900 min-w-[120px]">
                      <div className="truncate">{activity.mitra}</div>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-600 min-w-[200px]">
                      <div className="truncate max-w-[200px]" title={activity.description}>
                        {activity.description || `${activity.type === 'upload' ? 'Upload data' : 'Distribusi qurban'}`}
                      </div>
                  </td>
                    <td className="py-3 px-3 text-sm text-gray-600 min-w-[100px]">
                    <span className="inline-flex items-center">
                        <span className="mr-2 text-base">
                        {activity.type === 'upload' ? '📤' : '🎯'}
                      </span>
                        <span className="truncate">
                          {activity.type === 'upload' ? 'Upload' : 'Distribusi'}
                        </span>
                    </span>
                  </td>
                    <td className="py-3 px-3 text-sm text-gray-500 min-w-[120px]">
                      <div className="whitespace-nowrap">
                    {new Date(activity.timestamp).toLocaleString('id-ID', { 
                      month: 'short', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-500 min-w-[80px] hidden sm:table-cell">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          activity.type === 'upload' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {activity.type === 'upload' ? 'Uploaded' : 'Completed'}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            
            {/* Mobile scroll indicator */}
            <div className="sm:hidden text-center mt-3">
              <p className="text-xs text-gray-500">← Geser untuk melihat lebih banyak →</p>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Menampilkan {startIndex + 1} - {Math.min(endIndex, activities.length)} dari {activities.length} aktivitas
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
        </>
      )}
    </div>
  );
};

export default ActivityFeed; 