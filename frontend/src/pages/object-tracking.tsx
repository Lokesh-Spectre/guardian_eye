import React, { useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { List, Map as MapIcon, Grid, Clock, Crosshair } from 'lucide-react';

export function ObjectTracking() {
  const { id } = useParams();
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        sources: [{
          // Placeholder video source
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
        <div className="bg-black rounded-lg overflow-hidden">
          <div data-vjs-player>
            <video
              ref={videoRef}
              className="video-js vjs-big-play-centered"
            />
          </div>
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
      <div className="w-1/3 bg-white p-4 border-l">
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
          <div>
            <h3 className="text-lg font-semibold mb-3">Detected Objects</h3>
            <div className="space-y-2">
              {['Person', 'Vehicle', 'Bag'].map((object) => (
                <div
                  key={object}
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                >
                  <span>{object}</span>
                  <Crosshair className="h-4 w-4 text-gray-500" />
                </div>
              ))}
            </div>
          </div>

          {/* Selected Object Details */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Selected Object</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-500 text-center">No object selected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}