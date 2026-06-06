import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  FiLogOut, FiCalendar, FiDollarSign, FiFileText, FiImage,
  FiUser, FiActivity, FiClock, FiCheck, FiAlertCircle, FiPhone,
  FiMapPin, FiChevronLeft, FiAward, FiStar, FiZap
} from 'react-icons/fi';
import { FaWhatsapp, FaTooth } from 'react-icons/fa';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
  .pp-root { font-family: 'Cairo', sans-serif; direction: rtl; background: #f0f6ff; min-height: 100vh; -webkit-font-smoothing: antialiased; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  @keyframes shimmer { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }

  .pp-tab { padding: 10px 16px; border: none; border-radius: 9px; background: transparent; font-weight: 700; font-size: 13.5px; cursor: pointer; font-family: 'Cairo', sans-serif; color: #64748b; transition: all 0.2s; display: flex; align-items: center; gap: 7px; white-space: nowrap; }
  .pp-tab.active { background: white; color: #2563eb; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .pp-tab:hover:not(.active) { background: rgba(255,255,255,0.6); color: #334155; }

  .pp-card { background: white; border-radius: 14px; padding: 20px; border: 1.5px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .pp-card-hover { transition: all 0.2s; }
  .pp-card-hover:hover { border-color: #bfdbfe; box-shadow: 0 6px 20px rgba(37,99,235,0.08); }

  .pp-session-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; overflow: hidden; margin-bottom: 12px; transition: all 0.2s; }
  .pp-session-card:hover { border-color: #bfdbfe; box-shadow: 0 6px 20px rgba(37,99,235,0.08); }
  .pp-session-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; cursor: pointer; background: #fafbff; }

  .pp-payment-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #f8fafc; transition: background 0.15s; }
  .pp-payment-row:last-child { border-bottom: none; }
  .pp-payment-row:hover { background: #fafbff; }

  .pp-stat { background: white; border-radius: 14px; padding: 18px 16px; border: 1.5px solid #e2e8f0; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s; position: relative; overflow: hidden; }
  .pp-stat::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: var(--stat-color, #2563eb); }
  .pp-stat:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.07); }

  .pp-progress { height: 8px; background: #e2e8f0; border-radius: 100px; overflow: hidden; margin-top: 8px; }
  .pp-progress-bar { height: 100%; border-radius: 100px; transition: width 1s ease; }

  .pp-wa-btn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #25d366, #128c7e); color: white; padding: 11px 20px; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 14px rgba(37,211,102,0.3); }
  .pp-wa-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37,211,102,0.4); }
`;

const statusConfig = {
  paid: { cls: 'badge-success', label: 'مدفوع بالكامل', icon: '✅', color: '#16a34a', bg: '#f0fdf4' },
  partial: { cls: 'badge-warning', label: 'مدفوع جزئياً', icon: '⚡', color: '#d97706', bg: '#fffbeb' },
  overdue: { cls: 'badge-danger', label: 'متأخر', icon: '⚠️', color: '#dc2626', bg: '#fff5f5' },
  pending: { cls: 'badge-gray', label: 'معلق', icon: '⏳', color: '#64748b', bg: '#f8fafc' },
};

export default function PatientPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [openSession, setOpenSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.patientId) return;
    Promise.all([
      axios.get(`/patients/${user.patientId}`),
      axios.get('/appointments'),
      axios.get('/sessions'),
      axios.get('/payments').catch(() => ({ data: [] })),
    ]).then(([pRes, aRes, sRes, payRes]) => {
      setPatient(pRes.data);
      setAppointments((aRes.data || []).filter(a => a.status !== 'cancelled'));
      setSessions(sRes.data || []);
      const allPay = Array.isArray(payRes.data) ? payRes.data : payRes.data?.payments || [];
      setPayments(allPay.filter(p => p.patientId?._id === user.patientId || p.patientId === user.patientId));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f6ff', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '52px', height: '52px', border: '4px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: '#64748b', fontFamily: 'Cairo, sans-serif', fontWeight: 600 }}>جاري تحميل ملفك...</div>
    </div>
  );

  if (!patient) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', fontFamily: 'Cairo, sans-serif', background: '#f0f6ff' }}>
      <div style={{ fontSize: '56px' }}>🔍</div>
      <h2 style={{ color: '#0f172a', fontWeight: 800 }}>لا يوجد ملف طبي مرتبط بحسابك</h2>
      <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', maxWidth: '400px', lineHeight: 1.7 }}>تواصل مع الدكتور للتأكد من تسجيل بياناتك الصحيحة في النظام.</p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <a href="https://wa.me/201156798324" target="_blank" rel="noreferrer" className="pp-wa-btn" style={{ fontFamily: 'Cairo, sans-serif' }}>
          <FaWhatsapp size={16} /> تواصل مع الدكتور
        </a>
        <button onClick={handleLogout} style={{ background: 'white', border: '1.5px solid #e2e8f0', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, color: '#475569' }}>تسجيل الخروج</button>
      </div>
    </div>
  );

  const fs = patient.financials || {};
  const totalCost = fs.totalCost || 0;
  const totalPaid = fs.totalPaid || 0;
  const remaining = fs.remaining || Math.max(0, totalCost - totalPaid);
  const payPercent = totalCost > 0 ? Math.min(100, Math.round((totalPaid / totalCost) * 100)) : 0;
  const status = statusConfig[fs.status] || statusConfig.pending;
  const upcomingApts = appointments.filter(a => a.status === 'scheduled' && new Date(a.date) >= new Date());
  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: <FiActivity size={15} /> },
    { id: 'appointments', label: 'مواعيدي', icon: <FiCalendar size={15} /> },
    { id: 'sessions', label: 'الجلسات', icon: <FiZap size={15} /> },
    { id: 'file', label: 'ملفي الطبي', icon: <FiFileText size={15} /> },
    { id: 'images', label: 'الصور والأشعة', icon: <FiImage size={15} /> },
    { id: 'financial', label: 'حسابي', icon: <FiDollarSign size={15} /> },
  ];

  return (
    <>
      <style>{STYLE}</style>
      <div className="pp-root">

        {/* ── HEADER ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0891b2 100%)',
          padding: '0 6% 0',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* BG shapes */}
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-100px', left: '10%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: '-60px', right: '15%', pointerEvents: 'none' }} />

          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <img src="/logo.png" alt="شعار العيادة" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '14px' }}>بوابة المريض</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>عيادة د. وسام يوسف</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a href="https://wa.me/201156798324" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(37,211,102,0.2)', border: '1px solid rgba(37,211,102,0.4)', color: '#4ade80', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
                <FaWhatsapp size={14} /> تواصل
              </a>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', transition: 'all 0.2s' }}>
                <FiLogOut size={13} /> خروج
              </button>
            </div>
          </div>

          {/* Patient info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px 0 28px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              border: '3px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 900, fontSize: '26px', flexShrink: 0,
              backdropFilter: 'blur(8px)',
            }}>
              {patient.fullName?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>مرحباً بك،</div>
              <h1 style={{ color: 'white', fontSize: '24px', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.3px' }}>{patient.fullName}</h1>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {patient.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                    <FiPhone size={12} /> {patient.phone}
                  </div>
                )}
                {patient.age && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                    <FiUser size={12} /> {patient.age} سنة
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ background: status.bg, color: status.color, padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                    {status.icon} {status.label}
                  </span>
                </div>
              </div>
            </div>
            {/* Quick stats */}
            <div style={{ display: 'flex', gap: '12px', flexShrink: 0 }}>
              {[
                { val: upcomingApts.length, label: 'موعد قادم', icon: '📅', c: '#dbeafe', t: '#1d4ed8' },
                { val: sessions.length, label: 'جلسة علاج', icon: '💉', c: '#d1fae5', t: '#065f46' },
                { val: `${payPercent}%`, label: 'نسبة السداد', icon: '💰', c: '#fef3c7', t: '#92400e' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.18)', minWidth: '76px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
                  <div style={{ color: 'white', fontWeight: 900, fontSize: '18px', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', marginTop: '3px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '2px', overflowX: 'auto', paddingBottom: '1px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`pp-tab${activeTab === t.id ? ' active' : ''}`} style={{ color: activeTab === t.id ? '#2563eb' : 'rgba(255,255,255,0.7)' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px', animation: 'fadeUp 0.3s ease-out' }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {[
                  { val: `${totalPaid.toLocaleString()} ج.م`, label: 'إجمالي المدفوع', icon: '💳', color: '#16a34a', style: '--stat-color: #16a34a' },
                  { val: `${remaining.toLocaleString()} ج.م`, label: 'المتبقي', icon: remaining > 0 ? '⚠️' : '✅', color: remaining > 0 ? '#dc2626' : '#16a34a', style: `--stat-color: ${remaining > 0 ? '#dc2626' : '#16a34a'}` },
                  { val: upcomingApts.length, label: 'مواعيد قادمة', icon: '📅', color: '#2563eb', style: '--stat-color: #2563eb' },
                  { val: sessions.length, label: 'جلسات مكتملة', icon: '🏥', color: '#7c3aed', style: '--stat-color: #7c3aed' },
                ].map((s, i) => (
                  <div key={i} className="pp-stat" style={{ style: s.style, '--stat-color': s.color.replace('#', '') }}>
                    <div style={{ fontSize: '26px' }}>{s.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: '22px', color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Payment progress */}
                <div className="pp-card">
                  <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💰</span> الوضع المالي
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>نسبة السداد</span>
                    <span style={{ fontWeight: 800, color: payPercent === 100 ? '#16a34a' : '#f59e0b', fontSize: '15px' }}>{payPercent}%</span>
                  </div>
                  <div className="pp-progress">
                    <div className="pp-progress-bar" style={{ width: `${payPercent}%`, background: payPercent === 100 ? '#22c55e' : 'linear-gradient(90deg, #2563eb, #06b6d4)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '16px' }}>{totalPaid.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>مدفوع (ج.م)</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: '#64748b', fontSize: '16px' }}>{totalCost.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>الإجمالي (ج.م)</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: remaining > 0 ? '#dc2626' : '#16a34a', fontSize: '16px' }}>{remaining.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>المتبقي (ج.م)</div>
                    </div>
                  </div>
                  {remaining > 0 && (
                    <a href="https://wa.me/201156798324?text=مرحباً دكتور، أريد سداد قسط من حسابي" target="_blank" rel="noreferrer" className="pp-wa-btn" style={{ fontFamily: 'Cairo, sans-serif', marginTop: '14px', justifyContent: 'center', display: 'flex' }}>
                      <FaWhatsapp size={15} /> التواصل لسداد القسط
                    </a>
                  )}
                </div>

                {/* Next appointment */}
                <div className="pp-card" style={{ position: 'relative', overflow: 'hidden' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📅</span> موعدك القادم
                  </h3>
                  {upcomingApts.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '16px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', borderRadius: '12px', border: '1px solid #bfdbfe', marginBottom: '12px' }}>
                        <div style={{ background: '#2563eb', color: 'white', borderRadius: '12px', padding: '12px 16px', textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: '24px', fontWeight: 900, lineHeight: 1 }}>{format(new Date(upcomingApts[0].date), 'd')}</div>
                          <div style={{ fontSize: '12px', opacity: 0.9 }}>{format(new Date(upcomingApts[0].date), 'MMM', { locale: ar })}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{format(new Date(upcomingApts[0].date), 'EEEE', { locale: ar })}</div>
                          <div style={{ color: '#2563eb', fontSize: '13px', fontWeight: 600 }}>{upcomingApts[0].time || '—'}</div>
                          <div style={{ color: '#64748b', fontSize: '12.5px', marginTop: '2px' }}>{upcomingApts[0].type}</div>
                        </div>
                      </div>
                      {upcomingApts.length > 1 && (
                        <div style={{ fontSize: '12.5px', color: '#64748b', textAlign: 'center' }}>
                          + {upcomingApts.length - 1} مواعيد أخرى قادمة
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', color: '#94a3b8', gap: '10px' }}>
                      <span style={{ fontSize: '36px', opacity: 0.4 }}>📅</span>
                      <p style={{ fontSize: '13.5px', fontWeight: 500 }}>لا توجد مواعيد قادمة</p>
                      <a href="https://wa.me/201156798324?text=مرحباً دكتور، أريد حجز موعد" target="_blank" rel="noreferrer" className="pp-wa-btn" style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px' }}>
                        <FaWhatsapp size={14} /> احجز موعداً
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent session */}
              {sessions.length > 0 && (
                <div className="pp-card">
                  <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>💉</span> آخر جلسة علاجية</span>
                    <button onClick={() => setActiveTab('sessions')} style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      الكل <FiChevronLeft size={13} />
                    </button>
                  </h3>
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>جلسة #{sessions.length}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{format(new Date(sessions[sessions.length - 1].sessionDate), 'd MMMM yyyy', { locale: ar })}</span>
                    </div>
                    {sessions[sessions.length - 1].notes && (
                      <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: 1.7, marginBottom: '10px' }}>{sessions[sessions.length - 1].notes}</p>
                    )}
                    {sessions[sessions.length - 1].nextStep && (
                      <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '10px 12px', border: '1px solid #bfdbfe' }}>
                        <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '12.5px' }}>الخطوة القادمة: </span>
                        <span style={{ color: '#1d4ed8', fontSize: '12.5px' }}>{sessions[sessions.length - 1].nextStep}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href="https://wa.me/201156798324" target="_blank" rel="noreferrer" className="pp-wa-btn" style={{ fontFamily: 'Cairo, sans-serif', flex: 1, justifyContent: 'center' }}>
                  <FaWhatsapp size={16} /> تواصل مع الدكتور
                </a>
                <a href="tel:+201156798324" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#2563eb', padding: '11px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s' }}>
                  <FiPhone size={15} /> اتصل بالعيادة
                </a>
              </div>
            </div>
          )}

          {/* ── APPOINTMENTS ── */}
          {activeTab === 'appointments' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>مواعيدي</h2>
                <a href="https://wa.me/201156798324?text=مرحباً دكتور، أريد حجز موعد" target="_blank" rel="noreferrer" className="pp-wa-btn" style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', padding: '9px 16px' }}>
                  <FaWhatsapp size={14} /> حجز موعد جديد
                </a>
              </div>

              {appointments.length === 0 ? (
                <div className="pp-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px' }}>📅</div>
                  <p style={{ color: '#94a3b8', fontWeight: 600 }}>لا توجد مواعيد مسجلة</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {appointments.sort((a, b) => new Date(b.date) - new Date(a.date)).map((apt, i) => {
                    const isPast = new Date(apt.date) < new Date();
                    const isUpcoming = !isPast && apt.status === 'scheduled';
                    return (
                      <div key={apt._id || i} className="pp-card pp-card-hover" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '56px', height: '56px', borderRadius: '14px',
                          background: isUpcoming ? '#eff6ff' : isPast && apt.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                          color: isUpcoming ? '#2563eb' : isPast && apt.status === 'completed' ? '#16a34a' : '#94a3b8',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, border: `2px solid ${isUpcoming ? '#bfdbfe' : '#e2e8f0'}`,
                        }}>
                          <div style={{ fontSize: '18px', fontWeight: 900, lineHeight: 1 }}>{format(new Date(apt.date), 'd')}</div>
                          <div style={{ fontSize: '10px', fontWeight: 700 }}>{format(new Date(apt.date), 'MMM', { locale: ar })}</div>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a' }}>{apt.type}</div>
                          <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                            {format(new Date(apt.date), 'EEEE d/M/yyyy', { locale: ar })}
                            {apt.time && ` — ${apt.time}`}
                          </div>
                          {apt.notes && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.notes}</div>}
                        </div>
                        <span style={{
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, flexShrink: 0,
                          background: isUpcoming ? '#eff6ff' : apt.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                          color: isUpcoming ? '#2563eb' : apt.status === 'completed' ? '#16a34a' : '#94a3b8',
                        }}>
                          {isUpcoming ? '🔔 قادم' : apt.status === 'completed' ? '✅ مكتمل' : apt.status === 'cancelled' ? '❌ ملغي' : '⏳ مجدول'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── SESSIONS ── */}
          {activeTab === 'sessions' && (
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>جلسات العلاج</h2>
              {sessions.length === 0 ? (
                <div className="pp-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px' }}>💉</div>
                  <p style={{ color: '#94a3b8', fontWeight: 600 }}>لا توجد جلسات مسجلة بعد</p>
                </div>
              ) : (
                sessions.map((s, i) => (
                  <div key={s._id || i} className="pp-session-card">
                    <div className="pp-session-header" onClick={() => setOpenSession(openSession === i ? null : i)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, flexShrink: 0 }}>
                          {sessions.length - i}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>جلسة #{s.sessionNumber || sessions.length - i}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{format(new Date(s.sessionDate), 'd MMMM yyyy', { locale: ar })}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {s.amountPaid > 0 && <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>{s.amountPaid.toLocaleString()} ج.م</span>}
                        <FiChevronLeft size={16} style={{ color: '#94a3b8', transform: openSession === i ? 'rotate(-90deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                      </div>
                    </div>
                    {openSession === i && (
                      <div style={{ padding: '16px 20px', animation: 'fadeUp 0.2s ease-out' }}>
                        {s.notes && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '5px' }}>ملاحظات الجلسة:</div>
                            <p style={{ color: '#334155', lineHeight: 1.8, fontSize: '14px' }}>{s.notes}</p>
                          </div>
                        )}
                        {s.nextStep && (
                          <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '12px 14px', border: '1px solid #bfdbfe', marginBottom: '10px' }}>
                            <div style={{ fontWeight: 700, color: '#2563eb', fontSize: '12.5px', marginBottom: '4px' }}>الخطوة القادمة:</div>
                            <p style={{ color: '#1d4ed8', fontSize: '13.5px', lineHeight: 1.7 }}>{s.nextStep}</p>
                          </div>
                        )}
                        {s.nextAppointment && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#0891b2', fontSize: '13px', fontWeight: 600 }}>
                            <FiCalendar size={13} />
                            موعد المتابعة: {format(new Date(s.nextAppointment), 'd MMMM yyyy', { locale: ar })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── MEDICAL FILE ── */}
          {activeTab === 'file' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a' }}>الملف الطبي</h2>
              <div className="pp-card">
                <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>👤</span> البيانات الشخصية</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  {[
                    ['الاسم الكامل', patient.fullName, '#eff6ff', '#2563eb'],
                    ['رقم الجوال', patient.phone, '#f0fdf4', '#16a34a'],
                    ['العمر', patient.age ? `${patient.age} سنة` : '—', '#fff7ed', '#ea580c'],
                    ['العنوان', patient.address || '—', '#fdf4ff', '#9333ea'],
                    ['تاريخ الميلاد', patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'd/M/yyyy') : '—', '#ecfeff', '#0891b2'],
                    ['تاريخ التسجيل', format(new Date(patient.createdAt || Date.now()), 'd MMMM yyyy', { locale: ar }), '#f8fafc', '#64748b'],
                  ].map(([k, v, bg, c]) => (
                    <div key={k} style={{ padding: '12px 14px', background: bg, borderRadius: '10px', border: `1px solid ${bg === '#eff6ff' ? '#bfdbfe' : '#e2e8f0'}` }}>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', fontWeight: 600, marginBottom: '5px' }}>{k}</div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: c }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              {patient.diagnosis && (
                <div className="pp-card">
                  <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🔍</span> التشخيص</h3>
                  <p style={{ color: '#475569', lineHeight: 1.85, fontSize: '14px', padding: '14px', background: '#f8fafc', borderRadius: '10px' }}>{patient.diagnosis}</p>
                </div>
              )}
              {patient.treatmentPlan && (
                <div className="pp-card">
                  <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🗺️</span> خطة العلاج</h3>
                  <p style={{ color: '#475569', lineHeight: 1.85, fontSize: '14px', padding: '14px', background: '#f8fafc', borderRadius: '10px' }}>{patient.treatmentPlan}</p>
                </div>
              )}
            </div>
          )}

          {/* ── IMAGES ── */}
          {activeTab === 'images' && (
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>الصور والأشعة</h2>
              {patient.faceImages?.length > 0 && (
                <div className="pp-card" style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '14px' }}>🖼️ صور الوجه الخارجية</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                    {patient.faceImages.map((img, i) => (
                      <a key={i} href={img.url} target="_blank" rel="noreferrer" style={{ borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #e2e8f0', display: 'block', transition: 'all 0.2s', textDecoration: 'none' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                      >
                        <img src={img.url} alt={img.type} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600, textAlign: 'center', background: '#f8fafc' }}>{img.type}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {patient.xrays?.length > 0 && (
                <div className="pp-card">
                  <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '14px' }}>🩻 الأشعة</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                    {patient.xrays.map((x, i) => (
                      <a key={i} href={x.url} target="_blank" rel="noreferrer" style={{ borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #e2e8f0', display: 'block', textDecoration: 'none', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
                      >
                        <img src={x.url} alt={x.type} style={{ width: '100%', height: '140px', objectFit: 'cover', background: '#1e293b', display: 'block' }} />
                        <div style={{ padding: '10px' }}>
                          <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                            {x.type === 'panorama' ? '🦷 بانوراما' : x.type === 'lateral' ? '🦴 جانبية' : '📡 CBCT'}
                          </div>
                          {x.description && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>{x.description}</div>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {!patient.faceImages?.length && !patient.xrays?.length && (
                <div className="pp-card" style={{ textAlign: 'center', padding: '48px' }}>
                  <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '12px' }}>🖼️</div>
                  <p style={{ color: '#94a3b8', fontWeight: 600 }}>لا توجد صور أو أشعة بعد</p>
                </div>
              )}
            </div>
          )}

          {/* ── FINANCIAL ── */}
          {activeTab === 'financial' && (
            <div>
              <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', marginBottom: '20px' }}>حسابي المالي</h2>

              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {[
                  { icon: '💰', label: 'إجمالي التكلفة', val: `${totalCost.toLocaleString()} ج.م`, color: '#334155', bg: '#f8fafc', border: '#e2e8f0' },
                  { icon: '✅', label: 'المدفوع', val: `${totalPaid.toLocaleString()} ج.م`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                  { icon: remaining > 0 ? '⚠️' : '🎉', label: 'المتبقي', val: remaining > 0 ? `${remaining.toLocaleString()} ج.م` : 'مكتمل ✓', color: remaining > 0 ? '#dc2626' : '#16a34a', bg: remaining > 0 ? '#fff5f5' : '#f0fdf4', border: remaining > 0 ? '#fecaca' : '#bbf7d0' },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: '14px', padding: '18px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: '20px', color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="pp-card" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>نسبة إتمام السداد</span>
                  <span style={{ fontWeight: 900, color: payPercent === 100 ? '#16a34a' : '#2563eb', fontSize: '18px' }}>{payPercent}%</span>
                </div>
                <div className="pp-progress">
                  <div className="pp-progress-bar" style={{ width: `${payPercent}%`, background: payPercent === 100 ? '#22c55e' : 'linear-gradient(90deg, #2563eb, #06b6d4)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#94a3b8' }}>
                  <span>0</span>
                  <span style={{ color: status.color, fontWeight: 700 }}>{status.icon} {status.label}</span>
                  <span>{totalCost.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Payment history */}
              {payments.length > 0 && (
                <div className="pp-card" style={{ padding: '0', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧾</span> سجل الدفعات
                  </div>
                  {payments.map((p, i) => (
                    <div key={p._id || i} className="pp-payment-row">
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>💳</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>دفعة #{i + 1}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                          {p.date ? format(new Date(p.date), 'd/M/yyyy', { locale: ar }) : '—'}
                          {p.method && ` · ${p.method}`}
                        </div>
                      </div>
                      <div style={{ fontWeight: 900, color: '#16a34a', fontSize: '16px' }}>{(p.amount || 0).toLocaleString()} ج.م</div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              {remaining > 0 && (
                <a href="https://wa.me/201156798324?text=مرحباً دكتور، أريد الاستفسار عن حسابي وسداد القسط المتبقي" target="_blank" rel="noreferrer" className="pp-wa-btn" style={{ fontFamily: 'Cairo, sans-serif', marginTop: '16px', justifyContent: 'center', display: 'flex' }}>
                  <FaWhatsapp size={16} /> تواصل لسداد المبلغ المتبقي ({remaining.toLocaleString()} ج.م)
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
