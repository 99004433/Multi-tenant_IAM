
// src/components/users/UsersToolbar.jsx
import React from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export default function UsersToolbar({
  organizations,
  selectedOrg,
  setSelectedOrg,
  search,
  setSearch,
  exportCSV,
  openCreate,
  pagedUsers,
  visibleUsersAll,
  clientPaged,
}) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2, flexWrap: "wrap" }}>
      {/* Organization filter */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="org-filter-label">Organization</InputLabel>
          <Select
            labelId="org-filter-label"
            label="Organization"
            value={selectedOrg}
            onChange={(e) => { setSelectedOrg(e.target.value); }}
          >
            <MenuItem value=""><em>All Organizations</em></MenuItem>
            {organizations.map((org) => {
              const name = org.name ?? org.organizationName ?? org.code ?? org.orgShortName ?? "";
              const key = org.id ?? org.organizationId ?? org.code ?? org.name ?? name;
              return (
                <MenuItem key={key} value={name}>{name}</MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      {/* Right: Search + Export + Add */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); }}
          sx={{ minWidth: 320 }}
          inputProps={{ "aria-label": "Search users by email" }}
        />
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={exportCSV}
          disabled={(clientPaged ? pagedUsers.length : visibleUsersAll.length) === 0}
          aria-label="Export users to CSV"
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          onClick={openCreate}
          aria-label="Add new user"
        >
          + Add User
        </Button>
      </Box>
    </Box>
  );
}
