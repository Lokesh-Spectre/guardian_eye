// src/lib/api.ts
import axios from "axios";
import { TrackedObject } from "../pages/tracked-object";

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
  type: "person" | "vehicle" | "object";
  name: string;
  description: string;
  lastSeen: Date;
  location: string;
  confidence: number;
  status: "active" | "found" | "lost";
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
    const resp = await api.get("/case");
    console.log("DATA BACKED: ", resp.data);
    // For now, return dummy data
    const data = resp.data.map(
      (a: { id: any; name: any; description: any; caseStatus: any }) => ({
        id: a.id,
        title: a.name,
        description: a.description,
        status: a.caseStatus,
      })
    );
    return data;
    // return [
    //   {
    //     id: "case-001",
    //     title: "Missing Person - John Doe",
    //     description: "Last seen at Central Station",
    //     createdAt: new Date("2024-02-28T10:00:00Z"),
    //     status: "open",
    //   },
    //   {
    //     id: "case-002",
    //     title: "Vehicle Theft - Blue Toyota",
    //     description: "Stolen from Main Street parking",
    //     createdAt: new Date("2024-02-27T15:30:00Z"),
    //     status: "open",
    //   },
    //   {
    //     id: "case-003",
    //     title: "Vandalism Report",
    //     description: "Graffiti incident at City Park",
    //     createdAt: new Date("2024-02-26T09:15:00Z"),
    //     status: "closed",
    //   },
    // ];
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
    const payload = {
      name: caseData.title,
      description: caseData.description,
      caseStatus: caseData.status.toUpperCase(),
      isClose: false,
    };
    const resp = await api.post("/case", payload);
    return resp.data;
    // return {
    //   ...caseData,
    //   id: `case-${Math.random().toString(36).substr(2, 9)}`,
    //   createdAt: new Date(),
    // };
  },

  getTrackedObjects: async (caseId: string): Promise<TrackedObject[]> => {
    const resp = await api.get("/tracked-object");
    const data = resp.data.map(
      (a: {
        id: any;
        name: any;
        description: any;
        lastSeen: any;
        location: any;
      }) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        lastSeenTimeStamp: a.lastSeen,
        currentLocation: a.location,
      })
    );
    return data;
    // For now, return dummy data
    // return [
    //   {
    //     id: "obj-001",
    //     caseId,
    //     type: "person",
    //     name: "John Doe",
    //     description: "Male, 6'0\", wearing blue jacket",
    //     lastSeen: new Date("2024-03-01T15:30:00Z"),
    //     location: "Camera 3 - Main Street",
    //     confidence: 0.95,
    //     status: "active",
    //     referenceImages: [
    //       "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200",
    //     ],
    //   },
    //   {
    //     id: "obj-002",
    //     caseId,
    //     type: "vehicle",
    //     name: "Blue Toyota Camry",
    //     description: "License plate: ABC123",
    //     lastSeen: new Date("2024-03-01T14:45:00Z"),
    //     location: "Camera 1 - Park Avenue",
    //     confidence: 0.88,
    //     status: "active",
    //     referenceImages: [
    //       "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&q=80&w=200&h=200",
    //     ],
    //   },
    // ];
  },

  createTrackedObject: async (
    caseId: string,
    objectData: Omit<
      TrackedObject,
      "id" | "caseId" | "lastSeen" | "location" | "confidence" | "status"
    >
  ): Promise<TrackedObject> => {
    // For now, return dummy data
    const payload = {
      name: TrackedObject.name,
      description: "None",
      type: "HUMAN",
      lastseenSeenTimestamp: new Date(),
      currentLocation: "not detected yet",
    };
    const resp = await api.post("/tracked-object", payload);
    return resp.data;
    // return {
    //   ...objectData,
    //   id: `obj-${Math.random().toString(36).substr(2, 9)}`,
    //   caseId,
    //   lastSeen: new Date(),
    //   location: "Not yet detected",
    //   confidence: 0,
    //   status: "active",
    // };
  },

  updateTrackedObject: async (
    objectId: string,
    updates: Partial<TrackedObject>
  ): Promise<TrackedObject> => {
    // For now, simulate updating the object
    const payload = {
      name: TrackedObject.name,
      description: "None",
      type: "HUMAN",
      lastseenSeenTimestamp: new Date(),
      currentLocation: "not detected yet",
    };
    const resp = await api.post("/tracked-object", payload);
    return resp.data;
    // return {
    //   id: objectId,
    //   caseId: "case-001",
    //   type: "person",
    //   name: "Updated Object",
    //   description: "Updated description",
    //   lastSeen: new Date(),
    //   location: "Updated location",
    //   confidence: 0.9,
    //   status: "active",
    //   referenceImages: updates.referenceImages || [],
    // };
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
    const resp = await api.get("/cctv");
    const data = resp.data.map(
      (a: { id: any; name: any; directions: any; location: any }) => ({
        id: a.id,
        name: a.name,
        lattitude: a.location[0],
        longitude: a.location[1],
        isActive: true,
        lastMaintenanceDate: new Date(),
      })
    );
    return data;
    // return [
    //   {
    //     id: "cam1",
    //     name: "Main Street Camera",
    //     location: [51.505, -0.09],
    //     detections: [
    //       {
    //         id: "det1",
    //         cameraId: "cam1",
    //         startTime: new Date("2024-03-01T10:00:00Z"),
    //         endTime: new Date("2024-03-01T10:05:00Z"),
    //         confidence: 0.95,
    //         objectId: "obj1",
    //         verified: true,
    //         disputed: false,
    //         videoStartTime: 120,
    //       },
    //     ],
    //   },
    //   {
    //     id: "cam2",
    //     name: "Park Avenue Camera",
    //     location: [51.51, -0.1],
    //     detections: [
    //       {
    //         id: "det2",
    //         cameraId: "cam2",
    //         startTime: new Date("2024-03-01T10:30:00Z"),
    //         endTime: new Date("2024-03-01T10:35:00Z"),
    //         confidence: 0.88,
    //         objectId: "obj1",
    //         verified: true,
    //         disputed: false,
    //         videoStartTime: 180,
    //       },
    //     ],
    //   },
    // ];
  },
};

