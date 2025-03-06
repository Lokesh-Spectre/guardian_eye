// src\components\layout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Map, Camera, Upload } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <Eye className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold">Guardian Eye</span>
              </Link>
              
              <div className="ml-10 flex items-center space-x-4">
                <Link
                  to="/cctvs"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  CCTVs
                </Link>
                <Link
                  to="/upload"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload Footage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}