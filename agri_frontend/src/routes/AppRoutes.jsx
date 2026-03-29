import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/ui/Loader';

// Lazy load views
const Login = lazy(() => import('../features/auth/views/Login'));
const Signup = lazy(() => import('../features/auth/views/Signup'));
const Dashboard = lazy(() => import('../features/dashboard/views/Dashboard'));

// Placeholder components for other pages
const Farmers = lazy(() => import('../features/farmers/views/FarmersList'));
const Dealers = lazy(() => import('../features/dealers/views/DealersList'));
const Lots = lazy(() => import('../features/lots/views/LotsList'));
const BrowseLots = lazy(() => import('../features/dealers/views/BrowseLots'));
const Purchases = lazy(() => import('../features/purchases/views/PurchasesList'));
const Shipments = lazy(() => import('../features/shipments/views/ShipmentsList'));
const Payments = lazy(() => import('../features/payments/views/PaymentsList'));
const Transporters = lazy(() => import('../features/transporters/views/TransportersList'));
const Parties = () => <div className="p-4">Parties Module (Under Development)</div>;
const PendingApprovals = lazy(() => import('../features/admin/views/PendingApprovals'));
const Profile = lazy(() => import('../features/profile/views/Profile'));
const NotFound = () => <div className="p-4 flex flex-col items-center justify-center"><h1 style={{fontSize: '3rem'}}>404</h1><p>Page Not Found</p></div>;

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <Routes>
        <Route path="/" element={<Navigate to="/login/farmer" replace />} />
        
        {/* Auth Routes */}
        <Route path="/login/farmer" element={<Login roleTarget="FARMER" />} />
        <Route path="/login/dealer" element={<Login roleTarget="DEALER" />} />
        <Route path="/login/transporter" element={<Login roleTarget="TRANSPORTER" />} />
        <Route path="/login/admin" element={<Login roleTarget="ADMIN" />} />
        
        <Route path="/signup/farmer" element={<Signup roleTarget="FARMER" />} />
        <Route path="/signup/dealer" element={<Signup roleTarget="DEALER" />} />
        <Route path="/signup/transporter" element={<Signup roleTarget="TRANSPORTER" />} />
        
        <Route path="/login" element={<Navigate to="/login/farmer" replace />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Navigate to="/dashboard/farmer" replace />} />
            <Route path="/dashboard/:role" element={<Dashboard />} />
            
            {/* Additional Modules mapped */}
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/dealers" element={<Dealers />} />
            <Route path="/lots" element={<Lots />} />
            <Route path="/browse" element={<BrowseLots />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/assignments" element={<Shipments />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/transporters" element={<Transporters />} />
            <Route path="/dashboard/admin/approvals" element={<PendingApprovals />} />
            <Route path="/dashboard/admin/farmers" element={<Farmers />} />
            <Route path="/dashboard/admin/dealers" element={<Dealers />} />
            <Route path="/dashboard/admin/transporters" element={<Transporters />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/parties" element={<Parties />} />
          </Route>
        </Route>
        
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
