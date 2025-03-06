import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Clock, Eye } from 'lucide-react';
import { useCaseStore } from '../store/case-store';

export function CaseDashboard() {
  const { id } = useParams();
  const { cases } = useCaseStore();
  const currentCase = cases.find(c => c.id === id);

  if (!currentCase) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Case not found</h2>
      </div>
    );
  }

  // Placeholder data for demonstration
  const trackedObjects = [
    {
      id: '1',
      type: 'person',
      lastSeen: '2024-02-28T15:30:00Z',
      location: 'Camera 3 - Main Street',
      confidence: 0.95
    },
    {
      id: '2',
      type: 'vehicle',
      lastSeen: '2024-02-28T15:25:00Z',
      location: 'Camera 1 - Park Avenue',
      confidence: 0.88
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentCase.title}</h1>
            <p className="mt-1 text-gray-600">{currentCase.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${
            currentCase.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {currentCase.status.charAt(0).toUpperCase() + currentCase.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tracked Objects</h2>
        <div className="space-y-4">
          {trackedObjects.map((object) => (
            <div key={object.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">
                      {object.type.charAt(0).toUpperCase() + object.type.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{object.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(object.lastSeen).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {(object.confidence * 100).toFixed(1)}% confidence
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}