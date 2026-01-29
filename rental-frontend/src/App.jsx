import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminProducts from './pages/AdminProducts';
import Dashboard from './pages/Dashboard';
import AdminLanding from './pages/AdminLanding';
import AdminTemplate from './pages/AdminTemplate';
import AdminUsers from './pages/AdminUsers';
import ClientBooking from './pages/ClientBooking';
import AgreementView from './pages/AgreementView';
import AgreementManager from './pages/AgreementManager';
import Sidebar from './components/Sidebar';

import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // list of paths where sidebar should NOT appear
  const noSidebarPaths = ['/login'];
  const showSidebar = !noSidebarPaths.includes(location.pathname);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={showSidebar ? "app-layout" : "auth-layout"} style={showSidebar ? { display: 'block', width: '100%', minHeight: '100vh' } : { width: '100%', minHeight: '100vh' }}>

      {/* Mobile Overlay */}
      {showSidebar && isMobileSidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 990, // Just below sidebar (1000)
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      {/* Mobile Header */}
      {showSidebar && (
        <div className="mobile-only" style={{
          padding: '1rem',
          background: 'white',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 900
        }}>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)'
            }}
          >
            <Menu size={24} />
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>AeonCare</span>
        </div>
      )}

      {showSidebar && <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />}

      <main className={showSidebar ? "main-content" : "auth-content"} style={showSidebar ? {} : { margin: 0, padding: 0, width: '100%' }}>
        <div className={showSidebar ? "content-container" : ""}>
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={<ClientBooking />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/agreements" element={<AgreementManager />} />
          <Route path="/agreement/:id" element={<AgreementView />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLanding />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/template" element={<AdminTemplate />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
