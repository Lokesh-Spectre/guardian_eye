// src\pages\object-tracking.tsx
import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { List, Map as MapIcon, Grid, Clock, Crosshair, Plus, Camera } from 'lucide-react';
import { casesApi, type TrackedObject } from '../lib/api';

interface SnippingToolProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onSnip: (imageData: string) => void;
  onCancel: () => void;
}

function SnippingTool({ videoRef, onSnip, onCancel }: SnippingToolProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [endPos, setEndPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setEndPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw selection rectangle
    ctx.clearRect(
      Math.min(startPos.x, endPos.x),
      Math.min(startPos.y, endPos.y),
      Math.abs(endPos.x - startPos.x),
      Math.abs(endPos.y - startPos.y)
    );
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const snipCanvas = document.createElement('canvas');
    const ctx = snipCanvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions for the snipped area
    snipCanvas.width = Math.abs(endPos.x - startPos.x);
    snipCanvas.height = Math.abs(endPos.y - startPos.y);

    // Draw the selected portion of the video
    ctx.drawImage(
      video,
      Math.min(startPos.x, endPos.x),
      Math.min(startPos.y, endPos.y),
      snipCanvas.width,
      snipCanvas.height,
      0,
      0,
      snipCanvas.width,
      snipCanvas.height
    );

    // Get the image data
    const imageData = snipCanvas.toDataURL('image/png');
    onSnip(imageData);
    setIsDrawing(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // Match canvas size to video size
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    // Initial semi-transparent overlay
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [videoRef]);

  return (
    <div className="absolute inset-0 z-10">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="absolute top-4 right-4 space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white text-gray-700 rounded-md shadow-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ObjectTracking() {
  const { id } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isSnipping, setIsSnipping] = useState(false);
  const [selectedObject, setSelectedObject] = useState<TrackedObject | null>(null);
  const [objects, setObjects] = useState<TrackedObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchObjects = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const fetchedObjects = await casesApi.getTrackedObjects(id);
        setObjects(fetchedObjects);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tracked objects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchObjects();
  }, [id]);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        sources: [{
          src: 'https://vjs.zencdn.net/v/oceans.mp4',
          type: 'video/mp4'
        }]
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, []);

  const handleSnip = async (imageData: string) => {
    if (!selectedObject) return;

    try {
      const updatedObject = await casesApi.addReferenceImage(selectedObject.id, imageData);
      setObjects(objects.map(obj => 
        obj.id === updatedObject.id ? updatedObject : obj
      ));
      setIsSnipping(false);
    } catch (err) {
      setError('Failed to add reference image');
    }
  };

  const viewModes = [
    { icon: MapIcon, label: 'Map View' },
    { icon: Grid, label: 'Gallery View' },
    { icon: List, label: 'Table View' },
    { icon: Clock, label: 'Timeline View' }
  ];

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Left Panel */}
      <div className="w-2/3 flex flex-col p-4 space-y-4">
        {/* Video Player */}
        <div className="bg-black rounded-lg overflow-hidden relative">
          <div data-vjs-player>
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered"
            />
          </div>
          {isSnipping && (
            <SnippingTool
              videoRef={videoRef}
              onSnip={handleSnip}
              onCancel={() => setIsSnipping(false)}
            />
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Timeline</h3>
          <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center">
            <span className="text-gray-500">Timeline visualization will appear here</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-1/3 bg-white p-4 border-l flex flex-col">
        <div className="space-y-6">
          {/* View Mode Selector */}
          <div className="flex space-x-2">
            {viewModes.map(({ icon: Icon, label }) => (
              <button
                key={label}
                className="flex-1 py-2 px-3 rounded-md border hover:bg-gray-50 flex items-center justify-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Object List */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3">Detected Objects</h3>
            <div className="h-[calc(100vh-24rem)] overflow-y-auto pr-2 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center p-4">{error}</div>
              ) : objects.map((object) => (
                <div
                  key={object.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedObject?.id === object.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedObject(object)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{object.name}</h4>
                      <p className="text-sm text-gray-600">{object.type}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedObject(object);
                        setIsSnipping(true);
                      }}
                      className="p-1 hover:bg-gray-100 rounded-full"
                      title="Add reference image"
                    >
                      <Plus className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                  {object.referenceImages.length > 0 && (
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                      {object.referenceImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Reference ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-2 text-sm text-gray-600">
                    Last seen: {new Date(object.lastSeen).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Object Details */}
          {selectedObject && (
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Selected Object</h3>
                <button
                  onClick={() => setIsSnipping(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Camera className="h-4 w-4" />
                  <span>Add Image</span>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1">{selectedObject.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1">{selectedObject.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 capitalize">{selectedObject.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Confidence</label>
                  <p className="mt-1">{(selectedObject.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}