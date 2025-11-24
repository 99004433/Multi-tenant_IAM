import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import OrganizationList from './OrganizationList';
import OrganizationHierarchy from './OrganizationHierarchy';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function Organizations() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Organization List" />
          <Tab label="Hierarchy View" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <OrganizationList />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <OrganizationHierarchy rootOrgId={1} />
      </TabPanel>
    </Box>
  );
}