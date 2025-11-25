// Home.jsx
import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import { People, Group, Security, Business } from '@mui/icons-material';

// Reusable StatCard component
const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const Home = () => {
  // Static placeholder values instead of useAuth
  const user = {
    firstName: 'Guest',
    email: 'admin@example.com',
    role: 'admin',
    orgId: 'N/A',
  };

  return (
    <Box sx={{ p: 3, paddingTop: '10px' }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Welcome back, {user.firstName}!
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom mb={4}>
        Here's what's happening with your IAM portal today.
      </Typography>

      <Grid container spacing={3}>
        {/* Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value="0"
            icon={<People />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Organizations"
            value="0"
            icon={<Business />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Groups"
            value="0"
            icon={<Group />}
            color="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Roles"
            value="0"
            icon={<Security />}
            color="error.main"
          />
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use the navigation menu to manage users, organizations, groups, and roles.
            </Typography>
          </Paper>
        </Grid>

        {/* Profile */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Your Profile
            </Typography>
            <Box mt={2}>
              <Typography variant="body2">
                <strong>Email:</strong> {user.email}
              </Typography>
              <Typography variant="body2" mt={1}>
                <strong>Role:</strong> {user.role}
              </Typography>
              <Typography variant="body2" mt={1}>
                <strong>Organization ID:</strong> {user.orgId}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              System Status
            </Typography>
            <Box mt={2}>
              <Typography variant="body2" color="success.main">
                ● All systems operational
              </Typography>
              <Typography variant="body2" mt={1} color="text.secondary">
                Last updated: {new Date().toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;