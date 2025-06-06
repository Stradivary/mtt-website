import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, ZoomIn, ZoomOut, RotateCcw, AlertTriangle, BarChart3 } from 'lucide-react';

// Fix for Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  totalDagingPaket?: number; // Add optional prop for total daging calculation
}

// Component to handle map controls and error detection
const MapController = ({ onMapReady, onError }: { 
  onMapReady: (map: L.Map) => void;
  onError: (error: string) => void;
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      try {
      onMapReady(map);
        
        // Check for tile loading errors
        map.on('tileerror', (e) => {
          console.warn('Tile loading error:', e);
        });
        
        // Timeout to check if map loaded properly
        const timeoutId = setTimeout(() => {
          const container = map.getContainer();
          const tiles = container.querySelectorAll('.leaflet-tile');
          if (tiles.length === 0) {
            console.warn('Map tiles not loading - timeout');
          }
        }, 5000);
        
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error('Map initialization error:', error);
        onError('Map initialization failed');
      }
    }
  }, [map, onMapReady, onError]);

  return null;
};

// Province coordinates for markers - Updated with more accurate coordinates (capital cities)
const provinceCoordinates: Record<string, [number, number]> = {
  // Sumatera
  'Aceh': [5.5477, 95.3238], // Banda Aceh
  'Sumatera Utara': [3.5952, 98.6722], // Medan - VERIFIED
  'Sumatera Barat': [-0.9471, 100.4172], // Padang
  'Riau': [0.5071, 101.4478], // Pekanbaru
  'Kepulauan Riau': [1.1456, 104.0305], // Tanjung Pinang
  'Jambi': [-1.6101, 103.6131], // Jambi
  'Sumatera Selatan': [-2.9761, 104.7754], // Palembang
  'Bangka Belitung': [-2.1384, 106.1171], // Pangkal Pinang
  'Bengkulu': [-3.8004, 102.2655], // Bengkulu
  'Lampung': [-5.4502, 105.2670], // Bandar Lampung
  
  // Jawa
  'DKI Jakarta': [-6.2088, 106.8456], // Jakarta
  'Jawa Barat': [-6.9147, 107.6098], // Bandung
  'Banten': [-6.1200, 106.1500], // Serang
  'Jawa Tengah': [-7.7956, 110.3695], // Semarang  
  'DI Yogyakarta': [-7.7956, 110.3695], // Yogyakarta
  'Jawa Timur': [-7.2504, 112.7688], // Surabaya
  
  // Kalimantan
  'Kalimantan Barat': [-0.0263, 109.3425], // Pontianak
  'Kalimantan Tengah': [-2.2081, 113.9211], // Palangka Raya
  'Kalimantan Selatan': [-3.3186, 114.5942], // Banjarmasin
  'Kalimantan Timur': [-0.5017, 117.1536], // Samarinda
  'Kalimantan Utara': [3.0730, 116.0413], // Tanjung Selor
  
  // Sulawesi
  'Sulawesi Utara': [1.4748, 124.8421], // Manado
  'Sulawesi Tengah': [-0.8999, 119.8707], // Palu
  'Sulawesi Selatan': [-5.1477, 119.4327], // Makassar
  'Sulawesi Tenggara': [-4.1401, 122.1748], // Kendari
  'Gorontalo': [0.5435, 123.0682], // Gorontalo
  'Sulawesi Barat': [-2.6707, 118.8987], // Mamuju
  
  // Bali & Nusa Tenggara
  'Bali': [-8.6705, 115.2126], // Denpasar
  'Nusa Tenggara Barat': [-8.5833, 116.1167], // Mataram
  'Nusa Tenggara Timur': [-10.1772, 123.6070], // Kupang - VERIFIED NTT
  
  // Maluku
  'Maluku': [-3.6954, 128.1814], // Ambon
  'Maluku Utara': [0.7893, 127.3815], // Ternate
  
  // Papua
  'Papua': [-2.5489, 140.7156], // Jayapura
  'Papua Barat': [-0.8614, 134.0758], // Manokwari
  'Papua Tengah': [-4.0648, 136.2672], // Nabire
  'Papua Pegunungan': [-4.0648, 138.5801], // Wamena
  'Papua Selatan': [-6.0882, 140.7713], // Merauke
  'Papua Barat Daya': [-1.9345, 132.2755] // Sorong
};

