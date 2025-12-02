
// // src/components/users/useReferenceData.js
// import { useEffect, useState } from "react";
// import { orgsApi, groupsApi, rolesApi } from "./api";

// export default function useReferenceData(setSnackbar) {
//   const [organizations, setOrganizations] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [roles, setRoles] = useState([]);

//   useEffect(() => {
//     const controller = new AbortController();

//     const p2 = orgsApi.get("/api/organizations", { signal: controller.signal }).then(r => r.data).catch(() => []);
//     const p3 = groupsApi.get("/api/groups", { signal: controller.signal }).then(r => r.data).catch(() => []);
//     const p4 = rolesApi.get("/api/roles", { signal: controller.signal }).then(r => r.data).catch(() => []);

//     Promise.all([p2, p3, p4])
//       .then(([orgs, grps, rls]) => {
//         setOrganizations(Array.isArray(orgs) ? orgs : []);
//         setGroups(Array.isArray(grps) ? grps : []);
//         setRoles(Array.isArray(rls) ? rls : []);
//       })
//       .catch(() => setSnackbar({ open: true, message: "Failed to load some resources.", severity: "error" }));

//     return () => controller.abort();
//   }, [setSnackbar]);

//   return { organizations, groups, roles };
// }

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
