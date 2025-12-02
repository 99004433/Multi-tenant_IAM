
// src/components/users/useUsersData.js
import { useEffect, useRef } from "react";
import { fetchUsersPaged, fetchUsersByOrgPaged, searchUsersByEmail } from "./api";

export default function useUsersData({
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
}) {
  const firstRunRef = useRef(true);
  const isSearching = debouncedSearch.length >= 2;
  const isOrgFilterActive = selectedOrg.trim().length > 0;

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && firstRunRef.current) {
      firstRunRef.current = false;
      return;
    }
    const controller = new AbortController();
    setLoading(true);

    if (isOrgFilterActive) {
      // ✅ UPDATED org URL with page & size
      fetchUsersByOrgPaged(
        { organization: selectedOrg, page, size: rowsPerPage /*, sortBy, sortDir*/ },
        controller.signal
      )
        .then(({ data }) => {
          const content = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
          const totalElements = Number.isFinite(data?.totalElements) ? data.totalElements : content.length;

          // optional: filter by email within org page
          const filtered = isSearching
            ? content.filter(u => (u.email || "").toLowerCase().includes(debouncedSearch.toLowerCase()))
            : content;

          setUsers(filtered);
          setTotal(isSearching ? filtered.length : totalElements);
        })
        .catch(() => setSnackbar({ open: true, message: "Failed to load users for organization.", severity: "error" }))
        .finally(() => setLoading(false));
    } else if (isSearching) {
      searchUsersByEmail(debouncedSearch, controller.signal)
        .then(({ data }) => {
          const arr = Array.isArray(data) ? data : [];
          setUsers(arr);
          setTotal(arr.length);
        })
        .catch(() => setSnackbar({ open: true, message: "Failed to search users.", severity: "error" }))
        .finally(() => setLoading(false));
    } else {
      fetchUsersPaged({ page, size: rowsPerPage, sortBy, sortDir }, controller.signal)
        .then(({ data }) => {
          const content = Array.isArray(data?.content) ? data.content : [];
          const totalElements = Number.isFinite(data?.totalElements) ? data.totalElements : 0;
          setUsers(content);
          setTotal(totalElements);
        })
        .catch(() => setSnackbar({ open: true, message: "Failed to load users.", severity: "error" }))
        .finally(() => setLoading(false));
    }

    return () => controller.abort();
  }, [selectedOrg, debouncedSearch, page, rowsPerPage, sortBy, sortDir, setUsers, setTotal, setLoading, setSnackbar]);

  // Helper to reload current page (used after CRUD)
  const reloadPage = async () => {
    try {
      if (isOrgFilterActive) {
        const { data } = await fetchUsersByOrgPaged({ organization: selectedOrg, page, size: rowsPerPage /*, sortBy, sortDir*/ });
        const content = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
        const totalElements = Number.isFinite(data?.totalElements) ? data.totalElements : content.length;
        setUsers(content);
        setTotal(totalElements);
      } else if (!isSearching) {
        const { data } = await fetchUsersPaged({ page, size: rowsPerPage, sortBy, sortDir });
        const content = Array.isArray(data?.content) ? data.content : [];
        const totalElements = Number.isFinite(data?.totalElements) ? data.totalElements : 0;
        setUsers(content);
        setTotal(totalElements);
      }
    } catch (e) {
      setSnackbar({ open: true, message: "Failed to refresh data.", severity: "error" });
    }
  };

  return { isSearching, isOrgFilterActive, reloadPage };
}
