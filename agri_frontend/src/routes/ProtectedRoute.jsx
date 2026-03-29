import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

const ProtectedRoute = ({ allowedRoles }) => {
  const isAuth = isAuthenticated();
  
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
