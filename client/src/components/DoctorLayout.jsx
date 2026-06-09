import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiHome, FiUsers, FiCalendar, FiDollarSign, FiBarChart2,
  FiMenu, FiLogOut, FiChevronLeft, FiBell, FiCreditCard,
  FiGlobe, FiSettings, FiX, FiActivity, FiAward,
  FiMonitor, FiUserCheck, FiMessageSquare,
} from 'react-icons/fi';
import PushNotifBell from './PushNotifBell';
import { usePushNotifications } from '../hooks/usePushNotifications';
import OnboardingTour from './OnboardingTour';

const navItems = [
  { to: '/doctor', icon: <FiHome size={17} />, label: 'لوحة التحكم', end: true },
  { to: '/doctor/patients', icon: <FiUsers size={17} />, label: 'المرضى' },
  { to: '/doctor/appointments', icon: <FiCalendar size={17} />, label: 'المواعيد' },
  { to: '/doctor/payments', icon: <FiDollarSign size={17} />, label: 'المدفوعات' },
  { to: '/doctor/payment-requests', icon: <FiCreditCard size={17} />, label: 'طلبات InstaPay', notif: true },
  { to: '/doctor/wallet', icon: <FiCreditCard size={17} />, label: 'المحفظة' },
  { to: '/doctor/reports', icon: <FiBarChart2 size={17} />, label: 'التقارير' },
  { to: '/doctor/reception', icon: <FiMonitor size={17} />, label: 'الاستقبال' },
  { to: '/doctor/employees', icon: <FiUserCheck size={17} />, label: 'الموظفون' },
  { to: '/doctor/messages', icon: <FiMessageSquare size={17} />, label: 'الرسائل الداخلية' },
  { to: '/doctor/notifications', icon: <FiBell size={17} />, label: 'الإشعارات', notif: true },
  { to: '/doctor/site', icon: <FiGlobe size={17} />, label: 'إدارة الموقع' },
  { to: '/doctor/id-card', icon: <FiAward size={17} />, label: 'بطاقة التوظيف' },
  { to: '/doctor/settings', icon: <FiSettings size={17} />, label: 'الإعدادات' },
];

const bottomTabs = [
  { to: '/doctor', icon: <FiHome size={21} />, label: 'الرئيسية', end: true },
  { to: '/doctor/patients', icon: <FiUsers size={21} />, label: 'المرضى' },
  { to: '/doctor/appointments', icon: <FiCalendar size={21} />, label: 'المواعيد' },
  { to: '/doctor/payments', icon: <FiDollarSign size={21} />, label: 'المدفوعات' },
];

