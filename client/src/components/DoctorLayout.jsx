import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiHome, FiUsers, FiCalendar, FiDollarSign, FiBarChart2,
  FiMenu, FiLogOut, FiChevronLeft, FiBell, FiCreditCard,
  FiGlobe, FiSettings, FiX, FiActivity, FiAward
} from 'react-icons/fi';
import PushNotifBell from './PushNotifBell';
import { usePushNotifications } from '../hooks/usePushNotifications';

const navItems = [
  { to: '/doctor', icon: <FiHome size={17} />, label: 'لوحة التحكم', end: true },
  { to: '/doctor/patients', icon: <FiUsers size={17} />, label: 'المرضى' },
  { to: '/doctor/appointments', icon: <FiCalendar size={17} />, label: 'المواعيد' },
  { to: '/doctor/payments', icon: <FiDollarSign size={17} />, label: 'المدفوعات' },
  { to: '/doctor/wallet', icon: <FiCreditCard size={17} />, label: 'المحفظة' },
  { to: '/doctor/reports', icon: <FiBarChart2 size={17} />, label: 'التقارير' },
  { to: '/doctor/notifications', icon: <FiBell size={17} />, label: 'الإشعارات', notif: true },
  { to: '/doctor/site', icon: <FiGlobe size={17} />, label: 'إدارة الموقع' },
  { to: '/doctor/id-card', icon: <FiAward size={17} />, label: 'بطاقة التوظيف' },
  { to: '/doctor/settings', icon: <FiSettings size={17} />, label: 'الإعدادات' },
];

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

  .dl-sidebar-link {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 9px; margin-bottom: 2px;
    font-size: 14px; font-weight: 500; transition: all 0.18s;
    white-space: nowrap; text-decoration: none; position: relative;
    color: #64748b;
  }
  .dl-sidebar-link:hover { color: #2563eb; background: #eff6ff; }
  .dl-sidebar-link.active {
    color: #2563eb; font-weight: 700;
    background: #eff6ff; border: 1px solid #dbeafe;
  }
  .dl-sidebar-link.active::before {
    content: ''; position: absolute;
    right: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: #2563eb;
  }

  .dl-topbar-btn {
    background: #f8fafc; border: 1.5px solid #e2e8f0;
    border-radius: 9px; padding: 7px 13px;
    color: #475569; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: 'Cairo', sans-serif;
    display: flex; align-items: center; gap: 6px;
    text-decoration: none; transition: all 0.18s;
  }
  .dl-topbar-btn:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }

  .dl-logout-btn {
    display: flex; align-items: center; gap: 9px;
    width: 100%; padding: 10px 12px; border-radius: 9px;
    background: #fff5f5; border: 1.5px solid #fecaca;
    color: #dc2626; font-size: 14px; cursor: pointer;
    font-family: 'Cairo', sans-serif; transition: all 0.18s;
    font-weight: 600;
  }
  .dl-logout-btn:hover { background: #fee2e2; border-color: #fca5a5; }

  @keyframes slideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
  .page-anim { animation: slideIn 0.25s ease-out; }

  .dl-nav-section { font-size: 10.5px; font-weight: 700; color: #94a3b8; letter-spacing: 1.2px; padding: 10px 12px 6px; text-transform: uppercase; }
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
      { icon: '🔔', duration: 5000, style: { borderRadius: '12px', border: '1px solid #e2e8f0' } }
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
      axios.get('/notifications').then(r => setUnreadCount(r.data.unreadCount || 0)).catch(() => {});
    };
    fetchNotifCount();
    const interval = setInterval(fetchNotifCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Cairo, sans-serif' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: sidebarOpen ? '256px' : '68px',
          background: 'white',
          borderLeft: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0,
          position: 'sticky', top: 0, height: '100vh',
          overflowX: 'hidden',
          boxShadow: '2px 0 12px rgba(0,0,0,0.05)',
          zIndex: 20,
        }}>

          {/* Logo area */}
          <div style={{
            padding: '16px 14px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: '10px',
            minHeight: '68px',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '11px',
              background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}>
              <img src="/logo-transparent.png" alt="شعار العيادة" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            </div>

            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '14px', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  د. وسام يوسف
                </div>
                <div style={{ color: '#2563eb', fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>
                  أخصائي تقويم الأسنان
                </div>
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                marginRight: 'auto', background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px', color: '#64748b',
                fontSize: '15px', cursor: 'pointer',
                width: '30px', height: '30px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s', flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#2563eb'; e.currentTarget.style.borderColor = '#bfdbfe'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              {sidebarOpen ? <FiChevronLeft size={15} /> : <FiMenu size={15} />}
            </button>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
            {sidebarOpen && <div className="dl-nav-section">القائمة الرئيسية</div>}

            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `dl-sidebar-link${isActive ? ' active' : ''}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span style={{ flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                  {item.notif && unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '-6px', left: '-6px',
                      background: '#ef4444', color: 'white',
                      borderRadius: '50%', width: '15px', height: '15px',
                      fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, lineHeight: 1,
                    }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </span>
                {sidebarOpen && (
                  <>
                    <span style={{ flex: 1, fontSize: '13.5px' }}>{item.label}</span>
                    {item.notif && unreadCount > 0 && (
                      <span style={{
                        background: '#ef4444', color: 'white',
                        borderRadius: '20px', padding: '2px 7px',
                        fontSize: '11px', fontWeight: 800,
                      }}>{unreadCount}</span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom user section */}
          <div style={{ padding: '10px 8px 14px', borderTop: '1px solid #f1f5f9' }}>
            {sidebarOpen && (
              <div style={{
                padding: '10px 12px', marginBottom: '8px',
                background: '#f8fafc', borderRadius: '9px',
                border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  padding: '2px',
                  background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                }}>
                  <img
                    src="/dr-wessam.png"
                    alt="د. وسام يوسف"
                    style={{
                      width: '100%', height: '100%',
                      borderRadius: '50%', objectFit: 'cover',
                      objectPosition: 'center top',
                      border: '1.5px solid white', display: 'block',
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1e293b', fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                  <div style={{ color: '#2563eb', fontSize: '11px', marginTop: '1px' }}>🩺 طبيب</div>
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="dl-logout-btn">
              <FiLogOut size={15} style={{ flexShrink: 0 }} />
              {sidebarOpen && 'تسجيل الخروج'}
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

          {/* Top bar */}
          <div style={{
            background: 'white',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 24px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            height: '64px',
            position: 'sticky', top: 0, zIndex: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            {/* Greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
              }} />
              <div>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>مرحباً، {user?.name || 'الدكتور'}</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginRight: '8px' }}>— لوحة تحكم العيادة</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PushNotifBell />

              <NavLink to="/doctor/notifications" style={{ position: 'relative', textDecoration: 'none' }} className="dl-topbar-btn">
                <FiBell size={15} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '4px', right: '10px',
                    background: '#ef4444', color: 'white',
                    borderRadius: '50%', width: '14px', height: '14px',
                    fontSize: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </NavLink>

              <NavLink to="/doctor/settings" className="dl-topbar-btn">
                <FiSettings size={15} /> الإعدادات
              </NavLink>

              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                padding: '2px',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                flexShrink: 0, cursor: 'default',
                boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}>
                <img
                  src="/dr-wessam.png"
                  alt="د. وسام يوسف"
                  style={{
                    width: '100%', height: '100%',
                    borderRadius: '50%', objectFit: 'cover',
                    objectPosition: 'center top',
                    border: '1.5px solid white', display: 'block',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Page content */}
          <main style={{ flex: 1, padding: '24px', overflowX: 'hidden' }} className="page-anim">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
