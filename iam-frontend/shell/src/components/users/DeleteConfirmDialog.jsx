
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function DeleteConfirmDialog({ open, onCancel, onConfirm, userId }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">
          Are you sure you want to delete user <b>{userId}</b>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} variant="outlined">Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
