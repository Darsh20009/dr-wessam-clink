import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('App Error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif', direction: 'rtl', background: '#f8fafc', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#1e3a8a', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>حدث خطأ غير متوقع</h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '14px' }}>{this.state.error?.message || 'يرجى تحديث الصفحة والمحاولة مرة أخرى'}</p>
          <button onClick={() => window.location.reload()} style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Presentation = lazy(() => import('./pages/Presentation'));
const DoctorLayout = lazy(() => import('./components/DoctorLayout'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const Patients = lazy(() => import('./pages/Patients'));
const PatientFile = lazy(() => import('./pages/PatientFile'));
const NewPatient = lazy(() => import('./pages/NewPatient'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Payments = lazy(() => import('./pages/Payments'));
const Reports = lazy(() => import('./pages/Reports'));
const PatientPortal = lazy(() => import('./pages/PatientPortal'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Wallet = lazy(() => import('./pages/Wallet'));
const SiteManager = lazy(() => import('./pages/SiteManager'));
const Settings = lazy(() => import('./pages/Settings'));
const SelfRegister = lazy(() => import('./pages/SelfRegister'));
const EmployeeCard = lazy(() => import('./pages/EmployeeCard'));
const PatientCard  = lazy(() => import('./pages/PatientCard'));
const DoctorPaymentRequests = lazy(() => import('./pages/DoctorPaymentRequests'));
const ReceptionDesk = lazy(() => import('./pages/ReceptionDesk'));
const Employees = lazy(() => import('./pages/Employees'));
const InternalMessages = lazy(() => import('./pages/InternalMessages'));

const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: 'Cairo, sans-serif', background: '#f8fafc' }}>
    <div style={{ width: '44px', height: '44px', border: '4px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
  </div>
);

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return <Navigate to={user.role === 'doctor' ? '/doctor' : user.role === 'employee' ? '/reception' : '/portal'} replace />;
    }
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={user ? <Navigate to={user.role === 'doctor' ? '/doctor' : user.role === 'employee' ? '/reception' : '/portal'} /> : <Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={user ? <Navigate to="/portal" /> : <SelfRegister />} />
        <Route path="/presentation" element={<Presentation />} />
        <Route path="/guide" element={<Presentation />} />

        <Route path="/doctor" element={
          <ProtectedRoute role="doctor"><DoctorLayout /></ProtectedRoute>
        }>
          <Route index element={<DoctorDashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/new" element={<NewPatient />} />
          <Route path="patients/:id" element={<PatientFile />} />
          <Route path="patients/:id/card" element={<PatientCard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="site" element={<SiteManager />} />
          <Route path="payment-requests" element={<DoctorPaymentRequests />} />
          <Route path="id-card" element={<EmployeeCard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reception" element={<ReceptionDesk />} />
          <Route path="employees" element={<Employees />} />
          <Route path="messages" element={<InternalMessages />} />
        </Route>

        <Route path="/reception" element={
          <ProtectedRoute role={['doctor', 'employee']}><ReceptionDesk /></ProtectedRoute>
        } />

        <Route path="/portal" element={
          <ProtectedRoute role="patient"><PatientPortal /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
    </ErrorBoundary>
  );
}
