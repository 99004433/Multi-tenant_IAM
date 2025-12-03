
// common/src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, Avatar,
  List, ListItem, ListItemText, Divider, Chip, Stack, CircularProgress, Button,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { People, Group, Security, Business, Refresh } from '@mui/icons-material';

// ---- ENV (Vite or CRA) + fallback
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) ||
  'http://localhost:8085';

// ---- Helper fetch that throws on non-OK
const fetchJson = async (path) => {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GET ${url} → ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
};

// ---- Helpers
const normalizeStatus = (s) => {
  const v = String(s || '').trim().toUpperCase();
  if (v === 'ACTIVATED') return 'ACTIVE';
  if (v === 'DISABLED')  return 'INACTIVE';
  return v; // ACTIVE / SUSPENDED / INACTIVE (preferred)
};

const sortByCreated = (arr) =>
  [...(Array.isArray(arr) ? arr : [])].sort((a, b) => {
    const ad = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bd = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bd - ad;
  });

const applyStatus = (arr, status) =>
  status === 'ALL'
    ? (arr || [])
    : (arr || []).filter((i) => normalizeStatus(i.status) === status);

const countByStatus = (arr) => ({
  ACTIVE:    (arr || []).filter((i) => normalizeStatus(i.status) === 'ACTIVE').length,
  SUSPENDED: (arr || []).filter((i) => normalizeStatus(i.status) === 'SUSPENDED').length,
  INACTIVE:  (arr || []).filter((i) => normalizeStatus(i.status) === 'INACTIVE').length,
});

