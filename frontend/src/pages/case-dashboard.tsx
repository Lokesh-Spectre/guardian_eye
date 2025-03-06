// src\pages\case-dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Eye, Plus, User, Car, Package, X } from 'lucide-react';
import { useCaseStore } from '../store/case-store';
import { casesApi, type TrackedObject } from '../lib/api';

function NewObjectDialog({ onClose, onSubmit }: { 
  onClose: () => void;
  onSubmit: (data: { type: TrackedObject['type']; name: string; description: string }) => void;
}) {
  const [formData, setFormData] = useState({
    type: 'person' as TrackedObject['type'],
    name: '',
    description: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add New Object</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
          onClose();
        }} className="space-y-4">
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

export function CaseDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cases } = useCaseStore();
  const [trackedObjects, setTrackedObjects] = useState<TrackedObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewObjectDialog, setShowNewObjectDialog] = useState(false);
  
  const currentCase = cases.find(c => c.id === id);

  useEffect(() => {
    const fetchTrackedObjects = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const objects = await casesApi.getTrackedObjects(id);
        setTrackedObjects(objects);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tracked objects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackedObjects();
  }, [id]);

  const handleAddObject = async (objectData: { 
    type: TrackedObject['type']; 
    name: string; 
    description: string 
  }) => {
    if (!id) return;

    try {
      const newObject = await casesApi.createTrackedObject(id, {
        ...objectData,
        referenceImages: []
      });
      setTrackedObjects(prev => [...prev, newObject]);
    } catch (err) {
      setError('Failed to create tracked object');
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

  if (!currentCase) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900">Case not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentCase.title}</h1>
            <p className="mt-1 text-gray-600">{currentCase.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/tracked-object/${id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Eye className="h-5 w-5" />
              <span>Track Objects</span>
            </button>
            <button
              onClick={() => setShowNewObjectDialog(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Object</span>
            </button>
            <span className={`px-3 py-1 rounded-full text-sm ${
              currentCase.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {currentCase.status.charAt(0).toUpperCase() + currentCase.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tracked Objects</h2>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tracked objects...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
          </div>
        ) : trackedObjects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No objects being tracked yet</p>
            <button
              onClick={() => setShowNewObjectDialog(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add First Object</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trackedObjects.map((object) => {
              const Icon = getObjectIcon(object.type);
              return (
                <div
                  key={object.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => navigate(`/tracked-object/${object.id}`)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{object.name}</h3>
                      <p className="text-sm text-gray-500">{object.type}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{object.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{object.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Last seen: {new Date(object.lastSeen).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      object.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : object.status === 'found'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {object.status.charAt(0).toUpperCase() + object.status.slice(1)}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {(object.confidence * 100).toFixed(1)}% confidence
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNewObjectDialog && (
        <NewObjectDialog
          onClose={() => setShowNewObjectDialog(false)}
          onSubmit={handleAddObject}
        />
      )}
    </div>
  );
}