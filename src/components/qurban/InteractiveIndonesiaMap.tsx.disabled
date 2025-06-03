import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { Users, Target, ChevronDown, ChevronUp, Filter, MapPin, ZoomIn, ZoomOut, Home, Move, RotateCcw } from 'lucide-react';
import { KabupatenData } from '../../types/qurban';

interface InteractiveIndonesiaMapProps {
  data: KabupatenData[] | null;
  loading: boolean;
  onKabupatenClick?: (kabupaten: KabupatenData) => void;
}

// Indonesia TopoJSON URL (using more reliable source)
const INDONESIA_TOPO_JSON = "https://raw.githubusercontent.com/hanchanteng/indonesia-geojson/master/indonesia-provinces-simple.json";

// Alternative sources as fallback
const FALLBACK_TOPO_URLS = [
  "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json",
  "https://raw.githubusercontent.com/ans-4175/indonesia-geojson/master/indonesia.json"
];

// Province coordinates for markers (longitude, latitude)
const provinceMarkers = [
  { name: 'DKI Jakarta', coordinates: [106.845599, -6.208763], penerima: 1665, hewan: 325, mitra: ['LAZIS', 'BAZNAS', 'MTT'] },
  { name: 'Jawa Barat', coordinates: [107.609344, -6.914744], penerima: 1100, hewan: 206, mitra: ['BAZNAS', 'MTT', 'LAZIS'] },
  { name: 'Jawa Timur', coordinates: [112.238402, -7.972429], penerima: 1140, hewan: 213, mitra: ['BAZNAS', 'LAZIS'] },
  { name: 'Jawa Tengah', coordinates: [110.370529, -7.797068], penerima: 780, hewan: 141, mitra: ['BAZNAS', 'LAZIS', 'MTT'] },
  { name: 'Sumatra Utara', coordinates: [98.678513, 3.597031], penerima: 450, hewan: 84, mitra: ['LAZIS', 'BAZNAS'] },
  { name: 'Sulawesi Selatan', coordinates: [120.307842, -5.147665], penerima: 410, hewan: 76, mitra: ['BAZNAS', 'LAZIS'] },
  { name: 'Bali', coordinates: [115.188919, -8.455472], penerima: 285, hewan: 52, mitra: ['LAZIS'] },
  { name: 'Kalimantan Timur', coordinates: [116.419389, 1.688530], penerima: 195, hewan: 38, mitra: ['BAZNAS'] },
  { name: 'Sumatra Barat', coordinates: [100.351906, -0.789275], penerima: 320, hewan: 62, mitra: ['LAZIS', 'MTT'] },
  { name: 'Riau', coordinates: [101.447777, 0.507068], penerima: 180, hewan: 35, mitra: ['BAZNAS'] }
];

