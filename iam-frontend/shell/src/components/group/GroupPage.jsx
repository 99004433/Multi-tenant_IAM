import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Typography, Grid, Card, CardContent, CardActions,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, InputLabel, FormControl, Box
} from '@mui/material';
 
const GroupsPage = () => {
  // State for list of groups and parent organizations
  const [groups, setGroups] = useState([]);
  const [parentOrgs, setParentOrgs] = useState([]);
 
  // State for dialog (create/edit)
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [currentGroup, setCurrentGroup] = useState({
    description: '',
    groupId: '',
    parentOrg: '',
    totalCount: ''
  });
 
  // Fetch groups and parent orgs on component mount
  useEffect(() => {
    fetchGroups();
    fetchParentOrgs();
  }, []);
 
  const fetchGroups = async () => {
    try {
      const res = await axios.get('/api/groups'); // GET all groups
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  };
 
  const fetchParentOrgs = async () => {
    try {
      const res = await axios.get('/api/organizations'); // GET parent organizations
      setParentOrgs(res.data);
    } catch (err) {
      console.error('Failed to fetch parent organizations:', err);
    }
  };
 
  // Open dialog for creating or editing
  const handleOpenDialog = (mode, group = { description: '', groupId: '', parentOrg: '', totalCount: '' }) => {
    setDialogMode(mode);
    setCurrentGroup(group);
    setOpenDialog(true);
  };
 
  const handleCloseDialog = () => {
    setOpenDialog(false);
    // Reset form fields
    setCurrentGroup({ description: '', groupId: '', parentOrg: '', totalCount: '' });
  };
 
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // If totalCount, ensure numeric
    const newValue = name === 'totalCount' ? Number(value) : value;
    setCurrentGroup(prev => ({ ...prev, [name]: newValue }));
  };
 
  // Submit (create or update)
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        // POST /api/groups to create new group
        await axios.post('/api/groups', {
          description: currentGroup.description,
          groupId: currentGroup.groupId,
          parentOrg: currentGroup.parentOrg,
          totalCount: currentGroup.totalCount
        });
      } else {
        // PUT /api/groups/:id to update existing group
        await axios.put(`/api/groups/${currentGroup.groupId}`, currentGroup);
      }
      fetchGroups(); // Refresh list after change
      handleCloseDialog();
    } catch (err) {
      console.error('Failed to save group:', err);
    }
  };
 
  // Delete a group by id
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/groups/${id}`);
      fetchGroups();
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };
 
  // Helper to get organization name by id
  const getOrgName = (id) => {
    const org = parentOrgs.find(o => o.id === id);
    return org ? org.name : '';
  };
 
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>Groups</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog('create')}>
        Add New Group
      </Button>
 
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        {groups.map(group => (
          <Grid item key={group.groupId} xs={12} sm={6} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">Group ID: {group.groupId}</Typography>
                <Typography>Description: {group.description}</Typography>
                <Typography>Organization: {getOrgName(group.parentOrg)}</Typography>
                <Typography>Total Count: {group.totalCount}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" variant="contained" color="primary"
                  onClick={() => handleOpenDialog('edit', group)}>
                  Edit
                </Button>
                <Button size="small" variant="outlined" color="secondary"
                  onClick={() => handleDelete(group.groupId)}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
 
      {/* Dialog for Create/Edit Form */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{dialogMode === 'create' ? 'Add Group' : 'Edit Group'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="dense" label="Group ID" name="groupId" fullWidth
              value={currentGroup.groupId} onChange={handleChange}
            />
            <TextField
              margin="dense" label="Description" name="description" fullWidth
              value={currentGroup.description} onChange={handleChange}
            />
            <FormControl fullWidth margin="dense">
              <InputLabel id="parent-org-label">Parent Organization</InputLabel>
              <Select
                labelId="parent-org-label" label="Parent Organization"
                name="parentOrg" value={currentGroup.parentOrg} onChange={handleChange}
              >
                {parentOrgs.map(org => (
                  <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="dense" label="Total Count" name="totalCount" type="number" fullWidth
              value={currentGroup.totalCount} onChange={handleChange}
            />
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
 
export default GroupsPage;