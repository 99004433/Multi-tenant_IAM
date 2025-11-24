import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from '@mui/material';

import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import { organizationService } from '../../services/organizationService';

export default function OrganizationHierarchy({ rootOrgId }) {
  const [hierarchy, setHierarchy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    loadHierarchy();
  }, [rootOrgId]);

   const loadHierarchy = async () => {
  if (!rootOrgId) return; 
  try {
    setLoading(true);
    setError(null);
    const data = await organizationService.getOrganizationHierarchy(rootOrgId);
    setHierarchy(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event, nodeIds) => {
    setSelected(nodeIds);
  };

const renderTree = (node) => (
  <TreeItem
    key={node.orgId ?? node.name}
    nodeId={(node.orgId ?? node.name).toString()}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
          <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Box>
            <Typography variant="body1" fontWeight="medium">
              {node.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Level {node.level} • {node.status}
            </Typography>
          </Box>
        </Box>
      }
    >
     {Array.isArray(node.children)
      ? node.children.map((child) => renderTree(child))
      : null}
  </TreeItem>
);


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Organization Hierarchy
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        {hierarchy ? (
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={expanded}
            selected={selected}
            onNodeToggle={handleToggle}
            onNodeSelect={handleSelect}
          >
            {renderTree(hierarchy)}
          </TreeView>
        ) : (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No hierarchy data available
          </Typography>
        )}
      </Paper>
    </Box>
  );
}