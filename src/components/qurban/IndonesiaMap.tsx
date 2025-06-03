import React, { useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ProvinsiData {
  provinsi: string;
  count: number;
  percentage: number;
  color: string;
}

interface IndonesiaMapProps {
  data: ProvinsiData[];
  totalPenerima: number;
  kabupatenCoverage: number;
}

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ 
  data, 
  totalPenerima, 
  kabupatenCoverage 
}) => {
  const [hoveredProvinsi, setHoveredProvinsi] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  // Create a map for quick lookup
  const dataMap = data.reduce((acc, item) => {
    acc[item.provinsi] = item;
    return acc;
  }, {} as Record<string, ProvinsiData>);

  // Simplified Indonesia provinces with better positioning
  const provinces = [
    // Java (main distribution area)
    { name: 'DKI Jakarta', x: 280, y: 180, width: 15, height: 10, active: true },
    { name: 'Jawa Barat', x: 260, y: 180, width: 40, height: 15, active: true },
    { name: 'Jawa Tengah', x: 300, y: 180, width: 45, height: 15, active: true },
    { name: 'Jawa Timur', x: 345, y: 180, width: 55, height: 15, active: true },
    
    // Sumatera
    { name: 'Sumatera Utara', x: 180, y: 80, width: 35, height: 40, active: false },
    { name: 'Sumatera Barat', x: 160, y: 120, width: 25, height: 30, active: false },
    { name: 'Sumatera Selatan', x: 170, y: 150, width: 30, height: 25, active: false },
    
    // Kalimantan
    { name: 'Kalimantan Timur', x: 380, y: 100, width: 40, height: 50, active: false },
    { name: 'Kalimantan Selatan', x: 360, y: 140, width: 35, height: 30, active: false },
    
    // Sulawesi
    { name: 'Sulawesi Selatan', x: 420, y: 140, width: 30, height: 40, active: false },
    
    // Others
    { name: 'NTT', x: 420, y: 200, width: 25, height: 15, active: false },
    { name: 'Bali', x: 390, y: 190, width: 15, height: 10, active: false }
  ];

  const getProvinsiColor = (provinsiName: string, isActive: boolean) => {
    if (!isActive) return '#e5e7eb'; // Gray for inactive
    const provinsiData = dataMap[provinsiName];
    if (!provinsiData) return '#f3f4f6'; // Light gray for no data
    return provinsiData.color || '#3b82f6'; // Blue default
  };

  const getProvinsiOpacity = (provinsiName: string, isActive: boolean) => {
    if (!isActive) return 0.3;
    const provinsiData = dataMap[provinsiName];
    if (!provinsiData) return 0.4;
    return 0.8;
  };

  const handleZoom = (delta: number) => {
    const newZoom = Math.max(0.8, Math.min(2, zoom + delta));
    setZoom(newZoom);
  };

  const resetView = () => {
    setZoom(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
            Peta Distribusi Indonesia
          </h2>
          <p className="text-sm text-gray-600">
            {totalPenerima} penerima di {kabupatenCoverage} kabupaten
          </p>
        </div>
        
        {/* Map Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleZoom(0.2)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.2)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[400px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-blue-200 overflow-hidden">
        
        {/* SVG Map */}
        <svg
          viewBox="0 0 600 300"
          className="w-full h-full"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center'
          }}
        >
          {/* Ocean Background */}
          <rect width="600" height="300" fill="#bfdbfe" opacity="0.2" />
          
          {/* Islands/Provinces */}
          {provinces.map((province) => (
            <g key={province.name}>
              {/* Province Shape */}
              <rect
                x={province.x}
                y={province.y}
                width={province.width}
                height={province.height}
                fill={getProvinsiColor(province.name, province.active)}
                opacity={getProvinsiOpacity(province.name, province.active)}
                stroke="#374151"
                strokeWidth="1"
                rx="3"
                className="transition-all duration-300 cursor-pointer hover:stroke-2 hover:opacity-100"
                onMouseEnter={() => setHoveredProvinsi(province.name)}
                onMouseLeave={() => setHoveredProvinsi(null)}
              />
              
              {/* Province Label */}
              {dataMap[province.name] && province.active && (
                <text
                  x={province.x + province.width / 2}
                  y={province.y + province.height / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#1f2937"
                  className="pointer-events-none font-medium"
                >
                  {dataMap[province.name].count}
                </text>
              )}
              
              {/* Province Name */}
              {province.active && (
                <text
                  x={province.x + province.width / 2}
                  y={province.y + province.height + 12}
                  textAnchor="middle"
                  fontSize="8"
                  fill="#6b7280"
                  className="pointer-events-none"
                >
                  {province.name}
                </text>
              )}
            </g>
          ))}
          
          {/* Distribution Points */}
          {data.slice(0, 4).map((item, index) => {
            const province = provinces.find(p => p.name === item.provinsi && p.active);
            if (!province) return null;
            
            return (
              <circle
                key={`point-${index}`}
                cx={province.x + province.width / 2}
                cy={province.y + province.height / 2}
                r={Math.max(3, Math.min(8, item.count))}
                fill="#ef4444"
                opacity="0.7"
                className="animate-pulse"
              />
            );
          })}
        </svg>

        {/* Hover Tooltip */}
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
          <div className="text-xs font-semibold text-gray-700 mb-2">Area Distribusi</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Aktif</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-xs text-gray-600">Belum aktif</span>
            </div>
          </div>
        </div>

        {/* Statistics Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {totalPenerima}
            </div>
            <div className="text-xs text-gray-600">Total Penerima</div>
          </div>
        </div>
      </div>

      {/* Map Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div>
          📍 Fokus distribusi di wilayah Jawa • 🔍 Zoom untuk detail
        </div>
        <div>
          {data.filter(d => provinces.find(p => p.name === d.provinsi && p.active)).length} provinsi aktif
        </div>
      </div>
    </div>
  );
};

export default IndonesiaMap; 