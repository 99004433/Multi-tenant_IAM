import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Button,
  CircularProgress,
} from "@mui/material";

export default function OrgDialog({
  open,
  form,
  submitting,
  onClose,
  onChange,
  onSubmit,
  parentName,
}) {
  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onClose}>
      <DialogTitle fontWeight={700}>
        {form.orgId
          ? "Edit Organization"
          : parentName
          ? `Add Child to ${parentName}`
          : "Add Parent Organization"}
      </DialogTitle>

      <form onSubmit={onSubmit}>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={onChange}
              required
            />
            <TextField
              label="City"
              name="city"
              value={form.city}
              onChange={onChange}
            />
            <TextField
              label="State"
              name="state"
              value={form.state}
              onChange={onChange}
            />
            <TextField
              label="Country"
              name="country"
              value={form.country}
              onChange={onChange}
            />
            <TextField
              label="Zipcode"
              name="zipcode"
              value={form.zipcode}
              onChange={onChange}
            />
            <TextField
              select
              name="status"
              value={form.status}
              label="Status"
              onChange={onChange}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField
              label="Region"
              name="region"
              value={form.region}
              onChange={onChange}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}