const InteractiveIndonesiaMap: React.FC<InteractiveIndonesiaMapProps> = ({ data, loading, onKabupatenClick }) => {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [geoData, setGeoData] = useState(null);
  const [mapError, setMapError] = useState(false);
  
  // Interactive map controls state
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([118, -1.5]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState<{x: number, y: number} | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    minPenerima: 0,
    maxPenerima: 2000,
    mitra: 'all',
    hewan: 'all',
    showLabels: true,
    showMarkers: true
  });

  // Load Indonesia geographical data
  useEffect(() => {
    const loadMapData = async () => {
      // Try primary source first
      try {
        const response = await fetch(INDONESIA_TOPO_JSON);
        if (response.ok) {
          const data = await response.json();
          setGeoData(data);
          setMapError(false);
          return;
        }
      } catch (error) {
        console.log('Primary map source failed, trying fallbacks...');
      }

      // Try fallback sources
      for (const fallbackUrl of FALLBACK_TOPO_URLS) {
        try {
          const response = await fetch(fallbackUrl);
          if (response.ok) {
            const data = await response.json();
            setGeoData(data);
            setMapError(false);
            console.log('Map loaded from fallback source');
            return;
          }
        } catch (error) {
          console.log(`Fallback ${fallbackUrl} failed`);
        }
      }

      // All sources failed
      console.error('All map data sources failed');
      setMapError(true);
    };

    loadMapData();
  }, []);

  // Filter markers based on current filters
  const filteredMarkers = provinceMarkers.filter(marker => {
    if (filters.mitra !== 'all' && !marker.mitra.includes(filters.mitra)) return false;
    if (marker.penerima < filters.minPenerima || marker.penerima > filters.maxPenerima) return false;
    return true;
  });

  // Interactive controls functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 8));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setCenter([118, -1.5]);
    setSelectedProvince(null);
  };

  const handleCenterChange = (newCenter: [number, number]) => {
    setCenter(newCenter);
  };

  // Mouse interaction handlers
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsPanning(true);
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isPanning || !lastMousePosition) return;
    
    const deltaX = event.clientX - lastMousePosition.x;
    const deltaY = event.clientY - lastMousePosition.y;
    
    // Adjust center based on mouse movement
    const sensitivity = 0.001 / zoom;
    setCenter(prev => [
      prev[0] - deltaX * sensitivity,
      prev[1] + deltaY * sensitivity
    ]);
    
    setLastMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setLastMousePosition(null);
  };

  // Wheel zoom handler
  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.5, Math.min(8, prev * zoomFactor)));
  };

  const getTotalStats = () => {
    const filtered = filteredMarkers;
    return {
      totalPenerima: filtered.reduce((sum, m) => sum + m.penerima, 0),
      totalHewan: filtered.reduce((sum, m) => sum + m.hewan, 0),
      totalProvinsi: filtered.length
    };
  };

  const stats = getTotalStats();

  const getMarkerSize = (penerima: number) => {
    const baseSize = 4;
    const scaleFactor = zoom * 0.8;
    if (penerima > 1000) return baseSize * 2 * scaleFactor;
    if (penerima > 500) return baseSize * 1.5 * scaleFactor;
    if (penerima > 200) return baseSize * 1.2 * scaleFactor;
    return baseSize * scaleFactor;
  };

  const getMarkerColor = (penerima: number) => {
    if (penerima > 1000) return "#dc2626"; // red-600
    if (penerima > 500) return "#ea580c"; // orange-600
    if (penerima > 200) return "#2563eb"; // blue-600
    return "#059669"; // green-600
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat peta distribusi Indonesia...</p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Gagal memuat peta geografis</p>
          <p className="text-sm text-gray-500">Menggunakan mode fallback</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Enhanced Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filter Data</span>
          {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            {showControls ? 'Sembunyikan' : 'Tampilkan'} Kontrol
          </button>
        </div>
      </div>
      
      {/* Advanced Filter Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg grid lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Penerima</label>
            <input
              type="range"
              min="0"
              max="2000"
              value={filters.minPenerima}
              onChange={(e) => setFilters({...filters, minPenerima: parseInt(e.target.value)})}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{filters.minPenerima.toLocaleString('id-ID')}</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mitra</label>
            <select
              value={filters.mitra}
              onChange={(e) => setFilters({...filters, mitra: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Semua Mitra</option>
              <option value="LAZIS">LAZIS</option>
              <option value="BAZNAS">BAZNAS</option>
              <option value="MTT">MTT</option>
            </select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showLabels}
                onChange={(e) => setFilters({...filters, showLabels: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Tampilkan Label</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showMarkers}
                onChange={(e) => setFilters({...filters, showMarkers: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Tampilkan Marker</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium text-gray-900">Zoom: {zoom.toFixed(1)}x</div>
              <div className="text-gray-500">{stats.totalProvinsi} Provinsi</div>
              <div className="text-gray-500">{stats.totalPenerima.toLocaleString('id-ID')} Penerima</div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Container */}
      <div 
        className="relative w-full h-96 bg-gradient-to-br from-blue-100 via-green-50 to-blue-100 rounded-lg border border-gray-200 mb-6 overflow-hidden cursor-move"
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {geoData ? (
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 700 * zoom,
              center: center
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <ZoomableGroup zoom={1} center={[0, 0]}>
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#e5e7eb"
                      stroke="#d1d5db"
                      strokeWidth={0.5 / zoom}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#cbd5e1", outline: "none" },
                        pressed: { fill: "#94a3b8", outline: "none" }
                      }}
                    />
                  ))
                }
              </Geographies>
              
              {/* Province Markers */}
              {filters.showMarkers && filteredMarkers.map((marker, index) => (
                <Marker key={index} coordinates={marker.coordinates}>
                  <circle
                    r={getMarkerSize(marker.penerima)}
                    fill={getMarkerColor(marker.penerima)}
                    stroke="#ffffff"
                    strokeWidth={1 / zoom}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedProvince(selectedProvince === marker.name ? null : marker.name)}
                  />
                  {filters.showLabels && (
                    <text
                      textAnchor="middle"
                      y={getMarkerSize(marker.penerima) + 15 / zoom}
                      style={{
                        fontFamily: "system-ui",
                        fontSize: Math.max(8, 10 / zoom) + "px",
                        fill: "#374151",
                        fontWeight: "bold"
                      }}
                    >
                      {marker.name.replace(' ', '\n')}
                    </text>
                  )}
                </Marker>
              ))}
            </ZoomableGroup>
          </ComposableMap>
        ) : (
          // Enhanced Fallback visualization
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-5 gap-2">
              {filteredMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="text-center cursor-pointer p-2 hover:bg-white hover:bg-opacity-50 rounded transition-colors"
                  onClick={() => setSelectedProvince(selectedProvince === marker.name ? null : marker.name)}
                >
                  <div 
                    className="w-6 h-6 mx-auto rounded-full mb-1"
                    style={{ backgroundColor: getMarkerColor(marker.penerima) }}
                  ></div>
                  <div className="text-xs font-medium text-gray-700">{marker.name}</div>
                  <div className="text-xs text-gray-500">{marker.penerima.toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 bg-white bg-opacity-95 rounded-lg p-2 shadow-lg">
            <div className="flex flex-col space-y-1">
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetView}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Reset View"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-95 rounded-lg p-3 text-xs shadow-lg">
          <h4 className="font-semibold mb-2">Sebaran Distribusi</h4>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-600 rounded-full mr-2"></div>
              <span>1000+ penerima</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-600 rounded-full mr-2"></div>
              <span>500-999 penerima</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
              <span>200-499 penerima</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              <span>&lt; 200 penerima</span>
            </div>
          </div>
        </div>

        {/* Zoom Level Display */}
        <div className="absolute bottom-4 right-4 bg-white bg-opacity-95 rounded-lg p-2 text-xs shadow-lg">
          <div className="flex items-center space-x-2">
            <Move className="w-3 h-3" />
            <span>Zoom: {zoom.toFixed(1)}x</span>
          </div>
        </div>

        {/* Interactive Guide */}
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 rounded-lg p-2 text-xs shadow-lg">
          <div className="space-y-1">
            <div>🖱️ Drag untuk pan</div>
            <div>🔄 Scroll untuk zoom</div>
            <div>📍 Klik marker untuk detail</div>
          </div>
        </div>
      </div>

      {/* Selected Province Details */}
      {selectedProvince && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          {(() => {
            const province = filteredMarkers.find(p => p.name === selectedProvince);
            if (!province) return null;
            
            return (
              <div>
                <h3 className="font-bold text-blue-900 mb-3">{province.name}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">Penerima</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {province.penerima.toLocaleString('id-ID')}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Hewan</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {province.hewan}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <div className="text-sm font-medium mb-2">Mitra</div>
                    <div className="flex flex-wrap gap-1">
                      {province.mitra.map((mitra, i) => (
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
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default InteractiveIndonesiaMap; 