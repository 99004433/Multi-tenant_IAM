import React from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from "@mui/material";

const GroupFormDialog = ({
  open,
  mode = "create",
  organizations = [],
  roles = [],
  group,
  onChange,
  onCancel,
  onSubmit,
}) => {
  const title = mode === "create" ? "Add Group" : "Edit Group";

  const handleField = (e) => {
    const { name, value } = e.target;
    onChange((prev) => ({ ...prev, [name]: value }));
  };

  const handleOrgChange = (e) => {
    const value = e.target.value;
    onChange((prev) => ({ ...prev, parentOrgId: value }));
  };

  const handleRolesChange = (e) => {
    const value = e.target.value; // array of role IDs
    onChange((prev) => ({ ...prev, allowed_role_ids: value }));
  };

  const submit = () => {
    onSubmit(group);
  };

  if (!open) return null;

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          {/* Group Name */}
          <TextField
            margin="dense"
            label="Group Name"
            name="name"
            fullWidth
            value={group.name || ""}
            onChange={handleField}
            required
          />

          {/* Description */}
          <TextField
            margin="dense"
            label="Description"
            name="description"
            fullWidth
            value={group.description || ""}
            onChange={handleField}
          />

          {/* Organization Select */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="org-select-label">Select Organization</InputLabel>
            <Select
              labelId="org-select-label"
              id="org-select"
              value={group.parentOrgId ?? ""}
              onChange={handleOrgChange}
            >
              <MenuItem value="">Select...</MenuItem>
              {organizations
                .filter((org) => org.status === "ACTIVE" || org.status === undefined)
                .map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* Roles Multi-Select */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="roles-label">Allowed Roles</InputLabel>
            <Select
              labelId="roles-label"
              id="roles-select"
              multiple
              value={group.allowed_role_ids ?? []}
              onChange={handleRolesChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((roleId) => {
                    const r = roles.find((rr) => String(rr.id) === String(roleId));
                    return <Chip key={roleId} label={r?.name ?? roleId} />;
                  })}
                </Box>
              )}
            >
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Status Select */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status-select"
              name="status"
              value={group.status ?? "ACTIVE"}
              onChange={handleField}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={submit} variant="contained" color="primary">
          {mode === "create" ? "Add" : "Update"}
        </Button>
      </DialogActions>
    </>
  );
};

export default GroupFormDialog;
