
// src/components/users/Users.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Pagination, Select, Snackbar, Typography
} from "@mui/material";
import UsersToolbar from "./UsersToolbar";
import UsersTable from "./UsersTable";
import AddEditUserDialog from "./AddEditUserDialog";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import useReferenceData from "./useReferenceData";
import useUsersData from "./useUsersData";
import { exportCSV as exportCsvHelper, validateForm, computeFilteredRoles, trimAll } from "./utils";
import { saveUser, updateUser, deleteUserById } from "./api";

export default function Users() {
  // Data
  const [users, setUsers] = useState([]);     // server page OR search/org results
  const [total, setTotal] = useState(0);      // server totalElements OR client total

  // UI states
  const [open, setOpen] = useState(false);    // add/edit dialog
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // delete confirm dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [toDeleteUserId, setToDeleteUserId] = useState(null);

  // form + validation
  const [formData, setFormData] = useState({
    userId: null,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    organization: "",
    groupName: "",
    role: "",
    contactNo: "",
    password: "",
    status: "ACTIVE",
  });
  const [formErrors, setFormErrors] = useState({});

  // filters + search
  const [selectedOrg, setSelectedOrg] = useState("");     // "" → All Organizations
  const [search, setSearch] = useState("");               // email-only text
  const [debouncedSearch, setDebouncedSearch] = useState(""); // debounced email text

  // server-side pagination & sort (listing mode only)
  const [page, setPage] = useState(0);               // 0-based index (shared for all modes)
  const [rowsPerPage, setRowsPerPage] = useState(10); // size=5 (as per your URL)
  const [sortBy, setSortBy] = useState("userId");
  const [sortDir, setSortDir] = useState("asc");

  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reference data
  const { organizations, groups, roles } = useReferenceData(setSnackbar);

  // Fetch users (org/search/listing) — org URL UPDATED with page & size inside useUsersData
  const { isSearching, isOrgFilterActive, reloadPage } = useUsersData({
    selectedOrg, debouncedSearch, page, rowsPerPage, sortBy, sortDir,
    setUsers, setTotal, setLoading, setSnackbar,
  });

  // Handlers
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
      setSnackbar({ open: true, message: "Fix validation errors.", severity: "warning" });
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
          setUsers((prev) => prev.map((u) => (u.userId === formData.userId ? updated : u)));
        }

        setSnackbar({ open: true, message: "User updated", severity: "success" });
      } else {
        await saveUser(payload);
        setSnackbar({ open: true, message: "User created", severity: "success" });

        if (isOrgFilterActive || !isSearching) {
          await reloadPage();
        } else {
          const newTotal = total + 1;
          const lastPageIndex = Math.max(0, Math.ceil(newTotal / rowsPerPage) - 1);
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
        organization: selectedOrg || "",
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
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(", ") : null);
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
      organization: user.organization || selectedOrg || "",
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
    setUsers((p) => p.filter((u) => u.userId !== id)); // optimistic

    try {
      await deleteUserById(id);
      setSnackbar({ open: true, message: "User deleted", severity: "success" });

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
        const lastPageIndex = Math.max(0, Math.ceil(newTotal / rowsPerPage) - 1);
        if (page > lastPageIndex) setPage(lastPageIndex);
      }
    } catch (err) {
      setUsers(prevUsers);
      const status = err.response?.status;
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(", ") : null);
      let msg = serverMsg || err.message || "Delete failed";
      if (status === 404) msg = "User not found (already deleted?)";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setToDeleteUserId(null);
    }
  };

  // Roles computed from selected group
  const computedFilteredRoles = useMemo(
    () => computeFilteredRoles(formData.groupName, groups, roles),
    [formData.groupName, groups, roles]
  );

  // Visible + client/server paging
  const visibleUsersAll = users;
  const clientPaged = isSearching || isOrgFilterActive;

  const pagedUsers = useMemo(() => {
    if (!clientPaged) return visibleUsersAll; // server page already
    const start = page * rowsPerPage;
    return visibleUsersAll.slice(start, start + rowsPerPage);
  }, [visibleUsersAll, clientPaged, page, rowsPerPage]);

  // Pagination numbers (UI is 1-based)
  const totalPages = useMemo(() => {
    return clientPaged
      ? Math.max(1, Math.ceil(visibleUsersAll.length / rowsPerPage))
      : Math.max(1, Math.ceil(total / rowsPerPage));
  }, [clientPaged, visibleUsersAll.length, total, rowsPerPage]);

  const startIndex = useMemo(() => {
    if (clientPaged) return visibleUsersAll.length === 0 ? 0 : page * rowsPerPage + 1;
    return total === 0 ? 0 : page * rowsPerPage + 1;
  }, [clientPaged, visibleUsersAll.length, total, page, rowsPerPage]);

  const endIndex = useMemo(() => {
    if (clientPaged) return Math.min(page * rowsPerPage + pagedUsers.length, visibleUsersAll.length);
    return Math.min(page * rowsPerPage + visibleUsersAll.length, total);
  }, [clientPaged, pagedUsers.length, visibleUsersAll.length, total, page, rowsPerPage]);

  // reset page when organization filter changes (avoid empty pages)
  useEffect(() => { setPage(0); }, [selectedOrg]);

  // Styles
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

  // Pagination handlers
  const handlePageChange = (_evt, muiPage) => { setPage(muiPage - 1); };
  const handleRowsPerPageChange = (evt) => { setRowsPerPage(Number(evt.target.value) || 5); setPage(0); };

  const exportCSV = () => {
    const rows = clientPaged ? pagedUsers : visibleUsersAll;
    exportCsvHelper(rows, page);
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Heading Banner */}
      <Box sx={{ background: "linear-gradient(90deg, #1976d2 0%, #1565c0 100%)", color: "#fff", borderRadius: 1, p: 2.5, mb: 2, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, lineHeight: 1.2 }}>Users</Typography>
            <Typography variant="body2" sx={{ opacity: 0.95 }}>Manage user accounts &amp; access</Typography>
          </Box>
        </Box>
      </Box>

      {/* Top bar */}
      <UsersToolbar
        organizations={organizations}
        selectedOrg={selectedOrg}
        setSelectedOrg={setSelectedOrg}
        search={search}
        setSearch={setSearch}
        exportCSV={exportCSV}
        openCreate={() => {
          setFormData({
            userId: null,
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            organization: selectedOrg || "",
            groupName: "",
            role: "",
            contactNo: "",
            password: "",
            status: "ACTIVE",
          });
          setFormErrors({});
          setOpen(true);
        }}
        pagedUsers={pagedUsers}
        visibleUsersAll={visibleUsersAll}
        clientPaged={clientPaged}
      />

      {/* Table */}
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

      {/* Pagination controls */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2">Rows per page:</Typography>
          <Select size="small" value={rowsPerPage} onChange={handleRowsPerPageChange} aria-label="Rows per page">
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
          </Select>
          <Typography variant="body2" sx={{ ml: 2 }}>Showing {startIndex}–{endIndex} of {clientPaged ? visibleUsersAll.length : total}</Typography>
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
          aria-label="Users page navigation"
        />
      </Box>

      {/* Delete confirm */}
      <DeleteConfirmDialog
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        userId={toDeleteUserId}
      />

      {/* Add/Edit dialog */}
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

      {/* Snackbar */}
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
