import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Pagination,
  Card,
  CardContent,
  CardActions,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import GroupFormDialog from "../group/GroupFormDialog";

const API_BASE =  "http://localhost:8085/api";

export default function OrgGroups({ currentOrg, onClose, onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [editingGroup, setEditingGroup] = useState(null);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  // Fetch groups for current organization
  const fetchGroups = async () => {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const backendUrl = `${API_BASE}/groups/byOrg/${currentOrg.orgId}`;
      let res;
      try {
        res = await axios.get(backendUrl);
      } catch {
        // fallback to fetching all and filtering
        const all = await axios.get(`${API_BASE}/groups`);
        const arr = Array.isArray(all.data) ? all.data : [];
        const filtered = arr.filter(
          (g) => String(g.parentOrgId ?? g.parentOrg ?? "") === String(currentOrg.orgId)
        );
        res = { data: filtered };
      }
      setGroups(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Failed to load groups", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentOrg) return;
    setPage(1);
    fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrg]);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        (g.name || "").toLowerCase().includes(q) ||
        (g.description || "").toLowerCase().includes(q)
    );
  }, [groups, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pagedGroups = filtered.slice(
    (page - 1) * rowsPerPage,
    (page - 1) * rowsPerPage + rowsPerPage
  );

  const openCreate = () => {
    setDialogMode("create");
    setEditingGroup({ parentOrgId: currentOrg.orgId ?? null });
    setOpenDialog(true);
  };

  const openEdit = (g) => {
    setDialogMode("edit");
    setEditingGroup(g);
    setOpenDialog(true);
  };

  const submitGroup = async (payload) => {
    try {
      if (dialogMode === "create") {
        try {
          await axios.post(`${API_BASE}/groups/create`, payload);
        } catch {
          await axios.post(`${API_BASE}/groups`, payload);
        }
        setSnack({ open: true, message: "Group created", severity: "success" });
      } else {
        const id = payload.id ?? payload.groupId;
        try {
          await axios.put(`${API_BASE}/groups/updatedGroup/${id}`, payload);
        } catch {
          await axios.put(`${API_BASE}/groups/${id}`, payload);
        }
        setSnack({ open: true, message: "Group updated", severity: "success" });
      }
      await fetchGroups();
      setOpenDialog(false);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Save failed", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    try {
      try {
        await axios.delete(`${API_BASE}/groups/deleteById/${id}`);
      } catch {
        await axios.delete(`${API_BASE}/groups/${id}`);
      }
      setSnack({ open: true, message: "Deleted", severity: "success" });
      await fetchGroups();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Delete failed", severity: "error" });
    }
  };

  return (
    <Box sx={{ mt: 2, p: 2, border: "2px solid #1976d2", borderRadius: 2, bgcolor: "#fff" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Groups for: {currentOrg.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search groups…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 260, flex: 1 }}
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          + Add Group
        </Button>
      </Box>

      <Grid container spacing={2}>
        {pagedGroups.map((g) => (
          <Grid item xs={12} sm={6} md={4} key={g.id ?? g.groupId}>
            <Card sx={{ minHeight: 140 }}>
              <CardContent>
                <Typography fontWeight={700} noWrap>
                  {g.name}
                </Typography>
                <Typography color="text.secondary" noWrap>
                  {g.description}
                </Typography>
                <Typography variant="caption">ID: {g.id ?? g.groupId}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => onSelectGroup && onSelectGroup(g)}>
                  View Roles
                </Button>
                <IconButton size="small" onClick={() => openEdit(g)}>
                  <EditIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(g.id ?? g.groupId)}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
      </Box>

      <GroupFormDialog
        open={openDialog}
        mode={dialogMode}
        organizations={[{ id: currentOrg.orgId, name: currentOrg.name }]}
        roles={[]} // optionally pass roles here
        group={editingGroup || {}}
        onChange={(updater) =>
          setEditingGroup((p) => (typeof updater === "function" ? updater(p) : updater))
        }
        onCancel={() => setOpenDialog(false)}
        onSubmit={submitGroup}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}
