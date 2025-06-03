import React from 'react';
import { Users, TrendingUp, MapPin, Target } from 'lucide-react';
import { DashboardStats } from '../../types/qurban';

interface SimplifiedStatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
  animalBreakdown?: Record<string, number>;
}

// Format currency to Indonesian format (juta, milyar)
const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1).replace('.', ',')} milyar`;
  } else if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1).replace('.', ',')} juta`;
  } else {
    return `Rp ${value.toLocaleString('id-ID')}`;
  }
};

// Get animal icon
const getAnimalIcon = (jenis: string): string => {
  switch (jenis.toLowerCase()) {
    case 'sapi':
      return '🐄';
    case 'kambing':
      return '🐐';
    case 'domba':
      return '🐑';
    default:
      return '🐄';
  }
};

const SimplifiedStatsCards: React.FC<SimplifiedStatsCardsProps> = ({ 
  stats, 
  loading, 
  animalBreakdown = {} 
}) => {
  const cards = [
    {
      title: 'Total Muzakki',
      value: stats?.total_muzakki?.toLocaleString('id-ID') || '0',
      subtitle: 'Donatur',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Penerima',
      value: stats?.total_penerima?.toLocaleString('id-ID') || '0',
      subtitle: 'Keluarga',
      icon: Target,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Nilai Qurban',
      value: formatCurrency(stats?.total_nilai_qurban || 0),
      subtitle: 'Terkumpul',
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: 'Sebaran Wilayah',
      value: stats?.kabupaten_coverage?.toString() || '0',
      subtitle: 'Kabupaten',
      icon: MapPin,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-6 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                <span className="text-sm text-gray-500 pb-1">{card.subtitle}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Animal Breakdown Card - Only if data exists */}
      {Object.keys(animalBreakdown).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Jenis Hewan Qurban</h3>
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(animalBreakdown).map(([jenis, count]) => (
              <div key={jenis} className="text-center">
                <div className="text-4xl mb-2">{getAnimalIcon(jenis)}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{jenis}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimplifiedStatsCards; 