import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

interface ProvinsiData {
  provinsi: string;
  count: number;
  percentage: number;
  color: string;
}

interface SimpleIndonesiaMapProps {
  data: ProvinsiData[];
  totalPenerima: number;
  kabupatenCoverage: number;
}

const SimpleIndonesiaMap: React.FC<SimpleIndonesiaMapProps> = ({ 
  data, 
  totalPenerima, 
  kabupatenCoverage 
}) => {
  const [hoveredProvinsi, setHoveredProvinsi] = useState<string | null>(null);

  // Create a map for quick lookup
  const dataMap = data.reduce((acc, item) => {
    acc[item.provinsi] = item;
    return acc;
  }, {} as Record<string, ProvinsiData>);

  // Simplified Indonesia provinces with relative positioning
  const provinces = [
    { name: 'DKI Jakarta', x: 35, y: 60, width: 8, height: 8 },
    { name: 'Jawa Barat', x: 30, y: 65, width: 12, height: 8 },
    { name: 'Jawa Tengah', x: 42, y: 65, width: 15, height: 8 },
    { name: 'Jawa Timur', x: 57, y: 65, width: 18, height: 8 },
    { name: 'Sumatera Utara', x: 10, y: 20, width: 12, height: 15 },
    { name: 'Sumatera Barat', x: 8, y: 35, width: 10, height: 12 },
    { name: 'Sumatera Selatan', x: 15, y: 47, width: 12, height: 10 },
    { name: 'Kalimantan Timur', x: 60, y: 30, width: 15, height: 20 },
    { name: 'Kalimantan Selatan', x: 55, y: 50, width: 12, height: 10 },
    { name: 'Sulawesi Selatan', x: 65, y: 45, width: 10, height: 15 },
    { name: 'Papua', x: 75, y: 40, width: 20, height: 25 },
    { name: 'NTT', x: 65, y: 70, width: 8, height: 6 },
    { name: 'Bali', x: 58, y: 70, width: 6, height: 4 }
  ];

  const getProvinsiColor = (provinsiName: string) => {
    const provinsiData = dataMap[provinsiName];
    if (!provinsiData) return '#e5e7eb'; // Gray for no data
    return provinsiData.color;
  };

  const getProvinsiOpacity = (provinsiName: string) => {
    const provinsiData = dataMap[provinsiName];
    if (!provinsiData) return 0.3;
    return Math.max(0.4, Math.min(1, provinsiData.count / 10)); // Scale opacity based on count
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-blue-200 h-[400px] overflow-hidden">
        
        {/* Map Title */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-500" />
              Indonesia Qurban Distribution
            </h3>
            <p className="text-sm text-gray-600">
              {totalPenerima} penerima di {kabupatenCoverage} kabupaten
            </p>
          </div>
        </div>

        {/* Simplified SVG Map */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' }}
        >
          {/* Ocean background */}
          <rect width="100" height="100" fill="#bfdbfe" opacity="0.3" />
          
          {/* Islands/Provinces */}
          {provinces.map((province) => (
            <g key={province.name}>
              {/* Province shape */}
              <rect
                x={province.x}
                y={province.y}
                width={province.width}
                height={province.height}
                fill={getProvinsiColor(province.name)}
                opacity={getProvinsiOpacity(province.name)}
                stroke="#374151"
                strokeWidth="0.2"
                rx="1"
                className="transition-all duration-300 cursor-pointer hover:stroke-2 hover:opacity-100"
                onMouseEnter={() => setHoveredProvinsi(province.name)}
                onMouseLeave={() => setHoveredProvinsi(null)}
              />
              
              {/* Province label for major ones */}
              {dataMap[province.name] && (
                <text
                  x={province.x + province.width / 2}
                  y={province.y + province.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="2"
                  fill="#1f2937"
                  className="pointer-events-none font-medium"
                >
                  {dataMap[province.name].count}
                </text>
              )}
            </g>
          ))}
          
          {/* Distribution points */}
          {data.slice(0, 3).map((item, index) => {
            const province = provinces.find(p => p.name === item.provinsi);
            if (!province) return null;
            
            return (
              <circle
                key={`point-${index}`}
                cx={province.x + province.width / 2}
                cy={province.y + province.height / 2}
                r={Math.max(1, Math.min(3, item.count / 2))}
                fill="#ef4444"
                opacity="0.8"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredProvinsi && dataMap[hoveredProvinsi] && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 border z-20">
            <div className="text-sm font-semibold text-gray-900">
              {hoveredProvinsi}
            </div>
            <div className="text-xs text-gray-600">
              {dataMap[hoveredProvinsi].count} penerima ({dataMap[hoveredProvinsi].percentage}%)
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-xs font-semibold text-gray-700 mb-2">Intensitas Distribusi</div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span className="text-xs text-gray-600">Rendah</span>
            <div className="w-3 h-3 bg-blue-400 rounded"></div>
            <span className="text-xs text-gray-600">Sedang</span>
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Tinggi</span>
          </div>
        </div>

        {/* Statistics overlay */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalPenerima}
            </div>
            <div className="text-xs text-gray-600">Total Penerima</div>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          Interactive map menampilkan distribusi real-time
        </div>
        <div>
          Hover untuk detail provinsi
        </div>
      </div>
    </div>
  );
};

export default SimpleIndonesiaMap; 