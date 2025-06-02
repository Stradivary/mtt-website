import React from 'react';
import { Users, MapPin, Heart, DollarSign, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../../types/qurban';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, loading }) => {
  const cards = [
    {
      title: 'Total Muzakki',
      value: stats?.total_muzakki || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      format: (val: number) => val.toLocaleString('id-ID')
    },
    {
      title: 'Total Hewan Qurban',
      value: stats?.total_hewan || 0,
      icon: Heart,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      format: (val: number) => val.toLocaleString('id-ID')
    },
    {
      title: 'Keluarga Penerima',
      value: stats?.total_penerima || 0,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      format: (val: number) => val.toLocaleString('id-ID')
    },
    {
      title: 'Kabupaten Terjangkau',
      value: stats?.kabupaten_coverage || 0,
      icon: MapPin,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      format: (val: number) => val.toString()
    },
    {
      title: 'Total Nilai Qurban',
      value: stats?.total_nilai_qurban || 0,
      icon: DollarSign,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
      format: (val: number) => `Rp ${(val / 1000000).toFixed(1)}M`
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {card.format(card.value)}
              </div>
              <div className="text-sm text-gray-600">
                {card.title}
              </div>
            </div>
            
            {/* Progress bar or indicator */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${card.color}`}
                  style={{ width: '75%' }} // Mock progress, can be dynamic
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards; 