import React from 'react';
import { Users, TrendingUp, MapPin, Target } from 'lucide-react';
import { DashboardStats } from '../../types/qurban';

interface StatsCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
  animalBreakdown?: Record<string, number>;
  mitraCount?: number;
  totalDagingPaket?: number;
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

// Get animal icon with badge support
const getAnimalIcon = (jenis: string): JSX.Element => {
  const iconStyle = "text-3xl sm:text-4xl lg:text-5xl";
  
  switch (jenis.toLowerCase()) {
    case 'sapi':
      return <span className={iconStyle}>🐄</span>;
    case 'sapi 1/7':
      return (
        <div className="relative inline-block">
          <span className={iconStyle}>🐄</span>
          <span className="absolute -bottom-1 -right-1 bg-black bg-opacity-70 text-white text-xs sm:text-sm px-1.5 py-0.5 rounded-lg font-medium leading-none">
            1/7
          </span>
        </div>
      );
    case 'domba':
      return <span className={iconStyle}>🐑</span>;
    default:
      return <span className={iconStyle}>🐄</span>;
  }
};

// Get display name for animals
const getAnimalDisplayName = (jenis: string): string => {
  switch (jenis.toLowerCase()) {
    case 'sapi':
      return 'Sapi';
    case 'sapi 1/7':
      return 'Sapi 1/7';
    case 'domba':
      return 'Domba';
    default:
      return jenis;
  }
};

const StatsCards: React.FC<StatsCardsProps> = ({ 
  stats, 
  loading, 
  animalBreakdown = {}, 
  mitraCount = 0,
  totalDagingPaket = 0
}) => {
  const cards = [
    {
      title: 'Total Pequrban',
      value: stats?.total_muzakki?.toLocaleString('id-ID') || '0',
      subtitle: 'Donatur',
      icon: Users,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Penerima',
      value: Math.round(totalDagingPaket).toLocaleString('id-ID') || '0',
      subtitle: 'Paket',
      icon: Target,
      color: 'from-red-600 to-red-700',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Nilai Qurban',
      value: formatCurrency(stats?.total_nilai_qurban || 0),
      subtitle: 'Terkumpul',
      icon: TrendingUp,
      color: 'from-red-700 to-red-800',
      textColor: 'text-red-800',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Sebaran Wilayah',
      value: stats?.kabupaten_coverage?.toString() || '0',
      subtitle: 'Kabupaten',
      icon: MapPin,
      color: 'from-red-400 to-red-500',
      textColor: 'text-red-500',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Mitra',
      value: mitraCount?.toLocaleString('id-ID') || '0',
      subtitle: 'Partner',
      icon: Target,
      color: 'from-red-800 to-red-900',
      textColor: 'text-red-900',
      bgColor: 'bg-red-50'
    }
  ];

  // Process animal breakdown: ensure proper order and include all animal types
  const processAnimalBreakdown = () => {
    console.log('🐄 StatsCards: Processing animal breakdown:', animalBreakdown);
    
    // Include ALL animal types, don't filter out anything
    const allEntries = Object.entries(animalBreakdown);
    
    // Create a map to store the results
    const result: Record<string, number> = {};
    
    // Add all existing entries
    allEntries.forEach(([jenis, count]) => {
      result[jenis] = count;
    });
    
    // Ensure all animal types are represented, even with 0 count
    const supportedAnimals = ['Sapi', 'Sapi 1/7', 'Domba'];
    supportedAnimals.forEach(animal => {
      // Check if animal exists (case insensitive)
      const exists = Object.keys(result).some(key => key.toLowerCase() === animal.toLowerCase());
      if (!exists) {
        result[animal] = 0;
      }
    });
    
    console.log('🐄 StatsCards: Processed breakdown:', result);
    return result;
  };

  const processedAnimalBreakdown = processAnimalBreakdown();

  // Define display order: Sapi, Sapi 1/7, Domba
  const animalOrder = ['sapi', 'sapi 1/7', 'domba'];
  
  const orderedAnimals = animalOrder
    .map(animalType => {
      // Find matching entry (case insensitive)
      const entry = Object.entries(processedAnimalBreakdown)
        .find(([jenis]) => jenis.toLowerCase() === animalType);
      
      return entry ? { jenis: entry[0], count: entry[1] } : null;
    })
    .filter(Boolean) as { jenis: string; count: number }[];

  console.log('🐄 StatsCards: Ordered animals for display:', orderedAnimals);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gray-300 rounded-lg sm:rounded-xl"></div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="w-full h-4 sm:h-5 lg:h-6 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-3 sm:h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
      {/* Main Stats Cards */}
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${card.color} rounded-lg sm:rounded-xl flex items-center justify-center`}>
              <card.icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600">{card.title}</h3>
            <div className="space-y-1">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-none whitespace-nowrap">{card.value}</div>
              <div className="text-xs sm:text-sm text-gray-500">{card.subtitle}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Animal Breakdown Card - Mobile optimized with better space utilization */}
      {orderedAnimals.length > 0 && (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 col-span-1 sm:col-span-2 md:col-span-1 xl:col-span-1">
          {/* Content */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-3 sm:mb-4">Jenis Hewan Qurban</h3>
            <div className="space-y-3 sm:space-y-4">
              {orderedAnimals.map(({ jenis, count }) => (
                <div key={jenis} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0">
                      {getAnimalIcon(jenis)}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">{getAnimalDisplayName(jenis)}</span>
                  </div>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex-shrink-0 ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCards; 