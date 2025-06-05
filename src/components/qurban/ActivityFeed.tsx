import React from 'react';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  mitra: string;
  type: 'upload' | 'distribusi';
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading = false }) => {
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
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
        Aktivitas Terbaru
      </h2>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="overflow-x-auto table-scroll">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Mitra
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
              {activities.slice(0, 8).map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 text-sm font-medium text-gray-900 min-w-[120px]">
                    <div className="truncate">{activity.mitra}</div>
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-600 min-w-[100px]">
                    <span className="inline-flex items-center">
                      <span className="mr-2 text-base">
                        {activity.type === 'upload' ? '📤' : '🎯'}
                      </span>
                      <span className="truncate">
                        {activity.type === 'upload' ? 'Upload data' : 'Distribusi'}
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
      )}
      
      {activities.length > 8 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors">
            Lihat Semua Aktivitas ({activities.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 