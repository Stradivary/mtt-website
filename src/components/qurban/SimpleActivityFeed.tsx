import React from 'react';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  mitra: string;
  type: 'upload' | 'distribusi';
  timestamp: string;
}

interface SimpleActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
}

const SimpleActivityFeed: React.FC<SimpleActivityFeedProps> = ({ activities, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-blue-500" />
        Aktivitas Terbaru
      </h2>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Mitra
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Aktivitas
                </th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activities.slice(0, 8).map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-sm font-medium text-gray-900">
                    {activity.mitra}
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-600">
                    <span className="inline-flex items-center">
                      <span className="mr-2">
                        {activity.type === 'upload' ? '📤' : '🎯'}
                      </span>
                      {activity.type === 'upload' ? 'Upload data' : 'Distribusi'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('id-ID', { 
                      month: 'short', 
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SimpleActivityFeed; 