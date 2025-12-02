import React, { useMemo, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Card,
  CardContent,
  IconButton,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Tooltip,
  Divider,
} from "@mui/material";
import OrgFooterButtons from "../organizations/OrgFooterButtons";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import organizationService from "../../Services/organizationService";
import OrgDialog from "../organizations/OrgDialog"; 
export default function DynamicHierarchy({
  rootOrg,
  allOrgs,
  onBackToParent,
  onRefresh,
}) {
  const [stack, setStack] = useState([rootOrg]);
  const current = stack[stack.length - 1];

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

  const childrenOf = (id) => allOrgs.filter((o) => o.parentOrgId === id);
  const children = useMemo(() => childrenOf(current.orgId), [allOrgs, current]);

  // Fast child count
  const childCountMap = useMemo(() => {
    const m = new Map();
    allOrgs.forEach((o) => {
      const p = o.parentOrgId ?? null;
      m.set(p, (m.get(p) || 0) + 1);
    });
    return m;
  }, [allOrgs]);

  const childCount = (id) => childCountMap.get(id) || 0;

  const goInto = (child) => setStack((s) => [...s, child]);

  const goBackOne = () => {
    if (stack.length === 1) {
      onBackToParent();
      return;
    }
    setStack((s) => s.slice(0, s.length - 1));
  };

  const openAddDialog = () => {
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
  };

  const openEditDialog = (org) => {
    setForm({ ...org });
    setDialogOpen(true);
  };

  const handleFormChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: form.name,
      address: form.address,
      city: form.city,
      state: form.state,
      country: form.country,
      zipcode: form.zipcode,
      status: form.status,
      region: form.region,
      parentOrgId: current.orgId,
    };

    try {
      if (form.orgId) {
        await organizationService.update(form.orgId, payload);
      } else {
        await organizationService.create(payload);
      }
      await onRefresh();
      setDialogOpen(false);
    } catch (err) {
      alert("Error occurred");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete? Backend prevents delete if children exist.")) return;

    try {
      await organizationService.remove(id);
      await onRefresh();
    } catch {
      alert("Delete failed");
    }
  };
    // ----------------------- USER / GROUP / ROLE DIALOGS -----------------------
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  const openUserDialog = (org) => setUserDialogOpen(true);
  const openGroupDialog = (org) => setGroupDialogOpen(true);
  const openRoleDialog = (org) => setRoleDialogOpen(true);

  return (
    <Box>

      {/* ---------------------------------- BREADCRUMB ---------------------------------- */}
      <Breadcrumbs sx={{ mb: 2 }} separator="›">
        <Link
          component="button"
          onClick={onBackToParent}
          sx={{ fontWeight: 500 }}
        >
          Parent Organizations
        </Link>

        {stack.map((s, i) =>
          i === stack.length - 1 ? (
            <Typography key={s.orgId} fontWeight={700}>
              {s.name}
            </Typography>
          ) : (
            <Link
              key={s.orgId}
              component="button"
              onClick={() => setStack(stack.slice(0, i + 1))}
            >
              {s.name}
            </Link>
          )
        )}
      </Breadcrumbs>

      {/* ---------------------------------- CURRENT ORG CARD ---------------------------------- */}
      <Card
        elevation={2}
        sx={{
          mb: 3,
          borderRadius: 2,
          borderLeft: "5px solid #1976d2",
        }}
      >
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={goBackOne}>
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {current.name}
            </Typography>
            <Typography>{current.address}</Typography>
          </Box>

          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add Child
          </Button>
        </CardContent>
      </Card>

  {/* ---------------------------------- CHILD LIST ---------------------------------- */}
<Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
  Children ({children.length})
</Typography>

{children.length === 0 && (
  <Box
    sx={{
      py: 3,
      px: 2,
      border: "1px dashed #e0e0e0",
      borderRadius: 1,
      textAlign: "center",
    }}
  >
    <Typography color="text.secondary">
      No child organizations.
    </Typography>
  </Box>
)}

{/* Scrollable container for child list */}
<Box
  sx={{
    maxHeight: "55vh",   // adjust as needed
    overflowY: "auto",   // enables vertical scroll
    pr: 1,               // optional padding for scrollbar
  }}
>
  <Grid
    container
    spacing={3}
    sx={{
      paddingX: 2,
      paddingY: 1,
      mb: 2,
    }}
  >
    {children.map((c) => (
      <Grid item xs={12} sm={6} md={4} key={c.orgId}>
        <Card
          onClick={() => goInto(c)}
          sx={{
            cursor: "pointer",
            borderRadius: 2,
            borderLeft: "4px solid #4caf50",
            minHeight: 180,
            transition: "0.2s",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            "&:hover": {
              backgroundColor: "#f4fff4",
              transform: "scale(1.02)",
            },
          }}
        >
          <CardContent>
            <Typography fontWeight={700}>{c.name}</Typography>
            <Typography color="text.secondary">{c.address}</Typography>

            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
              <Chip
                size="small"
                label={`Children: ${childCount(c.orgId)}`}
                sx={{
                  background: "#e3f2fd",
                  color: "#1976d2",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                label={c.status.toUpperCase()}
                sx={{
                  background: c.status === "active" ? "#e8f5e9" : "#ffebee",
                  color: c.status === "active" ? "#2e7d32" : "#c62828",
                  fontWeight: 700,
                }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditDialog(c);
                  }}
                >
                  <EditIcon fontSize="small" color="primary" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c.orgId);
                  }}
                >
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
</Box>
 
<Box
  sx={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    bgcolor: "#fff",
    borderTop: "1px solid #e0e0e0",
    py: 0.5,              // reduced vertical padding
    px: 1,                // optional horizontal padding
    display: "flex",
    justifyContent: "center",
    zIndex: 999,          // above content
  }}
>
  <OrgFooterButtons
    current={current}
    openUserDialog={openUserDialog}
    openGroupDialog={openGroupDialog}
    openRoleDialog={openRoleDialog}
  />
</Box>
      {/* ---------------------------------- DIALOG ---------------------------------- */}
      <OrgDialog
        open={dialogOpen}
        form={form}
        submitting={submitting}
        onClose={() => setDialogOpen(false)}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        parentName={current.name}
        />
    </Box>
  );
}
