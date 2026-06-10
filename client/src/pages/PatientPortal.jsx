import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  FiLogOut, FiCalendar, FiDollarSign, FiFileText, FiImage,
  FiUser, FiActivity, FiClock, FiCheck, FiAlertCircle, FiPhone,
  FiMapPin, FiChevronLeft, FiAward, FiStar, FiZap, FiUpload, FiEye, FiRefreshCw,
  FiMessageSquare as FiMessageCircle, FiSend, FiDownload,
} from 'react-icons/fi';
import { FaWhatsapp, FaTooth } from 'react-icons/fa';
import { generateICS, googleCalendarUrl } from '../utils/addToCalendar';
import { exportPatientPDF } from '../utils/exportPDF';
import { htmlToPdfBlob } from '../utils/pdfScreenshot';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
  html, body { overflow-x: hidden !important; max-width: 100vw !important; }
  .pp-root { font-family: 'Cairo', sans-serif; direction: rtl; background: #f0f6ff; min-height: 100vh; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes slideIn   { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes shimmer   { 0%{background-position:-200px 0} 100%{background-position:calc(200px + 100%) 0} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes glowPulse { 0%,100%{box-shadow:0 0 20px rgba(37,99,235,0.3)} 50%{box-shadow:0 0 40px rgba(37,99,235,0.6)} }

  /* ── Video Hero ── */
  .pp-hero {
    position: relative; overflow: hidden;
    min-height: 340px;
  }
  .pp-hero-video {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; object-position: center 30%;
    pointer-events: none;
  }
  .pp-hero-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      160deg,
      rgba(3,7,18,0.82) 0%,
      rgba(15,23,42,0.72) 40%,
      rgba(30,58,138,0.65) 70%,
      rgba(8,145,178,0.55) 100%
    );
  }
  .pp-hero-content {
    position: relative; z-index: 2;
    padding: 0 6%;
  }

  /* ── Glassmorphism stat pills ── */
  .pp-glass-pill {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 14px;
    padding: 14px 18px;
    text-align: center;
    transition: all 0.25s;
  }
  .pp-glass-pill:hover {
    background: rgba(255,255,255,0.22);
    transform: translateY(-3px);
    border-color: rgba(255,255,255,0.35);
  }

  /* ── Avatar ── */
  .pp-avatar {
    width: 76px; height: 76px; border-radius: 50%;
    background: linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.12));
    border: 3px solid rgba(255,255,255,0.4);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 900; color: white;
    flex-shrink: 0;
    animation: glowPulse 3s ease-in-out infinite;
  }

  /* ── Tabs ── */
  .pp-tab {
    padding: 11px 18px; border: none; border-radius: 0;
    background: transparent; font-weight: 700; font-size: 13.5px;
    cursor: pointer; font-family: 'Cairo', sans-serif;
    color: rgba(255,255,255,0.65); transition: all 0.2s;
    display: flex; align-items: center; gap: 7px;
    white-space: nowrap; position: relative;
    border-bottom: 3px solid transparent;
  }
  .pp-tab.active {
    color: white;
    border-bottom: 3px solid #60a5fa;
    background: rgba(255,255,255,0.06);
  }
  .pp-tab:hover:not(.active) { color: rgba(255,255,255,0.9); background: rgba(255,255,255,0.06); }

  /* ── Cards ── */
  .pp-card { background: white; border-radius: 16px; padding: 20px; border: 1.5px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
  .pp-card-hover { transition: all 0.2s; }
  .pp-card-hover:hover { border-color: #bfdbfe; box-shadow: 0 8px 24px rgba(37,99,235,0.09); transform: translateY(-2px); }

  .pp-session-card { background: white; border-radius: 16px; border: 1.5px solid #e2e8f0; overflow: hidden; margin-bottom: 12px; transition: all 0.2s; }
  .pp-session-card:hover { border-color: #bfdbfe; box-shadow: 0 6px 20px rgba(37,99,235,0.08); }
  .pp-session-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; cursor: pointer; background: #fafbff; }

  .pp-payment-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #f8fafc; transition: background 0.15s; }
  .pp-payment-row:last-child { border-bottom: none; }
  .pp-payment-row:hover { background: #fafbff; }

  .pp-stat {
    background: white; border-radius: 16px; padding: 20px 16px;
    border: 1.5px solid #e2e8f0; display: flex; flex-direction: column;
    gap: 8px; transition: all 0.25s; position: relative; overflow: hidden;
  }
  .pp-stat::before {
    content: ''; position: absolute; top: 0; right: 0; left: 0; height: 3px;
    background: var(--stat-color, #2563eb);
    border-radius: 3px 3px 0 0;
  }
  .pp-stat:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.09); }

  .pp-progress { height: 10px; background: #e2e8f0; border-radius: 100px; overflow: hidden; margin-top: 8px; }
  .pp-progress-bar { height: 100%; border-radius: 100px; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

  .pp-wa-btn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #25d366, #128c7e); color: white; padding: 11px 20px; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none; transition: all 0.2s; box-shadow: 0 4px 14px rgba(37,211,102,0.3); }
  .pp-wa-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(37,211,102,0.45); }

  /* wave separator between hero and content */
  .pp-wave {
    display: block; width: 100%;
    margin-bottom: -2px; line-height: 0;
  }

  /* ═══ MOBILE ≤ 640px ═══ */
  @media (max-width: 640px) {
    .pp-hero { min-height: auto; }
    .pp-hero-content { padding: 0 4% !important; }
    .pp-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }

    /* Patient info row: stack vertically */
    .pp-patient-row { flex-direction: column !important; gap: 14px !important; padding: 20px 0 8px !important; }
    .pp-patient-meta { min-width: 0 !important; }
    .pp-patient-name { font-size: 20px !important; }

    /* Glass stat pills: 2x2 grid */
    .pp-pills-row { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; width: 100% !important; }
    .pp-glass-pill { min-width: 0 !important; padding: 10px 8px !important; }
    .pp-glass-pill > div:nth-child(1) { font-size: 18px !important; margin-bottom: 3px !important; }
    .pp-glass-pill > div:nth-child(2) { font-size: 15px !important; }
    .pp-glass-pill > div:nth-child(3) { font-size: 10px !important; }

    .pp-avatar { width: 60px !important; height: 60px !important; font-size: 22px !important; }

    .pp-tab { padding: 9px 10px !important; font-size: 12px !important; gap: 4px !important; }

    .pp-card { padding: 14px !important; }
    .pp-session-header { padding: 12px 14px !important; }
    .pp-wa-btn { padding: 10px 14px !important; font-size: 13px !important; }

    .pp-grid-2 { grid-template-columns: 1fr !important; gap: 12px !important; }
  }

  @media (max-width: 400px) {
    .pp-hero-content { padding: 0 3% !important; }
    .pp-tab { padding: 8px 8px !important; font-size: 11.5px !important; }
  }
`;

const statusConfig = {
  paid: { cls: 'badge-success', label: 'مدفوع بالكامل', icon: <FiCheck size={13}/>, color: '#16a34a', bg: '#f0fdf4' },
  partial: { cls: 'badge-warning', label: 'مدفوع جزئياً', icon: <FiZap size={13}/>, color: '#d97706', bg: '#fffbeb' },
  overdue: { cls: 'badge-danger', label: 'متأخر', icon: <FiAlertCircle size={13}/>, color: '#dc2626', bg: '#fff5f5' },
  pending: { cls: 'badge-gray', label: 'معلق', icon: <FiClock size={13}/>, color: '#64748b', bg: '#f8fafc' },
};

const PR_STATUS = {
  pending:              { label: 'في الانتظار',          icon: '⏳', color: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  approved:             { label: 'تم التأكيد',            icon: '✅', color: '#065f46', bg: '#d1fae5', border: '#a7f3d0' },
  rejected:             { label: 'مرفوض',                 icon: '❌', color: '#991b1b', bg: '#fee2e2', border: '#fecaca' },
  'reupload-requested': { label: 'إعادة رفع مطلوبة',     icon: '🔄', color: '#5b21b6', bg: '#ede9fe', border: '#ddd6fe' },
};

export default function PatientPortal() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [openSession, setOpenSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [siteInfo, setSiteInfo] = useState(null);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  // Payment request form state
  const [prForm, setPrForm] = useState({ paymentType: 'remaining', customAmount: '', notes: '' });
  const [prReceipt, setPrReceipt] = useState(null);
  const [prReceiptPreview, setPrReceiptPreview] = useState(null);
  const [prSubmitting, setPrSubmitting] = useState(false);
  const [prReuploadId, setPrReuploadId] = useState(null);
  const [imgModal, setImgModal] = useState(null);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [calOpen, setCalOpen] = useState(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('حجم الصورة كبير جداً (الحد الأقصى 5 ميجا)'); return; }
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const { data } = await axios.patch('/auth/avatar', { avatar: ev.target.result });
        updateUser({ avatar: data.avatar });
        toast.success('تم تحديث الصورة الشخصية ✅');
      } catch {
        toast.error('حدث خطأ أثناء رفع الصورة');
      }
      setAvatarUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const loadPaymentRequests = async () => {
    try {
      const { data } = await axios.get('/payment-requests/my');
      setPaymentRequests(data);
    } catch {}
  };

  useEffect(() => {
    if (!user?.patientId) return;
    Promise.all([
      axios.get(`/patients/${user.patientId}`),
      axios.get('/appointments'),
      axios.get('/sessions'),
      axios.get('/payments').catch(() => ({ data: [] })),
      axios.get('/payment-requests/my').catch(() => ({ data: [] })),
      axios.get('/site').catch(() => ({ data: {} })),
    ]).then(([pRes, aRes, sRes, payRes, prRes, siteRes]) => {
      setPatient(pRes.data);
      setAppointments((aRes.data || []).filter(a => a.status !== 'cancelled'));
      setSessions(sRes.data || []);
      const allPay = Array.isArray(payRes.data) ? payRes.data : payRes.data?.payments || [];
      setPayments(allPay.filter(p => p.patientId?._id === user.patientId || p.patientId === user.patientId));
      setPaymentRequests(prRes.data || []);
      setSiteInfo(siteRes.data);
      if (user.patientId) {
        axios.get(`/comments?patientId=${user.patientId}`).then(r => setComments(r.data || [])).catch(() => {});
      }
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleReceiptFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error('حجم الصورة كبير جداً (الحد الأقصى 8 ميجا)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPrReceipt(ev.target.result);
      setPrReceiptPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!prReceipt) { toast.error('يرجى رفع صورة سند التحويل'); return; }
    const fs = patient?.financials || {};
    const remaining = fs.remaining || Math.max(0, (fs.totalCost || 0) - (fs.totalPaid || 0));
    let amount = 0;
    if (prForm.paymentType === 'remaining') amount = remaining;
    else if (prForm.paymentType === 'next-session') amount = 300;
    else amount = parseFloat(prForm.customAmount);
    if (!amount || amount <= 0) { toast.error('يرجى إدخال مبلغ صحيح'); return; }

    setPrSubmitting(true);
    try {
      if (prReuploadId) {
        await axios.patch(`/payment-requests/${prReuploadId}/reupload`, { receiptImage: prReceipt, notes: prForm.notes });
        toast.success('تم إعادة رفع السند بنجاح ✅');
        setPrReuploadId(null);
      } else {
        await axios.post('/payment-requests', { amount, paymentType: prForm.paymentType, receiptImage: prReceipt, notes: prForm.notes });
        toast.success('تم إرسال طلب الدفع! في انتظار تأكيد الدكتور ✅');
      }
      setPrReceipt(null); setPrReceiptPreview(null);
      setPrForm({ paymentType: 'remaining', customAmount: '', notes: '' });
      await loadPaymentRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
    setPrSubmitting(false);
  };

  const handlePdfDownload = async () => {
    if (!patient) return;
    setPdfDownloading(true);
    try {
      const sessions = patient.sessions || [];
      const ttt = patient.tttFile || {};
      const { html } = await exportPatientPDF({ patient, sessions, ttt, siteInfo: siteInfo || {}, opts: {} });
      const blob = await htmlToPdfBlob(html, { filename: `ملف-${patient.fullName}.pdf` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ملف-${patient.fullName}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success('تم تحميل ملفك الطبي PDF ✅');
    } catch (e) {
      console.error(e);
      toast.error('تعذّر تحميل الملف، حاول مجدداً');
    }
    setPdfDownloading(false);
  };

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
    { id: 'comments', label: 'ملاحظات', icon: <FiMessageCircle size={15} /> },
  ];

  return (
    <>
      <style>{STYLE}</style>
      <div className="pp-root">

        {/* ── HERO with video background ── */}
        <div className="pp-hero">
          <video className="pp-hero-video" autoPlay muted loop playsInline preload="metadata">
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
          <div className="pp-hero-overlay" />

          <div className="pp-hero-content">
            {/* ── Top bar ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  <img src="/logo-transparent.png" alt="شعار العيادة" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '14px', letterSpacing: '0.2px' }}>بوابة المريض</div>
                  <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px' }}>عيادة د. وسام يوسف</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <a href="https://wa.me/201156798324" target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(37,211,102,0.18)', border: '1px solid rgba(37,211,102,0.35)', color: '#4ade80', padding: '7px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', backdropFilter: 'blur(8px)' }}>
                  <FaWhatsapp size={14} /> تواصل
                </a>
                <button onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.8)', padding: '7px 14px', borderRadius: '9px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', backdropFilter: 'blur(8px)' }}>
                  <FiLogOut size={13} /> خروج
                </button>
              </div>
            </div>

            {/* ── Patient info row ── */}
            <div className="pp-patient-row" style={{ display: 'flex', alignItems: 'center', gap: '22px', padding: '28px 0 10px', flexWrap: 'wrap' }}>
              {/* Avatar — اضغط لتغيير الصورة */}
              <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
              <div
                className="pp-avatar"
                title="اضغط لتغيير الصورة الشخصية"
                onClick={() => avatarInputRef.current.click()}
                style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative', flexShrink: 0 }}
              >
                {avatarUploading ? (
                  <div style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : user?.avatar ? (
                  <>
                    <img src={user.avatar} alt="صورتك" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                    >
                      <FiUpload size={18} color="white" style={{ opacity: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.style.opacity = '1'}
                      />
                    </div>
                  </>
                ) : (
                  patient.fullName?.[0]
                )}
              </div>

              {/* Name & meta */}
              <div className="pp-patient-meta" style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.4)', display: 'inline-block' }} />
                  مرحباً بك
                </div>
                <h1 className="pp-patient-name" style={{ color: 'white', fontSize: '26px', fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.5px', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                  {patient.fullName}
                </h1>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {patient.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.65)', fontSize: '13px', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FiPhone size={11} /> {patient.phone}
                    </div>
                  )}
                  {patient.age && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.65)', fontSize: '13px', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FiUser size={11} /> {patient.age} سنة
                    </div>
                  )}
                  <span style={{ background: status.bg, color: status.color, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                    {status.icon} {status.label}
                  </span>
                </div>
              </div>

              {/* Glass stat pills */}
              <div className="pp-pills-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { val: upcomingApts.length, label: 'موعد قادم', icon: '📅' },
                  { val: sessions.length,     label: 'جلسة علاج', icon: '🦷' },
                  { val: `${payPercent}%`,    label: 'نسبة السداد', icon: '💰' },
                  { val: remaining > 0 ? `${remaining.toLocaleString()}` : '✓', label: remaining > 0 ? 'متبقي (ج.م)' : 'مكتمل', icon: remaining > 0 ? '⚠️' : '🎉' },
                ].map((s, i) => (
                  <div key={i} className="pp-glass-pill" style={{ minWidth: '80px', animationDelay: `${i * 0.1}s` }}>
                    <div style={{ fontSize: '22px', marginBottom: '6px', lineHeight: 1 }}>{s.icon}</div>
                    <div style={{ color: 'white', fontWeight: 900, fontSize: '18px', lineHeight: 1 }}>{s.val}</div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: '0', overflowX: 'auto', marginTop: '8px', scrollbarWidth: 'none' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`pp-tab${activeTab === t.id ? ' active' : ''}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="pp-wave">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: '40px' }}>
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f0f6ff" />
          </svg>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px', animation: 'fadeUp 0.3s ease-out' }}>

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div>
              {/* Stats row */}
              <div className="pp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {[
                  { val: `${totalPaid.toLocaleString()} ج.م`, label: 'إجمالي المدفوع', icon: <FiDollarSign size={20}/>, color: '#16a34a', style: '--stat-color: #16a34a' },
                  { val: `${remaining.toLocaleString()} ج.م`, label: 'المتبقي', icon: remaining > 0 ? <FiAlertCircle size={20}/> : <FiCheck size={20}/>, color: remaining > 0 ? '#dc2626' : '#16a34a', style: `--stat-color: ${remaining > 0 ? '#dc2626' : '#16a34a'}` },
                  { val: upcomingApts.length, label: 'مواعيد قادمة', icon: <FiCalendar size={20}/>, color: '#2563eb', style: '--stat-color: #2563eb' },
                  { val: sessions.length, label: 'جلسات مكتملة', icon: <FiActivity size={20}/>, color: '#7c3aed', style: '--stat-color: #7c3aed' },
                ].map((s, i) => (
                  <div key={i} className="pp-stat" style={{ style: s.style, '--stat-color': s.color.replace('#', '') }}>
                    <div style={{ color: s.color }}>{s.icon}</div>
                    <div style={{ fontWeight: 900, fontSize: '22px', color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="pp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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
                      <a href={`https://wa.me/${siteInfo?.whatsapp || '201156798324'}?text=${encodeURIComponent(siteInfo?.bookingWhatsappMsg || 'مرحباً دكتور، أريد حجز موعد')}`} target="_blank" rel="noreferrer" className="pp-wa-btn" style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px' }}>
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
                <a href={`https://wa.me/${siteInfo?.whatsapp || '201156798324'}?text=${encodeURIComponent(siteInfo?.bookingWhatsappMsg || 'مرحباً دكتور، أريد حجز موعد')}`} target="_blank" rel="noreferrer" className="pp-wa-btn" style={{ fontFamily: 'Cairo, sans-serif', fontSize: '13px', padding: '9px 16px' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                            background: isUpcoming ? '#eff6ff' : apt.status === 'completed' ? '#f0fdf4' : '#f8fafc',
                            color: isUpcoming ? '#2563eb' : apt.status === 'completed' ? '#16a34a' : '#94a3b8',
                          }}>
                            {isUpcoming ? 'قادم' : apt.status === 'completed' ? 'مكتمل' : apt.status === 'cancelled' ? 'ملغي' : 'مجدول'}
                          </span>
                          {isUpcoming && (
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={() => setCalOpen(calOpen === apt._id ? null : apt._id)}
                                style={{ padding: '5px 9px', borderRadius: '8px', background: '#fff', border: '1px solid #bfdbfe', color: '#2563eb', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <FiCalendar size={12} /> أضف للتقويم
                              </button>
                              {calOpen === apt._id && (
                                <div style={{ position: 'absolute', top: '110%', left: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 20, overflow: 'hidden', minWidth: '170px' }}>
                                  <button onClick={() => { generateICS(apt); setCalOpen(null); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid #f1f5f9', width: '100%', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '12.5px', color: '#0f172a', fontWeight: 600 }}>
                                    📥 تقويم الجهاز
                                  </button>
                                  <a href={googleCalendarUrl(apt)} target="_blank" rel="noreferrer" onClick={() => setCalOpen(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'none', width: '100%', cursor: 'pointer', fontFamily: 'Cairo', fontSize: '12.5px', color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>
                                    🗓 تقويم جوجل
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <h2 style={{ fontWeight: 800, fontSize: '18px', color: '#0f172a', margin: 0 }}>الملف الطبي</h2>
                {patient.visibility?.pdfDownload && (
                  <button onClick={handlePdfDownload} disabled={pdfDownloading}
                    style={{ background: pdfDownloading ? '#94a3b8' : 'linear-gradient(135deg,#1e3a8a,#2563eb)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: 13, cursor: pdfDownloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: pdfDownloading ? 'none' : '0 4px 14px rgba(37,99,235,0.4)', transition: 'all 0.2s' }}>
                    {pdfDownloading ? (
                      <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> جاري التحميل...</>
                    ) : (
                      <><FiDownload size={15}/> تحميل ملفي PDF</>
                    )}
                  </button>
                )}
              </div>
              <div className="pp-card">
                <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>👤</span> البيانات الشخصية</h3>
                <div className="pp-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
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
                  <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '14px' }}>🖼️ Extraoral Examination</h3>
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
                            {x.type === 'panorama' ? 'بانوراما' : x.type === 'lateral' ? 'جانبية' : 'CBCT'}
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
                  { icon: <FiDollarSign size={22}/>, iconColor: '#334155', label: 'إجمالي التكلفة', val: `${totalCost.toLocaleString()} ج.م`, color: '#334155', bg: '#f8fafc', border: '#e2e8f0' },
                  { icon: <FiCheck size={22}/>, iconColor: '#16a34a', label: 'المدفوع', val: `${totalPaid.toLocaleString()} ج.م`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                  { icon: remaining > 0 ? <FiAlertCircle size={22}/> : <FiAward size={22}/>, iconColor: remaining > 0 ? '#dc2626' : '#16a34a', label: 'المتبقي', val: remaining > 0 ? `${remaining.toLocaleString()} ج.م` : 'مكتمل', color: remaining > 0 ? '#dc2626' : '#16a34a', bg: remaining > 0 ? '#fff5f5' : '#f0fdf4', border: remaining > 0 ? '#fecaca' : '#bbf7d0' },
                ].map((s, i) => (
                  <div key={i} style={{ background: s.bg, border: `2px solid ${s.border}`, borderRadius: '14px', padding: '18px 16px', textAlign: 'center' }}>
                    <div style={{ color: s.iconColor, display:'flex', alignItems:'center', justifyContent:'center', marginBottom: '8px' }}>{s.icon}</div>
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

              {/* ── InstaPay payment system ───────────────────── */}
              <div className="pp-card" style={{ marginBottom: '16px', padding: 0, overflow: 'hidden', border: '1.5px solid #fed7aa' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #fff7ed, #fffbeb)', padding: '16px 20px', borderBottom: '1px solid #fed7aa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/instapay.png" alt="InstaPay" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '12px', background: 'white', padding: '4px', border: '1px solid #fed7aa' }} />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '16px', color: '#9a3412' }}>ادفع عبر InstaPay</div>
                      <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 600 }}>تحويل فوري — ارفع السند وانتظر التأكيد</div>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '18px 20px' }}>

                  {/* ── ادفع الآن button ── */}
                  <a
                    href="https://ipn.eg/S/wesam49/instapay/125uYm"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      width: '100%', padding: '14px 20px', borderRadius: '12px', marginBottom: '14px',
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      color: 'white', fontWeight: 900, fontSize: '16px',
                      fontFamily: 'Cairo, sans-serif', textDecoration: 'none',
                      boxShadow: '0 6px 20px rgba(249,115,22,0.4)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <img src="/instapay.png" alt="InstaPay" style={{ width: '28px', height: '28px', objectFit: 'contain', borderRadius: '6px', background: 'white', padding: '2px' }} />
                    ادفع الآن عبر InstaPay
                  </a>

                  {/* ── رسالة بعد التحويل ── */}
                  <div style={{
                    background: '#fef3c7', border: '1.5px solid #fcd34d', borderRadius: '10px',
                    padding: '12px 14px', marginBottom: '16px',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                  }}>
                    <span style={{ fontSize: '18px', flexShrink: 0, marginTop: '1px' }}>📎</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '13px', color: '#92400e', marginBottom: '3px' }}>بعد التحويل</div>
                      <div style={{ fontSize: '12.5px', color: '#78350f', lineHeight: 1.6 }}>
                        يرجى ارفاق السند هنا لتوثيق التحويل وحساب المبلغ
                      </div>
                    </div>
                  </div>

                  {/* Account number */}
                  <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, marginBottom: '3px' }}>رقم الهاتف للتحويل عبر InstaPay</div>
                      <div style={{ fontWeight: 900, fontSize: '19px', color: '#0f172a', direction: 'ltr' }}>{siteInfo?.instapayNumber || '01156798324'}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>د. وسام يوسف — عيادة تقويم الأسنان</div>
                    </div>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(siteInfo?.instapayNumber || '01156798324'); toast.success('تم نسخ الرقم'); }}
                      style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '7px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', color: '#475569', flexShrink: 0 }}>
                      نسخ
                    </button>
                  </div>

                  {/* Payment form */}
                  <form onSubmit={handleSubmitPayment}>
                    {/* Amount type */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#475569', marginBottom: '8px' }}>اختر نوع الدفعة</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { key: 'remaining',     label: 'دفع المبلغ المتبقي كاملاً', sub: `${remaining.toLocaleString()} ج.م`, show: remaining > 0 },
                          { key: 'next-session',  label: 'قيمة الجلسة القادمة',       sub: '~ 300 ج.م',                       show: true },
                          { key: 'custom',        label: 'مبلغ محدد أختاره',          sub: 'أدخل المبلغ بنفسك',               show: true },
                        ].filter(o => o.show).map(opt => (
                          <label key={opt.key} style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px', borderRadius: '10px', cursor: 'pointer',
                            border: `1.5px solid ${prForm.paymentType === opt.key ? '#2563eb' : '#e2e8f0'}`,
                            background: prForm.paymentType === opt.key ? '#eff6ff' : 'white',
                            transition: 'all 0.15s',
                          }}>
                            <input type="radio" name="paymentType" value={opt.key} checked={prForm.paymentType === opt.key}
                              onChange={() => setPrForm(f => ({ ...f, paymentType: opt.key }))}
                              style={{ accentColor: '#2563eb', width: '16px', height: '16px', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{opt.label}</div>
                              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>{opt.sub}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {prForm.paymentType === 'custom' && (
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontWeight: 700, fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px' }}>المبلغ (ج.م)</label>
                        <input
                          type="number" min="1" placeholder="مثال: 500"
                          value={prForm.customAmount}
                          onChange={e => setPrForm(f => ({ ...f, customAmount: e.target.value }))}
                          required={prForm.paymentType === 'custom'}
                          style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontSize: '15px', fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', direction: 'ltr', textAlign: 'right' }}
                        />
                      </div>
                    )}

                    {/* Receipt upload */}
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                        صورة سند التحويل <span style={{ color: '#ef4444' }}>*</span>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleReceiptFile} style={{ display: 'none' }} />
                      {prReceiptPreview ? (
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img src={prReceiptPreview} alt="السند" style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#f8fafc' }} />
                          <button type="button" onClick={() => { setPrReceipt(null); setPrReceiptPreview(null); fileInputRef.current.value = ''; }}
                            style={{ position: 'absolute', top: '6px', left: '6px', background: '#ef4444', border: 'none', color: 'white', width: '26px', height: '26px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileInputRef.current.click()}
                          style={{ width: '100%', padding: '18px', border: '2px dashed #cbd5e1', borderRadius: '10px', background: '#f8fafc', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontFamily: 'Cairo, sans-serif' }}>
                          <FiUpload size={24} color="#94a3b8" />
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>اضغط لرفع صورة السند</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>JPG أو PNG — حد أقصى 8 ميجا</span>
                        </button>
                      )}
                    </div>

                    {/* Notes */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontWeight: 700, fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px' }}>ملاحظة (اختياري)</label>
                      <textarea value={prForm.notes} onChange={e => setPrForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="أي ملاحظة للدكتور..."
                        rows={2}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontFamily: 'Cairo, sans-serif', fontSize: '13px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
                    </div>

                    <button type="submit" disabled={prSubmitting || !prReceipt}
                      style={{ width: '100%', padding: '13px', borderRadius: '11px', border: 'none', background: prReceipt ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#e2e8f0', color: prReceipt ? 'white' : '#94a3b8', fontWeight: 800, fontSize: '15px', fontFamily: 'Cairo, sans-serif', cursor: prReceipt ? 'pointer' : 'not-allowed', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      {prSubmitting ? <><span style={{ width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> جاري الإرسال...</> : <><FiUpload size={16} /> {prReuploadId ? 'إعادة رفع السند' : 'إرسال طلب الدفع'}</>}
                    </button>
                  </form>
                </div>
              </div>

              {/* Payment requests history */}
              {paymentRequests.length > 0 && (
                <div className="pp-card" style={{ marginBottom: '16px', padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 800, fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/instapay.png" alt="InstaPay" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    طلبات الدفع عبر InstaPay
                    <button onClick={loadPaymentRequests} style={{ marginRight: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><FiRefreshCw size={14} /></button>
                  </div>
                  {paymentRequests.map((pr) => {
                    const st = PR_STATUS[pr.status] || PR_STATUS.pending;
                    const needsReupload = pr.status === 'reupload-requested';
                    return (
                      <div key={pr._id} style={{ padding: '14px 20px', borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 900, fontSize: '16px', color: '#2563eb' }}>{pr.amount.toLocaleString()} ج.م</span>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 9px', borderRadius: '20px', fontSize: '11.5px', fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                                {st.icon} {st.label}
                              </span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                              {format(new Date(pr.createdAt), 'd MMM yyyy — HH:mm', { locale: ar })}
                            </div>
                            {pr.doctorNotes && (
                              <div style={{ fontSize: '12.5px', color: '#5b21b6', background: '#f5f3ff', borderRadius: '8px', padding: '6px 10px', border: '1px solid #ddd6fe', marginTop: '6px' }}>
                                💬 {pr.doctorNotes}
                              </div>
                            )}
                            {needsReupload && (
                              <button onClick={() => { setPrReuploadId(pr._id); setPrForm(f => ({ ...f, notes: '' })); setPrReceipt(null); setPrReceiptPreview(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '8px', fontFamily: 'Cairo, sans-serif', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
                                <FiRefreshCw size={12} /> إعادة رفع السند
                              </button>
                            )}
                          </div>
                          {pr.receiptImage && (
                            <button onClick={() => setImgModal(pr.receiptImage)}
                              style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#475569', fontFamily: 'Cairo, sans-serif', flexShrink: 0 }}>
                              <FiEye size={13} /> السند
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

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

          {/* ── Comments Tab ── */}
          {activeTab === 'comments' && (
            <div style={{ padding: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="pp-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', fontWeight: 800, fontSize: '14px', color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiMessageCircle size={16} /> ملاحظات وردود الطبيب
                </div>
                {comments.length === 0 ? (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                    لا توجد ملاحظات بعد
                  </div>
                ) : (
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {comments.map(comment => (
                      <div key={comment._id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: comment.authorRole === 'patient' ? 'rgba(6,182,212,0.3)' : 'rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 13 }}>
                            {comment.authorName?.[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{comment.authorName}</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{format(new Date(comment.createdAt), 'd/M/yyyy', { locale: ar })}</div>
                          </div>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: comment.authorRole === 'patient' ? 'rgba(6,182,212,0.2)' : 'rgba(37,99,235,0.25)', color: comment.authorRole === 'patient' ? '#67e8f9' : '#93c5fd', fontWeight: 700 }}>
                            {comment.authorRole === 'patient' ? 'أنا' : '🩺 الطبيب'}
                          </span>
                        </div>
                        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.88)', margin: 0, lineHeight: 1.7 }}>{comment.text}</p>
                        {(comment.replies || []).map(reply => (
                          <div key={reply._id} style={{ marginTop: 10, marginRight: 12, background: 'rgba(37,99,235,0.15)', borderRadius: 10, padding: '10px 14px', borderRight: '3px solid rgba(96,165,250,0.5)' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#93c5fd', marginBottom: 4 }}>🩺 {reply.authorName}</div>
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pp-card" style={{ padding: '16px 20px' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>💬 أرسل ملاحظة للطبيب</div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!commentText.trim() || !user?.patientId) return;
                  setSavingComment(true);
                  try {
                    const { data } = await axios.post('/comments', { patientId: user.patientId, text: commentText.trim() });
                    setComments(prev => [...prev, { ...data, replies: [] }]);
                    setCommentText('');
                  } catch { toast.error('خطأ في الإرسال'); }
                  setSavingComment(false);
                }} style={{ display: 'flex', gap: 8 }}>
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="اكتب ملاحظتك أو سؤالك هنا..."
                    rows={2}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13, fontFamily: 'Cairo, sans-serif', resize: 'none', outline: 'none' }}
                  />
                  <button type="submit" disabled={savingComment || !commentText.trim()} style={{ background: '#2563eb', border: 'none', borderRadius: 12, color: 'white', padding: '0 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: savingComment || !commentText.trim() ? 0.6 : 1 }}>
                    <FiSend size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt image modal */}
      {imgModal && (
        <div onClick={() => setImgModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out' }}>
          <img src={imgModal} alt="سند التحويل"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()} />
          <button onClick={() => setImgModal(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>×</button>
        </div>
      )}
    </>
  );
}
