
import React, { useEffect, useMemo, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, Avatar,
  List, ListItem, ListItemText, Divider, Chip, Stack, CircularProgress, Button,
  ToggleButton, ToggleButtonGroup
} from '@mui/material';
import { People, Group, Security, Business, Refresh } from '@mui/icons-material';

const API_BASE = 'http://localhost:8085/api';

const fetchJson = async (path) => {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`GET ${url} → ${res.status}: ${txt || res.statusText}`);
  }
  return res.json();
};

const normalizeStatus = (s) => {
  const v = String(s || '').trim().toUpperCase();
  if (v === 'ACTIVATED') return 'ACTIVE';
  if (v === 'DISABLED') return 'INACTIVE';
  return v;
};

const countByStatus = (arr) => ({
  ACTIVE: arr.filter(i => normalizeStatus(i.status) === 'ACTIVE').length,
  SUSPENDED: arr.filter(i => normalizeStatus(i.status) === 'SUSPENDED').length,
  INACTIVE: arr.filter(i => normalizeStatus(i.status) === 'INACTIVE').length,
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

const Home = () => {
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const handleStatusFilterChange = (_e, value) => value && setStatusFilter(value);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [uRes, oRes, gRes, rRes] = await Promise.allSettled([
      fetchJson('/users?page=0&size=1000&sortBy=userId&sortDir=asc'),
      fetchJson('/organizations'),
      fetchJson('/groups'),
      fetchJson('/roles'),
    ]);

    const errs = [];
    const usersData = uRes.status === 'fulfilled' ? uRes.value.content || [] : [];
    const orgData = oRes.status === 'fulfilled' ? oRes.value || [] : [];
    const groupData = gRes.status === 'fulfilled' ? gRes.value || [] : [];
    const roleData = rRes.status === 'fulfilled' ? rRes.value || [] : [];

    setUsers(usersData);
    setOrganizations(orgData);
    setGroups(groupData);
    setRoles(roleData);

    if (!errs.length) setUpdatedAt(new Date().toISOString());
    if (errs.length) setError(errs.join(' • '));
    setLoading(false);
  };

  useEffect(() => {
    load().catch((e) => {
      console.error('Dashboard fatal load error:', e);
      setError(e.message);
      setLoading(false);
    });
  }, []);

  const userStatusCounts = useMemo(() => countByStatus(users), [users]);
  const orgStatusCounts = useMemo(() => countByStatus(organizations), [organizations]);
  const grpStatusCounts = useMemo(() => countByStatus(groups), [groups]);
  const roleStatusCounts = useMemo(() => countByStatus(roles), [roles]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, pt: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Welcome back, Guest!</Typography>
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
          <Button variant="outlined" startIcon={<Refresh />} onClick={load}>
            REFRESH
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TOTAL USERS"
            value={users.length}
            icon={<People />}
            color="primary.main"
            footer={
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={`Active: ${userStatusCounts.ACTIVE}`} color="primary" />
                <Chip size="small" label={`Suspended: ${userStatusCounts.SUSPENDED}`} color="warning" />
                <Chip size="small" label={`Inactive: ${userStatusCounts.INACTIVE}`} color="default" />
              </Stack>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ORGANIZATIONS"
            value={organizations.length}
            icon={<Business />}
            color="success.main"
            footer={
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={`Active: ${orgStatusCounts.ACTIVE}`} color="success" />
                <Chip size="small" label={`Suspended: ${orgStatusCounts.SUSPENDED}`} color="warning" />
                <Chip size="small" label={`Inactive: ${orgStatusCounts.INACTIVE}`} color="default" />
              </Stack>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="GROUPS"
            value={groups.length}
            icon={<Group />}
            color="warning.main"
            footer={
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={`Active: ${grpStatusCounts.ACTIVE}`} color="warning" />
                <Chip size="small" label={`Suspended: ${grpStatusCounts.SUSPENDED}`} color="warning" />
                <Chip size="small" label={`Inactive: ${grpStatusCounts.INACTIVE}`} color="default" />
              </Stack>
            }
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ROLES"
            value={roles.length}
            icon={<Security />}
            color="error.main"
            footer={
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" label={`Active: ${roleStatusCounts.ACTIVE}`} color="error" />
                <Chip size="small" label={`Suspended: ${roleStatusCounts.SUSPENDED}`} color="warning" />
                <Chip size="small" label={`Inactive: ${roleStatusCounts.INACTIVE}`} color="default" />
              </Stack>
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;