// Province name mapping to handle variations in data
const provinceNameMapping: Record<string, string> = {
  // Handle alternative names - Enhanced mapping
  'Jakarta': 'DKI Jakarta',
  'DIY': 'DI Yogyakarta',
  'Yogyakarta': 'DI Yogyakarta',
  'Jogja': 'DI Yogyakarta',
  'Yogya': 'DI Yogyakarta',
  
  // Sumatera variations - ENHANCED
  'Sumatra Utara': 'Sumatera Utara',
  'Sumut': 'Sumatera Utara',
  'SUMUT': 'Sumatera Utara',
  'Sum Ut': 'Sumatera Utara',
  'Sumatra_Utara': 'Sumatera Utara',
  
  'Sumatra Barat': 'Sumatera Barat',
  'Sumbar': 'Sumatera Barat',
  'SUMBAR': 'Sumatera Barat',
  'Sum Bar': 'Sumatera Barat',
  
  'Sumatra Selatan': 'Sumatera Selatan',
  'Sumsel': 'Sumatera Selatan',
  'SUMSEL': 'Sumatera Selatan',
  'Sum Sel': 'Sumatera Selatan',
  
  // NTT variations - ENHANCED  
  'NTT': 'Nusa Tenggara Timur',
  'NT Timur': 'Nusa Tenggara Timur',
  'NusaTenggaraTimur': 'Nusa Tenggara Timur',
  'Nusa_Tenggara_Timur': 'Nusa Tenggara Timur',
  'NUSA TENGGARA TIMUR': 'Nusa Tenggara Timur',
  'nusa tenggara timur': 'Nusa Tenggara Timur',
  
  // NTB variations
  'NTB': 'Nusa Tenggara Barat',
  'NT Barat': 'Nusa Tenggara Barat',
  'NusaTenggaraBarat': 'Nusa Tenggara Barat',
  'Nusa_Tenggara_Barat': 'Nusa Tenggara Barat',
  'NUSA TENGGARA BARAT': 'Nusa Tenggara Barat',
  'nusa tenggara barat': 'Nusa Tenggara Barat',
  
  // Kalimantan variations
  'Kaltim': 'Kalimantan Timur',
  'Kalbar': 'Kalimantan Barat',
  'Kalteng': 'Kalimantan Tengah',
  'Kalsel': 'Kalimantan Selatan',
  'Kaltara': 'Kalimantan Utara',
  'KALTIM': 'Kalimantan Timur',
  'KALBAR': 'Kalimantan Barat',
  'KALTENG': 'Kalimantan Tengah',
  'KALSEL': 'Kalimantan Selatan',
  'KALTARA': 'Kalimantan Utara',
  
  // Sulawesi variations  
  'Sulut': 'Sulawesi Utara',
  'Sulteng': 'Sulawesi Tengah',
  'Sulsel': 'Sulawesi Selatan',
  'Sultra': 'Sulawesi Tenggara',
  'Sulbar': 'Sulawesi Barat',
  'SULUT': 'Sulawesi Utara',
  'SULTENG': 'Sulawesi Tengah',
  'SULSEL': 'Sulawesi Selatan',
  'SULTRA': 'Sulawesi Tenggara',
  'SULBAR': 'Sulawesi Barat',
  
  // Other variations
  'Babel': 'Bangka Belitung',
  'Kepri': 'Kepulauan Riau',
  'BABEL': 'Bangka Belitung',
  'KEPRI': 'Kepulauan Riau',
  'Bangka_Belitung': 'Bangka Belitung',
  'Kepulauan_Riau': 'Kepulauan Riau',
  
  // Handle generic names by mapping to most common/representative
  'Sulawesi': 'Sulawesi Selatan',
  'Kalimantan': 'Kalimantan Timur', // Map generic Kalimantan to Kaltim
  
  // Handle exact matches (passthrough) - Updated with all provinces
  'Aceh': 'Aceh',
  'Sumatera Utara': 'Sumatera Utara',
  'Sumatera Barat': 'Sumatera Barat',
  'Riau': 'Riau',
  'Kepulauan Riau': 'Kepulauan Riau',
  'Jambi': 'Jambi',
  'Sumatera Selatan': 'Sumatera Selatan',
  'Bangka Belitung': 'Bangka Belitung',
  'Bengkulu': 'Bengkulu',
  'Lampung': 'Lampung',
  'DKI Jakarta': 'DKI Jakarta',
  'Jawa Barat': 'Jawa Barat',
  'Banten': 'Banten',
  'Jawa Tengah': 'Jawa Tengah',
  'DI Yogyakarta': 'DI Yogyakarta',
  'Jawa Timur': 'Jawa Timur',
  'Kalimantan Barat': 'Kalimantan Barat',
  'Kalimantan Tengah': 'Kalimantan Tengah',
  'Kalimantan Selatan': 'Kalimantan Selatan',
  'Kalimantan Timur': 'Kalimantan Timur',
  'Kalimantan Utara': 'Kalimantan Utara',
  'Sulawesi Utara': 'Sulawesi Utara',
  'Sulawesi Tengah': 'Sulawesi Tengah',
  'Sulawesi Selatan': 'Sulawesi Selatan',
  'Sulawesi Tenggara': 'Sulawesi Tenggara',
  'Gorontalo': 'Gorontalo',
  'Sulawesi Barat': 'Sulawesi Barat',
  'Bali': 'Bali',
  'Nusa Tenggara Barat': 'Nusa Tenggara Barat',
  'Nusa Tenggara Timur': 'Nusa Tenggara Timur',
  'Maluku': 'Maluku',
  'Maluku Utara': 'Maluku Utara',
  'Papua': 'Papua',
  'Papua Barat': 'Papua Barat',
  'Papua Tengah': 'Papua Tengah',
  'Papua Pegunungan': 'Papua Pegunungan',
  'Papua Selatan': 'Papua Selatan',
  'Papua Barat Daya': 'Papua Barat Daya'
};

