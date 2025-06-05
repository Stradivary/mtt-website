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

// Province coordinates for markers
const provinceCoordinates: Record<string, [number, number]> = {
  'DKI Jakarta': [-6.2, 106.8],
  'Jawa Barat': [-6.75, 106.65],
  'Jawa Tengah': [-7.05, 110.3],
  'Jawa Timur': [-7.5, 113.35],
  'Sumatera Utara': [2.65, 99.15],
  'Sumatera Barat': [-0.65, 100.0],
  'Kalimantan Timur': [1.25, 116.25],
  'Sulawesi Selatan': [-4.5, 120.25]
};

// Custom marker icon - optimized for mobile
const createCustomIcon = (count: number, color: string) => {
  const size = Math.max(20, Math.min(40, count * 2));
  return L.divIcon({
    html: `
      <div style="
        background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(10, size / 3)}px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
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
  kabupatenCoverage 
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);

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
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500 flex-shrink-0" />
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
            className="p-2 sm:p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors touch-manipulation"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            disabled={isMapLoading}
            className="p-2 sm:p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors touch-manipulation"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={handleResetView}
            disabled={isMapLoading}
            className="p-2 sm:p-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 transition-colors touch-manipulation"
            title="Reset View"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Map Container - Auto-responsive heights */}
      <div 
        ref={mapRef}
        className="relative w-full h-[250px] sm:h-[350px] lg:h-[400px] rounded-lg overflow-hidden border border-blue-200 bg-gray-100"
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
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
            const coordinates = provinceCoordinates[item.provinsi];
            if (!coordinates) return null;

            return (
              <Marker
                key={index}
                position={coordinates}
                icon={createCustomIcon(item.count, item.color || '#ef4444')}
              >
                <Popup>
                  <div style={{ textAlign: 'center', padding: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>{item.provinsi}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                      📍 {item.count} penerima<br />
                      📊 {item.percentage}% dari total distribusi
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend Overlay - Mobile Responsive */}
        <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-4 shadow-lg border z-[50] max-w-[140px] sm:max-w-none">
          <div className="text-xs font-bold text-gray-700 mb-2 sm:mb-3">Keterangan Peta</div>
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full shadow-sm flex-shrink-0"></div>
              <span className="text-xs text-gray-600">Titik Distribusi</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex-shrink-0"></div>
              <span className="text-xs text-gray-600">Ukuran = Jumlah</span>
            </div>
          </div>
        </div>

        {/* Statistics Overlay - Mobile Responsive */}
        <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 sm:p-4 shadow-lg border z-[50] max-w-[100px] sm:max-w-none">
          <div className="text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600 mb-1">
              {totalPenerima.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-gray-600 mb-1 sm:mb-2">Total</div>
            <div className="text-sm sm:text-lg font-semibold text-green-600">
              {kabupatenCoverage}
            </div>
            <div className="text-xs text-gray-600">Kab</div>
          </div>
        </div>
      </div>

      {/* Map Info - Mobile Responsive */}
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
          <span className="flex items-center">🗺️ Peta interaktif Indonesia</span>
          <span className="flex items-center">📍 Klik titik untuk detail</span>
        </div>
        <div className="text-blue-600 font-medium text-center sm:text-right">
          {data.length} titik distribusi
        </div>
      </div>
    </div>
  );
};

export default IndonesiaMap; 