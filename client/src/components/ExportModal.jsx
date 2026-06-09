import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiDownload, FiMail, FiCheck, FiPrinter, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { exportPatientPDF } from '../utils/exportPDF';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ExportModal({ patient, sessions = [], ttt = {}, siteInfo = {}, onClose }) {
  const [step, setStep] = useState(1);
  const [dest, setDest] = useState({ download: true, whatsapp: false, email: false });
  const [phone, setPhone] = useState(patient?.phone || '');
  const [email, setEmail] = useState('');
  const [opts, setOpts] = useState({
    includeTTT: true,
    includePhotos: true,
    includeSessions: true,
    includeFinancials: false,
    sessionIds: [],
  });
  const [allSessions, setAllSessions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  const toggleDest = (k) => setDest(d => ({ ...d, [k]: !d[k] }));
  const toggleOpt = (k) => setOpts(o => ({ ...o, [k]: !o[k] }));

  const toggleSessionId = (id) => {
    setOpts(o => {
      const ids = o.sessionIds.includes(id)
        ? o.sessionIds.filter(x => x !== id)
        : [...o.sessionIds, id];
      return { ...o, sessionIds: ids };
    });
  };

  const normalizePhone = (raw) => {
    let cleaned = raw.replace(/\D/g, '');
    if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
    if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = '2' + cleaned;
    if (!cleaned.startsWith('20') && cleaned.length === 11) cleaned = '20' + cleaned;
    return cleaned;
  };

  const handleGenerate = async () => {
    if (!dest.download && !dest.whatsapp && !dest.email) {
      return toast.error('اختر وجهة واحدة على الأقل');
    }
    setLoading(true);
    try {
      const finalOpts = {
        ...opts,
        sessionIds: allSessions ? [] : opts.sessionIds,
      };
      const { blobUrl } = await exportPatientPDF({ patient, sessions, ttt, siteInfo, opts: finalOpts });
      setPdfBlobUrl(blobUrl);
      setStep(2);
    } catch (e) {
      toast.error('خطأ في إنشاء الملف');
    }
    setLoading(false);
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `ملف-${patient.fullName}-${new Date().toLocaleDateString('ar')}.html`;
    a.click();
    toast.success('تم التحميل');
  };

  const handleWhatsapp = () => {
    const cleaned = normalizePhone(phone);
    if (!cleaned || cleaned.length < 10) {
      toast.error('أدخل رقم واتساب صحيح');
      return;
    }
    const msg = encodeURIComponent(
      `السلام عليكم ${patient.fullName} 😊\nتحية من عيادة د. وسام يوسف\nنرفق لكم ملفكم الطبي عبر بوابة المريض.`
    );
    window.open(`https://wa.me/${cleaned}?text=${msg}`, '_blank');
  };

  const handleEmail = () => {
    if (!email) { toast.error('أدخل البريد الإلكتروني'); return; }
    const subject = encodeURIComponent(`ملف المريض — ${patient.fullName}`);
    const body = encodeURIComponent(
      `السلام عليكم ${patient.fullName}\n\nمرفق ملفك الطبي من عيادة د. وسام يوسف\n\nللاستفسار: ${siteInfo?.phone || '+20 115 679 8324'}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const Checkbox = ({ checked, label, onChange, sub }) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: sub ? '7px 10px' : '10px 12px', borderRadius: 10, border: `1.5px solid ${checked ? '#bfdbfe' : '#e2e8f0'}`, background: checked ? '#f0f9ff' : sub ? '#fafafa' : '#f8fafc', marginBottom: 6, userSelect: 'none' }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? '#2563eb' : '#cbd5e1'}`, background: checked ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
        {checked && <FiCheck size={11} color="white" strokeWidth={3}/>}
      </div>
      <span style={{ fontWeight: sub ? 600 : 700, fontSize: sub ? 12 : 13, color: checked ? '#1e3a8a' : '#475569' }}>{label}</span>
    </label>
  );

  const DestCard = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} style={{ flex: 1, padding: '12px 8px', border: `2px solid ${active ? '#2563eb' : '#e2e8f0'}`, borderRadius: 12, background: active ? '#eff6ff' : 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 12, color: active ? '#2563eb' : '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      {label}
      {active && <FiCheck size={12} color="#2563eb"/>}
    </button>
  );

  if (step === 2 && pdfBlobUrl) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 99999, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
        <div style={{ background: '#1e3a8a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiArrowRight size={13}/> رجوع
          </button>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 14, flex: 1 }}>📄 معاينة ملف {patient.fullName}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} style={{ background: '#2563eb', border: 'none', borderRadius: 8, padding: '7px 16px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiPrinter size={14}/> طباعة / PDF
            </button>
            <button onClick={handleDownload} style={{ background: '#10b981', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiDownload size={14}/> تحميل
            </button>
            {dest.whatsapp && (
              <button onClick={handleWhatsapp} style={{ background: '#16a34a', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13 }}>
                💬 واتساب
              </button>
            )}
            {dest.email && (
              <button onClick={handleEmail} style={{ background: '#7c3aed', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13 }}>
                <FiMail size={14}/>
              </button>
            )}
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '7px 10px', color: 'white', cursor: 'pointer' }}>
              <FiX size={16}/>
            </button>
          </div>
        </div>
        <iframe
          ref={iframeRef}
          src={pdfBlobUrl}
          style={{ flex: 1, border: 'none', background: 'white' }}
          title="معاينة الملف"
        />
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, direction: 'rtl' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, padding: 26, width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 900, fontSize: 17, color: '#0f172a', margin: 0 }}>📤 تصدير ملف المريض</h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '3px 0 0' }}>{patient.fullName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20 }}><FiX/></button>
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', marginBottom: 10 }}>1. وجهة التصدير</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <DestCard icon="📄" label="معاينة / PDF" active={dest.download} onClick={() => toggleDest('download')}/>
            <DestCard icon="💬" label="واتساب" active={dest.whatsapp} onClick={() => toggleDest('whatsapp')}/>
            <DestCard icon="📧" label="بريد" active={dest.email} onClick={() => toggleDest('email')}/>
          </div>
        </div>

        {dest.whatsapp && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <label style={{ fontWeight: 700, fontSize: 12, color: '#166534', display: 'block', marginBottom: 5 }}>رقم واتساب المريض</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01156798324 أو +20..." dir="ltr"
              style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #bbf7d0', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4 }}>سيُفتح واتساب برسالة جاهزة للمريض</div>
          </div>
        )}

        {dest.email && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
            <label style={{ fontWeight: 700, fontSize: 12, color: '#1e40af', display: 'block', marginBottom: 5 }}>البريد الإلكتروني</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="patient@example.com" dir="ltr"
              style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #bfdbfe', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', marginBottom: 10 }}>2. محتوى التقرير</div>
          <Checkbox checked={opts.includeTTT} label="📋 الملف الطبي التفصيلي (TTT File)" onChange={() => toggleOpt('includeTTT')}/>
          <Checkbox checked={opts.includePhotos} label="📸 صور الوجه والفم والأشعة" onChange={() => toggleOpt('includePhotos')}/>
          <Checkbox checked={opts.includeFinancials} label="💰 البيانات المالية" onChange={() => toggleOpt('includeFinancials')}/>

          <div style={{ border: `1.5px solid ${opts.includeSessions ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', background: opts.includeSessions ? '#f0f9ff' : '#f8fafc', userSelect: 'none' }} onClick={() => toggleOpt('includeSessions')}>
              <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${opts.includeSessions ? '#2563eb' : '#cbd5e1'}`, background: opts.includeSessions ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {opts.includeSessions && <FiCheck size={11} color="white" strokeWidth={3}/>}
              </div>
              <span style={{ fontWeight: 700, fontSize: 13, color: opts.includeSessions ? '#1e3a8a' : '#475569' }}>🗂️ جلسات المتابعة</span>
            </label>

            {opts.includeSessions && sessions.length > 0 && (
              <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8f0', background: '#fafcff' }}>
                <Checkbox checked={allSessions} label="✅ كل الجلسات" onChange={() => { setAllSessions(true); setOpts(o => ({ ...o, sessionIds: [] })); }} sub/>
                <Checkbox checked={!allSessions} label="🔍 اختيار جلسات محددة" onChange={() => setAllSessions(false)} sub/>

                {!allSessions && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>اختر الجلسات المراد تضمينها:</div>
                    <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[...sessions].sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate)).map((s, i) => {
                        const checked = opts.sessionIds.includes(s._id);
                        return (
                          <label key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, border: `1.5px solid ${checked ? '#93c5fd' : '#e2e8f0'}`, background: checked ? '#eff6ff' : 'white', userSelect: 'none' }}>
                            <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? '#2563eb' : '#cbd5e1'}`, background: checked ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {checked && <FiCheck size={9} color="white" strokeWidth={3}/>}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: checked ? 700 : 500, color: checked ? '#1e3a8a' : '#475569', flex: 1 }}>
                              جلسة #{s.sessionNumber || i + 1}
                              <span style={{ fontSize: 11, color: '#94a3b8', marginRight: 6 }}>
                                {format(new Date(s.sessionDate), 'd MMM yyyy', { locale: ar })}
                              </span>
                            </span>
                            <input type="checkbox" checked={checked} onChange={() => toggleSessionId(s._id)} style={{ display: 'none' }}/>
                          </label>
                        );
                      })}
                    </div>
                    {!allSessions && opts.sessionIds.length === 0 && (
                      <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 6, fontWeight: 600 }}>⚠️ اختر جلسة واحدة على الأقل</div>
                    )}
                    {opts.sessionIds.length > 0 && (
                      <div style={{ fontSize: 11, color: '#10b981', marginTop: 6, fontWeight: 600 }}>✓ تم اختيار {opts.sessionIds.length} جلسة</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || (!allSessions && opts.includeSessions && opts.sessionIds.length === 0 && sessions.length > 0)}
          style={{ width: '100%', padding: '13px', background: loading ? '#93c5fd' : 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 900, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? '⏳ جاري الإنشاء...' : <><FiArrowLeft size={16}/> إنشاء التقرير ومعاينته</>}
        </button>
        <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
          سيُعرض التقرير داخل النظام — ثم يمكنك طباعته أو تحميله
        </p>
      </div>
    </div>
  );
}