// ===== New Video API Function =====
export const videoApi = {
  /**
   * Fetches a video URL from the backend based on a provided ID.
   * Adjust the endpoint as needed.
   */
  getVideoUrl: async (id: string): Promise<string> => {
    try {
      const response = await api.get(`/videos/${id}`);
      // Assuming your backend returns an object with a "url" property
      return response.data.url;
    } catch (error) {
      console.error("Failed to fetch video URL:", error);
      throw error;
    }
  },
};
// In your lib/api.ts file, add this function:

export const uploadSnipImageFromCanvas = (
  canvas: HTMLCanvasElement
): Promise<string> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        return reject(new Error("Canvas is empty"));
      }
      try {
        const formData = new FormData();
        formData.append("file", blob, "snip.png");
        // Use your Axios instance (api) to post the FormData.
        const response = await api.post("/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        // Expecting the backend to return a JSON object with a `url` property.
        resolve(response.data.url);
      } catch (error) {
        reject(error);
      }
    }, "image/png");
  });
};
export interface CameraDetails {
  id: string;
  name: string;
  description: string;
  angle: number;
  direction: number;
  location: [number, number];
}

// Function to fetch camera details by ID
export const getCameraDetails = async (id: string): Promise<CameraDetails> => {
  const resp = await api.get(`/cctv/`);
  const data = resp.data.map(
    (a: { id: any; name: any; directions: any; location: any }) => ({
      id: a.id,
      name: a.name,
      lattitude: a.location[0],
      longitude: a.location[1],
      isActive: true,
      lastMaintenanceDate: new Date(),
    })
  );
  console.log(data);
  return data;
};

// Function to update camera details
export const updateCameraDetails = async (
  id: string,
  Details: Partial<CameraDetails>
): Promise<CameraDetails> => {
  const data = {
    name: Details.name,
    description: Details.description,
    direction: Details.direction,
    latitude: Details.location ? Details.location[0] : 0, // default value if undefined
    longitude: Details.location ? Details.location[1] : 0,
    isActive: true,
    lastMaintenanceDate: new Date(),
  };
  const response = await api.post(`/cctv`, data);

  return response.data;
};
