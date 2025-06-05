import React from 'react';
import { Users, TrendingUp, MapPin, Target } from 'lucide-react';
import { DashboardStats } from '../../types/qurban';

interface StatsCardsProps {
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

// Get animal icon with badge support
const getAnimalIcon = (jenis: string): JSX.Element => {
  const iconStyle = "text-2xl";
  
  switch (jenis.toLowerCase()) {
    case 'sapi':
      return <span className={iconStyle}>🐄</span>;
    case 'sapi 1/7':
      return (
        <div className="relative inline-block">
          <span className={iconStyle}>🐄</span>
          <span className="absolute -bottom-1 -right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded-lg font-medium leading-none">
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, index) => (
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
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {/* Main Stats Cards */}
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
            <div className="space-y-1">
              <div className="text-3xl font-bold text-gray-900 leading-none whitespace-nowrap">{card.value}</div>
              <div className="text-sm text-gray-500">{card.subtitle}</div>
            </div>
          </div>
        </div>
      ))}

      {/* Animal Breakdown Card - Showing all supported animal types */}
      {orderedAnimals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
          {/* Content */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Jenis Hewan Qurban</h3>
            <div className="space-y-3">
              {orderedAnimals.map(({ jenis, count }) => (
                <div key={jenis} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      {getAnimalIcon(jenis)}
                    </div>
                    <span className="text-base font-medium text-gray-700">{getAnimalDisplayName(jenis)}</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
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