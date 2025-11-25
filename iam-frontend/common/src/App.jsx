import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Local components in common
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuthPage from './components/AuthPage';
import Home from './pages/Home';
import HospitalDetails from './components/HospitalDetails';

// Material UI Icons for consistency
import HomeIcon from '@mui/icons-material/Home';
import PublicIcon from '@mui/icons-material/Public';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Example local pages
const DummyPage = () => <h2>Dummy Page</h2>;

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  if (!isLoggedIn) {
    return <AuthPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // Use same menu items as shell for consistency
  const menuItems = [
    { label: 'Home', path: '/', icon: <HomeIcon /> },
    { label: 'Orgs', path: '/orgs', icon: <PublicIcon /> },
    { label: 'Group', path: '/group', icon: <GroupIcon /> },
    { label: 'Users', path: '/users', icon: <PersonIcon /> },
    { label: 'Roles', path: '/roles', icon: <AdminPanelSettingsIcon /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar menuItems={menuItems} open={sidebarOpen} />

        <div style={{ flex: 1, padding: '20px', paddingTop: '10px' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dummy" element={<DummyPage />} />
            <Route path="/hospital/:name" element={<HospitalDetails />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}