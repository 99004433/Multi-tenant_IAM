
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
  Tooltip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import OrgGroups from "../organizations/OrgGroups";
import OrgRoles from "../roles/OrgRoles";
import organizationService from "../../Services/organizationService";
import OrgDialog from "../organizations/OrgDialog";
import OrgUsers from "../organizations/OrgUsers";

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

  // State to track which section is open
  const [activeSection, setActiveSection] = useState(null); // "users" | "groups" | "roles" | null
  const [activePayload, setActivePayload] = useState(null); 

  const childrenOf = (id) => allOrgs.filter((o) => o.parentOrgId === id);
  const children = useMemo(() => childrenOf(current.orgId), [allOrgs, current]);

  const childCountMap = useMemo(() => {
    const m = new Map();
    allOrgs.forEach((o) => {
      const p = o.parentOrgId ?? null;
      m.set(p, (m.get(p) || 0) + 1);
    });
    return m;
  }, [allOrgs]);

  const childCount = (id) => childCountMap.get(id) || 0;

  const goInto = (child) => {
    setStack((s) => [...s, child]);
    setActiveSection(null);
  };

  const goBackOne = () => {
    if (stack.length === 1) {
      onBackToParent();
      return;
    }
    setStack((s) => s.slice(0, s.length - 1));
    setActiveSection(null);
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

  // ✅ Toggle button handlers
//   const toggleSection = (section) => {
//     setActiveSection(activeSection === section ? null : section);
//   };
// modify toggleSection to accept optional payload
const toggleSection = (section, payload = null) => {
  // if same section clicked twice -> collapse
  if (activeSection === section) {
    setActiveSection(null);
    setActivePayload(null);
  } else {
    setActiveSection(section);
    setActivePayload(payload);
  }
};
  return (
  <Box
    sx={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      zoom: 0.9,
    }}
  >
    {/* BREADCRUMB */}
    <Breadcrumbs sx={{ mb: 2, flexShrink: 0 }} separator="›">
      <Link component="button" onClick={onBackToParent} sx={{ fontWeight: 500 }}>
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

    {/* CURRENT ORG CARD */}
    <Card
      elevation={2}
      sx={{
        flexShrink: 0,
        mb: 2,
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

    {/* MAIN CONTENT SCROLL AREA */}
    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        paddingRight: 1,
        paddingLeft: 0.5,
      }}
    >
      {/* CHILDREN LIST TITLE */}
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Children ({children.length})
      </Typography>

      {/* NO CHILDREN */}
      {children.length === 0 && (
        <Box
          sx={{
            py: 3,
            px: 2,
            border: "1px dashed #e0e0e0",
            borderRadius: 2,
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography color="text.secondary">No child organizations.</Typography>
        </Box>
      )}

      {/* CHILDREN GRID – FULL WIDTH */}
      {children.length > 0 && (
        <Grid container spacing={3}>
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
                        fontWeight: "bold",
                      }}
                    />

                    <Chip
                      size="small"
                      label={c.status.toUpperCase()}
                      sx={{
                        background: c.status === "active" ? "#e8f5e9" : "#ffebee",
                        color: c.status === "active" ? "#2e7d32" : "#c62828",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditDialog(c);
                      }}
                    >
                      <EditIcon fontSize="small" color="primary" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.orgId);
                      }}
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* THREE BUTTONS FULL WIDTH */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          mt: 4,
          mb: 3,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        <Button
          variant={activeSection === "users" ? "contained" : "outlined"}
          onClick={() => toggleSection("users", { org: current })} // your OrgUsers expects currentOrg prop
        >
          {activeSection === "users" ? "Hide Users" : "Users"}
        </Button>

        <Button
          variant={activeSection === "groups" ? "contained" : "outlined"}
          onClick={() => toggleSection("groups", { org: current })}
        >
          {activeSection === "groups" ? "Hide Groups" : "Groups"}
        </Button>

        <Button
          variant={activeSection === "roles" ? "contained" : "outlined"}
           onClick={() => toggleSection("roles", { org: current })} // roles at org-level can show all roles for org; you can also open roles from group
        >
          {activeSection === "roles" ? "Hide Roles" : "Roles"}
        </Button>
      </Box>

      {/* USER / GROUP / ROLE TABLES */}
      {activeSection === "users" && (
        // <OrgUsers currentOrg={current} onClose={() => setActiveSection(null)} />
         <OrgUsers
    currentOrg={activePayload?.org || current}
    onClose={() => { setActiveSection(null); setActivePayload(null); }}
  />
      )}

      {activeSection === "groups" && (
  <OrgGroups
    currentOrg={activePayload?.org || current}
    onClose={() => { setActiveSection(null); setActivePayload(null); }}
    onSelectGroup={(group) => {
      // drill into roles for selected group
      setActiveSection("roles");
      setActivePayload({ group, org: activePayload?.org || current });
    }}
  />
)}
      {activeSection === "roles" && (
  <OrgRoles
    currentGroup={activePayload?.group || { name: activePayload?.org?.name, id: activePayload?.org?.orgId }}
    onClose={() => { setActiveSection(null); setActivePayload(null); }}
    onSelectRole={(role) => {
      // optionally show users filtered by role
      setActiveSection("users");
      // pass an augmented payload: users component expects currentOrg; we can pass role via props or add a new prop in OrgUsers
      setActivePayload({ org: activePayload?.org || current, role });
    }}
  />
)}
    </Box>

    {/* DIALOG */}
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