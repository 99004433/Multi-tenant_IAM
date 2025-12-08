import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import UsersTable from "../users/UsersTable";
import AddEditUserDialog from "../users/AddEditUserDialog";
import DeleteConfirmDialog from "../users/DeleteConfirmDialog";
import useReferenceData from "../users/useReferenceData";
import useUsersData from "../users/useUsersData";
import {
  exportCSV as exportCsvHelper,
  validateForm,
  computeFilteredRoles,
  trimAll,
} from "../users/utils";
import { saveUser, updateUser, deleteUserById } from "../users/api";

export default function OrgUsers({ currentOrg, onClose , role }) {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDeleteUserId, setToDeleteUserId] = useState(null);

  const [formData, setFormData] = useState({
    userId: null,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    organization: currentOrg.name || "",
    groupName: "",
    role: "",
    contactNo: "",
    password: "",
    status: "ACTIVE",
  });
  const [formErrors, setFormErrors] = useState({});

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState("userId");
  const [sortDir, setSortDir] = useState("asc");
  const [loading, setLoading] = useState(false);

  const selectedOrg = currentOrg.name || "";

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { organizations, groups, roles } = useReferenceData(setSnackbar);

  const { isSearching, isOrgFilterActive, reloadPage } = useUsersData({
    selectedOrg,
    debouncedSearch,
    page,
    rowsPerPage,
    sortBy,
    sortDir,
    setUsers,
    setTotal,
    setLoading,
    setSnackbar,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleGroupChange = (e) => {
    const value = e.target.value;
    setFormData((p) => ({ ...p, groupName: value, role: "" }));
  };

  const buildPayload = () => {
    const { userId, ...rest } = trimAll(formData);
    const payload = { ...rest };
    if (formData.userId && !payload.password) delete payload.password;
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateForm(formData, setFormErrors)) {
      setSnackbar({
        open: true,
        message: "Fix validation errors.",
        severity: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload();
      if (formData.userId) {
        const res = await updateUser(formData.userId, payload);
        const updated = res.data;

        if (isOrgFilterActive || !isSearching) {
          await reloadPage();
        } else {
          setUsers((prev) =>
            prev.map((u) => (u.userId === formData.userId ? updated : u))
          );
        }

        setSnackbar({
          open: true,
          message: "User updated",
          severity: "success",
        });
      } else {
        await saveUser(payload);
        setSnackbar({
          open: true,
          message: "User created",
          severity: "success",
        });

        if (isOrgFilterActive || !isSearching) {
          await reloadPage();
        } else {
          const newTotal = total + 1;
          const lastPageIndex = Math.max(
            0,
            Math.ceil(newTotal / rowsPerPage) - 1
          );
          setTotal(newTotal);
          setPage(lastPageIndex);
        }
      }

      setOpen(false);
      setFormData({
        userId: null,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        organization: currentOrg.name || "",
        groupName: "",
        role: "",
        contactNo: "",
        password: "",
        status: "ACTIVE",
      });
      setFormErrors({});
    } catch (err) {
      const status = err.response?.status;
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(", ")
          : null);
      let msg = serverMsg || err.message || "Operation failed";
      if (status === 409) msg = "Email already exists.";
      if (status === 404) msg = "User not found.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      userId: user.userId,
      firstName: user.firstName || "",
      middleName: user.middleName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      organization: user.organization || currentOrg.name || "",
      groupName: user.groupName || "",
      role: user.role || "",
      contactNo: user.contactNo || "",
      password: "",
      status: user.status || "ACTIVE",
    });
    setFormErrors({});
    setOpen(true);
  };

  const requestDelete = (userId) => {
    setToDeleteUserId(userId);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    const id = toDeleteUserId;
    setConfirmDeleteOpen(false);
    if (!id) return;

    const prevUsers = users;
    setUsers((p) => p.filter((u) => u.userId !== id));

    try {
      await deleteUserById(id);
      setSnackbar({
        open: true,
        message: "User deleted",
        severity: "success",
      });

      if (isOrgFilterActive || !isSearching) {
        await reloadPage();
        setTimeout(async () => {
          if (users.length === 0 && page > 0) {
            setPage((p) => Math.max(0, p - 1));
            await reloadPage();
          }
        }, 0);
      } else {
        const newTotal = Math.max(0, total - 1);
        setTotal(newTotal);
        const lastPageIndex = Math.max(
          0,
          Math.ceil(newTotal / rowsPerPage) - 1
        );
        if (page > lastPageIndex) setPage(lastPageIndex);
      }
    } catch (err) {
      setUsers(prevUsers);
      const status = err.response?.status;
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (Array.isArray(err.response?.data?.errors)
          ? err.response.data.errors.join(", ")
          : null);
      let msg = serverMsg || err.message || "Delete failed";
      if (status === 404) msg = "User not found (already deleted?)";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setToDeleteUserId(null);
    }
  };

  const computedFilteredRoles = useMemo(
    () => computeFilteredRoles(formData.groupName, groups, roles),
    [formData.groupName, groups, roles]
  );

//   const visibleUsersAll = users;
const visibleUsersAll = role
  ? users.filter(u => String(u.role) === String(role.name || role.roleId || role.id))
  : users;
  const clientPaged = isSearching || isOrgFilterActive;

  const pagedUsers = useMemo(() => {
    if (!clientPaged) return visibleUsersAll;
    const start = page * rowsPerPage;
    return visibleUsersAll.slice(start, start + rowsPerPage);
  }, [visibleUsersAll, clientPaged, page, rowsPerPage]);

  const totalPages = useMemo(() => {
    return clientPaged
      ? Math.max(1, Math.ceil(visibleUsersAll.length / rowsPerPage))
      : Math.max(1, Math.ceil(total / rowsPerPage));
  }, [clientPaged, visibleUsersAll.length, total, rowsPerPage]);

  const startIndex = useMemo(() => {
    if (clientPaged)
      return visibleUsersAll.length === 0 ? 0 : page * rowsPerPage + 1;
    return total === 0 ? 0 : page * rowsPerPage + 1;
  }, [clientPaged, visibleUsersAll.length, total, page, rowsPerPage]);

  const endIndex = useMemo(() => {
    if (clientPaged)
      return Math.min(
        page * rowsPerPage + pagedUsers.length,
        visibleUsersAll.length
      );
    return Math.min(page * rowsPerPage + visibleUsersAll.length, total);
  }, [
    clientPaged,
    pagedUsers.length,
    visibleUsersAll.length,
    total,
    page,
    rowsPerPage,
  ]);

  const thStyle = {
    padding: "10px",
    backgroundColor: "#1976d2",
    color: "#fff",
    textAlign: "left",
    position: "sticky",
    top: 0,
    zIndex: 1,
  };
  const tdStyle = {
    padding: "10px",
    borderBottom: "1px solid #eee",
  };

  const handlePageChange = (_evt, muiPage) => {
    setPage(muiPage - 1);
  };
  const handleRowsPerPageChange = (evt) => {
    setRowsPerPage(Number(evt.target.value) || 5);
    setPage(0);
  };

  const exportCSV = () => {
    const rows = clientPaged ? pagedUsers : visibleUsersAll;
    exportCsvHelper(rows, page);
  };

  return (
    <Box
      sx={{
        mt: 2,
        p: 3,
        border: "2px solid #1976d2",
        borderRadius: 2,
        bgcolor: "#fff",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Users for: {currentOrg.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 250, flex: 1 }}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={exportCSV}
            disabled={
              (clientPaged ? pagedUsers.length : visibleUsersAll.length) === 0
            }
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setFormData({
                userId: null,
                firstName: "",
                middleName: "",
                lastName: "",
                email: "",
                organization: currentOrg.name || "",
                groupName: "",
                role: "",
                contactNo: "",
                password: "",
                status: "ACTIVE",
              });
              setFormErrors({});
              setOpen(true);
            }}
          >
            + Add User
          </Button>
        </Box>
      </Box>

      {/* Table - Fully Responsive */}
      <Box sx={{ width: "100%", overflowX: "auto", mb: 2 }}>
        <UsersTable
          pagedRows={clientPaged ? pagedUsers : visibleUsersAll}
          visibleUsersAll={visibleUsersAll}
          clientPaged={clientPaged}
          loading={loading}
          thStyle={thStyle}
          tdStyle={tdStyle}
          handleEdit={handleEdit}
          requestDelete={requestDelete}
        />
      </Box>

      {/* Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="body2">Rows per page:</Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
          <Typography variant="body2" sx={{ ml: 1 }}>
            Showing {startIndex}–{endIndex} of{" "}
            {clientPaged ? visibleUsersAll.length : total}
          </Typography>
        </Box>

        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          siblingCount={1}
          boundaryCount={1}
          disabled={(clientPaged ? visibleUsersAll.length : total) === 0}
        />
      </Box>

      <DeleteConfirmDialog
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        userId={toDeleteUserId}
      />

      <AddEditUserDialog
        open={open}
        submitting={submitting}
        formData={formData}
        formErrors={formErrors}
        organizations={organizations}
        groups={groups}
        computedFilteredRoles={computedFilteredRoles}
        handleChange={handleChange}
        handleGroupChange={handleGroupChange}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}