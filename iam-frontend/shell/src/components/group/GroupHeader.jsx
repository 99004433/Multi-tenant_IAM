import React from 'react';
import { Box, Button, TextField, Select, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const GroupHeader = ({ organization, onSearch, onAddGroup }) => {
  return (
    <Box
      sx={{
        position: 'sticky', // Keeps header in place while scrolling
        top: 0,
        zIndex: 1000,
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        borderBottom: '1px solid #ddd',
      }}
    >
      {/* Left Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <h3 style={{ margin: 0 }}>👥 GROUPS</h3>
        <Select value={organization} onChange={(e) => console.log(e.target.value)}>
          <MenuItem value="Manipal">Manipal</MenuItem>
          <MenuItem value="OtherOrg">OtherOrg</MenuItem>
        </Select>
      </Box>

      {/* Right Section */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Search groups..."
          variant="outlined"
          size="small"
          onChange={(e) => onSearch(e.target.value)}
        />
        <Button
          variant="contained"
          sx={{ backgroundColor: '#8e24aa' }}
          startIcon={<AddIcon />}
          onClick={onAddGroup}
        >
          ADD GROUP
        </Button>
      </Box>
    </Box>
  );
};

export default GroupHeader;