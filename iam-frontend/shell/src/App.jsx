import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Remote components
const Sidebar = React.lazy(() => import('common/Sidebar'));
const Header = React.lazy(() => import('common/Header'));
const ProtectedRoute = React.lazy(() => import('common/ProtectedRoute'));
const RoleProtectedRoute = React.lazy(() => import('common/RoleProtectedRoute'));
const AuthPage = React.lazy(() => import('common/AuthPage'));
const Home = React.lazy(() => import('common/Home'));
const HospitalDetails = React.lazy(() => import('common/HospitalDetails'));

// Local pages
import Organizations from './components/organizations';
import GroupList from './components/group/GroupList';
import GroupForm from './components/group/GroupForm';
import Users from './components/users/Users';
import Roles from './components/roles/RolesPage';

// Sidebar menu items
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const menuItems = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Organizations', path: '/Organizations', icon: <PublicIcon /> },
  { label: 'Group', path: '/group', icon: <GroupIcon /> },
  { label: 'Users', path: '/users', icon: <PersonIcon /> },
  { label: 'Roles', path: '/roles', icon: <AdminPanelSettingsIcon /> },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div>Loading Auth Page...</div>}>
        <AuthPage onLoginSuccess={() => setIsLoggedIn(true)} />
      </Suspense>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* ✅ Fixed Main Header */}
      <Suspense fallback={<div>Loading Header...</div>}>
        <div style={{
          position: 'fixed',
          top: 0,
          left: sidebarOpen ? '240px' : '60px',
          right: 0,
          height: '60px',
          backgroundColor: '#fff',
          zIndex: 1000,
          borderBottom: '1px solid #ddd',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px'
        }}>
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>
      </Suspense>

      <div style={{ display: 'flex', flex: 1, marginTop: '60px' }}>
        {/* Sidebar */}
        <Suspense fallback={<div>Loading Sidebar...</div>}>
          <Sidebar menuItems={menuItems} open={sidebarOpen} />
        </Suspense>

        <div style={{ flex: 1, padding: '20px', paddingTop: '80px' }}>
          <Suspense fallback={<div>Loading Routes...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/Organizations" element={<ProtectedRoute><Organizations /></ProtectedRoute>} />
              <Route path="/group" element={<ProtectedRoute><GroupList /></ProtectedRoute>} />
              <Route path="/group/add" element={<ProtectedRoute><GroupForm /></ProtectedRoute>} />
              <Route path="/group/edit/:id" element={<ProtectedRoute><GroupForm /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/roles" element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Roles />
                </RoleProtectedRoute>
              } />
              <Route path="/hospital/:name" element={<HospitalDetails />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
}