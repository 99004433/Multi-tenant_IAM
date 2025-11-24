import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  Divider,
} from '@mui/material';

export default function OrganizationForm({ open, onClose, onSubmit, organization, parentOrg }) {
  const [formData, setFormData] = useState({
    name: '',
    parentOrgId: null,
    level: 0,
    address: '',
    status: 'ACTIVE',
    latitude: '',
    longitude: '',
    region: '',
    country: '',
    state: '',
    city: '',
  });

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        parentOrgId: organization.parentOrgId || null,
        level: organization.level || 0,
        address: organization.address || '',
        status: organization.status || 'ACTIVE',
        latitude: organization.latitude || '',
        longitude: organization.longitude || '',
        region: organization.region || '',
        country: organization.country || '',
        state: organization.state || '',
        city: organization.city || '',
      });
    } else if (parentOrg) {
      setFormData({
        ...formData,
        parentOrgId: parentOrg.id,
        level: (parentOrg.level || 0) + 1,
      });
    } else {
      setFormData({
        name: '',
        parentOrgId: null,
        level: 0,
        address: '',
        status: 'ACTIVE',
        latitude: '',
        longitude: '',
        region: '',
        country: '',
        state: '',
        city: '',
      });
    }
  }, [organization, parentOrg, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {organization ? 'Edit Organization' : 'Create New Organization'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {parentOrg && (
            <>
              <Typography variant="body2" color="primary" gutterBottom>
                Parent Organization: <strong>{parentOrg.name}</strong>
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Organization Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Manipal Hospitals"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange}>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                disabled
                label="Level"
                value={formData.level}
                helperText="Auto-calculated based on hierarchy"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g., Asia Pacific"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g., India"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g., Karnataka"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Bangalore"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                inputProps={{ step: 'any' }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                inputProps={{ step: 'any' }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {organization ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}