// src/components/users/useReferenceData.js
import { useEffect, useState } from "react";
import { fetchOrganizations, fetchGroups, fetchRoles } from "./api";

export default function useReferenceData(setSnackbar) {
  const [organizations, setOrganizations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const pOrgs = fetchOrganizations(undefined, controller.signal).then(r => r.data).catch(() => []);
    const pGroups = fetchGroups(undefined, controller.signal).then(r => r.data).catch(() => []);
    const pRoles = fetchRoles(undefined, controller.signal).then(r => r.data).catch(() => []);

    Promise.all([pOrgs, pGroups, pRoles])
      .then(([orgs, grps, rls]) => {
        setOrganizations(Array.isArray(orgs) ? orgs : []);
        setGroups(Array.isArray(grps) ? grps : []);
        setRoles(Array.isArray(rls) ? rls : []);
      })
      .catch(() =>
        setSnackbar({ open: true, message: "Failed to load some resources.", severity: "error" })
      );

    return () => controller.abort();
  }, [setSnackbar]);

  return { organizations, groups, roles };
}
