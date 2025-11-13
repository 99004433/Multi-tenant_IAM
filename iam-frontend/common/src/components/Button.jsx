import React from "react";

export default function Button() {
  return (
    <button
      style={{
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
      onClick={() => alert("Button from Common MFE clicked!")}
    >
      Common MFE Button
    </button>
  );
}