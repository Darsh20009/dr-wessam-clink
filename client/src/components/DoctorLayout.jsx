import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiUsers, FiCalendar, FiDollarSign, FiBarChart2,
  FiMenu, FiX, FiLogOut, FiChevronRight
} from 'react-icons/fi';
import { FaTooth } from 'react-icons/fa';

const navItems = [
  { to: '/doctor', icon: <FiHome />, label: 'لوحة التحكم', end: true },
  { to: '/doctor/patients', icon: <FiUsers />, label: 'المرضى' },
  { to: '/doctor/appointments', icon: <FiCalendar />, label: 'المواعيد' },
  { to: '/doctor/payments', icon: <FiDollarSign />, label: 'المدفوعات' },
  { to: '/doctor/reports', icon: <FiBarChart2 />, label: 'التقارير' },
];

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        background: 'linear-gradient(180deg, #1a3a6b 0%, #1e3a8a 100%)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="logo" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          {sidebarOpen && (
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>د. وسام يوسف</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>تقويم الأسنان</div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            marginRight: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
            fontSize: '18px', cursor: 'pointer', flexShrink: 0
          }}>
            {sidebarOpen ? <FiChevronRight /> : <FiMenu />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 14px', borderRadius: '10px', marginBottom: '4px',
                color: isActive ? 'white' : 'rgba(255,255,255,0.65)',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                fontSize: '14px', fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s', whiteSpace: 'nowrap',
                textDecoration: 'none',
              })}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {sidebarOpen && (
            <div style={{ padding: '10px 12px', marginBottom: '8px' }}>
              <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{user?.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>طبيب</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '10px 12px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.2)', border: 'none',
            color: '#fca5a5', fontSize: '14px', cursor: 'pointer',
            transition: 'background 0.2s',
          }}>
            <FiLogOut style={{ flexShrink: 0 }} />
            {sidebarOpen && 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '28px', overflowX: 'hidden', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
