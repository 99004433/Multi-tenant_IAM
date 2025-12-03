
// RolesPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Tooltip,
  Grid,
  Pagination,
  Stack,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Snackbar,
  InputAdornment,
  Alert as MuiAlert,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const API_URL = 'http://localhost:8085/api/roles';

// MUI Alert usable inside Snackbar
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function RolesPage() {
  const theme = useTheme();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit dialog
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  // Delete dialog
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  // Notifications
  const [snack, setSnack] = useState({ open: false, severity: 'success', message: '' });

  // Search + pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const getId = (r) => r?.roleId ?? r?.id;

  // Fetch roles
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      setRoles(data);
    } catch (err) {
      console.error('Fetch roles error:', err);
      setSnack({ open: true, severity: 'error', message: 'Failed to load roles. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter + paginate
  const filteredRoles = useMemo(() => {
    const term = (searchTerm || '').toLowerCase().trim();
    return roles.filter((role) => (role?.name || '').toLowerCase().includes(term));
  }, [roles, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / rowsPerPage));

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRoles.slice(start, start + rowsPerPage);
  }, [filteredRoles, page, rowsPerPage]);

  // Reset page on filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, rowsPerPage]);

  // Form validation
  const validateForm = () => {
    const errors = { name: '' };
    const name = formData.name.trim();
    if (!name) {
      errors.name = 'Role name is required';
    } else if (name.length < 2) {
      errors.name = 'Role name must be at least 2 characters';
    }
    setFormErrors(errors);
    return !errors.name;
  };

  // Handle create/update
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editId) {
        await axios.put(`${API_URL}/${editId}`, formData);
        setSnack({ open: true, severity: 'success', message: 'Role updated successfully.' });
      } else {
        await axios.post(API_URL, formData);
        setSnack({ open: true, severity: 'success', message: 'Role created successfully.' });
      }
      await fetchRoles();
      setOpen(false);
      setFormData({ name: '', description: '' });
      setEditId(null);
    } catch (err) {
      console.error('Save role error:', err);
      setSnack({ open: true, severity: 'error', message: 'Failed to save role. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm.id) return;
    setDeleting(true);
    try {
      await axios.delete(`${API_URL}/${deleteConfirm.id}`);
      setSnack({ open: true, severity: 'success', message: 'Role deleted successfully.' });
      await fetchRoles();
      setDeleteConfirm({ open: false, id: null });
    } catch (err) {
      console.error('Delete role error:', err);
      setSnack({ open: true, severity: 'error', message: 'Failed to delete role. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  // Identify role name for confirming delete
  const roleToDelete = useMemo(
    () => roles.find((r) => getId(r) === deleteConfirm.id),
    [roles, deleteConfirm.id]
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 3,
          p: 2,
          borderRadius: 2,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'saturate(180%) blur(6px)',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Roles Management
        </Typography>

      
<Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
  <Button
    variant="outlined"
    color="inherit"
    size="small"
    startIcon={<RefreshIcon fontSize="small" />}
    onClick={fetchRoles}
    sx={{
      textTransform: 'none',
      px: 2, // reduce horizontal padding
      py: 0.5, // reduce vertical padding
      minWidth: 'auto', // prevent overly wide button
    }}
  >
    Refresh
  </Button>

  <Button
    variant="contained"
    color="primary"
    size="small"
    startIcon={<AddIcon fontSize="small" />}
    onClick={() => {
      setOpen(true);
      setEditId(null);
      setFormData({ name: '', description: '' });
      setFormErrors({ name: '' });
    }}
    sx={{
      textTransform: 'none',
      px: 2,
      py: 0.5,
      minWidth: 'auto',
    }}
  >
    Add role
  </Button>
</Stack>

      </Paper>

      {/* Controls: Search + RowsPerPage */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={5}>
          <TextField
            placeholder="Search roles…"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="rows-per-page-label">Rows per page</InputLabel>
            <Select
              labelId="rows-per-page-label"
              label="Rows per page"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              {[5, 8, 10, 15, 20].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.action.hover }}>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRoles.length > 0 ? (
                paginatedRoles.map((role) => (
                  <TableRow key={getId(role)} hover>
                    <TableCell
                      sx={{
                        maxWidth: 240,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {role?.name}
                    </TableCell>

                    <TableCell
                      sx={{
                        maxWidth: 420,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {role?.description}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label="ACTIVE"
                        color="success"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip arrow title="Edit">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => {
                            setFormData({
                              name: role?.name || '',
                              description: role?.description || '',
                            });
                            setEditId(getId(role));
                            setFormErrors({ name: '' });
                            setOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip arrow title="Delete">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() =>
                            setDeleteConfirm({ open: true, id: getId(role) })
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No roles found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
          siblingCount={0}
          boundaryCount={1}
          shape="rounded"
        />
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
      >
        <DialogTitle>{editId ? 'Edit role' : 'Add role'}</DialogTitle>

       

<DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
  <TextField
    label="Role name"
    value={formData.name}
    error={!!formErrors.name}
    helperText={formErrors.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    fullWidth
    variant="outlined"
    // Use margin="dense" instead of size="small" to avoid clipping
    margin="dense"
    autoFocus
    // Force label to float above the outline, and pin its transform
    InputLabelProps={{
      shrink: true,
      sx: {
        transform: 'translate(14px, -9px) scale(0.75)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(14px, -9px) scale(0.75)',
        },
        '&.Mui-focused': {
          transform: 'translate(14px, -9px) scale(0.75)',
        },
        lineHeight: 1.2,
      },
    }}
    // Ensure the notched outline text isn't clipped
    sx={{
      '& .MuiOutlinedInput-root': {
        alignItems: 'center',
      },
      '& .MuiOutlinedInput-notchedOutline legend': {
        // Prevent legend collapse that can clip the label
        width: 'auto',
      },
    }}
  />

  <TextField
    label="Description"
    value={formData.description}
    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
    fullWidth
    variant="outlined"
    margin="dense"
    multiline
    minRows={2}
    InputLabelProps={{
      shrink: true,
      sx: {
        transform: 'translate(14px, -9px) scale(0.75)',
        '&.MuiInputLabel-shrink, &.Mui-focused': {
          transform: 'translate(14px, -9px) scale(0.75)',
        },
        lineHeight: 1.2,
      },
    }}
    sx={{
      '& .MuiOutlinedInput-notchedOutline legend': {
        width: 'auto',
      },
    }}
  />
</DialogContent>



        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
            sx={{ textTransform: 'none' }}
          >
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
      >
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {roleToDelete?.name
              ? `Are you sure you want to delete the role “${roleToDelete.name}”?`
              : 'Are you sure you want to delete this role?'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, id: null })} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notifications */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack({ ...snack, open: false })}
          severity={snack.severity}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
