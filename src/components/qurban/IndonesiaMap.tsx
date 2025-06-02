import React from 'react';
import { MapPin, Users, Heart } from 'lucide-react';
import { KabupatenData } from '../../types/qurban';

interface IndonesiaMapProps {
  data: KabupatenData[] | null;
  loading: boolean;
  onKabupatenClick?: (kabupaten: KabupatenData) => void;
}

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ data, loading, onKabupatenClick }) => {
  // Mock data for demonstration
  const mockKabupatenData = [
    { name: 'Jakarta Pusat', penerima: 450, hewan: 85, mitra: ['LAZIS', 'BAZNAS'] },
    { name: 'Surabaya', penerima: 320, hewan: 62, mitra: ['LAZIS'] },
    { name: 'Bandung', penerima: 280, hewan: 48, mitra: ['BAZNAS'] },
    { name: 'Medan', penerima: 190, hewan: 35, mitra: ['LAZIS'] },
    { name: 'Makassar', penerima: 150, hewan: 28, mitra: ['BAZNAS'] },
    { name: 'Yogyakarta', penerima: 140, hewan: 25, mitra: ['LAZIS', 'BAZNAS'] },
  ];

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
      {/* Map Placeholder */}
      <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Peta Indonesia Interaktif
            </h3>
            <p className="text-gray-500 text-sm max-w-md">
              Peta distribusi qurban per kabupaten akan ditampilkan di sini
              menggunakan Leaflet dengan data GeoJSON Indonesia
            </p>
          </div>
        </div>
        
        {/* Mock map points */}
        <div className="absolute top-20 left-32 w-4 h-4 bg-red-500 rounded-full animate-pulse" title="Jakarta"></div>
        <div className="absolute top-32 right-40 w-3 h-3 bg-blue-500 rounded-full animate-pulse" title="Surabaya"></div>
        <div className="absolute top-28 left-20 w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Bandung"></div>
        <div className="absolute top-16 left-16 w-2 h-2 bg-purple-500 rounded-full animate-pulse" title="Medan"></div>
        <div className="absolute bottom-20 right-32 w-3 h-3 bg-orange-500 rounded-full animate-pulse" title="Makassar"></div>
      </div>

      {/* Kabupaten List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockKabupatenData.map((kabupaten, index) => (
          <div
            key={index}
            onClick={() => onKabupatenClick && onKabupatenClick(kabupaten as any)}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{kabupaten.name}</h4>
              <div className="flex space-x-1">
                {kabupaten.mitra.map((mitra, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-1 text-xs rounded-full ${
                      mitra === 'LAZIS' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {mitra}
                  </span>
                ))}
              </div>
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
          </div>
        ))}
      </div>

      {/* Map Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Keterangan Peta</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>1000+ Penerima</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>500-999 Penerima</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>100-499 Penerima</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>1-99 Penerima</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndonesiaMap; 