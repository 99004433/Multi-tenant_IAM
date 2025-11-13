import React, { Suspense } from "react";

const RemoteButton = React.lazy(() => import("common/Button"));

export default function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Shell Application</h1>
      <Suspense
        fallback={
          <div style={{ fontSize: "20px", color: "gray" }}>
            ⏳ Loading Remote Component...
          </div>
        }
      >
        <RemoteButton />
      </Suspense>
    </div>
  );
}