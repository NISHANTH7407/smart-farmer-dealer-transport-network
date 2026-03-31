import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../layouts/DashboardLayout';
import Loader from '../components/ui/Loader';

const Login              = lazy(() => import('../features/auth/views/Login'));
const Signup             = lazy(() => import('../features/auth/views/Signup'));
const FarmerDashboard    = lazy(() => import('../pages/FarmerDashboard'));
const DealerDashboard    = lazy(() => import('../pages/DealerDashboard'));
const TransporterDashboard = lazy(() => import('../pages/TransporterDashboard'));
const Lots               = lazy(() => import('../features/lots/views/LotsList'));
const BrowseLots         = lazy(() => import('../features/dealers/views/BrowseLots'));
const Purchases          = lazy(() => import('../features/purchases/views/PurchasesList'));
const Shipments          = lazy(() => import('../features/shipments/views/ShipmentsList'));
const Payments           = lazy(() => import('../features/payments/views/PaymentsList'));
const Transporters       = lazy(() => import('../features/transporters/views/TransportersList'));
const Profile            = lazy(() => import('../features/profile/views/Profile'));
const AiChat             = lazy(() => import('../features/ai/views/AiChat'));

const NotFound = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
    <h1 style={{ fontSize: '4rem', fontWeight: 700 }}>404</h1>
    <p style={{ color: 'var(--text-secondary)' }}>Page not found</p>
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<Loader fullScreen />}>
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/login/farmer" replace />} />
      <Route path="/login" element={<Navigate to="/login/farmer" replace />} />

      {/* Auth */}
      <Route path="/login/farmer"      element={<Login roleTarget="FARMER" />} />
      <Route path="/login/dealer"      element={<Login roleTarget="DEALER" />} />
      <Route path="/login/transporter" element={<Login roleTarget="TRANSPORTER" />} />
      <Route path="/login/admin"       element={<Login roleTarget="ADMIN" />} />
      <Route path="/signup/farmer"     element={<Signup roleTarget="FARMER" />} />
      <Route path="/signup/dealer"     element={<Signup roleTarget="DEALER" />} />
      <Route path="/signup/transporter" element={<Signup roleTarget="TRANSPORTER" />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Navigate to="/dashboard/farmer" replace />} />

          <Route path="/dashboard/farmer" element={
            <ProtectedRoute allowedRoles={['FARMER']}><FarmerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/dealer" element={
            <ProtectedRoute allowedRoles={['DEALER']}><DealerDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/transporter" element={
            <ProtectedRoute allowedRoles={['TRANSPORTER']}><TransporterDashboard /></ProtectedRoute>
          } />

          <Route path="/lots"         element={<Lots />} />
          <Route path="/browse"       element={<BrowseLots />} />
          <Route path="/purchases"    element={<Purchases />} />
          <Route path="/shipments"    element={<Shipments />} />
          <Route path="/assignments"  element={<Shipments />} />
          <Route path="/payments"     element={<Payments />} />
          <Route path="/transporters" element={<Transporters />} />
          <Route path="/profile"      element={<Profile />} />
          <Route path="/ai-chat"     element={<AiChat />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