const STYLE = `

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

  /* ── MOBILE BACKDROP ── */
  .dl-mobile-backdrop {
    display: none;
    position: fixed; inset: 0; z-index: 299;
    background: rgba(0,0,0,0.52);
    opacity: 0; pointer-events: none;
    transition: opacity 0.3s;
    -webkit-backdrop-filter: blur(2px);
    backdrop-filter: blur(2px);
  }
  .dl-mobile-backdrop.open { opacity: 1; pointer-events: all; }

  /* ── MOBILE DRAWER ── */
  .dl-mobile-drawer {
    display: none;
    position: fixed; right: 0; top: 0; bottom: 0;
    width: 284px; z-index: 300;
    background: white;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
    box-shadow: -4px 0 32px rgba(0,0,0,0.18);
    flex-direction: column;
    overflow: hidden;
    border-left: 1px solid #e2e8f0;
  }
  .dl-mobile-drawer.open { transform: translateX(0); }

  /* ── BOTTOM TAB BAR ── */
  .dl-bottom-tabs {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    background: rgba(255,255,255,0.97);
    border-top: 1px solid #e2e8f0;
    height: 64px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    padding-bottom: env(safe-area-inset-bottom, 0px);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .dl-bottom-tab {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 3px; height: 100%; border: none;
    background: transparent; cursor: pointer;
    color: #94a3b8; font-size: 10px; font-weight: 600;
    font-family: 'Cairo', sans-serif;
    transition: all 0.15s; text-decoration: none;
    padding: 8px 2px; position: relative;
  }
  .dl-bottom-tab.active { color: #2563eb; }
  .dl-bottom-tab.active::after {
    content: ''; position: absolute; top: 0; left: 20%; right: 20%;
    height: 2.5px; background: #2563eb; border-radius: 0 0 3px 3px;
  }
  .dl-bottom-tab-more {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 3px; height: 100%; border: none;
    background: transparent; cursor: pointer;
    color: #94a3b8; font-size: 10px; font-weight: 600;
    font-family: 'Cairo', sans-serif; padding: 8px 2px;
    transition: all 0.15s;
  }
  .dl-bottom-tab-more.menuopen { color: #2563eb; }

  /* ═══ MOBILE ≤768px ═══ */
  @media (max-width: 768px) {
    html, body { overflow-x: hidden !important; max-width: 100vw !important; }

    .dl-sidebar-desktop { display: none !important; }
    .dl-mobile-hamburger { display: flex !important; }
    .dl-bottom-tabs { display: flex !important; }
    .dl-mobile-backdrop { display: block !important; }
    .dl-mobile-drawer { display: flex !important; }

    .dl-topbar-tour { display: none !important; }
    .dl-topbar-settings-btn { display: none !important; }
    .dl-topbar-bell-notif { display: none !important; }
    .dl-greeting-sub { display: none !important; }

    .dl-topbar { padding: 0 12px !important; height: 56px !important; }
    .dl-main-content { padding: 16px 12px 76px !important; }
  }

  @media (min-width: 769px) {
    .dl-mobile-hamburger { display: none !important; }
    .dl-bottom-tabs { display: none !important; }
    .dl-mobile-backdrop { display: none !important; }
    .dl-mobile-drawer { display: none !important; }
  }
`;

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem('onboardingDone');
    if (!done) setShowOnboarding(true);
  }, []);

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
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <style>{STYLE}</style>
      {showOnboarding && <OnboardingTour onFinish={() => setShowOnboarding(false)} />}

      {/* ── MOBILE BACKDROP ── */}
      <div
        className={`dl-mobile-backdrop${mobileMenuOpen ? ' open' : ''}`}
        onClick={closeMobileMenu}
      />

      {/* ── MOBILE DRAWER (slide from right) ── */}
      <div className={`dl-mobile-drawer${mobileMenuOpen ? ' open' : ''}`}>
        {/* Drawer header */}
        <div style={{
          padding: '14px 14px', borderBottom: '1px solid #f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          minHeight: '64px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
              border: '1px solid #e2e8f0', overflow: 'hidden',
            }}>
              <img src="/logo-transparent.png" alt="شعار" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '13.5px', lineHeight: 1.3 }}>د. وسام يوسف</div>
              <div style={{ color: '#2563eb', fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>أخصائي تقويم | بني مزار</div>
            </div>
          </div>
          <button
            onClick={closeMobileMenu}
            style={{
              background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '8px',
              color: '#64748b', width: '34px', height: '34px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
          <div className="dl-nav-section">القائمة الرئيسية</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dl-sidebar-link${isActive ? ' active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span style={{ flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center' }}>
                {item.icon}
                {item.notif && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', left: '-6px',
                    background: '#ef4444', color: 'white', borderRadius: '50%',
                    width: '15px', height: '15px', fontSize: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, lineHeight: 1,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </span>
              <span style={{ flex: 1, fontSize: '13.5px' }}>{item.label}</span>
              {item.notif && unreadCount > 0 && (
                <span style={{
                  background: '#ef4444', color: 'white',
                  borderRadius: '20px', padding: '2px 7px',
                  fontSize: '11px', fontWeight: 800,
                }}>{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Drawer footer */}
        <div style={{ padding: '10px 8px 18px', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{
            padding: '10px 12px', marginBottom: '8px', background: '#f8fafc',
            borderRadius: '9px', border: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', padding: '2px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
            }}>
              <img src="/doctor-photo.png" alt="الدكتور" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '1.5px solid white', display: 'block' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#1e293b', fontWeight: 700, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: '#2563eb', fontSize: '11px', marginTop: '1px' }}>🩺 طبيب</div>
            </div>
          </div>
          <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="dl-logout-btn">
            <FiLogOut size={15} style={{ flexShrink: 0 }} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Cairo, sans-serif' }}>

        {/* ── SIDEBAR (desktop only) ── */}
        <aside className="dl-sidebar-desktop" style={{
          width: sidebarOpen ? '256px' : '68px',
          background: 'white', borderLeft: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column',
          transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1)',
          flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
          overflowX: 'hidden', boxShadow: '2px 0 12px rgba(0,0,0,0.05)', zIndex: 20,
        }}>

          {/* Logo area */}
          <div style={{
            padding: '16px 14px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: '10px', minHeight: '68px',
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '11px', background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
              border: '1px solid #e2e8f0', overflow: 'hidden',
            }}>
              <img src="/logo-transparent.png" alt="شعار العيادة" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            </div>

            {sidebarOpen && (
              <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '14px', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  د. وسام يوسف
                </div>
                <div style={{ color: '#2563eb', fontSize: '11px', fontWeight: 600, marginTop: '2px' }}>
                  أخصائي تقويم الأسنان | بني مزار
                </div>
              </div>
            )}

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                marginRight: 'auto', background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: '8px', color: '#64748b', cursor: 'pointer',
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
                      background: '#ef4444', color: 'white', borderRadius: '50%',
                      width: '15px', height: '15px', fontSize: '9px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                padding: '10px 12px', marginBottom: '8px', background: '#f8fafc',
                borderRadius: '9px', border: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', padding: '2px',
                  background: 'linear-gradient(135deg, #2563eb, #06b6d4)', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
                }}>
                  <img src="/doctor-photo.png" alt="د. وسام يوسف" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '1.5px solid white', display: 'block' }} />
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

        {/* ── MAIN CONTENT AREA ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

          {/* Top bar */}
          <div className="dl-topbar" style={{
            background: 'white', borderBottom: '1px solid #e2e8f0',
            padding: '0 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', height: '64px',
            position: 'sticky', top: 0, zIndex: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
          }}>
            {/* Mobile hamburger */}
            <button
              className="dl-mobile-hamburger"
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                borderRadius: '9px', color: '#475569',
                width: '40px', height: '40px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0, marginLeft: '10px',
              }}
            >
              <FiMenu size={18} />
            </button>

            {/* Greeting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 0 3px rgba(16,185,129,0.2)', flexShrink: 0,
              }} />
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', whiteSpace: 'nowrap' }}>
                  مرحباً، {user?.name || 'الدكتور'}
                </span>
                <span className="dl-greeting-sub" style={{ fontSize: '12px', color: '#94a3b8', marginRight: '8px' }}>
                  — لوحة تحكم العيادة
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                className="dl-topbar-btn dl-topbar-tour"
                onClick={() => { localStorage.removeItem('onboardingDone'); setShowOnboarding(true); }}
                title="جولة تعريفية"
                style={{ gap: 5, fontSize: 13, color: '#7c3aed', border: '1.5px solid #ede9fe', background: '#faf5ff' }}
              >
                🗺️ الجولة
              </button>

              <PushNotifBell />

              <NavLink
                to="/doctor/notifications"
                className="dl-topbar-btn dl-topbar-bell-notif"
                style={{ position: 'relative', textDecoration: 'none' }}
              >
                <FiBell size={15} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '4px', right: '10px',
                    background: '#ef4444', color: 'white', borderRadius: '50%',
                    width: '14px', height: '14px', fontSize: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </NavLink>

              <NavLink to="/doctor/settings" className="dl-topbar-btn dl-topbar-settings-btn">
                <FiSettings size={15} /> الإعدادات
              </NavLink>

              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', padding: '2px',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                flexShrink: 0, boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
              }}>
                <img src="/doctor-photo.png" alt="د. وسام يوسف" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center top', border: '1.5px solid white', display: 'block' }} />
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="dl-main-content page-anim" style={{ flex: 1, padding: '24px', overflowX: 'hidden' }}>
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── BOTTOM TAB BAR (mobile only) ── */}
      <div className="dl-bottom-tabs">
        {bottomTabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) => `dl-bottom-tab${isActive ? ' active' : ''}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </NavLink>
        ))}
        <button
          className={`dl-bottom-tab-more${mobileMenuOpen ? ' menuopen' : ''}`}
          onClick={() => setMobileMenuOpen(true)}
        >
          <FiMenu size={21} />
          <span>القائمة</span>
        </button>
      </div>
    </>
  );
}
