// src/components/organizations/index.jsx
import React, { useState } from "react";
import OrganizationList from "./OrganizationList";
import ChildOrganizationView from "./ChildOrganizationView";
import GrandchildOrganizationView from "./GrandchildOrganizationView";

export default function Organizations() {
  const [view, setView] = useState("parent"); // parent, child, grandchild
  const [selectedParent, setSelectedParent] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);

  const handleViewChildren = (parentOrg) => {
    setSelectedParent(parentOrg);
    setView("child");
  };

  const handleViewGrandchildren = (childOrg) => {
    setSelectedChild(childOrg);
    setView("grandchild");
  };

  const handleBackToParent = () => {
    setSelectedParent(null);
    setSelectedChild(null);
    setView("parent");
  };

  const handleBackToChild = () => {
    setSelectedChild(null);
    setView("child");
  };

  return (
    <>
      {view === "parent" && <OrganizationList onViewChildren={handleViewChildren} />}

      {view === "child" && selectedParent && (
        <ChildOrganizationView
          parentOrg={selectedParent}
          onBack={handleBackToParent}
          onViewGrandchildren={handleViewGrandchildren}
        />
      )}

      {view === "grandchild" && selectedParent && selectedChild && (
        <GrandchildOrganizationView
          parentOrg={selectedParent}
          childOrg={selectedChild}
          onBack={handleBackToChild}
          onBackToParent={handleBackToParent}
        />
      )}
    </>
  );
}
