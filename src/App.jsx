import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Simulation from './pages/Simulation';
import Anomalies from './pages/Anomalies';
import Recommendations from './pages/Recommendations';
import BusinessImpact from './pages/BusinessImpact';
import Reports from './pages/Reports';

/* Protected Layout: Sidebar + Header + Outlet */
const ProtectedLayout = ({ title }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-secondary)', fontSize: '16px'
      }}>
        Initializing AutoTwin Engine...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <Header title={title} />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

/* Route title mapping wrapper */
const LayoutWrapper = () => {
  return <ProtectedLayout />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<LayoutWrapper />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/assets/:id" element={<AssetDetail />} />
            <Route path="/simulation" element={<Simulation />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/impact" element={<BusinessImpact />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
