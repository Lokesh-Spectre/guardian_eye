// src/pages/tracked-object.tsx
import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
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
import { uploadSnipImageFromCanvas } from '../lib/api';

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
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
              onClick={() => { console.log('Cancel clicked'); onClose(); }}
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showNewObjectDialog, setShowNewObjectDialog] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ x: number; y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number; y: number } | null>(null);
  
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
        if (lastValidTime === null || detection.startTime.getTime() - lastValidTime < 300000) {
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isSelecting) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setSelectionStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setSelectionEnd(null);
  }, [isSelecting]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isSelecting || !selectionStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    setSelectionEnd({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [isSelecting, selectionStart]);

  const handleMouseUp = useCallback(async () => {
    if (!isSelecting || !selectionStart || !selectionEnd || !selectedObject) return;
    if (!videoRef.current || !containerRef.current) return;

    const video = videoRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate scaling factors
    const scaleX = video.videoWidth / containerRect.width;
    const scaleY = video.videoHeight / containerRect.height;

    const startX = Math.min(selectionStart.x, selectionEnd.x) * scaleX;
    const startY = Math.min(selectionStart.y, selectionEnd.y) * scaleY;
    const endX = Math.max(selectionStart.x, selectionEnd.x) * scaleX;
    const endY = Math.max(selectionStart.y, selectionEnd.y) * scaleY;

    // Create offscreen canvas for cropping
    const canvas = document.createElement('canvas');
    canvas.width = endX - startX;
    canvas.height = endY - startY;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(
        video,
        startX, startY, endX - startX, endY - startY,
        0, 0, endX - startX, endY - startY
      );
      
      // Add captured image to object
      const imageUrl = await uploadSnipImageFromCanvas(canvas);
      const updatedObject = {
        ...selectedObject,
        referenceImages: [...selectedObject.referenceImages, imageUrl]
      };
      setSelectedObject(updatedObject);
    }

    // Reset selection state
    setSelectionStart(null);
    setSelectionEnd(null);
    setIsSelecting(false);
  }, [isSelecting, selectionStart, selectionEnd, selectedObject, setSelectedObject, setIsSelecting]);

  // Improve usability of snipping tool: translucent fill & ESC key handling
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !containerRef.current) return;

    const drawSelection = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!selectionStart || !selectionEnd) return;

      const x = selectionStart.x;
      const y = selectionStart.y;
      const width = selectionEnd.x - selectionStart.x;
      const height = selectionEnd.y - selectionStart.y;

      // Draw semi-transparent fill
      ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
      ctx.fillRect(x, y, width, height);
      // Draw dashed border
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);
    };

    // Update canvas dimensions to match container
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    drawSelection();
  }, [selectionStart, selectionEnd]);

  // Add ESC key handling to cancel selection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSelecting) {
        setIsSelecting(false);
        setSelectionStart(null);
        setSelectionEnd(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelecting, setIsSelecting]);

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

  // ===== Long Press Logic for the "Update Reference" Button =====
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTriggeredRef = useRef(false);
  const LONG_PRESS_THRESHOLD = 800; // milliseconds

  const handleButtonMouseDown = useCallback(() => {
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      setIsSelecting(false);
      console.log('Long press detected: selection cancelled.');
    }, LONG_PRESS_THRESHOLD);
  }, [setIsSelecting]);

  const handleButtonMouseUpOrLeave = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);
  // ===============================================================

  // ===== Backend call for Review Detection =====
  const handleReviewDetection = useCallback(async (detectionId: string) => {
    try {
      // Adjust the URL and method as needed for your backend
      const response = await fetch(`/api/detections/${detectionId}/timestamp`);
      const data = await response.json();
      // For example, display the returned timestamp in an alert:
      alert(`Backend timestamp: ${data.timestamp}`);
    } catch (err) {
      console.error('Failed to fetch timestamp', err);
    }
  }, []);
  // ===================================================

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Left Panel - Map and Timeline */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* Map */}
        <div className="h-2/3 bg-white rounded-lg shadow-md overflow-hidden z-0">
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
                  ${camera.id === selectedCamera ? 'ring-2 ring-blue-500' : ''}`}
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
                          {detection.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {detection.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        <span>
                          {Math.floor(detection.videoStartTime / 60)}:
                          {(detection.videoStartTime % 60).toString().padStart(2, '0')}
                        </span>
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
                        const disputedDetection = camera.detections.find(d => d.disputed);
                        if (disputedDetection) {
                          handleReviewDetection(disputedDetection.id);
                        }
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
        {/* Video Player with Snipping Tool */}
        <div
          className="h-2/3 bg-black rounded-lg overflow-hidden relative"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
        >
          {videoUrl ? (
            <div data-vjs-player className="h-full">
              <video ref={videoRef} className="video-js vjs-big-play-centered h-full" />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ display: selectionStart ? 'block' : 'none' }}
              />
              {isSelecting && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                  <Crop className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-white text-center">
                    Click and drag to select object<br/>
                    Press ESC to cancel selection
                  </p>
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
        <div className="flex-1 bg-white rounded-lg shadow-md p-4 relative z-10">
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
                onMouseDown={handleButtonMouseDown}
                onMouseUp={handleButtonMouseUpOrLeave}
                onMouseLeave={handleButtonMouseUpOrLeave}
                onClick={() => {
                  if (!longPressTriggeredRef.current) {
                    setIsSelecting(true);
                    console.log('Single click: set isSelecting true.');
                  }
                }}
                onDoubleClick={() => {
                  setIsSelecting(false);
                  console.log('Double click: set isSelecting false.');
                }}
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
                    ${selectedObject?.id === object.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
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
