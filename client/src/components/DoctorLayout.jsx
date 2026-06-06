import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiHome, FiUsers, FiCalendar, FiDollarSign, FiBarChart2,
  FiMenu, FiLogOut, FiChevronRight, FiBell, FiCreditCard, FiGlobe, FiSettings
} from 'react-icons/fi';
import PushNotifBell from './PushNotifBell';
import { usePushNotifications } from '../hooks/usePushNotifications';

const navItems = [
  { to: '/doctor', icon: <FiHome />, label: 'لوحة التحكم', end: true },
  { to: '/doctor/patients', icon: <FiUsers />, label: 'المرضى' },
  { to: '/doctor/appointments', icon: <FiCalendar />, label: 'المواعيد' },
  { to: '/doctor/payments', icon: <FiDollarSign />, label: 'المدفوعات' },
  { to: '/doctor/wallet', icon: <FiCreditCard />, label: 'المحفظة' },
  { to: '/doctor/reports', icon: <FiBarChart2 />, label: 'التقارير' },
  { to: '/doctor/notifications', icon: <FiBell />, label: 'الإشعارات' },
  { to: '/doctor/site', icon: <FiGlobe />, label: 'إدارة الموقع' },
  { to: '/doctor/settings', icon: <FiSettings />, label: 'الإعدادات' },
];

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNotification = useCallback((data) => {
    toast(
      <div style={{ direction: 'rtl' }}>
        <div style={{ fontWeight: 700 }}>{data.title}</div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>{data.body}</div>
      </div>,
      { icon: '🔔', duration: 5000 }
    );
    setUnreadCount(n => n + 1);
  }, []);

  const { connectWs, disconnectWs } = usePushNotifications({ onNotification: handleNotification });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) connectWs(token);
    return () => disconnectWs();
  }, [connectWs, disconnectWs]);

  useEffect(() => {
    const fetchNotifCount = () => {
      axios.get('/notifications').then(r => setUnreadCount(r.data.unreadCount)).catch(() => {});
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        background: 'linear-gradient(180deg, #1a3a6b 0%, #1e3a8a 100%)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowX: 'hidden',
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
            fontSize: '18px', cursor: 'pointer', flexShrink: 0,
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
                textDecoration: 'none', position: 'relative',
              })}>
              <span style={{ fontSize: '18px', flexShrink: 0, position: 'relative' }}>
                {item.icon}
                {item.to === '/doctor/notifications' && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', left: '-6px',
                    background: '#ef4444', color: 'white',
                    borderRadius: '50%', width: '16px', height: '16px',
                    fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, lineHeight: 1,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </span>
              {sidebarOpen && <span style={{ flex: 1 }}>{item.label}</span>}
              {sidebarOpen && item.to === '/doctor/notifications' && unreadCount > 0 && (
                <span style={{
                  background: '#ef4444', color: 'white', borderRadius: '20px',
                  padding: '1px 7px', fontSize: '11px', fontWeight: 700,
                }}>{unreadCount}</span>
              )}
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
            fontFamily: 'Cairo, sans-serif', transition: 'background 0.2s',
          }}>
            <FiLogOut style={{ flexShrink: 0 }} />
            {sidebarOpen && 'تسجيل الخروج'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <div style={{
          background: 'white', borderBottom: '1px solid #e2e8f0',
          padding: '12px 28px', display: 'flex', alignItems: 'center',
          justifyContent: 'flex-end', gap: '10px', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <PushNotifBell />
          <NavLink to="/doctor/notifications" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '20px', padding: '6px', display: 'flex', alignItems: 'center' }}>
            <FiBell />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                background: '#ef4444', color: 'white',
                borderRadius: '50%', width: '14px', height: '14px',
                fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800,
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </NavLink>
          <NavLink to="/doctor/settings" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 12px', color: '#475569', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiSettings style={{ fontSize: '14px' }} /> الإعدادات
          </NavLink>
        </div>
        <main style={{ flex: 1, padding: '28px', overflowX: 'hidden' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
