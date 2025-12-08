import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Pagination,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const API_BASE = "http://localhost:8085/api";

export default function OrgRoles({ currentGroup, onClose, onSelectRole }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Dialog
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      // prefer backend endpoint byGroup
      let res;
      try {
        res = await axios.get(`${API_BASE}/roles/byGroup/${currentGroup.id ?? currentGroup.groupId}`);
      } catch {
        // fallback: GET /roles and client filter by allowed list or group association
        const all = await axios.get(`${API_BASE}/roles`);
        const arr = Array.isArray(all.data) ? all.data : [];
        // try filter by allowed_role_ids on group
        const allowed = currentGroup.allowed_role_ids || [];
        // if group has allowed list use that; else try name match
        res = { data: allowed.length ? arr.filter((r) => allowed.includes(r.roleId ?? r.id)) : arr };
      }
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to load roles", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentGroup) return;
    setPage(1);
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGroup]);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => (r.name || "").toLowerCase().includes(q));
  }, [roles, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, (page - 1) * rowsPerPage + rowsPerPage);

  const openCreate = () => {
    setEditing({ name: "", description: "" });
    setOpen(true);
  };
  const openEdit = (r) => {
    setEditing(r);
    setOpen(true);
  };

  const saveRole = async (payload) => {
    setSaving(true);
    try {
      if (payload.roleId || payload.id) {
        const id = payload.roleId ?? payload.id;
        await axios.put(`${API_BASE}/roles/${id}`, payload);
        setSnack({ open: true, message: "Role updated", severity: "success" });
      } else {
        await axios.post(`${API_BASE}/roles`, payload);
        setSnack({ open: true, message: "Role created", severity: "success" });
      }
      setOpen(false);
      await fetchRoles();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Save failed", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role?")) return;
    try {
      await axios.delete(`${API_BASE}/roles/${id}`);
      setSnack({ open: true, message: "Deleted", severity: "success" });
      await fetchRoles();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  return (
    <Box sx={{ mt: 2, p: 3, border: "2px solid #1976d2", borderRadius: 2, bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Roles for: {currentGroup.name}</Typography>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField size="small" placeholder="Search roles…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} sx={{ minWidth: 260, flex: 1 }} />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>+ Add Role</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length ? paged.map((r) => (
                <TableRow key={r.roleId ?? r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell align="center">
                    <Button size="small" onClick={() => onSelectRole && onSelectRole(r)}>View Users</Button>
                    <IconButton size="small" onClick={() => openEdit(r)}><EditIcon /></IconButton>
                    <IconButton size="small" onClick={() => handleDelete(r.roleId ?? r.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No roles found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editing?.roleId || editing?.id ? "Edit Role" : "Add Role"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={editing?.name || ""} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} sx={{ mt: 1 }} />
          <TextField fullWidth label="Description" value={editing?.description || ""} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} sx={{ mt: 2 }} multiline minRows={2} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={() => saveRole(editing)} disabled={saving}>{saving ? <CircularProgress size={16} /> : (editing?.roleId || editing?.id ? "Update" : "Create")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
