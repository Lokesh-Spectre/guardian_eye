// src\lib\api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Case {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  status: "open" | "closed";
}

export interface TrackedObject {
  id: string;
  caseId: string;
  type: 'person' | 'vehicle' | 'object';
  name: string;
  description: string;
  lastSeen: Date;
  location: string;
  confidence: number;
  status: 'active' | 'found' | 'lost';
  referenceImages: string[];
}

export interface Detection {
  id: string;
  cameraId: string;
  startTime: Date;
  endTime: Date;
  confidence: number;
  objectId: string;
  verified: boolean;
  disputed: boolean;
  videoStartTime: number;
}

export interface Camera {
  id: string;
  name: string;
  location: [number, number];
  detections: Detection[];
}

export const casesApi = {
  getAllCases: async (): Promise<Case[]> => {
    // For now, return dummy data
    return [
      {
        id: "case-001",
        title: "Missing Person - John Doe",
        description: "Last seen at Central Station",
        createdAt: new Date("2024-02-28T10:00:00Z"),
        status: "open",
      },
      {
        id: "case-002",
        title: "Vehicle Theft - Blue Toyota",
        description: "Stolen from Main Street parking",
        createdAt: new Date("2024-02-27T15:30:00Z"),
        status: "open",
      },
      {
        id: "case-003",
        title: "Vandalism Report",
        description: "Graffiti incident at City Park",
        createdAt: new Date("2024-02-26T09:15:00Z"),
        status: "closed",
      },
    ];
  },

  searchCases: async (query: string): Promise<Case[]> => {
    // For now, filter dummy data
    const allCases = await casesApi.getAllCases();
    const lowercaseQuery = query.toLowerCase();

    return allCases.filter(
      (case_) =>
        case_.id.toLowerCase().includes(lowercaseQuery) ||
        case_.title.toLowerCase().includes(lowercaseQuery)
    );
  },

  createCase: async (
    caseData: Omit<Case, "id" | "createdAt">
  ): Promise<Case> => {
    // For now, return dummy data
    return {
      ...caseData,
      id: `case-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
  },

  getTrackedObjects: async (caseId: string): Promise<TrackedObject[]> => {
    // For now, return dummy data
    return [
      {
        id: "obj-001",
        caseId,
        type: "person",
        name: "John Doe",
        description: "Male, 6'0\", wearing blue jacket",
        lastSeen: new Date("2024-03-01T15:30:00Z"),
        location: "Camera 3 - Main Street",
        confidence: 0.95,
        status: "active",
        referenceImages: [
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200"
        ]
      },
      {
        id: "obj-002",
        caseId,
        type: "vehicle",
        name: "Blue Toyota Camry",
        description: "License plate: ABC123",
        lastSeen: new Date("2024-03-01T14:45:00Z"),
        location: "Camera 1 - Park Avenue",
        confidence: 0.88,
        status: "active",
        referenceImages: [
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=200&h=200"
        ]
      }
    ];
  },

  createTrackedObject: async (
    caseId: string,
    objectData: Omit<TrackedObject, "id" | "caseId" | "lastSeen" | "location" | "confidence" | "status">
  ): Promise<TrackedObject> => {
    // For now, return dummy data
    return {
      ...objectData,
      id: `obj-${Math.random().toString(36).substr(2, 9)}`,
      caseId,
      lastSeen: new Date(),
      location: "Not yet detected",
      confidence: 0,
      status: "active",
    };
  },

  updateTrackedObject: async (
    objectId: string,
    updates: Partial<TrackedObject>
  ): Promise<TrackedObject> => {
    // For now, simulate updating the object
    return {
      id: objectId,
      caseId: "case-001",
      type: "person",
      name: "Updated Object",
      description: "Updated description",
      lastSeen: new Date(),
      location: "Updated location",
      confidence: 0.9,
      status: "active",
      referenceImages: updates.referenceImages || [],
    };
  },

  addReferenceImage: async (
    objectId: string,
    imageData: string
  ): Promise<TrackedObject> => {
    // For now, simulate adding a reference image
    return {
      id: objectId,
      caseId: "case-001",
      type: "person",
      name: "Object with New Image",
      description: "Description",
      lastSeen: new Date(),
      location: "Current location",
      confidence: 0.9,
      status: "active",
      referenceImages: [imageData],
    };
  },

  getCameras: async (): Promise<Camera[]> => {
    // For now, return dummy data
    return [
      {
        id: "cam1",
        name: "Main Street Camera",
        location: [51.505, -0.09],
        detections: [
          {
            id: "det1",
            cameraId: "cam1",
            startTime: new Date("2024-03-01T10:00:00Z"),
            endTime: new Date("2024-03-01T10:05:00Z"),
            confidence: 0.95,
            objectId: "obj1",
            verified: true,
            disputed: false,
            videoStartTime: 120,
          },
        ],
      },
      {
        id: "cam2",
        name: "Park Avenue Camera",
        location: [51.51, -0.1],
        detections: [
          {
            id: "det2",
            cameraId: "cam2",
            startTime: new Date("2024-03-01T10:30:00Z"),
            endTime: new Date("2024-03-01T10:35:00Z"),
            confidence: 0.88,
            objectId: "obj1",
            verified: true,
            disputed: false,
            videoStartTime: 180,
          },
        ],
      },
    ];
  },
};