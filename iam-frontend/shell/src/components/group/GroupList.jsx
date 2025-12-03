
// GroupList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Container, Typography, Button, Dialog, Box, Grid, Card, CardContent,
  CardActions, IconButton, Pagination, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

import GroupFormDialog from './GroupFormDialog';


// ✅ Safe for Vite and fallback
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8085';


const normalizeOrg = (org) => ({
  id: org.orgId ?? org.id,
  name: org.name ?? '',
  status: String(org.status ?? '').toUpperCase() || 'INACTIVE',
});

const normalizeRole = (role) => ({
  id: role.roleId ?? role.id,
  name: role.name ?? '',
  status: String(role.status ?? '').toUpperCase() || 'ACTIVE',
});

const normalizeGroup = (g) => ({
  id: g.id ?? g.groupId,
  name: g.name ?? '',
  description: g.description ?? '',
  status: String(g.status ?? 'ACTIVE').toUpperCase(),
  // store org ID (preferred)
  parentOrgId: g.parentOrgId ?? g.parentOrg ?? null,
  allowed_role_ids: Array.isArray(g.allowed_role_ids) ? g.allowed_role_ids : [],
  totalCount: g.totalCount ?? 0,
});

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [currentGroup, setCurrentGroup] = useState({
    id: null,
    name: '',
    description: '',
    status: 'ACTIVE',
    parentOrgId: '',
    allowed_role_ids: [],
    totalCount: 0,
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  // -------- Fetchers --------
  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/groups`);
      const normalized = Array.isArray(res.data) ? res.data.map(normalizeGroup) : [];
      setGroups(normalized);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
      alert('Failed to fetch groups.');
    }
  };

  const fetchOrganizations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/organizations`);
      const normalized = Array.isArray(res.data) ? res.data.map(normalizeOrg) : [];
      setOrganizations(normalized);
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      alert('Failed to fetch organizations.');
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/roles`);
      const normalized = Array.isArray(res.data) ? res.data.map(normalizeRole) : [];
      setRoles(normalized);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
      alert('Failed to fetch roles.');
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchOrganizations();
    fetchRoles();
  }, []);

  // Reset pagination when filter/search changes
  useEffect(() => {
    setPage(1);
  }, [selectedOrgId, searchQuery]);

  // -------- Dialog handlers --------
  const handleOpenDialog = (mode, group = null) => {
    setDialogMode(mode);

    if (mode === 'edit' && group) {
      setCurrentGroup(normalizeGroup(group));
    } else {
      // create mode: default to selected org filter (if set)
      setCurrentGroup({
        id: null,
        name: '',
        description: '',
        status: 'ACTIVE',
        parentOrgId: selectedOrgId || '',
        allowed_role_ids: [],
        totalCount: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmitGroup = async (groupPayload) => {
    // Basic validation
    if (!groupPayload.name?.trim()) {
      alert('Group name is required.');
      return;
    }
    if (!groupPayload.parentOrgId) {
      alert('Please select an organization.');
      return;
    }

    try {
      if (dialogMode === 'create') {
        await axios.post(`${API_BASE}/api/groups/create`, groupPayload);
      } else {
        await axios.put(
          `${API_BASE}/api/groups/updatedGroup/${groupPayload.id}`,
          groupPayload
        );
      }
      await fetchGroups();
      setOpenDialog(false);
    } catch (err) {
      console.error('Failed to save group:', err);
      alert('Failed to save group. Please check server logs/Network tab.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await axios.delete(`${API_BASE}/api/groups/deleteById/${id}`);
      fetchGroups();
    } catch (err) {
      console.error('Failed to delete group:', err);
      alert('Failed to delete group.');
    }
  };

  // -------- Derived data --------
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groups.filter((g) => {
      const matchName = g.name.toLowerCase().includes(q);
      const matchOrg =
        selectedOrgId ? String(g.parentOrgId) === String(selectedOrgId) : true;
      return matchName && matchOrg;
    });
  }, [groups, searchQuery, selectedOrgId]);

  const paginatedGroups = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredGroups.slice(start, start + itemsPerPage);
  }, [filteredGroups, page]);

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
          zIndex: 1000,
        }}
      >
        <Box display="flex" alignItems="center">
          <GroupIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            GROUPS
          </Typography>
          {selectedOrgId && (
            <Typography sx={{ ml: 2 }}>
              Selected Org ID: {selectedOrgId}
            </Typography>
          )}
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

      {/* Search + Filter */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <TextField
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
        <FormControl sx={{ minWidth: 240 }}>
          <InputLabel id="org-filter-label">Select Organization</InputLabel>
          <Select
            labelId="org-filter-label"
            id="org-filter"
            label="Select Organization"
            value={selectedOrgId}
            onChange={(e) => setSelectedOrgId(e.target.value)}
          >
            <MenuItem value="">All Organizations</MenuItem>
            {organizations
              .filter((org) => org.status === 'ACTIVE')
              .map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      {/* Cards */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {paginatedGroups.map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group.id}>
            <Card sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6">{group.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Description: {group.description || 'No description'}
                </Typography>
                <Typography variant="body2">ID: {group.id}</Typography>
                <Typography variant="body2">
                  Parent Org ID: {group.parentOrgId || '-'}
                </Typography>
                <Typography variant="body2">
                  Roles: {group.allowed_role_ids?.length || 0}
                </Typography>
                <Typography variant="body2">
                  Total Count: {group.totalCount || 0}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton
                  aria-label="Edit group"
                  color="primary"
                  onClick={() => handleOpenDialog('edit', group)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  aria-label="Delete group"
                  color="error"
                  onClick={() => handleDelete(group.id)}
                >
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <GroupFormDialog
          mode={dialogMode}
          organizations={organizations}
          roles={roles}
          group={currentGroup}
          onChange={setCurrentGroup}
          onCancel={handleCloseDialog}
          onSubmit={handleSubmitGroup}
        />
      </Dialog>
    </Container>
  );
};

export default GroupList;
