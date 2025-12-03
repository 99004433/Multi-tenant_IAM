
import React from 'react';

const RoleProtectedRoute = ({ children }) => {
  // ✅ Always allow access
  return children;
};

export default RoleProtectedRoute;
