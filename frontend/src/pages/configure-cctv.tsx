import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Camera, Save } from 'lucide-react';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getCameraDetails, updateCameraDetails, CameraDetails } from '../lib/api';

function DraggableMarker({
  position,
  setPosition,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
    />
  );
}

export function ConfigureCCTV() {
  const { id } = useParams(); // camera ID from URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // State for camera details fetched from the backend
  const [cameraDetails, setCameraDetails] = useState<CameraDetails>({
    id: "",
    name: "",
    description: "",
    angle: 0,
    direction: 0,
    location: [51.505, -0.09],
  });
  // State for marker position
  const [position, setPosition] = useState<[number, number]>([51.505, -0.09]);

  // Place the useEffect here to fetch camera details when the component mounts or id changes:
  useEffect(() => {
    const fetchDetails = async () => {
      if (id) {
        try {
          console.log("Fetching details for camera id:", id);
          const data = await getCameraDetails(id);
          console.log("Fetched data:", data);
          setCameraDetails(data);
          setPosition(data.location);
        } catch (error) {
          console.error("Error fetching camera details:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn("No camera id provided");
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Handle form submission to update the camera details
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedDetails = await updateCameraDetails(id!, {
        ...cameraDetails,
        location: position,
      });
      console.log("Camera updated:", updatedDetails);
      navigate("/cctvs");
    } catch (error) {
      console.error("Error updating camera:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Left Panel: Map */}
      <div className="w-2/3 relative">
        <MapContainer center={position} zoom={13} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <DraggableMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      
      {/* Right Panel: Form */}
      <div className="w-1/3 bg-white border-l p-6 overflow-y-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Camera className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Configure CCTV</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Camera Name
            </label>
            <input
              type="text"
              value={cameraDetails.name}
              onChange={(e) =>
                setCameraDetails({ ...cameraDetails, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={cameraDetails.description}
              onChange={(e) =>
                setCameraDetails({ ...cameraDetails, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Angle (degrees)
              </label>
              <input
                type="number"
                value={cameraDetails.angle}
                onChange={(e) =>
                  setCameraDetails({ ...cameraDetails, angle: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="360"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction (degrees)
              </label>
              <input
                type="number"
                value={cameraDetails.direction}
                onChange={(e) =>
                  setCameraDetails({ ...cameraDetails, direction: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="360"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={position[0].toFixed(6)}
                className="px-3 py-2 border rounded-md bg-gray-50"
                readOnly
              />
              <input
                type="text"
                value={position[1].toFixed(6)}
                className="px-3 py-2 border rounded-md bg-gray-50"
                readOnly
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Click on the map or drag the marker to update location.
            </p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <Save className="h-5 w-5" />
            <span>Save Camera</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConfigureCCTV;
