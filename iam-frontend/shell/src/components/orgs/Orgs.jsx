import React, { useState, useEffect } from "react";
import Tree from "react-d3-tree";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const initialData = {
  name: "Manipal Hospital",
  attributes: { role: "Hospital" },
  children: [
    {
      name: "Chief Medical Officer",
      attributes: { role: "CMO" },
      children: [
        {
          name: "Senior Doctor",
          attributes: { role: "Department Head" },
          children: [
            { name: "Doctor A", attributes: { role: "Doctor" } },
            { name: "Doctor B", attributes: { role: "Doctor" } },
            { name: "Doctor C", attributes: { role: "Doctor" } },
          ],
        },
      ],
    },
  ],
};

export default function Orgs() {
  const [treeData, setTreeData] = useState(initialData);
  const [openDialog, setOpenDialog] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Update dimensions on window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNodeClick = (nodeData) => {
    setSelectedNode(nodeData);
    setOpenDialog(true);
  };

  const handleAddNode = () => {
    if (!selectedNode || !newNodeName.trim()) return;

    const addChild = (node) => {
      if (node.name === selectedNode.name) {
        if (!node.children) node.children = [];
        node.children.push({ name: newNodeName, attributes: { role: "Doctor" } });
      } else if (node.children) {
        node.children.forEach(addChild);
      }
    };

    const updatedTree = { ...treeData };
    addChild(updatedTree);
    setTreeData(updatedTree);
    setNewNodeName("");
    setOpenDialog(false);
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    const deleteNode = (node, parent) => {
      if (node.name === selectedNode.name && parent) {
        parent.children = parent.children.filter((child) => child.name !== node.name);
        return true;
      }
      if (node.children) {
        return node.children.some((child) => deleteNode(child, node));
      }
      return false;
    };

    const updatedTree = { ...treeData };
    deleteNode(updatedTree, null);
    setTreeData(updatedTree);
    setOpenDialog(false);
  };

  return (
    <>
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Hospital Organization Structure
      </h2>
      <div style={{ width: "100vw", height: "calc(100vh - 100px)" }}>
        <Tree
          data={treeData}
          orientation="vertical"
          translate={{ x: dimensions.width / 2, y: 100 }} // Center horizontally
          zoomable={true}
          scaleExtent={{ min: 0.5, max: 2 }} // Zoom limits
          separation={{ siblings: 1.5, nonSiblings: 2 }} // Better spacing
        />
      </div>

      {/* Dialog for CRUD */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Manage Node: {selectedNode?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="New Child Name"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddNode} color="primary" variant="contained">
            Add Child
          </Button>
          <Button onClick={handleDeleteNode} color="error" variant="contained">
            Delete Node
          </Button>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}