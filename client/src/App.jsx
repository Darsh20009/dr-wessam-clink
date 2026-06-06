import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
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
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
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
            style: { fontFamily: 'Cairo, sans-serif', direction: 'rtl', borderRadius: '10px' },
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
