
import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl, Chip } from '@mui/material';
import axios from 'axios';

const GroupForm = ({ groupId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [orgId, setOrgId] = useState('');
  const [allowedRoleIds, setAllowedRoleIds] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Fetch organizations and roles
    axios.get('/api/organizations').then(res => setOrganizations(res.data));
    axios.get('/api/roles').then(res => setRoles(res.data));

    if (groupId) {
      axios.get(`/api/groups/${groupId}`).then(res => {
        const g = res.data;
        setName(g.name);
        setDescription(g.description);
        setStatus(g.status);
        setOrgId(g.org_id || '');
        setAllowedRoleIds(g.allowed_role_ids || []);
      });
    }
  }, [groupId]);

  const handleSubmit = async () => {
    const payload = {
      name,
      description,
      status,
      org_id: orgId,
      allowed_role_ids: allowedRoleIds
    };

    if (groupId) {
      await axios.put(`/api/groups/${groupId}`, payload);
    } else {
      await axios.post('/api/groups', payload);
    }
    alert('Group saved successfully!');
  };

  return (
    <Box sx={{ p: 3 }}>
      <TextField label="Group Name" value={name} onChange={e => setName(e.target.value)} fullWidth sx={{ mb: 2 }} />
      <TextField label="Description" value={description} onChange={e => setDescription(e.target.value)} fullWidth sx={{ mb: 2 }} />

      {/* Organization Dropdown */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Organization</InputLabel>
        <Select value={orgId} onChange={e => setOrgId(e.target.value)}>
          {organizations.map(org => (
            <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Roles Multi-Select */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Allowed Roles</InputLabel>
        <Select
          multiple
          value={allowedRoleIds}
          onChange={e => setAllowedRoleIds(e.target.value)}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((id) => {
                const role = roles.find(r => r.id === id);
                return <Chip key={id} label={role?.name || id} />;
              })}
            </Box>
          )}
        >
          {roles.map(role => (
            <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" onClick={handleSubmit}>Save Group</Button>
    </Box>
  );
};

export default GroupForm;
