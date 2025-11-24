import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowForward as ArrowForwardIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { organizationService } from '../../services/organizationService';
import OrganizationForm from './OrganizationForm';

export default function OrganizationList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentParent, setCurrentParent] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([{ id: null, name: 'Root' }]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [filters, setFilters] = useState({
    region: '',
    country: '',
    state: '',
    city: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load organizations
  useEffect(() => {
    loadOrganizations();
  }, [currentParent]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      let data;
      if (currentParent) {
        data = await organizationService.getChildOrganizations(currentParent.id);
      } else {
        data = await organizationService.getAllOrganizations();
        // Filter to show only root/parent organizations (level 0)
        data = data.filter(org => !org.parentOrgId || org.level === 0);
      }

      setOrganizations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to children
  const handleViewChildren = async (org) => {
    setCurrentParent(org);
    setBreadcrumb([...breadcrumb, { id: org.orgId, name: org.name }]);
  };

  // Navigate breadcrumb
  const handleBreadcrumbClick = (index) => {
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    setBreadcrumb(newBreadcrumb);

    if (index === 0) {
      setCurrentParent(null);
    } else {
      const parent = { id: newBreadcrumb[index].id, name: newBreadcrumb[index].name };
      setCurrentParent(parent);
    }
  };

  // Handle create
  const handleCreate = () => {
    setSelectedOrg(null);
    setOpenForm(true);
  };

  // Handle edit
  const handleEdit = (org) => {
    setSelectedOrg(org);
    setOpenForm(true);
  };

  // Handle delete
  const handleDelete = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) return;

    try {
      await organizationService.deleteOrganization(orgId);
      loadOrganizations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form submit
  const handleFormSubmit = async (orgData) => {
    try {
      if (selectedOrg) {
        await organizationService.updateOrganization(selectedOrg.orgId, orgData);
      } else {
        // Set parent org ID if we're in a child view
        if (currentParent) {
          orgData.parentOrgId = currentParent.id;
          orgData.level = breadcrumb.length;
        }
        await organizationService.createOrganization(orgData);
      }
      setOpenForm(false);
      loadOrganizations();
    } catch (err) {
      setError(err.message);
    }
  };

  // Apply filters
  const handleApplyFilters = async () => {
    try {
      setLoading(true);
      const data = await organizationService.filterByLocation(filters);
      setOrganizations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({ region: '', country: '', state: '', city: '' });
    loadOrganizations();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Organizations Management
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadOrganizations}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
          >
            Add Organization
          </Button>
        </Box>
      </Box>

      {/* Breadcrumb Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Breadcrumbs>
            {breadcrumb.map((item, index) => (
              <Link
                key={index}
                underline="hover"
                color={index === breadcrumb.length - 1 ? 'text.primary' : 'inherit'}
                onClick={() => handleBreadcrumbClick(index)}
                sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {index === 0 && <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />}
                {item.name}
              </Link>
            ))}
          </Breadcrumbs>
          {currentParent && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Viewing children of: <strong>{currentParent.name}</strong>
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Filters Panel */}
      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filter by Location
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Region"
                  value={filters.region}
                  onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Country"
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="State"
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="City"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button variant="contained" onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                  <Button variant="outlined" onClick={handleResetFilters}>
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Organizations Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Level</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" py={4}>
                    No organizations found. Click "Add Organization" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <TableRow
                  key={org.orgId}
                  hover
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {org.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`Level ${org.level}`}
                      size="small"
                      color={org.level === 0 ? 'primary' : org.level === 1 ? 'secondary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {[org.city, org.state, org.country].filter(Boolean).join(', ') || 'N/A'}
                    </Typography>
                    {org.region && (
                      <Typography variant="caption" color="text.secondary">
                        Region: {org.region}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={org.status}
                      size="small"
                      color={org.status === 'ACTIVE' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewChildren(org)}
                      title="View Children"
                    >
                      <ArrowForwardIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleEdit(org)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(org.orgId)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Organization Form Dialog */}
      <OrganizationForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleFormSubmit}
        organization={selectedOrg}
        parentOrg={currentParent}
      />
    </Box>
  );
}