// Get normalized province name with detailed logging
const getNormalizedProvinceName = (provinceName: string): string => {
  // Try exact match first
  let normalized = provinceNameMapping[provinceName];
  
  // If not found, try case-insensitive search
  if (!normalized) {
    const lowerProvince = provinceName.toLowerCase();
    const mappingEntries = Object.entries(provinceNameMapping);
    
    for (const [key, value] of mappingEntries) {
      if (key.toLowerCase() === lowerProvince) {
        normalized = value;
        break;
      }
    }
  }
  
  // If still not found, try partial matching for common cases
  if (!normalized) {
    const lowerProvince = provinceName.toLowerCase();
    
    // Special cases for partial matching
    if (lowerProvince.includes('sumatera utara') || lowerProvince.includes('sumut') || lowerProvince.includes('sumatra utara')) {
      normalized = 'Sumatera Utara';
    } else if (lowerProvince.includes('ntt') || lowerProvince.includes('nusa tenggara timur')) {
      normalized = 'Nusa Tenggara Timur';
    } else if (lowerProvince.includes('ntb') || lowerProvince.includes('nusa tenggara barat')) {
      normalized = 'Nusa Tenggara Barat';
    } else {
      normalized = provinceName; // fallback to original
    }
  }
  
  // Enhanced logging
  if (provinceName !== normalized) {
    console.log(`🔄 Province mapping: "${provinceName}" → "${normalized}"`);
  }
  
  // Check if final result has coordinates
  if (!provinceCoordinates[normalized]) {
    console.error(`❌ MISSING COORDINATES for: "${normalized}" (original: "${provinceName}")`);
    console.log('📍 Available provinces:', Object.keys(provinceCoordinates).sort());
    
    // Suggest possible matches
    const availableProvinces = Object.keys(provinceCoordinates);
    const possibleMatches = availableProvinces.filter(p => 
      p.toLowerCase().includes(provinceName.toLowerCase().substring(0, 4)) ||
      provinceName.toLowerCase().includes(p.toLowerCase().substring(0, 4))
    );
    if (possibleMatches.length > 0) {
      console.log(`💡 Possible matches for "${provinceName}":`, possibleMatches);
    }
  } else {
    console.log(`✅ Successfully mapped: "${provinceName}" → "${normalized}"`);
  }
  
  return normalized;
};

