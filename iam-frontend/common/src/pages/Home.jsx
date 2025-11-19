import React, { useState } from 'react';
import {
  Box, TextField, IconButton, Grid, Typography, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, Card, CardContent
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useNavigate } from 'react-router-dom';

const hospitalsData = [
  'Manipal Hospital',
  'BGS Hospital',
  'Narayana Hospital',
  'DRN Hospital',
  'Sigma Hospital',
  'BKG Hospital'
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hospitals, setHospitals] = useState(hospitalsData);
  const [openModal, setOpenModal] = useState(false);
  const [newHospital, setNewHospital] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredHospitals = hospitals.filter(h =>
    h.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddHospital = () => {
    if (newHospital.trim()) {
      if (editIndex !== null) {
        const updatedHospitals = [...hospitals];
        updatedHospitals[editIndex] = newHospital;
        setHospitals(updatedHospitals);
        setEditIndex(null);
      } else {
        setHospitals([...hospitals, newHospital]);
      }
      setNewHospital('');
      setOpenModal(false);
    }
  };

  const handleEdit = (index) => {
    setNewHospital(hospitals[index]);
    setEditIndex(index);
    setOpenModal(true);
  };

  const handleDelete = (index) => {
    const updatedHospitals = hospitals.filter((_, i) => i !== index);
    setHospitals(updatedHospitals);
  };

  return (
    <Box sx={{ paddingTop: '80px', paddingX: '20px' }}>
      {/* Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <TextField
          placeholder="Search Hospital"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: <SearchIcon sx={{ marginRight: '8px', color: '#555' }} />,
            endAdornment: searchTerm && (
              <IconButton onClick={() => setSearchTerm('')}>✕</IconButton>
            )
          }}
          sx={{
            width: '300px',
            backgroundColor: '#fff',
            borderRadius: '30px',
            transition: 'all 0.3s ease',
            '&:focus-within': {
              boxShadow: '0 0 8px rgba(0,0,0,0.2)',
              transform: 'scale(1.02)'
            }
          }}
        />
        <Button
          startIcon={<AddCircleOutlineIcon />}
          variant="outlined"
          onClick={() => setOpenModal(true)}
          sx={{ fontWeight: 'bold', borderRadius: '30px' }}
        >
          Add Hospital
        </Button>
      </Box>

      {/* Hospital Grid */}
      <Grid container spacing={3}>
        {filteredHospitals.map((hospital, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                textAlign: 'center',
                padding: '20px',
                borderRadius: '15px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  cursor: 'pointer'
                }
              }}
              onClick={() => navigate(`/hospital/${hospital}`)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '50%',
                    width: '80px',
                    height: '80px',
                    margin: '0 auto'
                  }}
                >
                  <LocalHospitalIcon sx={{ fontSize: 50, color: '#1976d2' }} />
                </Box>
                <Typography sx={{ marginTop: '12px', fontWeight: '600', fontSize: '18px' }}>
                  {hospital}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '12px' }}>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(index); }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(index); }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Hospital Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>{editIndex !== null ? 'Edit Hospital' : 'Add New Hospital'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Hospital Name"
            fullWidth
            margin="dense"
            value={newHospital}
            onChange={(e) => setNewHospital(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddHospital}>
            {editIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;