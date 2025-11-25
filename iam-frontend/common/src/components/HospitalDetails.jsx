import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const HospitalDetails = () => {
  const { name } = useParams();

  return (
    <Box sx={{ paddingTop: '10px', paddingX: '20px' }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: '20px' }}>
        {name}
      </Typography>
      <LocalHospitalIcon sx={{ fontSize: 100, color: '#00bfa5' }} />
      <Typography sx={{ marginTop: '20px', fontSize: '18px' }}>
        This is the details page for {name}. You can add more info like address, contact, etc.
      </Typography>
    </Box>
  );
};

export default HospitalDetails;