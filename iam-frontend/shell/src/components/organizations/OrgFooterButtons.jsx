import React from "react";
import { Box, Button } from "@mui/material";

export default function OrgFooterButtons({ current, openUserDialog, openGroupDialog, openRoleDialog }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 2,
        mt: 4,
        mb: 6,
        flexWrap: "wrap",
      }}
    >
      <Button
        variant="outlined"
        sx={{
          color: "#1976d2",
          borderColor: "#1976d2",
          "&:hover": {
            backgroundColor: "#1976d2",
            color: "#fff",
            borderColor: "#1976d2",
          },
        }}
        onClick={() => openUserDialog(current)}
      >
        Users
      </Button>

      <Button
        variant="outlined"
        sx={{
          color: "#1976d2",
          borderColor: "#1976d2",
          "&:hover": {
            backgroundColor: "#1976d2",
            color: "#fff",
            borderColor: "#1976d2",
          },
        }}
        onClick={() => openGroupDialog(current)}
      >
        Groups
      </Button>

      <Button
        variant="outlined"
        sx={{
          color: "#1976d2",
          borderColor: "#1976d2",
          "&:hover": {
            backgroundColor: "#1976d2",
            color: "#fff",
            borderColor: "#1976d2",
          },
        }}
        onClick={() => openRoleDialog(current)}
      >
        Roles
      </Button>
    </Box>
  );
}
