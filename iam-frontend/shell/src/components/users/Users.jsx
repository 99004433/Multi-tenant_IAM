// src/components/Users.jsx
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
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

// axios instance (simple)
const api = axios.create({
  baseURL: "",
  timeout: 15000,
});

export default function Users() {
  // data
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);

  // UI states
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // add/edit dialog
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // delete confirm dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDeleteUserId, setToDeleteUserId] = useState(null);

  // form + validation
  const [formData, setFormData] = useState({
    userId: null,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    organization: "",
    groupName: "",
    role: "",
    contactNo: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // search + pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // filtered/visible users
  const visibleUsers = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    let list = users || [];
    if (q) {
      list = list.filter((u) => {
        return (
          `${u.firstName || ""} ${u.middleName || ""} ${u.lastName || ""}`.toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.organization || "").toLowerCase().includes(q) ||
          (u.groupName || "").toLowerCase().includes(q) ||
          (u.role || "").toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [users, search]);

  const pagedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return visibleUsers.slice(start, start + rowsPerPage);
  }, [visibleUsers, page, rowsPerPage]);

  useEffect(() => {
    // load everything in parallel
    setLoading(true);
    const p1 = api.get("http://localhost:8084/api/users/getAllUsers").then((r) => r.data).catch(() => []);
    const p2 = api.get("http://localhost:8081/api/organizations").then((r) => r.data).catch(() => []);
    const p3 = api.get("http://localhost:8082/api/groups").then((r) => r.data).catch(() => []);
    const p4 = api.get("http://localhost:8080/api/roles").then((r) => r.data).catch(() => []);

    Promise.all([p1, p2, p3, p4])
      .then(([usr, orgs, grps, rls]) => {
        setUsers(Array.isArray(usr) ? usr : []);
        setOrganizations(Array.isArray(orgs) ? orgs : []);
        setGroups(Array.isArray(grps) ? grps : []);
        setRoles(Array.isArray(rls) ? rls : []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helpers: validate
  const validateForm = () => {
    const errors = {};
    if (!((formData.firstName || "").trim())) errors.firstName = "Required";
    if (!((formData.lastName || "").trim())) errors.lastName = "Required";
    if (!((formData.email || "").trim())) errors.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email";
    if (!formData.organization) errors.organization = "Required";

    // password required on create; optional on update
    if (!formData.userId) {
      if (!((formData.password || "").trim())) errors.password = "Password required";
      else if ((formData.password || "").length < 6) errors.password = "Min 6 chars";
    } else {
      if ((formData.password || "").trim() && (formData.password || "").length < 6) errors.password = "Min 6 chars";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // group change: filter roles based on allowed role ids in group object
  const handleGroupChange = (e) => {
    const value = e.target.value;
    setFormData((p) => ({ ...p, groupName: value, role: "" }));
  };

  // build payload and avoid sending empty password on update
  const buildPayload = () => {
    const payload = { ...formData };
    delete payload.userId;
    if (formData.userId && !(formData.password || "").trim()) delete payload.password;
    return payload;
  };

  // submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const payload = buildPayload();
      if (formData.userId) {
        // update
        const res = await api.put(`http://localhost:8084/api/users/updateUser/${formData.userId}`, payload);
        const updated = res.data;
        setUsers((prev) => prev.map((u) => (u.userId === formData.userId ? updated : u)));
        setSnackbar({ open: true, message: "User updated", severity: "success" });
      } else {
        const res = await api.post("http://localhost:8084/api/users/save", payload);
        setUsers((prev) => [...prev, res.data]);
        setSnackbar({ open: true, message: "User created", severity: "success" });
      }
      setOpen(false);
      // reset form
      setFormData({
        userId: null,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        organization: "",
        groupName: "",
        role: "",
        contactNo: "",
        password: "",
      });
      setFormErrors({});
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // edit: populate
  const handleEdit = (user) => {
    setFormData({
      userId: user.userId,
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      organization: user.organization || "",
      groupName: user.groupName || "",
      role: user.role || "",
      contactNo: user.contactNo || "",
      password: "", // must remain blank for security
    });

    // prepare filtered roles if group has allowedRoleIds
    const selectedGroup = groups.find((g) => (g.name === user.groupName) || (g.groupName === user.groupName) || (g.groupId === user.groupName) || (g.id === user.groupName));
    if (selectedGroup && (selectedGroup.allowedRoleIds || selectedGroup.allowed_roles)) {
      const allowed = selectedGroup.allowedRoleIds || selectedGroup.allowed_roles || [];
      const filtered = roles.filter((r) => allowed.includes(r.roleId ?? r.id));
      // set filtered roles by temporary state: reuse state variable 'filteredRoles' by setting roles slice
      // but here we cannot mutate 'roles'. We'll set formData.role (already set) and let selection display.
      // (the UI dropdown uses filteredRoles below computed from selected group)
      // We'll just open dialog:
    }

    setOpen(true);
  };

  // delete flow with confirm dialog
  const requestDelete = (userId) => {
    setToDeleteUserId(userId);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const id = toDeleteUserId;
    setConfirmDeleteOpen(false);
    if (!id) return;
    try {
      await api.delete(`http://localhost:8084/api/users/deleteById/${id}`);
      setUsers((p) => p.filter((u) => u.userId !== id));
      setSnackbar({ open: true, message: "User deleted", severity: "success" });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Delete failed";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setToDeleteUserId(null);
    }
  };

  // export CSV of visible users
  const exportCSV = () => {
    const rows = visibleUsers;
    const header = ["User ID", "First Name", "Middle Name", "Last Name", "Email", "Organization", "Group", "Role", "Contact No", "Status"];
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        [
          r.userId,
          r.firstName,
          r.middleName || "",
          r.lastName,
          `"${(r.email || "").replace(/"/g, '""')}"`,
          r.organization || "",
          r.groupName || "",
          r.role || "",
          r.contactNo || "",
          r.status || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // compute filteredRoles based on selected group in the form
  const computedFilteredRoles = useMemo(() => {
    const gname = formData.groupName;
    if (!gname) return [];
    const selectedGroup = groups.find((g) => (g.name === gname) || (g.groupName === gname) || (g.groupId === gname) || (g.id === gname));
    if (!selectedGroup) return [];
    const allowed = selectedGroup.allowedRoleIds || selectedGroup.allowed_roles || [];
    if (allowed.length === 0) return [];
    return roles.filter((r) => allowed.includes(r.roleId ?? r.id));
  }, [formData.groupName, groups, roles]);

  if (loading) {
    return (
      <Box sx={{ padding: 4 }}>
        <Typography variant="h6">Loading users...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h5" color="primary">Users</Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="Search name, email, org, group, role..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 320 }}
          />
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportCSV}>
            Export CSV
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              // open create dialog
              setFormData({
                userId: null,
                firstName: "",
                middleName: "",
                lastName: "",
                email: "",
                organization: "",
                groupName: "",
                role: "",
                contactNo: "",
                password: "",
              });
              setFormErrors({});
              setOpen(true);
            }}
          >
            + Add User
          </Button>
        </Box>
      </Box>

      {/* table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>First</th>
            <th style={thStyle}>Middle</th>
            <th style={thStyle}>Last</th>
            <th style={thStyle}>Email</th>
            <th style={thStyle}>Organization</th>
            <th style={thStyle}>Group</th>
            <th style={thStyle}>Role</th>
            <th style={thStyle}>Contact</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {pagedUsers.map((u) => (
            <tr key={u.userId} style={{ backgroundColor: "#fff" }}>
              <td style={tdStyle}>{u.userId}</td>
              <td style={tdStyle}>{u.firstName}</td>
              <td style={tdStyle}>{u.middleName || "-"}</td>
              <td style={tdStyle}>{u.lastName}</td>
              <td style={tdStyle}>{u.email}</td>
              <td style={tdStyle}>{u.organization}</td>
              <td style={tdStyle}>{u.groupName}</td>
              <td style={tdStyle}>{u.role}</td>
              <td style={tdStyle}>{u.contactNo}</td>
              <td style={tdStyle}>{u.status}</td>
              <td style={tdStyle}>
                <IconButton color="primary" onClick={() => handleEdit(u)}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => requestDelete(u.userId)}>
                  <DeleteIcon />
                </IconButton>
              </td>
            </tr>
          ))}

          {pagedUsers.length === 0 && (
            <tr>
              <td colSpan={11} style={{ padding: 16, textAlign: "center" }}>
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* pagination controls */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Box>
          <Button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</Button>
          <Button disabled={(page + 1) * rowsPerPage >= visibleUsers.length} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">Rows per page:</Typography>
          <Select size="small" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
          <Typography variant="body2" sx={{ ml: 2 }}>
            {visibleUsers.length} result(s)
          </Typography>
        </Box>
      </Box>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{formData.userId ? "Edit User" : "Create User"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                  required
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={!!formErrors.lastName} helperText={formErrors.lastName} required variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} error={!!formErrors.email} helperText={formErrors.email} required variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Contact No" name="contactNo" value={formData.contactNo} onChange={handleChange} variant="outlined" />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="password" label="Password" name="password" value={formData.password} onChange={handleChange} error={!!formErrors.password} helperText={formErrors.password} variant="outlined" />
              </Grid>

              {/* Organization select (TextField select for consistent UI) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  helperText={formErrors.organization}
                  error={!!formErrors.organization}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 56 },
                    '& .MuiSelect-select': { display: 'flex', alignItems: 'center', minHeight: 56 }
                  }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id ?? org.organizationId ?? org.code ?? org.name} value={org.name ?? org.organizationName ?? org.code ?? org.orgShortName}>
                      {org.name ?? org.organizationName ?? org.code ?? org.orgShortName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Group select */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Group"
                  name="groupName"
                  value={formData.groupName}
                  onChange={(e) => { handleGroupChange(e); }}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 56 },
                    '& .MuiSelect-select': { display: 'flex', alignItems: 'center', minHeight: 56 }
                  }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {groups.map((grp) => (
                    <MenuItem key={grp.groupId ?? grp.id ?? grp.name} value={grp.name ?? grp.groupName ?? grp.code}>
                      {grp.name ?? grp.groupName ?? grp.code}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Role select - filtered if group selected */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    '& .MuiInputBase-root': { minHeight: 56 },
                    '& .MuiSelect-select': { display: 'flex', alignItems: 'center', minHeight: 56 }
                  }}
                >
                  <MenuItem value="">Select</MenuItem>
                  {(computedFilteredRoles.length > 0 ? computedFilteredRoles : roles).map((r) => (
                    <MenuItem key={r.roleId ?? r.id} value={r.name ?? r.roleName ?? r.code}>
                      {r.name ?? r.roleName ?? r.code}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : (formData.userId ? "Update" : "Create")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// small styles
const thStyle = {
  padding: "10px",
  backgroundColor: "#1976d2",
  color: "#fff",
  textAlign: "left"
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};
