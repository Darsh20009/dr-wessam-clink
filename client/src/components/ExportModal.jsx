import React, { useState } from 'react';
import { FiX, FiDownload, FiMail, FiShare2, FiCheck } from 'react-icons/fi';
import { exportPatientPDF } from '../utils/exportPDF';
import toast from 'react-hot-toast';

export default function ExportModal({ patient, sessions = [], ttt = {}, siteInfo = {}, onClose }) {
  const [step, setStep] = useState(1);
  const [dest, setDest] = useState({ download: true, whatsapp: false, email: false });
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [opts, setOpts] = useState({
    includeTTT: true,
    includePhotos: true,
    includeSessions: true,
    includeFinancials: false,
    sessionId: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const toggleDest = (k) => setDest(d => ({ ...d, [k]: !d[k] }));
  const toggleOpt = (k) => setOpts(o => ({ ...o, [k]: !o[k] }));

  const handleExport = async () => {
    if (!dest.download && !dest.whatsapp && !dest.email) {
      return toast.error('اختر وجهة التصدير على الأقل');
    }
    setLoading(true);
    try {
      await exportPatientPDF({ patient, sessions, ttt, siteInfo, opts });

      if (dest.whatsapp && phone) {
        const clean = phone.replace(/\D/g, '');
        const msg = encodeURIComponent(`ملف المريض: ${patient.fullName}\nمن عيادة د. وسام يوسف`);
        setTimeout(() => window.open(`https://wa.me/${clean}?text=${msg}`, '_blank'), 1500);
      }
      if (dest.email && email) {
        const subject = encodeURIComponent(`ملف المريض — ${patient.fullName}`);
        const body = encodeURIComponent(`مرفق ملف المريض ${patient.fullName}\nمن عيادة د. وسام يوسف\n\nيرجى إرفاق ملف PDF الذي تم تحميله.`);
        setTimeout(() => window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank'), 1800);
      }

      setDone(true);
    } catch (e) {
      toast.error('خطأ في التصدير');
    }
    setLoading(false);
  };

  const Card = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '14px 10px', border: `2px solid ${active ? '#2563eb' : '#e2e8f0'}`,
      borderRadius: 12, background: active ? '#eff6ff' : 'white', cursor: 'pointer',
      fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, color: active ? '#2563eb' : '#64748b',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      {label}
      {active && <FiCheck size={13} color="#2563eb"/>}
    </button>
  );

  const Checkbox = ({ checked, label, onChange }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${checked ? '#bfdbfe' : '#e2e8f0'}`, background: checked ? '#f0f9ff' : '#f8fafc', marginBottom: 8, userSelect: 'none' }}>
      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked ? '#2563eb' : '#cbd5e1'}`, background: checked ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
        {checked && <FiCheck size={12} color="white" strokeWidth={3}/>}
      </div>
      <span style={{ fontWeight: 600, fontSize: 13, color: checked ? '#1e3a8a' : '#475569' }}>{label}</span>
    </label>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, direction: 'rtl' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: 17, color: '#0f172a', margin: 0 }}>📤 تصدير ملف المريض</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>{patient.fullName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22 }}><FiX/></button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '30px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h3 style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>تم فتح ملف PDF</h3>
            <p style={{ color: '#64748b', fontSize: 13, marginTop: 8, lineHeight: 1.7 }}>
              اضغط "طباعة / حفظ PDF" في النافذة التي فُتحت.<br/>
              {dest.whatsapp && 'ستُفتح واتساب بعد ثانية لإرسال الرسالة.'}
              {dest.email && 'ستُفتح نافذة البريد للإرسال.'}
            </p>
            <button onClick={onClose} style={{ marginTop: 20, padding: '10px 28px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>إغلاق</button>
          </div>
        ) : (
          <>
            {/* Step 1: Destination */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', marginBottom: 10 }}>1. وجهة التصدير</div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Card icon="📥" label="تحميل PDF" active={dest.download} onClick={() => toggleDest('download')}/>
                <Card icon="💬" label="واتساب" active={dest.whatsapp} onClick={() => toggleDest('whatsapp')}/>
                <Card icon="📧" label="بريد إلكتروني" active={dest.email} onClick={() => toggleDest('email')}/>
              </div>
            </div>

            {dest.whatsapp && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <label style={{ fontWeight: 700, fontSize: 12, color: '#166534', display: 'block', marginBottom: 6 }}>رقم واتساب (مع كود الدولة)</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+20 115 679 8324" dir="ltr"
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif', outline: 'none' }} />
              </div>
            )}

            {dest.email && (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <label style={{ fontWeight: 700, fontSize: 12, color: '#1e40af', display: 'block', marginBottom: 6 }}>البريد الإلكتروني</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@example.com" dir="ltr"
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #bfdbfe', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif', outline: 'none' }} />
              </div>
            )}

            {/* Step 2: Content */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', marginBottom: 10 }}>2. المحتوى المراد تصديره</div>
              <Checkbox checked={opts.includeTTT} label="📋 الملف الطبي التفصيلي (TTT File)" onChange={() => toggleOpt('includeTTT')}/>
              <Checkbox checked={opts.includePhotos} label="📸 الصور الخارجية والداخلية والأشعة" onChange={() => toggleOpt('includePhotos')}/>
              <Checkbox checked={opts.includeSessions} label="🗂️ جلسات المتابعة" onChange={() => toggleOpt('includeSessions')}/>
              <Checkbox checked={opts.includeFinancials} label="💰 البيانات المالية" onChange={() => toggleOpt('includeFinancials')}/>

              {opts.includeSessions && sessions.length > 0 && (
                <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', marginTop: 6 }}>
                  <label style={{ fontWeight: 700, fontSize: 12, color: '#92400e', display: 'block', marginBottom: 6 }}>تحديد جلسة معينة (اختياري)</label>
                  <select value={opts.sessionId} onChange={e => setOpts(o => ({ ...o, sessionId: e.target.value }))}
                    style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #fde68a', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif', background: 'white' }}>
                    <option value="">كل الجلسات</option>
                    {sessions.map((s, i) => (
                      <option key={s._id} value={s._id}>جلسة #{s.sessionNumber || i + 1} — {new Date(s.sessionDate).toLocaleDateString('ar')}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button onClick={handleExport} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? '⏳ جاري التصدير...' : <><FiDownload size={17}/> تصدير الآن</>}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
              ستُفتح نافذة المعاينة — اضغط "طباعة" ثم اختر "حفظ بصيغة PDF"
            </p>
          </>
        )}
      </div>
    </div>
  );
}
