import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }
  return <Navigate to="/" />;
};

export default RoleProtectedRoute;
