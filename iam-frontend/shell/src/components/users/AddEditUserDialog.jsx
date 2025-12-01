
// src/components/users/AddEditUserDialog.jsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, TextField, MenuItem, Button, Typography, CircularProgress
} from "@mui/material";

export default function AddEditUserDialog({
  open, submitting, formData, formErrors,
  organizations, groups, computedFilteredRoles,
  handleChange, handleGroupChange, onClose, onSubmit
}) {
  return (
    <Dialog
      open={open}
      onClose={(e, reason) => {
        if (submitting && (reason === "backdropClick" || reason === "escapeKeyDown")) return;
        onClose();
      }}
      maxWidth="lg"
      fullWidth
      aria-labelledby="user-dialog-title"
      keepMounted
    >
      <DialogTitle id="user-dialog-title">{formData.userId ? "Edit User" : "Create User"}</DialogTitle>
      <form onSubmit={onSubmit} noValidate>
        <DialogContent>
          <Grid container spacing={2}>
            {/* First Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="First Name" name="firstName" value={formData.firstName}
                onChange={handleChange} error={!!formErrors.firstName} helperText={formErrors.firstName}
                required variant="outlined" autoComplete="given-name"
              />
            </Grid>

            {/* Middle Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Middle Name" name="middleName" value={formData.middleName}
                onChange={handleChange} variant="outlined" autoComplete="additional-name"
              />
            </Grid>

            {/* Last Name */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Last Name" name="lastName" value={formData.lastName}
                onChange={handleChange} error={!!formErrors.lastName} helperText={formErrors.lastName}
                required variant="outlined" autoComplete="family-name"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label="Email" name="email" value={formData.email} onChange={handleChange}
                error={!!formErrors.email} helperText={formErrors.email} required variant="outlined" autoComplete="email"
                InputProps={{ readOnly: !!formData.userId }}
              />
            </Grid>

            {/* Contact No */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="tel" label="Contact No" name="contactNo" value={formData.contactNo}
                onChange={handleChange} error={!!formErrors.contactNo} helperText={formErrors.contactNo}
                variant="outlined" inputProps={{ inputMode: "numeric", pattern: "^\\+?[0-9]{7,15}$" }} autoComplete="tel"
              />
            </Grid>

            {/* Password */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="password"
                label={formData.userId ? "New Password (optional)" : "Password"}
                name="password" value={formData.password} onChange={handleChange}
                error={!!formErrors.password}
                helperText={formData.userId ? (formErrors.password || "Leave blank to keep current password") : formErrors.password}
                variant="outlined" autoComplete="new-password"
              />
            </Grid>

            {/* Organization */}
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Organization" name="organization" value={formData.organization}
                onChange={handleChange} helperText={formErrors.organization} error={!!formErrors.organization}
                required variant="outlined"
                sx={{ '& .MuiInputBase-root': { minHeight: 56 }, '& .MuiSelect-select': { display: 'flex', alignItems: 'center', minHeight: 56 } }}
              >
                <MenuItem value="" disabled>Select</MenuItem>
                {organizations.map((org) => (
                  <MenuItem
                    key={org.id ?? org.organizationId ?? org.code ?? org.name}
                    value={org.name ?? org.organizationName ?? org.code ?? org.orgShortName}
                  >
                    {org.name ?? org.organizationName ?? org.code ?? org.orgShortName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Group */}
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Group" name="groupName" value={formData.groupName}
                onChange={handleGroupChange} error={!!formErrors.groupName} helperText={formErrors.groupName}
                required variant="outlined"
                sx={{ '& .MuiInputBase-root': { minHeight: 56 }, '& .MuiSelect-select': { display: 'flex', alignItems: 'center', minHeight: 56 } }}
              >
                <MenuItem value="" disabled>Select</MenuItem>
                {groups.map((grp) => (
                  <MenuItem key={grp.groupId ?? grp.id ?? grp.name} value={grp.name ?? grp.groupName ?? grp.code}>
                    {grp.name ?? grp.groupName ?? grp.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Role */}
            <Grid item xs={12} sm={6}>
              <TextField
                select fullWidth label="Role" name="role" value={formData.role}
                onChange={handleChange} error={!!formErrors.role} helperText={formErrors.role}
                required variant="outlined"
                sx={{ '& .MuiInputBase-root': { minHeight: 56 }, '& .MuiSelect-select': { display: 'flex', alignItems: 'center', minHeight: 56 } }}
              >
                <MenuItem value="" disabled>Select</MenuItem>
                {computedFilteredRoles.map((r) => (
                  <MenuItem key={r.roleId ?? r.id ?? r.code ?? r.name} value={r.roleName ?? r.name ?? r.code}>
                    {r.roleName ?? r.name ?? r.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Status (optional) */}
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Status" name="status" value={formData.status ?? ""} onChange={handleChange} variant="outlined">
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={18} sx={{ color: 'white', mr: 1 }} /> : null}
            {formData.userId ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