const StatCard = ({ title, value, icon, color, footer }) => (
  <Card elevation={2} sx={{ borderRadius: 2 }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">{value}</Typography>
          {footer}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Home = ({
  // Props from shell (optional)
  users: usersProp,
  organizations: orgsProp,
  groups: groupsProp,
  roles: rolesProp,
  loading: loadingProp = false,
  error: errorProp = null,
  lastUpdated = null,
  onRefresh = null,
}) => {
  // --- DIAGNOSTIC LOGS ---
  useEffect(() => {
    console.log('[Home props] users:', usersProp);
    console.log('[Home props] organizations:', orgsProp);
    console.log('[Home props] groups:', groupsProp);
    console.log('[Home props] roles:', rolesProp);
  }, [usersProp, orgsProp, groupsProp, rolesProp]);

  // --- Local state
  const [users, setUsers] = useState(Array.isArray(usersProp) ? usersProp : []);
  const [organizations, setOrganizations] = useState(Array.isArray(orgsProp) ? orgsProp : []);
  const [groups, setGroups] = useState(Array.isArray(groupsProp) ? groupsProp : []);
  const [roles, setRoles] = useState(Array.isArray(rolesProp) ? rolesProp : []);

  const [loading, setLoading] = useState(loadingProp);
  const [error, setError] = useState(errorProp);
  const [updatedAt, setUpdatedAt] = useState(lastUpdated);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const handleStatusFilterChange = (_e, value) => value && setStatusFilter(value);

  // --- If props are empty, self-fetch
  const shouldSelfFetch =
    !(Array.isArray(usersProp) && usersProp.length) &&
    !(Array.isArray(orgsProp) && orgsProp.length) &&
    !(Array.isArray(groupsProp) && groupsProp.length) &&
    !(Array.isArray(rolesProp) && rolesProp.length);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [uRes, oRes, gRes, rRes] = await Promise.allSettled([
      fetchJson('/api/users/getAllUsers'),
      fetchJson('/api/organizations'),
      fetchJson('/api/groups'),
      fetchJson('/api/roles'),
    ]);

    const errs = [];
    const u = uRes.status === 'fulfilled' ? (Array.isArray(uRes.value) ? uRes.value : (uRes.value?.data ?? [])) : (errs.push(uRes.reason?.message), []);
    const o = oRes.status === 'fulfilled' ? (Array.isArray(oRes.value) ? oRes.value : (oRes.value?.data ?? [])) : (errs.push(oRes.reason?.message), []);
    const g = gRes.status === 'fulfilled' ? (Array.isArray(gRes.value) ? gRes.value : (gRes.value?.data ?? [])) : (errs.push(gRes.reason?.message), []);
    const r = rRes.status === 'fulfilled' ? (Array.isArray(rRes.value) ? rRes.value : (rRes.value?.data ?? [])) : (errs.push(rRes.reason?.message), []);

    console.log('[Home selfFetch] users:', u.length, u);
    console.log('[Home selfFetch] orgs:', o.length, o);
    console.log('[Home selfFetch] groups:', g.length, g);
    console.log('[Home selfFetch] roles:', r.length, r);

    setUsers(u);
    setOrganizations(o);
    setGroups(g);
    setRoles(r);

    if (!errs.length) setUpdatedAt(new Date().toISOString());
    if (errs.length) {
      console.error('Dashboard load errors:', errs);
      setError(errs.join(' • '));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (shouldSelfFetch) {
      load().catch((e) => {
        console.error('Dashboard fatal load error:', e);
        setError(e.message);
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect new props if shell later passes them
  useEffect(() => {
    if (Array.isArray(usersProp)) setUsers(usersProp);
    if (Array.isArray(orgsProp)) setOrganizations(orgsProp);
    if (Array.isArray(groupsProp)) setGroups(groupsProp);
    if (Array.isArray(rolesProp)) setRoles(rolesProp);
    setLoading(loadingProp);
    setError(errorProp);
    setUpdatedAt(lastUpdated);
  }, [usersProp, orgsProp, groupsProp, rolesProp, loadingProp, errorProp, lastUpdated]);

  // --- Normalize status field in memory
  const normUsers = useMemo(() => users.map(u => ({ ...u, status: normalizeStatus(u.status) })), [users]);
  const normOrgs  = useMemo(() => organizations.map(o => ({ ...o, status: normalizeStatus(o.status) })), [organizations]);
  const normGrps  = useMemo(() => groups.map(g => ({ ...g, status: normalizeStatus(g.status) })), [groups]);
  const normRoles = useMemo(() => roles.map(r => ({ ...r, status: normalizeStatus(r.status) })), [roles]);

  // --- Apply filter
  const filteredUsers  = useMemo(() => applyStatus(normUsers,  statusFilter), [normUsers,  statusFilter]);
  const filteredOrgs   = useMemo(() => applyStatus(normOrgs,   statusFilter), [normOrgs,   statusFilter]);
  const filteredGroups = useMemo(() => applyStatus(normGrps,   statusFilter), [normGrps,   statusFilter]);
  const filteredRoles  = useMemo(() => applyStatus(normRoles,  statusFilter), [normRoles,  statusFilter]);

  // --- Counts
  const userCount  = filteredUsers.length;
  const orgCount   = filteredOrgs.length;
  const groupCount = filteredGroups.length;
  const roleCount  = filteredRoles.length;

  const userStatusCounts = useMemo(() => countByStatus(normUsers), [normUsers]);
  const orgStatusCounts  = useMemo(() => countByStatus(normOrgs),  [normOrgs]);
  const grpStatusCounts  = useMemo(() => countByStatus(normGrps),  [normGrps]);
  const roleStatusCounts = useMemo(() => countByStatus(normRoles), [normRoles]);

  // --- Previews
  const previewUsers  = useMemo(() => sortByCreated(filteredUsers).slice(0, 5), [filteredUsers]);
  const previewOrgs   = useMemo(() => sortByCreated(filteredOrgs).slice(0, 5), [filteredOrgs]);
  const previewGroups = useMemo(() => sortByCreated(filteredGroups).slice(0, 5), [filteredGroups]);
  const previewRoles  = useMemo(() => sortByCreated(filteredRoles).slice(0, 5), [filteredRoles]);

  const userProfile = { firstName: 'Guest' };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pt: 2 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Welcome back, {userProfile.firstName}!</Typography>
          <Typography variant="body1" color="text.secondary">
            Here’s what’s happening with your IAM portal today.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : '—'}
          </Typography>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1}>
          <ToggleButtonGroup value={statusFilter} exclusive onChange={handleStatusFilterChange} size="small">
            <ToggleButton value="ALL">ALL</ToggleButton>
            <ToggleButton value="ACTIVE">ACTIVE</ToggleButton>
            <ToggleButton value="SUSPENDED">SUSPENDED</ToggleButton>
            <ToggleButton value="INACTIVE">INACTIVE</ToggleButton>
          </ToggleButtonGroup>

          <Chip label="Dashboard" color="primary" variant="outlined" />
          <Button variant="outlined" startIcon={<Refresh />} onClick={onRefresh ?? load}>
            REFRESH
          </Button>
        </Stack>
      </Stack>

      {/* Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TOTAL USERS"
            value={userCount}
            icon={<People />}
            color="primary.main"
            footer={
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={`Active: ${userStatusCounts.ACTIVE}`}    color="primary"  variant="outlined" />
                <Chip size="small" label={`Suspended: ${userStatusCounts.SUSPENDED}`} color="warning"  variant="outlined" />
                <Chip size="small" label={`Inactive: ${userStatusCounts.INACTIVE}`}  color="default"  variant="outlined" />
              </Stack>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ORGANIZATIONS"
            value={orgCount}
            icon={<Business />}
            color="success.main"
            footer={
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={`Active: ${orgStatusCounts.ACTIVE}`}    color="success"  variant="outlined" />
                <Chip size="small" label={`Suspended: ${orgStatusCounts.SUSPENDED}`} color="warning"  variant="outlined" />
                <Chip size="small" label={`Inactive: ${orgStatusCounts.INACTIVE}`}  color="default"  variant="outlined" />
              </Stack>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="GROUPS"
            value={groupCount}
            icon={<Group />}
            color="warning.main"
            footer={
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={`Active: ${grpStatusCounts.ACTIVE}`}    color="warning"  variant="outlined" />
                <Chip size="small" label={`Suspended: ${grpStatusCounts.SUSPENDED}`} color="warning"  variant="outlined" />
                <Chip size="small" label={`Inactive: ${grpStatusCounts.INACTIVE}`}  color="default"  variant="outlined" />
              </Stack>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ROLES"
            value={roleCount}
            icon={<Security />}
            color="error.main"
            footer={
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={`Active: ${roleStatusCounts.ACTIVE}`}    color="error"   variant="outlined" />
                <Chip size="small" label={`Suspended: ${roleStatusCounts.SUSPENDED}`} color="warning"  variant="outlined" />
                <Chip size="small" label={`Inactive: ${roleStatusCounts.INACTIVE}`}  color="default"  variant="outlined" />
              </Stack>
            }
          />
        </Grid>

        {/* Loading & Error */}
        {loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading live data…
              </Typography>
            </Paper>
          </Grid>
        )}
        {error && !loading && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="error">{error}</Typography>
            </Paper>
          </Grid>
        )}

        {/* Organizations Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold">Organizations Overview</Typography>
            <List dense sx={{ pt: 1 }}>
              {applyStatus(organizations, statusFilter).length === 0 && (
                <Typography variant="body2" color="text.secondary">No organizations found.</Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Recent Users (Name primary; email secondary) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold">Recent Users</Typography>
            <List dense sx={{ pt: 1 }}>
              {previewUsers.length === 0 && (
                <Typography variant="body2" color="text.secondary">No users found.</Typography>
              )}
              {previewUsers.map((u, idx) => {
                const name = u.name || u.username || `User #${idx + 1}`;
                const when = u.createdAt ? new Date(u.createdAt).toLocaleString() : null;
                return (
                  <React.Fragment key={u.userId ?? u.id ?? idx}>
                    <ListItem disableGutters>
                      <ListItemText
                        primary={name}
                        secondary={
                          <>
                            {u.email ? <span>{u.email}</span> : null}
                            {when ? <span> • {when}</span> : null}
                          </>
                        }
                      />
                    </ListItem>
                    {idx < previewUsers.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Recent Orgs / Groups / Roles (keep as you had) */}
        {/* ... */}
      </Grid>
    </Box>
  );
};

export default Home;
