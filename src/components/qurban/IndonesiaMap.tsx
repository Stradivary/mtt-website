import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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

// Component to handle map controls from inside the map
const MapController = ({ onMapReady }: { onMapReady: (map: L.Map) => void }) => {
  const map = useMap();
  
  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
};

// Simplified Indonesia GeoJSON (provinces outline) - More realistic coordinates
const indonesiaGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": { "name": "DKI Jakarta" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [106.65, -6.05], [106.95, -6.05], [106.95, -6.35], [106.65, -6.35], [106.65, -6.05]
        ]]
      }
    },
    {
      "type": "Feature", 
      "properties": { "name": "Jawa Barat" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [104.5, -5.5], [108.8, -5.5], [108.8, -8.0], [104.5, -8.0], [104.5, -5.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Jawa Tengah" },
      "geometry": {
        "type": "Polygon", 
        "coordinates": [[
          [108.8, -5.8], [111.8, -5.8], [111.8, -8.3], [108.8, -8.3], [108.8, -5.8]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Jawa Timur" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [111.8, -6.2], [114.9, -6.2], [114.9, -8.8], [111.8, -8.8], [111.8, -6.2]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Sumatera Utara" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [97.5, 0.5], [100.8, 0.5], [100.8, 4.8], [97.5, 4.8], [97.5, 0.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Sumatera Barat" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [98.2, -2.5], [101.8, -2.5], [101.8, 1.2], [98.2, 1.2], [98.2, -2.5]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Kalimantan Timur" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [113.5, -2.0], [119.0, -2.0], [119.0, 4.5], [113.5, 4.5], [113.5, -2.0]
        ]]
      }
    },
    {
      "type": "Feature",
      "properties": { "name": "Sulawesi Selatan" },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[
          [118.5, -8.0], [122.0, -8.0], [122.0, -1.0], [118.5, -1.0], [118.5, -8.0]
        ]]
      }
    }
  ]
};

// Custom marker icon with better styling
const createCustomIcon = (count: number, color: string) => {
  const size = Math.max(30, Math.min(60, count * 3));
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
        font-size: ${Math.max(12, size / 4)}px;
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      ">${count}</div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
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

  // Create a map for quick lookup
  const dataMap = data.reduce((acc, item) => {
    acc[item.provinsi] = item;
    return acc;
  }, {} as Record<string, ProvinsiData>);

  // Province coordinates for markers - Updated to match GeoJSON
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

  // Style function for GeoJSON features
  const geoJSONStyle = (feature: any) => {
    const provinceName = feature?.properties?.name;
    if (!provinceName) return { fillColor: '#e5e7eb', weight: 2, opacity: 1, color: '#374151', fillOpacity: 0.3 };
    
    const provinceData = dataMap[provinceName];
    
    return {
      fillColor: provinceData ? (provinceData.color || '#3b82f6') : '#e5e7eb',
      weight: 2,
      opacity: 1,
      color: '#374151',
      dashArray: '',
      fillOpacity: provinceData ? 0.7 : 0.3
    };
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    if (map) {
      try {
        map.zoomIn();
        console.log('Zoomed in, current zoom:', map.getZoom());
      } catch (error) {
        console.warn('Error zooming in:', error);
      }
    } else {
      console.warn('Map not available for zoom in');
    }
  };

  const handleZoomOut = () => {
    if (map) {
      try {
        map.zoomOut();
        console.log('Zoomed out, current zoom:', map.getZoom());
      } catch (error) {
        console.warn('Error zooming out:', error);
      }
    } else {
      console.warn('Map not available for zoom out');
    }
  };

  const handleResetView = () => {
    if (map) {
      try {
        map.setView([-2.5, 113.0], 5);
        console.log('Reset view to center Indonesia');
      } catch (error) {
        console.warn('Error resetting view:', error);
      }
    } else {
      console.warn('Map not available for reset');
    }
  };

  // Map ready handler
  const onMapReady = (mapInstance: L.Map) => {
    setMap(mapInstance);
    console.log('Map is ready:', mapInstance);
  };

  // Event handlers for GeoJSON features
  const onEachFeature = (feature: any, layer: any) => {
    if (!feature?.properties?.name) return;
    
    const provinceName = feature.properties.name;
    const provinceData = dataMap[provinceName];
    
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 4,
          color: '#666',
          fillOpacity: 0.9
        });
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle(geoJSONStyle(feature));
      }
    });

    if (provinceData) {
      layer.bindPopup(`
        <div style="text-align: center; padding: 8px; min-width: 150px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">${provinceName}</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            📍 ${provinceData.count} penerima<br>
            📊 ${provinceData.percentage}% dari total
          </p>
        </div>
      `);
    } else {
      layer.bindPopup(`
        <div style="text-align: center; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #1f2937;">${provinceName}</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">
            Belum ada data distribusi
          </p>
        </div>
      `);
    }
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
            onClick={handleZoomIn}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[500px] rounded-lg overflow-hidden border-2 border-blue-200">
        <MapContainer
          center={[-2.5, 113.0]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController onMapReady={onMapReady} />
          
          {/* Base Map Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border z-[1000]">
          <div className="text-xs font-bold text-gray-700 mb-3">Keterangan Peta</div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
              <span className="text-xs text-gray-600">Titik Distribusi</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Ukuran = Jumlah Penerima</span>
            </div>
          </div>
        </div>

        {/* Statistics Overlay */}
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border z-[1000]">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {totalPenerima.toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-gray-600 mb-2">Total Penerima</div>
            <div className="text-lg font-semibold text-green-600">
              {kabupatenCoverage}
            </div>
            <div className="text-xs text-gray-600">Kabupaten</div>
          </div>
        </div>
      </div>

      {/* Map Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>🗺️ Peta interaktif Indonesia</span>
          <span>📍 Klik titik merah untuk detail distribusi</span>
          <span>🔍 Gunakan mouse untuk navigasi</span>
        </div>
        <div className="text-blue-600 font-medium">
          {data.length} titik distribusi
        </div>
      </div>
    </div>
  );
};

export default IndonesiaMap; 