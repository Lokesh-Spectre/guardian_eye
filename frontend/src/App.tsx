// src\App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout';
import { Dashboard } from './pages/dashboard';
import { CaseDashboard } from './pages/case-dashboard';
import { ObjectTracking } from './pages/object-tracking';
import { CCTVs } from './pages/cctvs';
import { AddCCTV } from './pages/add-cctv';
import { TrackedObject } from './pages/tracked-object';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/case/:id" element={<CaseDashboard />} />
          <Route path="/case/:id/tracking" element={<TrackedObject />} />
          <Route path="/tracking/:id" element={<ObjectTracking />} />
          <Route path="/tracked-object/:id" element={<TrackedObject />} />
          <Route path="/cctvs" element={<CCTVs />} />
          <Route path="/cctvs/add" element={<AddCCTV />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App