import React from 'react';
import { Upload, Users, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { RecentActivity } from '../../types/qurban';

interface RecentActivityFeedProps {
  activities: RecentActivity[] | null;
  loading: boolean;
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities, loading }) => {
  // Mock data for demonstration
  const mockActivities = [
    {
      id: '1',
      type: 'upload' as const,
      description: 'LAZIS Jakarta mengupload data muzakki (125 record)',
      timestamp: '2025-06-02T10:30:00Z',
      mitra: 'LAZIS Jakarta'
    },
    {
      id: '2',
      type: 'distribution' as const,
      description: 'Distribusi qurban di Bandung (85 penerima)',
      timestamp: '2025-06-02T09:15:00Z',
      mitra: 'BAZNAS Bandung'
    },
    {
      id: '3',
      type: 'registration' as const,
      description: '15 muzakki baru mendaftar qurban',
      timestamp: '2025-06-02T08:45:00Z',
      mitra: 'MTT'
    },
    {
      id: '4',
      type: 'upload' as const,
      description: 'BAZNAS Surabaya mengupload data distribusi (200 record)',
      timestamp: '2025-06-02T08:20:00Z',
      mitra: 'BAZNAS Surabaya'
    },
    {
      id: '5',
      type: 'distribution' as const,
      description: 'Distribusi qurban di Medan (150 penerima)',
      timestamp: '2025-06-02T07:30:00Z',
      mitra: 'LAZIS Medan'
    },
    {
      id: '6',
      type: 'registration' as const,
      description: '8 muzakki baru mendaftar qurban',
      timestamp: '2025-06-02T07:00:00Z',
      mitra: 'MTT'
    }
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'upload':
        return Upload;
      case 'distribution':
        return MapPin;
      case 'registration':
        return Users;
      default:
        return CheckCircle;
    }
  };

  const getActivityColor = (type: RecentActivity['type']) => {
    switch (type) {
      case 'upload':
        return 'text-purple-500 bg-purple-50';
      case 'distribution':
        return 'text-green-500 bg-green-50';
      case 'registration':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Baru saja';
    if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} hari yang lalu`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-start space-x-3 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {mockActivities.map((activity) => {
        const IconComponent = getActivityIcon(activity.type);
        const colorClasses = getActivityColor(activity.type);
        
        return (
          <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`p-2 rounded-full ${colorClasses}`}>
              <IconComponent className="w-4 h-4" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 leading-relaxed">
                {activity.description}
              </p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.mitra === 'MTT' 
                      ? 'bg-orange-100 text-orange-600'
                      : activity.mitra.includes('LAZIS')
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {activity.mitra}
                  </span>
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* View All Button */}
      <div className="pt-4 border-t border-gray-200">
        <button className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 hover:bg-blue-50 rounded-lg transition-colors">
          Lihat Semua Aktivitas
        </button>
      </div>
    </div>
  );
};

export default RecentActivityFeed; 