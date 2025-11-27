import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  IconButton,
  Box,
  Typography,
  Select,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  InputAdornment,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import AutoCompleteSearch from "./AutoCompleteSearch";

const api = axios.create({
  baseURL: "http://localhost:8085/api/organizations",
  timeout: 15000,
});

export default function OrganizationList({ onViewChildren }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    orgId: null,
    name: "",
    address: "",
    status: "active",
    region: "",
    country: "",
    state: "",
    city: "",
    zipcode: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const visibleOrgs = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    let list = organizations.filter((org) => org.level === 0 || org.level === null);
    if (q) {
      list = list.filter((org) => {
        return (
          (org.name || "").toLowerCase().includes(q) ||
          (org.address || "").toLowerCase().includes(q) ||
          (org.city || "").toLowerCase().includes(q) ||
          (org.state || "").toLowerCase().includes(q) ||
          (org.country || "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [organizations, search]);

  const pagedOrgs = useMemo(() => {
    const start = page * rowsPerPage;
    return visibleOrgs.slice(start, start + rowsPerPage);
  }, [visibleOrgs, page, rowsPerPage]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const res = await api.get("");
      setOrganizations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setSnackbar({ open: true, message: "Failed to load organizations", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!((formData.name || "").trim())) errors.name = "Required";
    if (!((formData.address || "").trim())) errors.address = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePlaceSelected = (locationData) => {
    // Auto-fill all address-related fields
    setFormData((prev) => ({
      ...prev,
      address: locationData.address || prev.address,
      city: locationData.city || prev.city,
      state: locationData.state || prev.state,
      country: locationData.country || prev.country,
      zipcode: locationData.zipcode || prev.zipcode,
      region: locationData.region || prev.region,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        parentOrgId: null,
        level: 0,
        address: formData.address,
        status: formData.status,
        region: formData.region || null,
        country: formData.country || null,
        state: formData.state || null,
        city: formData.city || null,
        zipcode: formData.zipcode || null,
      };

      if (formData.orgId) {
        const res = await api.put(`/${formData.orgId}`, payload);
        setOrganizations((prev) => prev.map((o) => (o.orgId === formData.orgId ? res.data : o)));
        setSnackbar({ open: true, message: "Organization updated successfully", severity: "success" });
      } else {
        const res = await api.post("", payload);
        setOrganizations((prev) => [...prev, res.data]);
        setSnackbar({ open: true, message: "Organization created successfully", severity: "success" });
      }
      setOpen(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      orgId: null,
      name: "",
      address: "",
      status: "active",
      region: "",
      country: "",
      state: "",
      city: "",
      zipcode: "",
    });
    setFormErrors({});
  };

  const handleEdit = (org) => {
    setFormData({
      orgId: org.orgId,
      name: org.name || "",
      address: org.address || "",
      status: org.status || "active",
      region: org.region || "",
      country: org.country || "",
      state: org.state || "",
      city: org.city || "",
      zipcode: org.zipcode || "",
    });
    setOpen(true);
  };

  const requestDelete = (orgId) => {
    setToDeleteId(orgId);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const id = toDeleteId;
    setConfirmDeleteOpen(false);
    if (!id) return;
    try {
      await api.delete(`/${id}`);
      setOrganizations((p) => p.filter((o) => o.orgId !== id));
      setSnackbar({ open: true, message: "Organization deleted successfully", severity: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Delete failed";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setToDeleteId(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {/* Header Card */}
      <Card elevation={0} sx={{ mb: 2, borderRadius: 0, background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)", color: "white" }}>
        <CardContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <BusinessIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                Parent Organizations
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Manage your top-level organizational units
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 2,
          px: 3,
        }}
      >
        <TextField
          size="small"
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1, maxWidth: { sm: 400 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
          sx={{
            px: 3,
            py: 1,
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: 2,
          }}
        >
          Add Organization
        </Button>
      </Box>

      {/* Table */}
      <Box sx={{ px: 3 }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1 }}>
          <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Organization Name</TableCell>
              {!isMobile && <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Address</TableCell>}
              {!isTablet && (
                <>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>City</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>State</TableCell>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Country</TableCell>
                </>
              )}
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Level</TableCell>
              <TableCell sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedOrgs.map((org) => (
              <TableRow key={org.orgId} hover sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {org.name}
                  </Typography>
                </TableCell>
                {!isMobile && (
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                      {org.address}
                    </Typography>
                  </TableCell>
                )}
                {!isTablet && (
                  <>
                    <TableCell>{org.city || "-"}</TableCell>
                    <TableCell>{org.state || "-"}</TableCell>
                    <TableCell>{org.country || "-"}</TableCell>
                  </>
                )}
                <TableCell>
                  <Chip
                    label={`Level ${org.level ?? 0}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={org.status}
                    size="small"
                    color={org.status === "active" ? "success" : "default"}
                    sx={{ textTransform: "capitalize", fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                    <Tooltip title="View Child Organizations">
                      <IconButton size="small" color="info" onClick={() => onViewChildren(org)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleEdit(org)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => requestDelete(org.orgId)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {pagedOrgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No parent organizations found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          gap: 2,
          px: 3,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              disabled={page === 0}
              onClick={() => setPage(Math.max(0, page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outlined"
              size="small"
              disabled={(page + 1) * rowsPerPage >= visibleOrgs.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Page {page + 1} of {Math.max(1, Math.ceil(visibleOrgs.length / rowsPerPage))}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Rows per page:
          </Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
          <Typography variant="body2" color="text.secondary">
            Total: {visibleOrgs.length}
          </Typography>
        </Box>
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: "#1976d2", color: "white", fontWeight: "bold" }}>
          {formData.orgId ? "Edit Parent Organization" : "Create Parent Organization"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ mt: 2 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Organization Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Search and auto-fill address details:
                  </Typography>
                  <AutoCompleteSearch onSelect={handlePlaceSelected} />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                  required
                  variant="outlined"
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Zip Code" name="zipcode" value={formData.zipcode} onChange={handleChange} variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleChange} variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Country" name="country" value={formData.country} onChange={handleChange} variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Region" name="region" value={formData.region} onChange={handleChange} variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField select fullWidth label="Status" name="status" value={formData.status} onChange={handleChange} variant="outlined">
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : formData.orgId ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this organization? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
