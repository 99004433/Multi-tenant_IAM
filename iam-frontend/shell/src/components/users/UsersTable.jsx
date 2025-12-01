
import React from "react";
import { Box, Chip, CircularProgress, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function UsersTable({
  pagedRows,
  visibleUsersAll,
  clientPaged,
  loading,
  thStyle,
  tdStyle,
  handleEdit,
  requestDelete,
}) {
  return (
    <Box sx={{ maxHeight: 520, overflow: "auto", border: "1px solid #eee", borderRadius: 1 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }} aria-label="Users table">
        <thead>
          <tr>
            <th style={thStyle} scope="col">ID</th>
            <th style={thStyle} scope="col">First</th>
            <th style={thStyle} scope="col">Middle</th>
            <th style={thStyle} scope="col">Last</th>
            <th style={thStyle} scope="col">Email</th>
            <th style={thStyle} scope="col">Group</th>
            <th style={thStyle} scope="col">Role</th>
            <th style={thStyle} scope="col">Contact</th>
            <th style={thStyle} scope="col">Status</th>
            <th style={thStyle} scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {pagedRows.map((u, idx) => (
            <tr key={u.userId} style={{ backgroundColor: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
              <td style={tdStyle}>{u.userId}</td>
              <td style={tdStyle}>{u.firstName}</td>
              <td style={tdStyle}>{u.middleName || "-"}</td>
              <td style={tdStyle}>{u.lastName}</td>
              <td style={tdStyle}>{u.email}</td>
              <td style={tdStyle}>{u.groupName}</td>
              <td style={tdStyle}>{u.role}</td>
              <td style={tdStyle}>{u.contactNo}</td>
              <td style={tdStyle}>
                {typeof u.status === "string" ? (
                  <Chip
                    size="small"
                    label={u.status}
                    color={String(u.status).toLowerCase() === "active" ? "success" : "default"}
                    variant="outlined"
                  />
                ) : (
                  String(u.status ?? "")
                )}
              </td>
              <td style={tdStyle}>
                <Tooltip title={`Edit user ${u.userId}`}>
                  <IconButton color="primary" onClick={() => handleEdit(u)} aria-label={`Edit user ${u.userId}`}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={`Delete user ${u.userId}`}>
                  <IconButton color="error" onClick={() => requestDelete(u.userId)} aria-label={`Delete user ${u.userId}`}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </td>
            </tr>
          ))}

          {(clientPaged ? pagedRows.length : visibleUsersAll.length) === 0 && (
            <tr>
              <td colSpan={10} style={{ padding: 16, textAlign: "center" }}>
                {loading ? <CircularProgress size={22} /> : "No users found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  );
}
