import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Presentation from './pages/Presentation';
import DoctorLayout from './components/DoctorLayout';
import DoctorDashboard from './pages/DoctorDashboard';
import Patients from './pages/Patients';
import PatientFile from './pages/PatientFile';
import NewPatient from './pages/NewPatient';
import Appointments from './pages/Appointments';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import PatientPortal from './pages/PatientPortal';
import Notifications from './pages/Notifications';
import Wallet from './pages/Wallet';
import SiteManager from './pages/SiteManager';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ width: '44px', height: '44px', border: '4px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'doctor' ? '/doctor' : '/portal'} replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'doctor' ? '/doctor' : '/portal'} /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/presentation" element={<Presentation />} />
      <Route path="/guide" element={<Presentation />} />

      <Route path="/doctor" element={
        <ProtectedRoute role="doctor"><DoctorLayout /></ProtectedRoute>
      }>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="patients/new" element={<NewPatient />} />
        <Route path="patients/:id" element={<PatientFile />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="site" element={<SiteManager />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/portal" element={
        <ProtectedRoute role="patient"><PatientPortal /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'Cairo, sans-serif',
              direction: 'rtl',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              padding: '12px 16px',
            },
            duration: 3500,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
