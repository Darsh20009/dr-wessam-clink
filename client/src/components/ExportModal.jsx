import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiDownload, FiMail, FiCheck, FiArrowRight, FiFileText,
  FiCamera, FiDollarSign, FiList, FiLink, FiChevronDown, FiChevronUp,
  FiImage, FiCpu } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { exportPatientPDF } from '../utils/exportPDF';
import { htmlToPdfBlob } from '../utils/pdfScreenshot';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import axios from 'axios';

const Toggle = ({ checked, onChange }) => (
  <div onClick={(e) => { e.stopPropagation(); onChange(); }} style={{
    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
    background: checked ? '#2563eb' : '#cbd5e1', position: 'relative'
  }}>
    <div style={{
      position: 'absolute', top: 3, transition: 'all 0.2s',
      left: checked ? 'calc(100% - 21px)' : 3,
      width: 18, height: 18, borderRadius: '50%', background: 'white',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
    }} />
  </div>
);

const ContentRow = ({ checked, onChange, icon, label, sublabel, indent = false }) => (
  <div onClick={onChange} style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: indent ? '9px 14px 9px 28px' : '11px 14px',
    borderRadius: 10,
    border: `1.5px solid ${checked ? '#bfdbfe' : '#e2e8f0'}`,
    background: checked ? '#f0f9ff' : '#fafafa',
    marginBottom: 6, cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none'
  }}>
    {indent && <div style={{ width: 2, height: 20, background: '#bfdbfe', borderRadius: 2, marginLeft: 2 }} />}
    <div style={{
      width: indent ? 28 : 34, height: indent ? 28 : 34, borderRadius: 8, flexShrink: 0,
      background: checked ? '#dbeafe' : '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: checked ? '#2563eb' : '#94a3b8', transition: 'all 0.15s'
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: indent ? 600 : 700, fontSize: indent ? 12 : 13, color: checked ? '#1e3a8a' : '#475569' }}>{label}</div>
      {sublabel && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{sublabel}</div>}
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export default function ExportModal({ patient, sessions = [], ttt = {}, siteInfo = {}, onClose }) {
  const [step, setStep] = useState(1);
  const [dest, setDest] = useState({ download: true, whatsapp: false, email: false });
  const initPhone = () => {
    let p = (patient?.phone || '').replace(/\D/g, '');
    if (p.startsWith('00')) p = p.slice(2);
    if (p.startsWith('20')) p = p.slice(2);
    if (p.startsWith('0')) p = p.slice(1);
    return p;
  };
  const [phone, setPhone] = useState(initPhone);
  const [email, setEmail] = useState('');

  const [opts, setOpts] = useState({
    lang: 'en',
    includeClinicHeader: true,
    includePatientCard: true,
    includeDiagnosis: true,
    includeTTT: true,
    includeTTTObjectives: true,
    includeTTTBolton: true,
    includeTTTSpace: true,
    includePhotos: true,
    includeFacePhotos: true,
    includeIntraOralPhotos: true,
    includeXrays: true,
    includeSessions: true,
    includeSessionImages: true,
    includeFinancials: false,
    sessionIds: [],
  });

  const [expandedSections, setExpandedSections] = useState({ ttt: false, photos: false });
  const [allSessions, setAllSessions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [htmlBlobUrl, setHtmlBlobUrl] = useState(null);
  const [pdfFileBlob, setPdfFileBlob] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    return () => { if (htmlBlobUrl) URL.revokeObjectURL(htmlBlobUrl); };
  }, [htmlBlobUrl]);

  const toggleDest = (k) => setDest(d => ({ ...d, [k]: !d[k] }));
  const toggleOpt = (k) => setOpts(o => ({ ...o, [k]: !o[k] }));
  const toggleSection = (k) => setExpandedSections(s => ({ ...s, [k]: !s[k] }));

  const toggleSessionId = (id) => {
    setOpts(o => {
      const ids = o.sessionIds.includes(id)
        ? o.sessionIds.filter(x => x !== id)
        : [...o.sessionIds, id];
      return { ...o, sessionIds: ids };
    });
  };

  const normalizePhone = (raw) => {
    let c = raw.replace(/\D/g, '');
    if (c.startsWith('00')) c = c.slice(2);
    if (c.startsWith('20')) return c;
    if (c.startsWith('0')) c = c.slice(1);
    return '20' + c;
  };

  const handleGenerate = async () => {
    if (!dest.download && !dest.whatsapp && !dest.email) return toast.error('اختر وجهة واحدة على الأقل');
    setLoading(true);
    try {
      setLoadingStep('جاري تجهيز البيانات والصور...');
      const finalOpts = { ...opts, sessionIds: allSessions ? [] : opts.sessionIds };
      const { blobUrl, html } = await exportPatientPDF({ patient, sessions, ttt, siteInfo, opts: finalOpts });
      setHtmlBlobUrl(blobUrl);

      if (dest.whatsapp || dest.email) {
        setLoadingStep('جاري إنشاء رابط المشاركة...');
        try {
          const { data } = await axios.post('/shared-reports', {
            htmlContent: html,
            patientName: patient.fullName,
          });
          setShareUrl(`${window.location.origin}/view/${data.token}`);
        } catch (e) {
          console.error('Share link error:', e);
          toast.error('⚠️ تعذّر إنشاء رابط المشاركة — سيُرسل الواتساب بدون رابط', { duration: 5000 });
        }
      }

      setLoadingStep('جاري تصوير الصفحات وإنشاء PDF...');
      const pdfBlob = await htmlToPdfBlob(html, { filename: `ملف-${patient.fullName}.pdf` });
      setPdfFileBlob(pdfBlob);

      setStep(2);
    } catch (e) {
      console.error(e);
      toast.error('خطأ في إنشاء الملف');
    }
    setLoading(false);
    setLoadingStep('');
  };

  const fileName = `ملف-${patient.fullName}-${new Date().toLocaleDateString('ar-EG').replace(/\//g, '-')}.pdf`;

  const handleDownload = () => {
    if (!pdfFileBlob) return;
    const url = URL.createObjectURL(pdfFileBlob);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success('تم تحميل ملف PDF ✅');
  };

  const handleWhatsapp = () => {
    const cleaned = normalizePhone(phone);
    if (!cleaned || cleaned.length < 10) { toast.error('أدخل رقم واتساب صحيح'); return; }

    const link = shareUrl || '';
    const msgText = link
      ? `السلام عليكم ${patient.fullName} 😊\nتحية من عيادة د. وسام يوسف 🦷\n\nيمكنك الاطلاع على ملفك الطبي الكامل وتحميله PDF من خلال الرابط:\n\n🔗 ${link}\n\n(الرابط صالح لمدة 30 يوماً)`
      : `السلام عليكم ${patient.fullName} 😊\nتحية من عيادة د. وسام يوسف 🦷\nمرفق ملفك الطبي الكامل.`;

    window.open(`https://wa.me/${cleaned}?text=${encodeURIComponent(msgText)}`, '_blank');
    toast.success('تم فتح واتساب ✅', { duration: 4000 });
  };

  const handleEmail = () => {
    if (!email) { toast.error('أدخل البريد الإلكتروني'); return; }
    const link = shareUrl || '';
    const subject = encodeURIComponent(`ملفك الطبي — عيادة د. وسام يوسف`);
    const body = encodeURIComponent(
      link
        ? `السلام عليكم ${patient.fullName}\n\nيمكنك الاطلاع على ملفك الطبي الكامل وتحميله PDF:\n\n${link}\n\n(الرابط صالح 30 يوماً)\n\nللاستفسار: ${siteInfo?.phone || '+20 115 679 8324'}`
        : `السلام عليكم ${patient.fullName}\n\nمرفق ملفك الطبي.\n\nللاستفسار: ${siteInfo?.phone || '+20 115 679 8324'}`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    toast.success('تم فتح تطبيق البريد ✅', { duration: 4000 });
  };

  /* ── Step 2: Preview ── */
  if (step === 2 && htmlBlobUrl) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 99999, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
        <div style={{ background: '#1e3a8a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
          <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiArrowRight size={14}/> رجوع
          </button>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 14, flex: 1 }}> معاينة  ملف {patient.fullName}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleDownload} disabled={!pdfFileBlob}
              style={{ background: pdfFileBlob ? '#0ea5e9' : '#475569', border: 'none', borderRadius: 8, padding: '7px 16px', color: 'white', cursor: pdfFileBlob ? 'pointer' : 'not-allowed', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiDownload size={14}/> تحميل PDF
            </button>
            <button onClick={handleWhatsapp}
              style={{ background: '#16a34a', border: 'none', borderRadius: 8, padding: '7px 16px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
              <FaWhatsapp size={16}/> واتساب
            </button>
            <button onClick={handleEmail}
              style={{ background: '#7c3aed', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiMail size={14}/> بريد
            </button>
            {shareUrl && (
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('تم نسخ الرابط ✅'); }}
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 12px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiLink size={13}/> نسخ الرابط
              </button>
            )}
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '7px 10px', color: 'white', cursor: 'pointer' }}>
              <FiX size={16}/>
            </button>
          </div>
        </div>

        {shareUrl && (
          <div style={{ background: '#0c4a6e', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <FiLink size={13} color="#7dd3fc"/>
            <span style={{ color: '#7dd3fc', fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr' }}>{shareUrl}</span>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('تم نسخ الرابط'); }}
              style={{ background: '#0284c7', border: 'none', borderRadius: 6, padding: '4px 10px', color: 'white', fontSize: 11, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', flexShrink: 0 }}>
              نسخ
            </button>
          </div>
        )}

        {/* HTML iframe preview — works in all browsers (no PDF blob restriction) */}
        <iframe ref={iframeRef} src={htmlBlobUrl}
          style={{ flex: 1, border: 'none', background: 'white' }}
          title="معاينة الملف"
          sandbox="allow-same-origin allow-scripts" />
      </div>
    );
  }

  /* ── Step 1: Options ── */
  const SectionHeader = ({ label, icon, expandKey, hasChildren }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, marginTop: 4 }}>
      <span style={{ fontWeight: 800, fontSize: 11, color: '#94a3b8', letterSpacing: '0.05em', flex: 1 }}>{label}</span>
      {hasChildren && (
        <button onClick={() => toggleSection(expandKey)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}>
          {expandedSections[expandKey] ? <><FiChevronUp size={12}/> طيّ</> : <><FiChevronDown size={12}/> تفاصيل</>}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, direction: 'rtl' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 560, maxHeight: '94vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiFileText size={18} color="white"/>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 15, color: '#0f172a' }}>تصدير الملف الطبي</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{patient.fullName}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiX size={16}/>
          </button>
        </div>

        <div style={{ padding: '16px 20px' }}>

          {/* Destination */}
          <div style={{ marginBottom: 18 }}>
            <SectionHeader label="وجهة التصدير" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { k: 'download', icon: <FiFileText size={20}/>, label: 'معاينة / PDF', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
                { k: 'whatsapp', icon: <FaWhatsapp size={22}/>, label: 'واتساب', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                { k: 'email', icon: <FiMail size={20}/>, label: 'بريد', color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd' },
              ].map(({ k, icon, label, color, bg, border }) => (
                <button key={k} onClick={() => toggleDest(k)}
                  style={{ padding: '12px 6px', borderRadius: 12, border: `2px solid ${dest[k] ? border : '#e2e8f0'}`, background: dest[k] ? bg : 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, transition: 'all 0.15s', position: 'relative' }}>
                  {dest[k] && <div style={{ position: 'absolute', top: 5, left: 5, width: 16, height: 16, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheck size={9} color="white" strokeWidth={3}/></div>}
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: dest[k] ? `${bg}` : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dest[k] ? color : '#94a3b8' }}>{icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: dest[k] ? color : '#64748b' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phone */}
          {dest.whatsapp && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: '11px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <FaWhatsapp size={14} color="#16a34a"/>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#166534' }}>رقم واتساب المريض</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #86efac', borderRadius: 8, background: 'white', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', background: '#f0fdf4', borderLeft: '1.5px solid #86efac', flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>🇪🇬</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>+20</span>
                </div>
                <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="1156798324" dir="ltr" maxLength={10}
                  style={{ flex: 1, padding: '7px 10px', border: 'none', fontSize: 14, fontFamily: 'monospace', outline: 'none', background: 'transparent' }}/>
              </div>
            </div>
          )}

          {/* Email */}
          {dest.email && (
            <div style={{ background: '#faf5ff', border: '1.5px solid #c4b5fd', borderRadius: 12, padding: '11px 14px', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <FiMail size={14} color="#7c3aed"/>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#5b21b6' }}>البريد الإلكتروني</span>
              </div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="patient@example.com" dir="ltr"
                style={{ width: '100%', padding: '7px 12px', border: '1.5px solid #c4b5fd', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: 'white', fontFamily: 'monospace' }}/>
            </div>
          )}

          {/* ═══ LANGUAGE SELECTOR ═══ */}
          <div style={{ marginBottom: 18 }}>
            <SectionHeader label="لغة التقرير" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { val: 'en', flag: '🇬🇧', label: 'English', sub: 'English labels & layout' },
                { val: 'ar', flag: '🇸🇦', label: 'العربية', sub: 'مسميات وتخطيط عربي' },
              ].map(({ val, flag, label, sub }) => {
                const selected = opts.lang === val;
                return (
                  <button key={val} onClick={() => setOpts(o => ({ ...o, lang: val }))}
                    style={{
                      padding: '12px 10px', borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                      background: selected ? '#eff6ff' : 'white',
                      fontFamily: 'Cairo, sans-serif', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 5, transition: 'all 0.15s', position: 'relative',
                    }}>
                    {selected && (
                      <div style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiCheck size={9} color="white" strokeWidth={3}/>
                      </div>
                    )}
                    <span style={{ fontSize: 22 }}>{flag}</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: selected ? '#1e3a8a' : '#475569' }}>{label}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ CONTENT CUSTOMIZATION ═══ */}
          <div style={{ marginBottom: 16 }}>
            <SectionHeader label="تخصيص محتوى التقرير" />

            {/* Report Header & Patient Card */}
            <ContentRow checked={opts.includeClinicHeader} onChange={() => toggleOpt('includeClinicHeader')}
              icon={<span style={{ fontSize: 15 }}>🏥</span>} label="ترويسة العيادة" sublabel="اسم العيادة والشعار والتاريخ"/>
            <ContentRow checked={opts.includePatientCard} onChange={() => toggleOpt('includePatientCard')}
              icon={<FiFileText size={16}/>} label="بيانات المريض الأساسية" sublabel="الاسم والجوال والعنوان"/>

            <ContentRow checked={opts.includeDiagnosis} onChange={() => toggleOpt('includeDiagnosis')}
              icon={<span style={{ fontSize: 15 }}>🩺</span>} label="التشخيص وخطة العلاج" sublabel="التشخيص، خطة العلاج، المراحل، التعليمات"/>

            {/* TTT File */}
            <div style={{ border: `1.5px solid ${opts.includeTTT ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
              <div onClick={() => toggleOpt('includeTTT')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: opts.includeTTT ? '#f0f9ff' : '#fafafa', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: opts.includeTTT ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: opts.includeTTT ? '#2563eb' : '#94a3b8' }}><FiCpu size={16}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: opts.includeTTT ? '#1e3a8a' : '#475569' }}>الملف الطبي التفصيلي (TTT File)</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>بيانات الأسنان والخطة العلاجية</div>
                </div>
                <Toggle checked={opts.includeTTT} onChange={() => toggleOpt('includeTTT')} />
              </div>
              {opts.includeTTT && (
                <div style={{ padding: '8px 14px 10px', borderTop: '1px solid #e0f2fe', background: '#f8fcff' }}>
                  <button onClick={() => toggleSection('ttt')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, fontFamily: 'Cairo, sans-serif' }}>
                    {expandedSections.ttt ? <FiChevronUp size={12}/> : <FiChevronDown size={12}/>}
                    {expandedSections.ttt ? 'إخفاء التفاصيل' : 'تخصيص أقسام TTT'}
                  </button>
                  {expandedSections.ttt && (
                    <div>
                      <ContentRow checked={opts.includeTTTObjectives} onChange={() => toggleOpt('includeTTTObjectives')} indent
                        icon={<span style={{ fontSize: 12 }}>🎯</span>} label="TTT Objectives" sublabel="الأهداف العلاجية العشرة"/>
                      <ContentRow checked={opts.includeTTTBolton} onChange={() => toggleOpt('includeTTTBolton')} indent
                        icon={<span style={{ fontSize: 12 }}>📐</span>} label="Bolton Analysis" sublabel="نسبة التحليل الأمامي والكلي"/>
                      <ContentRow checked={opts.includeTTTSpace} onChange={() => toggleOpt('includeTTTSpace')} indent
                        icon={<span style={{ fontSize: 12 }}>📏</span>} label="Space & Arch Analysis" sublabel="تحليل المسافة والتقوس"/>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Photos */}
            <div style={{ border: `1.5px solid ${opts.includePhotos ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
              <div onClick={() => toggleOpt('includePhotos')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: opts.includePhotos ? '#f0f9ff' : '#fafafa', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: opts.includePhotos ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: opts.includePhotos ? '#2563eb' : '#94a3b8' }}><FiCamera size={16}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: opts.includePhotos ? '#1e3a8a' : '#475569' }}>الصور والأشعة</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>صور الوجه والفم والأشعة التشخيصية</div>
                </div>
                <Toggle checked={opts.includePhotos} onChange={() => toggleOpt('includePhotos')} />
              </div>
              {opts.includePhotos && (
                <div style={{ padding: '8px 14px 10px', borderTop: '1px solid #e0f2fe', background: '#f8fcff' }}>
                  <button onClick={() => toggleSection('photos')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6, fontFamily: 'Cairo, sans-serif' }}>
                    {expandedSections.photos ? <FiChevronUp size={12}/> : <FiChevronDown size={12}/>}
                    {expandedSections.photos ? 'إخفاء التفاصيل' : 'تخصيص أنواع الصور'}
                  </button>
                  {expandedSections.photos && (
                    <div>
                      <ContentRow checked={opts.includeFacePhotos} onChange={() => toggleOpt('includeFacePhotos')} indent
                        icon={<FiImage size={14}/>} label="Extraoral Examination" sublabel="Frontal Rest, Smile, Lateral"/>
                      <ContentRow checked={opts.includeIntraOralPhotos} onChange={() => toggleOpt('includeIntraOralPhotos')} indent
                        icon={<FiImage size={14}/>} label="Intraoral Examination" sublabel="Frontal, Upper/Lower Jaw, Laterals"/>
                      <ContentRow checked={opts.includeXrays} onChange={() => toggleOpt('includeXrays')} indent
                        icon={<span style={{ fontSize: 12 }}>🩻</span>} label="الأشعة" sublabel="Panoramic, Lateral Ceph, CBCT"/>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sessions */}
            <div style={{ border: `1.5px solid ${opts.includeSessions ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 10, overflow: 'hidden', marginBottom: 6 }}>
              <div onClick={() => toggleOpt('includeSessions')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: opts.includeSessions ? '#f0f9ff' : '#fafafa', cursor: 'pointer', userSelect: 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: opts.includeSessions ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: opts.includeSessions ? '#2563eb' : '#94a3b8' }}><FiList size={16}/></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: opts.includeSessions ? '#1e3a8a' : '#475569' }}>جلسات المتابعة</div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>{sessions.length} جلسة مسجّلة</div>
                </div>
                <Toggle checked={opts.includeSessions} onChange={() => toggleOpt('includeSessions')} />
              </div>
              {opts.includeSessions && sessions.length > 0 && (
                <div style={{ padding: '8px 14px 10px', borderTop: '1px solid #e0f2fe', background: '#f8fcff' }}>
                  <ContentRow checked={opts.includeSessionImages} onChange={() => toggleOpt('includeSessionImages')} indent
                    icon={<FiCamera size={14}/>} label="صور الجلسات" sublabel="صور كل جلسة داخل التقرير"/>

                  <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
                    {[{ val: true, label: 'كل الجلسات' }, { val: false, label: 'جلسات محددة' }].map(opt => (
                      <button key={String(opt.val)} onClick={() => { setAllSessions(opt.val); if (opt.val) setOpts(o => ({ ...o, sessionIds: [] })); }}
                        style={{ flex: 1, padding: '6px 8px', border: `1.5px solid ${allSessions === opt.val ? '#93c5fd' : '#e2e8f0'}`, borderRadius: 8, background: allSessions === opt.val ? '#eff6ff' : 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 11, color: allSessions === opt.val ? '#2563eb' : '#64748b' }}>
                        {allSessions === opt.val && '✓ '}{opt.label}
                      </button>
                    ))}
                  </div>
                  {!allSessions && (
                    <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                      {[...sessions].sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate)).map((s, i) => {
                        const checked = opts.sessionIds.includes(s._id);
                        return (
                          <label key={s._id} onClick={() => toggleSessionId(s._id)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${checked ? '#93c5fd' : '#e2e8f0'}`, background: checked ? '#eff6ff' : 'white', userSelect: 'none' }}>
                            <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? '#2563eb' : '#cbd5e1'}`, background: checked ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {checked && <FiCheck size={9} color="white" strokeWidth={3}/>}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: checked ? '#1e3a8a' : '#475569', flex: 1 }}>جلسة #{s.sessionNumber || i + 1}</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{format(new Date(s.sessionDate), 'd MMM yyyy', { locale: ar })}</span>
                          </label>
                        );
                      })}
                      {opts.sessionIds.length === 0 && <div style={{ fontSize: 11, color: '#f59e0b', padding: '3px 6px', fontWeight: 600 }}>⚠️ اختر جلسة واحدة على الأقل</div>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Financials */}
            <ContentRow checked={opts.includeFinancials} onChange={() => toggleOpt('includeFinancials')}
              icon={<FiDollarSign size={16}/>} label="البيانات المالية" sublabel="التكاليف والمدفوعات والمتبقي"/>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || (!allSessions && opts.includeSessions && opts.sessionIds.length === 0 && sessions.length > 0)}
            style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg,#1e3a8a,#2563eb)',
              color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Cairo, sans-serif', fontWeight: 900, fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.4)',
              transition: 'all 0.2s',
            }}>
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: '3px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 13 }}>{loadingStep || 'جاري المعالجة...'}</span>
              </>
            ) : (
              <><FiFileText size={18}/> إنشاء الملف ومعاينته</>
            )}
          </button>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
      </div>
    </div>
  );
}
