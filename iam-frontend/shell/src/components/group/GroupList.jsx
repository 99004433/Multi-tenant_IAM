import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, InputLabel, FormControl, Box,
  Grid, Card, CardContent, CardActions, IconButton, Pagination
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [currentGroup, setCurrentGroup] = useState({
    id: null,
    name: '',
    description: '',
    status: 'ACTIVE',
    parentOrg: '',
    totalCount: 0
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchGroups();
    fetchOrganizations();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get('http://localhost:8082/api/groups');
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/organizations');
      setOrganizations(res.data);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    }
  };

  const handleOpenDialog = (mode, group = {}) => {
    setDialogMode(mode);
    setCurrentGroup({
      id: group.id || group.groupId,
      name: group.name || '',
      description: group.description || '',
      status: group.status || 'ACTIVE',
      parentOrg: group.parentOrg || selectedOrg,
      totalCount: group.totalCount || 0
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentGroup({ id: null, name: '', description: '', status: 'ACTIVE', parentOrg: selectedOrg, totalCount: 0 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentGroup(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await axios.post('http://localhost:8082/api/groups/create', currentGroup);
      } else {
        await axios.put(`http://localhost:8082/api/groups/updatedGroup/${currentGroup.id}`, currentGroup);
      }
      fetchGroups();
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save group:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8082/api/groups/deleteById/${id}`);
      fetchGroups();
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedOrg ? group.parentOrg === selectedOrg : true)
  );

  const paginatedGroups = filteredGroups.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Container maxWidth="lg">
      {/* Sticky Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          width: '100%',
          backgroundColor: '#1976d2',
          color: '#fff',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}
      >
        <Box display="flex" alignItems="center">
          <GroupIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>GROUPS</Typography>
          {selectedOrg && <Typography sx={{ ml: 2 }}>{selectedOrg}</Typography>}
        </Box>
        <Button
          variant="contained"
          sx={{ backgroundColor: '#8e24aa' }}
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('create')}
        >
          ADD GROUP
        </Button>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <TextField
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />
          }}
          fullWidth
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Organization</InputLabel>
          <Select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            <MenuItem value="">All Organizations</MenuItem>
            {organizations
              .filter(org => org.status === 'ACTIVE')
              .map(org => (
                <MenuItem key={org.id} value={org.name}>{org.name}</MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {/* Cards Layout */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {paginatedGroups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.id || group.groupId}>
            <Card sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6">{group.name}</Typography>
                <Typography variant="body2" color="textSecondary">Description: {group.description || 'No description'}</Typography>
                <Typography variant="body2">ID: {group.id || group.groupId}</Typography>
                <Typography variant="body2">Parent Org: {group.parentOrg || selectedOrg}</Typography>
                <Typography variant="body2">Total Count: {group.totalCount || 0}</Typography>
                <Button size="small" sx={{ mt: 1 }} variant="outlined">Show Counts</Button>
              </CardContent>
              <CardActions>
                <IconButton color="primary" onClick={() => handleOpenDialog('edit', group)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleDelete(group.id || group.groupId)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil(filteredGroups.length / itemsPerPage)}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'create' ? 'Add Group' : 'Edit Group'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="dense" label="Group Name" name="name" fullWidth
              value={currentGroup.name} onChange={handleChange} required
            />
            <TextField
              margin="dense" label="Description" name="description" fullWidth
              value={currentGroup.description} onChange={handleChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel>Parent Organization</InputLabel>
              <Select
                name="parentOrg"
                value={currentGroup.parentOrg}
                onChange={handleChange}
              >
                {organizations
                  .filter(org => org.status === 'ACTIVE')
                  .map(org => (
                    <MenuItem key={org.id} value={org.name}>{org.name}</MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="dense">
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={currentGroup.status}
                onChange={handleChange}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'create' ? 'Add' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupList;