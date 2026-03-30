import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/ui/Loader';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login/farmer" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const roleRedirects = { FARMER: '/dashboard/farmer', DEALER: '/dashboard/dealer', TRANSPORTER: '/dashboard/transporter' };
    return <Navigate to={roleRedirects[user?.role] || '/login/farmer'} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