// Custom marker icon - improved sizing and transparency
const createCustomIcon = (count: number, color: string) => {
  // More dramatic size differences - Enhanced for better proportionality
  const baseSize = 25;
  const maxSize = 80;
  const minSize = 20;
  
  // Much more dramatic sizing based on count with better scaling
  let size;
  if (count <= 1) {
    size = minSize; // 20px
  } else if (count <= 3) {
    size = baseSize; // 25px
  } else if (count <= 10) {
    size = baseSize + 10; // 35px
  } else if (count <= 25) {
    size = baseSize + 20; // 45px
  } else if (count <= 50) {
    size = baseSize + 30; // 55px
  } else if (count <= 100) {
    size = baseSize + 40; // 65px
  } else {
    size = Math.min(maxSize, baseSize + 50 + Math.floor(count / 20)); // 75px+ scaling
  }
  
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color}CC 0%, ${color}AA 100%);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(10, size / 3.5)}px;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        opacity: 0.95;
        transition: all 0.3s ease;
      ">${count}</div>
    `,
    className: 'custom-distribution-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

const IndonesiaMap: React.FC<IndonesiaMapProps> = ({ 
  data, 
  totalPenerima, 
  kabupatenCoverage,
  totalDagingPaket = 0 // Default value
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

  // Debug: Log all provinces in data on component mount/update
  useEffect(() => {
    if (data && data.length > 0) {
      console.log('🗺️ === ENHANCED PROVINCE MAPPING DEBUG ===');
      console.log(`📊 Total provinces in data: ${data.length}`);
      console.log('📝 Raw province names from data:', data.map(item => `"${item.provinsi}"`));
      
      const mappingResults = data.map(item => {
        const normalized = getNormalizedProvinceName(item.provinsi);
        const hasCoordinates = !!provinceCoordinates[normalized];
        return {
          original: item.provinsi,
          normalized,
          hasCoordinates,
          count: item.count,
          coordinates: hasCoordinates ? provinceCoordinates[normalized] : null
        };
      });
      
      console.table(mappingResults);
      
      // Special check for Sumatera Utara and NTT
      const sumutData = data.find(item => 
        item.provinsi.toLowerCase().includes('sumatera utara') || 
        item.provinsi.toLowerCase().includes('sumut') ||
        item.provinsi.toLowerCase().includes('sumatra utara')
      );
      
      const nttData = data.find(item => 
        item.provinsi.toLowerCase().includes('ntt') || 
        item.provinsi.toLowerCase().includes('nusa tenggara timur') ||
        item.provinsi.toLowerCase().includes('nt timur')
      );
      
      if (sumutData) {
        console.log('🔍 FOUND Sumatera Utara data:', sumutData);
        const normalizedSumut = getNormalizedProvinceName(sumutData.provinsi);
        console.log('🎯 Sumatera Utara normalized to:', normalizedSumut);
        console.log('📍 Sumatera Utara coordinates:', provinceCoordinates[normalizedSumut]);
      } else {
        console.warn('⚠️ NO Sumatera Utara data found in:', data.map(item => item.provinsi));
      }
      
      if (nttData) {
        console.log('🔍 FOUND NTT data:', nttData);
        const normalizedNTT = getNormalizedProvinceName(nttData.provinsi);
        console.log('🎯 NTT normalized to:', normalizedNTT);
        console.log('📍 NTT coordinates:', provinceCoordinates[normalizedNTT]);
      } else {
        console.warn('⚠️ NO NTT data found in:', data.map(item => item.provinsi));
      }
      
      const unmapped = mappingResults.filter(r => !r.hasCoordinates);
      if (unmapped.length > 0) {
        console.error(`❌ ${unmapped.length} provinces without coordinates:`);
        unmapped.forEach(u => {
          console.error(`   - "${u.original}" → "${u.normalized}" (${u.count} penerima)`);
        });
        
        // Suggest fixes
        console.log('💡 DEBUGGING SUGGESTIONS:');
        unmapped.forEach(u => {
          const suggestions = Object.keys(provinceCoordinates).filter(p => 
            p.toLowerCase().includes(u.original.toLowerCase().substring(0, 3)) ||
            u.original.toLowerCase().includes(p.toLowerCase().substring(0, 3))
          );
          if (suggestions.length > 0) {
            console.log(`   - For "${u.original}": consider ${suggestions.join(', ')}`);
          }
        });
      } else {
        console.log('✅ All provinces successfully mapped!');
      }
      
      // Show mapping statistics
      const totalWithCoords = mappingResults.filter(r => r.hasCoordinates);
      console.log(`📈 MAPPING STATS: ${totalWithCoords.length}/${data.length} provinces mapped successfully`);
      console.log(`📊 Total penerima with coordinates: ${totalWithCoords.reduce((sum, r) => sum + r.count, 0)}`);
    }
  }, [data]);

  // Map ready handler with error handling
  const onMapReady = (mapInstance: L.Map) => {
    try {
      setMap(mapInstance);
      setIsMapLoading(false);
      console.log('Map is ready:', mapInstance);
    } catch (error) {
      console.error('Error setting up map:', error);
      setMapError('Map setup failed');
      setIsMapLoading(false);
    }
  };

  // Error handler
  const onMapError = (error: string) => {
    console.error('Map error:', error);
    setMapError(error);
    setIsMapLoading(false);
  };

  const handleZoomIn = () => {
    if (map) {
      try {
        map.zoomIn();
      } catch (error) {
        console.warn('Error zooming in:', error);
      }
    }
  };

  const handleZoomOut = () => {
    if (map) {
      try {
        map.zoomOut();
      } catch (error) {
        console.warn('Error zooming out:', error);
      }
    }
  };

  const handleResetView = () => {
    if (map) {
      try {
        map.setView([-2.5, 113.0], 5);
      } catch (error) {
        console.warn('Error resetting view:', error);
      }
    }
  };

  // Error/Fallback Component
  const MapFallback = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full">
      <div className="text-center py-8">
        <BarChart3 className="w-12 h-12 mx-auto text-blue-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Statistik Distribusi
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          {mapError || 'Menampilkan data dalam format alternatif'}
        </p>
        
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-xl font-bold text-blue-600">
              {totalPenerima.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-gray-600">Total Penerima</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-xl font-bold text-green-600">
              {kabupatenCoverage}
            </div>
            <div className="text-xs text-gray-600">Kabupaten</div>
          </div>
        </div>
        
        {/* Top Provinces List */}
        {data.length > 0 && (
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Distribusi per Provinsi
            </h3>
            <div className="space-y-2">
              {data.slice(0, 5).map((item, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-700 truncate">{item.provinsi}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {mapError && (
          <button
            onClick={() => {
              setMapError(null);
              setIsMapLoading(true);
            }}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );

  // If there's a persistent error, show fallback
  if (mapError) {
    return <MapFallback />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 w-full overflow-hidden relative z-10">
      {/* Add custom CSS for markers */}
      <style>{`
        .custom-distribution-marker {
          cursor: pointer;
        }
        .custom-distribution-marker:hover div {
          transform: scale(1.1);
          opacity: 1 !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-tip {
          background: white;
          border-color: #e5e7eb;
        }
      `}</style>
      
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500 flex-shrink-0" />
            <span className="truncate">Peta Distribusi Indonesia</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {totalPenerima} penerima di {kabupatenCoverage} kabupaten
          </p>
        </div>
        
        {/* Map Controls - Mobile Responsive */}
        <div className="flex items-center justify-center sm:justify-end space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={handleZoomIn}
            disabled={isMapLoading}
            className="p-2 sm:p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors touch-manipulation"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={isMapLoading}
            className="p-2 sm:p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors touch-manipulation"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleResetView}
            disabled={isMapLoading}
            className="p-2 sm:p-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors touch-manipulation"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Map Container - Auto-responsive heights */}
      <div 
        ref={mapRef}
        className="relative w-full h-[250px] sm:h-[350px] lg:h-[400px] rounded-lg overflow-hidden border border-red-200 bg-gray-100"
        style={{ 
          zIndex: 1,
          position: 'relative',
          maxHeight: '400px',
          minHeight: '250px'
        }}
      >
        {isMapLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[100]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Memuat peta...</p>
            </div>
          </div>
        )}
        
        <MapContainer
          center={[-2.5, 113.0]}
          zoom={5}
          style={{ 
            height: '100%', 
            width: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            zIndex: 1
          }}
          maxBounds={[[-15, 90], [10, 145]]}
          maxBoundsViscosity={1.0}
          minZoom={4}
          maxZoom={10}
          scrollWheelZoom={false}
          doubleClickZoom={true}
          touchZoom={true}
          zoomControl={false}
        >
          <MapController onMapReady={onMapReady} onError={onMapError} />
          
          {/* Base Map Tiles with error handling */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            errorTileUrl="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
          />
          
          {/* Distribution Markers */}
          {data.map((item, index) => {
            const normalizedName = getNormalizedProvinceName(item.provinsi);
            const coordinates = provinceCoordinates[normalizedName];
            
            // Enhanced logging for missing coordinates
            if (!coordinates) {
              console.warn(`⚠️ SKIPPING MARKER: "${item.provinsi}" → "${normalizedName}" (${item.count} penerima)`);
              console.log(`💡 Available coordinates for provinces starting with "${item.provinsi.substring(0, 3)}":`, 
                Object.keys(provinceCoordinates).filter(p => p.toLowerCase().startsWith(item.provinsi.toLowerCase().substring(0, 3)))
              );
              return null;
            }

            // Enhanced logging for successful mapping
            console.log(`🎯 RENDERING MARKER: "${item.provinsi}" → "${normalizedName}" at [${coordinates[0]}, ${coordinates[1]}] (${item.count} penerima)`);

            return (
              <Marker
                key={`${normalizedName}-${index}`} // Better key to avoid duplicates
                position={coordinates}
                icon={createCustomIcon(item.count, '#22c55e')} // Green color for all markers
              >
                <Popup>
                  <div style={{ textAlign: 'center', padding: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{normalizedName}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      📍 {item.count.toLocaleString('id-ID')} paket daging<br />
                      📊 {item.percentage}% dari total distribusi
                    </p>
                    {item.provinsi !== normalizedName && (
                      <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                        Data asli: {item.provinsi}
                      </p>
                    )}
                    <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>
                      Koordinat: [{coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}]
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Info - Mobile Responsive */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
          <span className="flex items-center">🗺️ Peta interaktif Indonesia</span>
          <span className="flex items-center">📍 Klik titik untuk detail</span>
        </div>
        <div className="text-red-600 font-medium text-center sm:text-right">
          {data.length} titik distribusi
        </div>
      </div>

      {/* Map Legend Card - Outside map for better mobile visibility */}
      <div className="mt-4 bg-gradient-to-r from-red-50 to-green-50 rounded-xl p-4 sm:p-6 border border-red-100">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-red-600" />
          Keterangan Peta
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Legend Items */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full shadow-sm opacity-90"></div>
              <span className="text-sm font-medium text-gray-700">Titik Distribusi</span>
            </div>
            <p className="text-xs text-gray-600">Lokasi penyaluran daging qurban</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-2 mb-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-90"></div>
                <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-90"></div>
                <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-90"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Ukuran Proporsional</span>
            </div>
            <p className="text-xs text-gray-600">Semakin besar = semakin banyak paket</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-red-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-lg">📊</div>
              <span className="text-sm font-medium text-gray-700">Data Real-time</span>
            </div>
            <p className="text-xs text-gray-600">Diperbarui secara otomatis</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-3 mb-2">
              <div className="text-lg">🎯</div>
              <span className="text-sm font-medium text-gray-700">Interaktif</span>
            </div>
            <p className="text-xs text-gray-600">Klik titik untuk detail lengkap</p>
          </div>
        </div>
      </div>

      {/* Map Statistics Card - Outside map for better mobile visibility */}
      <div className="mt-4 bg-gradient-to-r from-green-50 to-red-50 rounded-xl p-4 sm:p-6 border border-green-100">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
          Statistik Distribusi
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-red-100 text-center">
            <div className="text-lg sm:text-2xl font-bold text-red-600 mb-1">
              {totalPenerima.toLocaleString('id-ID')}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Penerima</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-green-100 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
              {kabupatenCoverage}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Kabupaten</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-red-100 text-center">
            <div className="text-lg sm:text-2xl font-bold text-red-600 mb-1">
              {data.length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Provinsi</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-green-100 text-center">
            <div className="text-lg sm:text-2xl font-bold text-green-600 mb-1">
              {data.reduce((sum, item) => sum + item.count, 0).toLocaleString('id-ID')}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Total Paket</div>
          </div>
        </div>
      </div>

      {/* Top 5 Provinces Table */}
      {data.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-red-50 to-green-50 rounded-xl p-4 sm:p-6 border border-red-100">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-red-600" />
            Top 5 Provinsi Distribusi
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
              <thead>
                <tr className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    Ranking
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    Provinsi
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    Paket Daging
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    Persentase
                  </th>
                  <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    Visual
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.slice(0, 5).map((item, index) => (
                  <tr 
                    key={index}
                    className={`hover:bg-red-50 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center">
                        <div className={`
                          w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm
                          ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : ''}
                          ${index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : ''}
                          ${index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' : ''}
                          ${index >= 3 ? 'bg-gradient-to-r from-red-500 to-red-600' : ''}
                        `}>
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="text-sm sm:text-base font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                        {item.provinsi}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <div className="text-sm sm:text-base font-bold text-red-600">
                        {item.count.toLocaleString('id-ID')}
                      </div>
                      <div className="text-xs text-gray-500">paket daging</div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-center">
                      <div className="text-sm sm:text-base font-semibold text-red-600">
                        {item.percentage}%
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex items-center justify-center">
                        <div className="w-full max-w-[60px] sm:max-w-[100px] bg-gray-200 rounded-full h-2 sm:h-3">
                          <div 
                            className="bg-gradient-to-r from-red-500 to-red-600 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(100, (item.percentage / data[0].percentage) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Summary Stats - Fixed Contribution Calculation */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-red-100 text-center">
              <div className="text-lg sm:text-xl font-bold text-red-600">
                {data.slice(0, 5).reduce((sum, item) => sum + item.count, 0).toLocaleString('id-ID')}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Top 5</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-green-100 text-center">
              <div className="text-lg sm:text-xl font-bold text-green-600">
                {data.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Total Provinsi</div>
            </div>
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-red-100 text-center">
              <div className="text-lg sm:text-xl font-bold text-red-600">
                {totalDagingPaket > 0 ? 
                  ((data.slice(0, 5).reduce((sum, item) => sum + item.count, 0) / totalDagingPaket) * 100).toFixed(1) :
                  ((data.slice(0, 5).reduce((sum, item) => sum + item.count, 0) / data.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)
                }%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Kontribusi Top 5</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndonesiaMap; 