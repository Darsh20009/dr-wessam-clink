import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiHome, FiUsers, FiCalendar, FiDollarSign, FiBarChart2,
  FiMenu, FiLogOut, FiChevronLeft, FiBell, FiCreditCard, FiGlobe, FiSettings, FiX
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

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

  .sidebar-nav-link {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 14px; border-radius: 12px; margin-bottom: 3px;
    font-size: 14px; font-weight: 500; transition: all 0.2s;
    white-space: nowrap; text-decoration: none; position: relative;
    color: rgba(255,255,255,0.5);
  }
  .sidebar-nav-link:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.06); }
  .sidebar-nav-link.active {
    color: white; font-weight: 700;
    background: linear-gradient(135deg, rgba(14,165,233,0.22), rgba(37,99,235,0.18));
    border: 1px solid rgba(14,165,233,0.2);
    box-shadow: 0 4px 12px rgba(14,165,233,0.1);
  }
  .sidebar-nav-link.active::before {
    content: '';
    position: absolute;
    right: 0; top: 25%; bottom: 25%;
    width: 3px; border-radius: 2px;
    background: linear-gradient(180deg, #38bdf8, #2563eb);
  }

  .topbar-btn {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 8px 14px;
    color: rgba(255,255,255,0.7); font-size: 13px;
    font-weight: 600; cursor: pointer;
    font-family: 'Cairo', sans-serif;
    display: flex; align-items: center; gap: 6px;
    text-decoration: none;
    transition: all 0.2s;
  }
  .topbar-btn:hover { background: rgba(255,255,255,0.09); color: white; border-color: rgba(255,255,255,0.15); }

  .logout-btn {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 11px 14px; border-radius: 12px;
    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.15);
    color: rgba(252,165,165,0.9); font-size: 14px; cursor: pointer;
    font-family: 'Cairo', sans-serif; transition: all 0.2s;
  }
  .logout-btn:hover { background: rgba(239,68,68,0.18); border-color: rgba(239,68,68,0.3); color: #fca5a5; }

  .main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; overflow: hidden; }

  @keyframes slideIn { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  .page-anim { animation: slideIn 0.3s ease-out; }
`;

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNotification = useCallback((data) => {
    toast(
      <div style={{ direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>{data.title}</div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>{data.body}</div>
      </div>,
      { icon: '🔔', duration: 5000, style: { borderRadius: '12px' } }
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
      axios.get('/api/notifications').then(r => setUnreadCount(r.data.unreadCount || 0)).catch(() => {});
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f8', fontFamily: 'Cairo, sans-serif' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: sidebarOpen ? '260px' : '72px',
          background: 'linear-gradient(180deg, #030b1a 0%, #061020 60%, #040d1e 100%)',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
          position: 'sticky', top: 0, height: '100vh',
          overflowX: 'hidden',
          boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
          zIndex: 20,
        }}>

          {/* Logo area */}
          <div style={{
            padding: '18px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', gap: '10px',
            minHeight: '72px',
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: '-2px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                opacity: 0.6,
              }} />
              <img
                src="/logo-transparent.png"
                alt="logo"
                style={{
                  width: '42px', height: '42px',
                  borderRadius: '10px', objectFit: 'cover',
                  position: 'relative', zIndex: 1,
                  mixBlendMode: 'screen',
                  filter: 'brightness(1.1)',
                }}
              />
            </div>
            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '14px', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  د. وسام يوسف
                </div>
                <div style={{ color: 'rgba(14,165,233,0.8)', fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>
                  أخصائي تقويم الأسنان
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                marginRight: 'auto', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', color: 'rgba(255,255,255,0.5)',
                fontSize: '16px', cursor: 'pointer',
                width: '30px', height: '30px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              {sidebarOpen ? <FiChevronLeft /> : <FiMenu />}
            </button>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
            {sidebarOpen && (
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '1.5px', padding: '6px 14px 10px', textTransform: 'uppercase' }}>
                القائمة الرئيسية
              </div>
            )}
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span style={{ fontSize: '19px', flexShrink: 0, position: 'relative' }}>
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
                {sidebarOpen && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.to === '/doctor/notifications' && unreadCount > 0 && (
                      <span style={{
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white', borderRadius: '20px',
                        padding: '2px 8px', fontSize: '11px', fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(239,68,68,0.35)',
                      }}>{unreadCount}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom user section */}
          <div style={{ padding: '10px 8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {sidebarOpen && (
              <div style={{
                padding: '10px 14px', marginBottom: '8px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>{user?.name}</div>
                <div style={{ color: 'rgba(14,165,233,0.7)', fontSize: '11px', marginTop: '2px' }}>🩺 طبيب</div>
              </div>
            )}
            <button onClick={handleLogout} className="logout-btn">
              <FiLogOut style={{ flexShrink: 0, fontSize: '16px' }} />
              {sidebarOpen && 'تسجيل الخروج'}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main-content">

          {/* Top bar */}
          <div style={{
            background: 'white',
            borderBottom: '1px solid #e8ecf0',
            padding: '0 28px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
            position: 'sticky', top: 0, zIndex: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            {/* Left side - page breadcrumb / greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/logo-transparent.png" alt="logo" style={{ height: '32px', width: '32px', borderRadius: '8px', objectFit: 'cover', mixBlendMode: 'multiply' }} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '13px', color: '#1a3a6b' }}>د. وسام يوسف</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>لوحة تحكم العيادة</div>
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PushNotifBell />

              <NavLink to="/doctor/notifications" style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }} className="topbar-btn">
                <FiBell style={{ fontSize: '16px' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '4px', right: '10px',
                    background: '#ef4444', color: 'white',
                    borderRadius: '50%', width: '14px', height: '14px',
                    fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </NavLink>

              <NavLink to="/doctor/settings" className="topbar-btn">
                <FiSettings style={{ fontSize: '16px' }} /> الإعدادات
              </NavLink>

              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 900, fontSize: '15px',
                flexShrink: 0, cursor: 'default',
                boxShadow: '0 4px 12px rgba(14,165,233,0.3)',
              }}>
                {user?.name?.[0] || 'د'}
              </div>
            </div>
          </div>

          {/* Page content */}
          <main style={{ flex: 1, padding: '28px', overflowX: 'hidden' }} className="page-anim">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
