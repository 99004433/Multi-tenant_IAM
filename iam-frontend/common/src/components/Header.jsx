import React from 'react';
import {
  AppBar, Toolbar, Typography, Box, Button, IconButton
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    alert('Logged out!');
    navigate('/');
    window.location.reload();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#fff',
        color: '#000',
        boxShadow: 'none',
        borderBottom: '1px solid #ccc',
        zIndex: 1201 // Ensures header stays above sidebar
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Left Section: Sidebar Toggle + Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <IconButton onClick={toggleSidebar} sx={{ transition: 'transform 0.3s ease' }}>
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <SecurityIcon sx={{ fontSize: 40, color: '#00bfa5' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>HealthCare</Typography>
        </Box>

        {/* Right Section: Profile + Logout */}
        <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <AccountCircleIcon sx={{ fontSize: 32 }} />
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;