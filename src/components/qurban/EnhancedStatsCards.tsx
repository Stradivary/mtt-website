import React from 'react';
import { Users, TrendingUp, MapPin, Calendar, PieChart, Target, DollarSign } from 'lucide-react';
import { DashboardStats } from '../../types/qurban';

interface EnhancedStatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

// Format currency to readable format (100M, 2.5B, etc.)
const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `Rp ${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `Rp ${(value / 1000000).toFixed(1)}M`;
  } else {
    return `Rp ${value.toLocaleString('id-ID')}`;
  }
};

// Format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toLocaleString('id-ID');
};

const EnhancedStatsCards: React.FC<EnhancedStatsCardsProps> = ({ stats, loading }) => {
  // Enhanced mock data with animal breakdown
  const enhancedStats = {
    total_penerima: stats?.total_penerima || 5625,
    total_nilai: 2800000000, // 2.8 billion
    total_hewan: stats?.total_hewan || 521,
    kabupaten_coverage: stats?.kabupaten_coverage || 20,
    sapi: 298,
    kambing: 165,
    domba: 58,
    completion_rate: 87.5,
    period: 'Idul Adha 1446H'
  };

  const cards = [
    {
      title: 'Total Penerima',
      value: enhancedStats.total_penerima.toLocaleString('id-ID'),
      subtitle: 'Keluarga',
      icon: Users,
      color: 'blue',
      progress: 87.5,
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Total Nilai Qurban',
      value: formatCurrency(enhancedStats.total_nilai),
      subtitle: 'Rupiah',
      icon: TrendingUp,
      color: 'green',
      progress: 92.3,
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Total Hewan Qurban',
      value: enhancedStats.total_hewan.toString(),
      subtitle: 'Ekor',
      icon: Target,
      color: 'purple',
      progress: 89.1,
      change: '+15%',
      trend: 'up',
      breakdown: [
        { label: 'Sapi', value: enhancedStats.sapi, color: 'bg-red-500' },
        { label: 'Kambing', value: enhancedStats.kambing, color: 'bg-orange-500' },
        { label: 'Domba', value: enhancedStats.domba, color: 'bg-yellow-500' }
      ]
    },
    {
      title: 'Sebaran Wilayah',
      value: enhancedStats.kabupaten_coverage.toString(),
      subtitle: 'Kabupaten/Kota',
      icon: MapPin,
      color: 'indigo',
      progress: 76.9,
      change: '+5 baru',
      trend: 'up'
    },
    {
      title: 'Tingkat Penyelesaian',
      value: `${enhancedStats.completion_rate}%`,
      subtitle: 'Distribusi',
      icon: PieChart,
      color: 'emerald',
      progress: enhancedStats.completion_rate,
      change: 'On Track',
      trend: 'stable'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 border-blue-200 bg-blue-50',
      green: 'bg-green-500 text-green-600 border-green-200 bg-green-50',
      purple: 'bg-purple-500 text-purple-600 border-purple-200 bg-purple-50',
      indigo: 'bg-indigo-500 text-indigo-600 border-indigo-200 bg-indigo-50',
      emerald: 'bg-emerald-500 text-emerald-600 border-emerald-200 bg-emerald-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '↗️';
    if (trend === 'down') return '↘️';
    return '➡️';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                <div className="w-12 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="w-full h-6 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                <div className="w-full h-2 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card, index) => {
        const colorClasses = getColorClasses(card.color);
        const [bgColor, textColor, borderColor, cardBg] = colorClasses.split(' ');
        
        return (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-lg border ${borderColor} p-6 hover:shadow-xl transition-shadow duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className={`px-2 py-1 ${cardBg} ${textColor} text-xs font-medium rounded-full flex items-center`}>
                {getTrendIcon(card.trend)}
                <span className="ml-1">{card.change}</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                <span className="text-sm text-gray-500 pb-1">{card.subtitle}</span>
              </div>
            </div>

            {/* Breakdown for Hewan Qurban */}
            {card.breakdown && (
              <div className="mt-4 space-y-2">
                <div className="text-xs font-medium text-gray-600 mb-2">Breakdown:</div>
                {card.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 ${item.color} rounded-full`}></div>
                      <span className="text-gray-600">{item.label}</span>
                    </div>
                    <span className="font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{card.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${bgColor} h-2 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${card.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Total Nilai Qurban Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-white/20 rounded-lg p-3">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Total Nilai Qurban</div>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-8 bg-white/20 rounded animate-pulse"></div>
              ) : (
                formatCurrency(stats.total_nilai_qurban)
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm opacity-90">
          <span>Terkumpul dari {stats.total_muzakki} muzakki</span>
          <TrendingUp className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default EnhancedStatsCards; 