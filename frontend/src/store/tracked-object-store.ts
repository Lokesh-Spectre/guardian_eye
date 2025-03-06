import { create } from 'zustand';

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

export interface TrackedObject {
  id: string;
  name: string;
  description: string;
  referenceImages: string[];
  type: 'person' | 'vehicle' | 'object';
}

export interface Camera {
  id: string;
  name: string;
  location: [number, number];
  detections: Detection[];
}

interface TrackedObjectStore {
  cameras: Camera[];
  selectedCamera: string | null;
  videoUrl: string | null;
  currentVideoTime: number;
  isSelecting: boolean;
  selectedObject: TrackedObject | null;
  objects: TrackedObject[];
  isLoading: boolean;
  error: string | null;
  setSelectedCamera: (id: string | null) => void;
  setVideoUrl: (url: string | null) => void;
  setCurrentVideoTime: (time: number) => void;
  setIsSelecting: (selecting: boolean) => void;
  setSelectedObject: (object: TrackedObject | null) => void;
  addObject: (object: Omit<TrackedObject, 'id' | 'referenceImages'>) => void;
  addReferenceImage: (objectId: string, imageUrl: string) => void;
}

// Dummy data for demonstration
const dummyObjects: TrackedObject[] = [
  {
    id: 'obj1',
    name: 'Blue Toyota Camry',
    description: 'Blue sedan with tinted windows',
    referenceImages: [],
    type: 'vehicle'
  },
  {
    id: 'obj2',
    name: 'Person in Red Jacket',
    description: 'Male, approximately 6ft tall',
    referenceImages: [],
    type: 'person'
  }
];

const dummyData: Camera[] = [
  {
    id: 'cam1',
    name: 'Main Street Camera',
    location: [51.505, -0.09],
    detections: [
      {
        id: 'det1',
        cameraId: 'cam1',
        startTime: new Date('2024-03-01T10:00:00Z'),
        endTime: new Date('2024-03-01T10:05:00Z'),
        confidence: 0.95,
        objectId: 'obj1',
        verified: true,
        disputed: false,
        videoStartTime: 120,
      },
      {
        id: 'det2',
        cameraId: 'cam1',
        startTime: new Date('2024-03-01T10:15:00Z'),
        endTime: new Date('2024-03-01T10:20:00Z'),
        confidence: 0.92,
        objectId: 'obj1',
        verified: true,
        disputed: false,
        videoStartTime: 450,
      },
    ],
  },
  {
    id: 'cam2',
    name: 'Park Avenue Camera',
    location: [51.51, -0.1],
    detections: [
      {
        id: 'det3',
        cameraId: 'cam2',
        startTime: new Date('2024-03-01T10:30:00Z'),
        endTime: new Date('2024-03-01T10:35:00Z'),
        confidence: 0.88,
        objectId: 'obj1',
        verified: true,
        disputed: false,
        videoStartTime: 180,
      },
    ],
  },
  {
    id: 'cam3',
    name: 'Station Camera',
    location: [51.515, -0.095],
    detections: [
      {
        id: 'det4',
        cameraId: 'cam3',
        startTime: new Date('2024-03-01T10:30:00Z'),
        endTime: new Date('2024-03-01T10:35:00Z'),
        confidence: 0.85,
        objectId: 'obj1',
        verified: false,
        disputed: true,
        videoStartTime: 300,
      },
    ],
  },
];

export const useTrackedObjectStore = create<TrackedObjectStore>((set) => ({
  cameras: dummyData,
  selectedCamera: null,
  videoUrl: null,
  currentVideoTime: 0,
  isSelecting: false,
  selectedObject: null,
  objects: dummyObjects,
  isLoading: false,
  error: null,
  setSelectedCamera: (id) => set({ selectedCamera: id }),
  setVideoUrl: (url) => set({ videoUrl: url }),
  setCurrentVideoTime: (time) => set({ currentVideoTime: time }),
  setIsSelecting: (selecting) => set({ isSelecting: selecting }),
  setSelectedObject: (object) => set({ selectedObject: object }),
  addObject: (object) => set((state) => ({
    objects: [...state.objects, { ...object, id: `obj${state.objects.length + 1}`, referenceImages: [] }]
  })),
  addReferenceImage: (objectId, imageUrl) => set((state) => ({
    objects: state.objects.map(obj =>
      obj.id === objectId
        ? { ...obj, referenceImages: [...obj.referenceImages, imageUrl] }
        : obj
    )
  }))
}));