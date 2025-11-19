import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ menuItems = [], open = true }) => {
  const location = useLocation();

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? 120 : 60,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 120 : 60,
          transition: 'width 0.3s ease-in-out',
          boxSizing: 'border-box',
          backgroundColor: '#fff',
          borderRight: '1px solid #ccc',
          marginTop: '64px',
        },
      }}
    >
      <List sx={{ paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <ListItem
              button
              key={item.label}
              component={Link}
              to={item.path}
              sx={{
                backgroundColor: location.pathname === item.path ? '#f0f0f0' : 'transparent',
                color: '#000',
                '&:hover': { backgroundColor: '#eaeaea' },
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 8px',
                width: '100%',
              }}
            >
              <ListItemIcon sx={{ color: '#000', minWidth: 'auto' }}>
                {React.cloneElement(item.icon, { sx: { fontSize: 40 } })}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  textAlign: 'center',
                  fontSize: '14px',
                  marginTop: '6px',
                }}
              />
            </ListItem>
          ))
        ) : (
          <div style={{ padding: '10px', color: '#999' }}>No menu items</div>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;