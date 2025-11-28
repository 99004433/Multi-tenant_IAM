import React, { useEffect, useState } from "react";
import organizationService from "../../Services/organizationService";
import ParentList from "./ParentList";
import DynamicHierarchy from "./DynamicHierarchy";
import { Box, CircularProgress } from "@mui/material";

export default function Organizations() {
  const [allOrgs, setAllOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParent, setSelectedParent] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const data = await organizationService.getAll();
      setAllOrgs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAllOrgs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  if (loading) return <Box sx={{minHeight: 300, display:"flex", alignItems:"center", justifyContent:"center"}}><CircularProgress /></Box>;

  return (
    <>
      {!selectedParent ? (
        <ParentList organizations={allOrgs} onViewChildren={(org) => setSelectedParent(org)} onRefresh={loadAll} />
      ) : (
        <DynamicHierarchy rootOrg={selectedParent} allOrgs={allOrgs} onBackToParent={() => setSelectedParent(null)} onRefresh={loadAll} />
      )}
    </>
  );
}
