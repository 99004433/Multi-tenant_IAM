import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BusinessIcon from "@mui/icons-material/Business";
import organizationService from "../../Services/organizationService";
import OrgDialog from "../organizations/OrgDialog"; 


export default function ParentList({ organizations, onViewChildren, onRefresh }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
    orgId: null,
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    region: "",
    status: "active",
    });
    const openEditDialog = (org) => {
  setForm({
    orgId: org.orgId,
    name: org.name || "",
    address: org.address || "",
    city: org.city || "",
    state: org.state || "",
    country: org.country || "",
    zipcode: org.zipcode || "",
    region: org.region || "",
    status: org.status || "active",
  });
  setDialogOpen(true);
};

  // top-level parents = parentOrgId null or undefined
  const parents = useMemo(() => organizations.filter((o) => !o.parentOrgId), [organizations]);

  const visible = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    if (!q) return parents;
    return parents.filter((org) => {
      return (
        (org.name || "").toLowerCase().includes(q) ||
        (org.address || "").toLowerCase().includes(q) ||
        (org.city || "").toLowerCase().includes(q)
      );
    });
  }, [parents, search]);

  const paged = useMemo(() => {
    const start = page * rowsPerPage;
    return visible.slice(start, start + rowsPerPage);
  }, [visible, page, rowsPerPage]);

  // helper to count children quickly
  const childCount = (parentId) => organizations.filter((o) => o.parentOrgId === parentId).length;

  const handleDelete = async (id) => {
    if (!confirm("Delete this parent organization?")) return;
    try {
      await organizationService.remove(id);
      await onRefresh();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Card elevation={0} sx={{ mb: 2, borderRadius: 0, background: "linear-gradient(135deg,#1976d2 0%,#1565c0 100%)", color: "white" }}>
        <CardContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <BusinessIcon sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h5" fontWeight="bold">Parent Organizations</Typography>
              <Typography variant="body2">Top-level organizational units</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ flex: 1 }}
        />
        <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => {
            setForm({
            orgId: null,
            name: "",
            address: "",
            city: "",
            state: "",
            country: "",
            zipcode: "",
            region: "",
            status: "active",
            });
            setDialogOpen(true);
        }}
        >
        Add Organization
        </Button>
        <Button variant="outlined" onClick={onRefresh}>Refresh</Button>
      </Box>

      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "#f5f5f5" }}>
              <TableCell>Organization Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Children</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paged.map((org) => (
              <TableRow key={org.orgId} hover sx={{ cursor: "pointer" }}>
                <TableCell onClick={() => onViewChildren(org)}>{org.name}</TableCell>
                <TableCell onClick={() => onViewChildren(org)}>{org.address || "-"}</TableCell>
                <TableCell onClick={() => onViewChildren(org)}>{org.city || "-"}</TableCell>
                <TableCell onClick={() => onViewChildren(org)}>{org.country || "-"}</TableCell>
                <TableCell onClick={() => onViewChildren(org)}>
                  <Chip label={`Child: ${childCount(org.orgId)}`} size="small" 
                  sx={{
                      background: "#e3f2fd",
                      color: "#1976d2",
                      fontWeight: 600,
                    }}/>
                </TableCell>
                <TableCell>
                    {/* <Chip label={org.status || "active"}  */}
                    <Chip
                        size="small"
                        label={(org.status || "active").toUpperCase()}
                        sx={{
                            backgroundColor: org.status === "active" ? "#e8f5e9" : "#ffebee",
                            color: org.status === "active" ? "#2e7d32" : "#c62828",
                            fontWeight: 700,
                        }}
                        />
                
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                    <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEditDialog(org)}>
                        <EditIcon fontSize="small" color="primary" />
                    </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(org.orgId)}><DeleteIcon fontSize="small" color="error"/></IconButton></Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}

            {paged.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  No parent organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
        <Box>
          <Button disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))}>Previous</Button>
          <Button disabled={(page + 1) * rowsPerPage >= visible.length} onClick={() => setPage(page + 1)}>Next</Button>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div>Rows per page:</div>
          <Select size="small" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}>
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
          <div>Total: {visible.length}</div>
        </Box>
      </Box>
      <OrgDialog
  open={dialogOpen}
  form={form}
  submitting={submitting}
  onClose={() => setDialogOpen(false)}
  onChange={(e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
  onSubmit={async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        parentOrgId: null, // ✅ parent-level org
      };
      if (form.orgId) {
        await organizationService.update(form.orgId, payload);
      } else {
        await organizationService.create(payload);
      }
      await onRefresh();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    } finally {
      setSubmitting(false);
    }
  }}
  parentName={null}
/>
    </Box>
  );
}
