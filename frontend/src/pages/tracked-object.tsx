// src\pages\tracked-object.tsx
import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import {
  Camera as CameraIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  Crop,
  Plus,
  Image as ImageIcon,
  User,
  Car,
  Package
} from 'lucide-react';
import { useTrackedObjectStore } from '../store/tracked-object-store';
import type { Camera, Detection, TrackedObject } from '../store/tracked-object-store';

// Custom camera icon for the map
const createCameraIcon = (isHighlighted: boolean, isDisputed: boolean) => L.divIcon({
  html: `<div class="relative">
    <svg xmlns="http://www.w3.org/2000/svg" width="${isHighlighted ? '32' : '24'}" height="${isHighlighted ? '32' : '24'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${isDisputed ? 'text-red-600' : 'text-blue-600'}" style="filter: ${isHighlighted ? 'drop-shadow(0 0 6px rgba(37, 99, 235, 0.5))' : 'none'}">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
    ${isDisputed ? '<div class="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3"></div>' : ''}
  </div>`,
  className: `camera-marker ${isHighlighted ? 'camera-marker-highlighted' : ''}`,
  iconSize: [isHighlighted ? 32 : 24, isHighlighted ? 32 : 24],
  iconAnchor: [isHighlighted ? 16 : 12, isHighlighted ? 16 : 12],
});

function CameraMarker({ camera, isHighlighted }: { camera: Camera; isHighlighted: boolean }) {
  const hasDispute = camera.detections.some(d => d.disputed);
  
  return (
    <Marker
      position={camera.location}
      icon={createCameraIcon(isHighlighted, hasDispute)}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold">{camera.name}</h3>
          <div className="mt-2 space-y-1">
            {camera.detections.map((detection) => (
              <div key={detection.id} className="text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {detection.startTime.toLocaleTimeString()} - {detection.endTime.toLocaleTimeString()}
                  </span>
                  {detection.disputed ? (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function NewObjectDialog({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'person' as TrackedObject['type']
  });
  const { addObject } = useTrackedObjectStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addObject(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Add New Object</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as TrackedObject['type'] })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="person">Person</option>
              <option value="vehicle">Vehicle</option>
              <option value="object">Object</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Object
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TrackedObject() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [showNewObjectDialog, setShowNewObjectDialog] = useState(false);
  const {
    cameras,
    selectedCamera,
    videoUrl,
    isSelecting,
    selectedObject,
    objects,
    setSelectedCamera,
    setVideoUrl,
    setIsSelecting,
    setSelectedObject
  } = useTrackedObjectStore();

  const sortedDetections = useMemo(() => {
    return cameras
      .flatMap(camera => 
        camera.detections.map(detection => ({
          ...detection,
          cameraLocation: camera.location,
          cameraName: camera.name,
        }))
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [cameras]);

  const pathCoordinates = useMemo(() => {
    const coordinates: [number, number][] = [];
    let lastValidTime: number | null = null;

    sortedDetections.forEach(detection => {
      if (!detection.disputed) {
        if (lastValidTime === null || 
            detection.startTime.getTime() - lastValidTime < 300000) {
          coordinates.push(detection.cameraLocation);
        }
        lastValidTime = detection.startTime.getTime();
      }
    });

    return coordinates;
  }, [sortedDetections]);

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        sources: [{ src: videoUrl, type: 'video/mp4' }]
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [videoUrl]);

  const seekToTime = (timeInSeconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime(timeInSeconds);
      playerRef.current.play();
    }
  };

  const getObjectIcon = (type: TrackedObject['type']) => {
    switch (type) {
      case 'person':
        return User;
      case 'vehicle':
        return Car;
      default:
        return Package;
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Left Panel - Map and Timeline */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Map */}
        <div className="h-2/3 bg-white rounded-lg shadow-md overflow-hidden">
          <MapContainer
            center={cameras[0]?.location || [51.505, -0.09]}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <Polyline
              positions={pathCoordinates}
              color="#2563eb"
              weight={3}
              opacity={0.6}
              dashArray="5, 10"
            />

            {cameras.map((camera) => (
              <CameraMarker
                key={camera.id}
                camera={camera}
                isHighlighted={camera.id === selectedCamera}
              />
            ))}
          </MapContainer>
        </div>

        {/* Timeline */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Detection Timeline</h2>
          <div className="space-y-3">
            {cameras.map((camera) => (
              <div
                key={camera.id}
                className={`p-4 border rounded-lg transition-all
                  ${camera.detections.some(d => d.disputed) ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}
                  ${camera.id === selectedCamera ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => {
                  setSelectedCamera(camera.id);
                  setVideoUrl('https://vjs.zencdn.net/v/oceans.mp4');
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <CameraIcon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{camera.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {camera.detections.map((detection) => (
                    <div
                      key={detection.id}
                      className="flex items-center justify-between bg-white/80 p-2 rounded border"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {detection.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {detection.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {detection.disputed ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <button
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          seekToTime(detection.videoStartTime);
                        }}
                      >
                        <Play className="h-4 w-4" />
                        <span>{Math.floor(detection.videoStartTime / 60)}:{(detection.videoStartTime % 60).toString().padStart(2, '0')}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {camera.detections.some(d => d.disputed) && (
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-red-600">Time conflict detected</span>
                    <button
                      className="px-3 py-1 text-sm bg-white border border-red-300 text-red-600 rounded hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle review logic
                      }}
                    >
                      Review Detection
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Video and Object Selection */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Video Player */}
        <div className="h-2/3 bg-black rounded-lg overflow-hidden relative">
          {videoUrl ? (
            <div data-vjs-player className="h-full">
              <video
                ref={videoRef}
                className="video-js vjs-big-play-centered h-full"
              />
              {isSelecting && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Crop className="h-12 w-12 mx-auto mb-2" />
                    <p>Click and drag to select object</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              <p>Select a detection to view footage</p>
            </div>
          )}
        </div>

        {/* Object Selection Panel */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Object Selection</h2>
            <div className="space-x-2">
              <button
                onClick={() => setShowNewObjectDialog(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
              >
                <Plus className="h-4 w-4" />
                <span>New Object</span>
              </button>
              <button
                onClick={() => setIsSelecting(true)}
                className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 flex items-center space-x-1"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Update Reference</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {objects.map((object) => {
              const Icon = getObjectIcon(object.type);
              return (
                <div
                  key={object.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedObject?.id === object.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => setSelectedObject(object)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">{object.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{object.description}</p>
                  {object.referenceImages.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {object.referenceImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Reference ${idx + 1}`}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showNewObjectDialog && <NewObjectDialog onClose={() => setShowNewObjectDialog(false)} />}
    </div>
  );
}