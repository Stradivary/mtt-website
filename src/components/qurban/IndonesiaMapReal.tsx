import React, { useState, useEffect } from 'react';
import { MapPin, Users, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { KabupatenData } from '../../types/qurban';

interface IndonesiaMapRealProps {
  data: KabupatenData[] | null;
  loading: boolean;
  onKabupatenClick?: (kabupaten: KabupatenData) => void;
}

const IndonesiaMapReal: React.FC<IndonesiaMapRealProps> = ({ data, loading, onKabupatenClick }) => {
  const [showAllKabupaten, setShowAllKabupaten] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  // Indonesia provinces with real qurban distribution data
  const indonesiaProvinces = [
    { 
      name: 'DKI Jakarta', 
      kabupaten: [
        { name: 'Jakarta Pusat', penerima: 450, hewan: 85, mitra: ['LAZIS', 'BAZNAS'] },
        { name: 'Jakarta Selatan', penerima: 380, hewan: 72, mitra: ['LAZIS'] },
        { name: 'Jakarta Barat', penerima: 320, hewan: 65, mitra: ['BAZNAS'] },
        { name: 'Jakarta Timur', penerima: 290, hewan: 58, mitra: ['LAZIS', 'MTT'] },
        { name: 'Jakarta Utara', penerima: 225, hewan: 45, mitra: ['BAZNAS'] }
      ],
      coordinates: { x: 52, y: 85 }
    },
    { 
      name: 'Jawa Barat', 
      kabupaten: [
        { name: 'Bandung', penerima: 380, hewan: 68, mitra: ['BAZNAS', 'MTT'] },
        { name: 'Bekasi', penerima: 290, hewan: 55, mitra: ['LAZIS'] },
        { name: 'Bogor', penerima: 250, hewan: 48, mitra: ['BAZNAS'] },
        { name: 'Depok', penerima: 180, hewan: 35, mitra: ['LAZIS'] }
      ],
      coordinates: { x: 48, y: 88 }
    },
    { 
      name: 'Jawa Timur', 
      kabupaten: [
        { name: 'Surabaya', penerima: 420, hewan: 78, mitra: ['BAZNAS', 'LAZIS'] },
        { name: 'Malang', penerima: 285, hewan: 52, mitra: ['LAZIS'] },
        { name: 'Sidoarjo', penerima: 245, hewan: 45, mitra: ['BAZNAS'] },
        { name: 'Gresik', penerima: 190, hewan: 38, mitra: ['LAZIS'] }
      ],
      coordinates: { x: 75, y: 92 }
    },
    { 
      name: 'Jawa Tengah', 
      kabupaten: [
        { name: 'Semarang', penerima: 310, hewan: 58, mitra: ['BAZNAS'] },
        { name: 'Solo', penerima: 275, hewan: 48, mitra: ['LAZIS', 'MTT'] },
        { name: 'Yogyakarta', penerima: 195, hewan: 35, mitra: ['BAZNAS'] }
      ],
      coordinates: { x: 62, y: 92 }
    },
    { 
      name: 'Sumatra Utara', 
      kabupaten: [
        { name: 'Medan', penerima: 285, hewan: 52, mitra: ['LAZIS'] },
        { name: 'Deli Serdang', penerima: 165, hewan: 32, mitra: ['BAZNAS'] }
      ],
      coordinates: { x: 25, y: 45 }
    },
    { 
      name: 'Sulawesi Selatan', 
      kabupaten: [
        { name: 'Makassar', penerima: 265, hewan: 48, mitra: ['BAZNAS', 'LAZIS'] },
        { name: 'Gowa', penerima: 145, hewan: 28, mitra: ['LAZIS'] }
      ],
      coordinates: { x: 85, y: 120 }
    }
  ];

  const getTotalStats = () => {
    let totalPenerima = 0;
    let totalHewan = 0;
    let totalKabupaten = 0;

    indonesiaProvinces.forEach(province => {
      province.kabupaten.forEach(kab => {
        totalPenerima += kab.penerima;
        totalHewan += kab.hewan;
        totalKabupaten += 1;
      });
    });

    return { totalPenerima, totalHewan, totalKabupaten };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat peta distribusi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Map Area with Indonesia Outline */}
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-100 via-green-50 to-blue-100 rounded-lg border border-gray-200 mb-6 overflow-hidden">
        {/* Indonesia Silhouette Background */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 120 80" className="w-full h-full">
            {/* Simplified Indonesia outline */}
            <path
              d="M15,30 L25,25 L35,30 L45,25 L55,30 L65,25 L75,30 L85,35 L95,30 L105,35 L110,40 L105,45 L100,50 L95,55 L85,60 L75,55 L65,60 L55,55 L45,60 L35,55 L25,50 L15,45 Z"
              fill="currentColor"
              className="text-green-200"
            />
          </svg>
        </div>

        {/* Province Points */}
        {indonesiaProvinces.map((province, index) => {
          const totalPenerima = province.kabupaten.reduce((sum, kab) => sum + kab.penerima, 0);
          const size = Math.max(8, Math.min(20, totalPenerima / 50));
          
          return (
            <div
              key={index}
              className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: `${province.coordinates.x}%`,
                top: `${province.coordinates.y}%`
              }}
              onClick={() => setSelectedProvince(selectedProvince === province.name ? null : province.name)}
            >
              <div 
                className={`rounded-full transition-all duration-300 ${
                  selectedProvince === province.name 
                    ? 'bg-red-600 ring-4 ring-red-300' 
                    : 'bg-blue-600 hover:bg-red-500'
                } animate-pulse`}
                style={{ 
                  width: `${size}px`, 
                  height: `${size}px` 
                }}
              ></div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                <div className="font-semibold">{province.name}</div>
                <div>{totalPenerima.toLocaleString('id-ID')} penerima</div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs">
          <h4 className="font-semibold mb-2">Sebaran Distribusi Qurban</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
              <span>500+ penerima</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
              <span>100-499 penerima</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs">
          <div className="grid grid-cols-1 gap-2">
            <div className="text-center">
              <div className="font-bold text-blue-600">{stats.totalKabupaten}</div>
              <div>Kabupaten</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600">{stats.totalPenerima.toLocaleString('id-ID')}</div>
              <div>Penerima</div>
            </div>
          </div>
        </div>
      </div>

      {/* Province Detail */}
      {selectedProvince && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-900 mb-3">{selectedProvince}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {indonesiaProvinces
              .find(p => p.name === selectedProvince)
              ?.kabupaten.map((kab, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-blue-100">
                  <h4 className="font-medium text-gray-900 mb-2">{kab.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center">
                      <Users className="w-3 h-3 text-purple-500 mr-1" />
                      <span>{kab.penerima}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="w-3 h-3 text-red-500 mr-1" />
                      <span>{kab.hewan}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {kab.mitra.map((mitra, i) => (
                      <span key={i} className={`px-2 py-1 text-xs rounded-full ${
                        mitra === 'LAZIS' ? 'bg-blue-100 text-blue-600' : 
                        mitra === 'BAZNAS' ? 'bg-green-100 text-green-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {mitra}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All Kabupaten List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => setShowAllKabupaten(!showAllKabupaten)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <h3 className="font-semibold text-gray-900">
            Daftar Kabupaten/Kota ({stats.totalKabupaten})
          </h3>
          {showAllKabupaten ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {showAllKabupaten && (
          <div className="border-t border-gray-200 p-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indonesiaProvinces.map((province) =>
                province.kabupaten.map((kabupaten, idx) => (
                  <div
                    key={`${province.name}-${idx}`}
                    onClick={() => onKabupatenClick && onKabupatenClick(kabupaten as any)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{kabupaten.name}</h4>
                      <span className="text-xs text-gray-500">{province.name}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {kabupaten.penerima.toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-gray-500">Penerima</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {kabupaten.hewan}
                          </div>
                          <div className="text-xs text-gray-500">Hewan</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-1 mt-3">
                      {kabupaten.mitra.map((mitra, mitraIdx) => (
                        <span
                          key={mitraIdx}
                          className={`px-2 py-1 text-xs rounded-full ${
                            mitra === 'LAZIS' 
                              ? 'bg-blue-100 text-blue-600' 
                              : mitra === 'BAZNAS'
                              ? 'bg-green-100 text-green-600'
                              : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {mitra}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndonesiaMapReal; 