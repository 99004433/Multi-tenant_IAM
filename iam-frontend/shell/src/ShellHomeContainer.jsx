// shell/src/ShellHomeContainer.jsx
import React, { useEffect, useState } from 'react';
import { fetchDashboard } from 'common/api';
import Home from 'common/pages/Home'; // adjust import based on your MF exposure

export default function ShellHomeContainer() {
  const [state, setState] = useState({
    users: [], organizations: [], groups: [], roles: [],
    loading: true, error: null, lastUpdated: null,
  });

  const load = async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { users, organizations, groups, roles } = await fetchDashboard();
      setState({
        users, organizations, groups, roles,
        loading: false, error: null,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setState(s => ({ ...s, loading: false, error: 'Failed to load dashboard data.' }));
    }
  };

  useEffect(() => { load(); }, []);

  return <Home {...state} onRefresh={load} />;
}
