// src\pages\cctvs.tsx
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { Plus, Settings } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React Leaflet
import L from 'leaflet';

// Create a custom camera icon
const cameraIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600" style="color: #2563eb;">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>`,
  className: 'camera-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const highlightedCameraIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600" style="color: #1d4ed8; filter: drop-shadow(0 0 6px rgba(37, 99, 235, 0.5));">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>`,
  className: 'camera-marker-highlighted',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MarkerComponent({ camera, isHighlighted }) {
  const map = useMap();

  React.useEffect(() => {
    if (isHighlighted) {
      map.setView(camera.location, map.getZoom(), {
        animate: true,
        duration: 0.5,
      });
    }
  }, [isHighlighted, camera.location, map]);

  return (
    <Marker
      key={camera.id}
      position={camera.location}
      icon={isHighlighted ? highlightedCameraIcon : cameraIcon}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">{camera.name}</h3>
          <p className="text-sm text-gray-600">Status: {camera.status}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export function CCTVs() {
  const [hoveredCamera, setHoveredCamera] = useState(null);

  // Placeholder data for demonstration
  const cameras = [
    { id: '1', name: 'Main Street Camera 1', location: [51.505, -0.09], status: 'active' },
    { id: '2', name: 'Park Avenue Camera 2', location: [51.51, -0.1], status: 'inactive' },
    { id: '3', name: 'Station Camera 3', location: [51.515, -0.09], status: 'active' }
  ];

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Map View */}
      <div className="w-2/3 relative">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {cameras.map((camera) => (
            <MarkerComponent
              key={camera.id}
              camera={camera}
              isHighlighted={hoveredCamera === camera.id}
            />
          ))}
        </MapContainer>

        <Link
          to="/cctvs/add"
          className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Camera</span>
        </Link>
      </div>

      {/* Camera List */}
      <div className="w-1/3 bg-white border-l p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">CCTV Cameras</h2>
          <span className="text-sm text-gray-600">{cameras.length} total</span>
        </div>

        <div className="space-y-3">
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02]"
              onMouseEnter={() => setHoveredCamera(camera.id)}
              onMouseLeave={() => setHoveredCamera(null)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{camera.name}</h3>
                  <p className="text-sm text-gray-600">ID: {camera.id}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  camera.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {camera.status}
                </span>
              </div>
              <div className="mt-3 flex justify-end">
                <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Configure</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}