// src/pages/upload.tsx
import React from "react";
import { Clock, AlertTriangle } from "lucide-react";

const Upload = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Clock className="h-16 w-16 text-blue-600 mb-4" />
      <h1 className="text-5xl font-bold text-blue-600">Coming Soon</h1>
      <p className="mt-4 text-lg text-gray-700">
        Our upload feature is on its way. Stay tuned for updates!
      </p>
      <div className="mt-8 flex items-center space-x-2 text-gray-500">
        <AlertTriangle className="h-5 w-5" />
        <span>Check back later for updates</span>
      </div>
    </div>
  );
};

export default Upload;
