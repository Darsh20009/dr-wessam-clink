import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiDownload, FiMail, FiCheck, FiArrowRight, FiFileText, FiCamera, FiDollarSign, FiList, FiLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa6';
import { exportPatientPDF } from '../utils/exportPDF';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import axios from 'axios';

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
    includeTTT: true,
    includePhotos: true,
    includeSessions: true,
    includeFinancials: false,
    sessionIds: [],
  });
  const [allSessions, setAllSessions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [pdfFileBlob, setPdfFileBlob] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
      if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    };
  }, [pdfBlobUrl, pdfPreviewUrl]);

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
    let c = raw.replace(/\D/g, '');
    if (c.startsWith('00')) c = c.slice(2);
    if (c.startsWith('20')) return c;
    if (c.startsWith('0')) c = c.slice(1);
    return '20' + c;
  };

  const buildPdfBlob = async (htmlString) => {
    const { default: html2pdf } = await import('html2pdf.js');

    // Use iframe so <head> styles are properly applied
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:794px;height:1123px;border:none;visibility:hidden;';
    document.body.appendChild(iframe);

    try {
      iframe.contentDocument.open();
      iframe.contentDocument.write(htmlString);
      iframe.contentDocument.close();

      // Wait for fonts/images to render
      await new Promise(r => setTimeout(r, 1800));

      const blob = await html2pdf().set({
        margin: [6, 6, 6, 6],
        filename: `ملف-${patient.fullName}.pdf`,
        image: { type: 'jpeg', quality: 0.92 },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          allowTaint: true,
          logging: false,
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'css' },
      }).from(iframe.contentDocument.body).outputPdf('blob');

      return blob;
    } finally {
      document.body.removeChild(iframe);
    }
  };

  const handleGenerate = async () => {
    if (!dest.download && !dest.whatsapp && !dest.email) return toast.error('اختر وجهة واحدة على الأقل');
    setLoading(true);
    try {
      setLoadingStep('جاري تجهيز البيانات والصور...');
      const finalOpts = { ...opts, sessionIds: allSessions ? [] : opts.sessionIds };
      const { blobUrl, html } = await exportPatientPDF({ patient, sessions, ttt, siteInfo, opts: finalOpts });
      setPdfBlobUrl(blobUrl);

      // Generate share link for WhatsApp / Email
      if (dest.whatsapp || dest.email) {
        setLoadingStep('جاري إنشاء رابط المشاركة...');
        try {
          const { data } = await axios.post('/api/shared-reports', {
            htmlContent: html,
            patientName: patient.fullName,
          });
          const url = `${window.location.origin}/view/${data.token}`;
          setShareUrl(url);
        } catch (e) {
          console.error('Share link error:', e);
        }
      }

      setLoadingStep('جاري تحويل الملف إلى PDF...');
      const pdfBlob = await buildPdfBlob(html);
      setPdfFileBlob(pdfBlob);
      setPdfPreviewUrl(URL.createObjectURL(pdfBlob));

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
    toast.success('تم تحميل ملف PDF');
  };

  const handleWhatsapp = async () => {
    const cleaned = normalizePhone(phone);
    if (!cleaned || cleaned.length < 10) { toast.error('أدخل رقم واتساب صحيح'); return; }

    const link = shareUrl || '';
    const msgText = link
      ? `السلام عليكم ${patient.fullName} 😊\nتحية من عيادة د. وسام يوسف 🦷\n\nيمكنك الاطلاع على ملفك الطبي الكامل من خلال الرابط التالي:\n\n${link}\n\n(الرابط صالح لمدة 30 يوماً)`
      : `السلام عليكم ${patient.fullName} 😊\nتحية من عيادة د. وسام يوسف 🦷\nمرفق ملفك الطبي الكامل.`;

    const msg = encodeURIComponent(msgText);
    window.open(`https://wa.me/${cleaned}?text=${msg}`, '_blank');
    toast.success('تم فتح واتساب ✅', { duration: 4000 });
  };

  const handleEmail = () => {
    if (!email) { toast.error('أدخل البريد الإلكتروني'); return; }

    const link = shareUrl || '';
    const subject = encodeURIComponent(`ملفك الطبي — عيادة د. وسام يوسف`);
    const body = encodeURIComponent(
      link
        ? `السلام عليكم ${patient.fullName}\n\nيمكنك الاطلاع على ملفك الطبي الكامل وتحميله من خلال الرابط التالي:\n\n${link}\n\n(الرابط صالح لمدة 30 يوماً)\n\nللاستفسار: ${siteInfo?.phone || '+20 115 679 8324'}`
        : `السلام عليكم ${patient.fullName}\n\nمرفق ملفك الطبي من عيادة د. وسام يوسف\n\nللاستفسار: ${siteInfo?.phone || '+20 115 679 8324'}`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    toast.success('تم فتح تطبيق البريد ✅', { duration: 4000 });
  };

  const Toggle = ({ checked, onChange }) => (
    <div onClick={onChange} style={{
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

  const ContentRow = ({ checked, onChange, icon, label, sublabel }) => (
    <div onClick={onChange} style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      borderRadius: 12, border: `1.5px solid ${checked ? '#bfdbfe' : '#e2e8f0'}`,
      background: checked ? '#f0f9ff' : '#fafafa', marginBottom: 8, cursor: 'pointer',
      transition: 'all 0.15s', userSelect: 'none'
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: checked ? '#dbeafe' : '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: checked ? '#2563eb' : '#94a3b8', transition: 'all 0.15s'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: checked ? '#1e3a8a' : '#475569' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{sublabel}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  if (step === 2 && pdfPreviewUrl) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 99999, display: 'flex', flexDirection: 'column', direction: 'rtl' }}>
        <div style={{ background: '#1e3a8a', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setStep(1)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiArrowRight size={14}/> رجوع
          </button>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 14, flex: 1 }}>📄 معاينة ملف {patient.fullName}</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleDownload} style={{ background: '#0ea5e9', border: 'none', borderRadius: 8, padding: '7px 16px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiDownload size={14}/> تحميل PDF
            </button>
            {dest.whatsapp && (
              <button onClick={handleWhatsapp} style={{ background: '#16a34a', border: 'none', borderRadius: 8, padding: '7px 16px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                <FaWhatsapp size={16}/> إرسال واتساب
              </button>
            )}
            {dest.email && (
              <button onClick={handleEmail} style={{ background: '#7c3aed', border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FiMail size={14}/> بريد
              </button>
            )}
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
          <div style={{ background: '#0c4a6e', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <FiLink size={13} color="#7dd3fc"/>
            <span style={{ color: '#7dd3fc', fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr' }}>{shareUrl}</span>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('تم نسخ الرابط'); }}
              style={{ background: '#0284c7', border: 'none', borderRadius: 6, padding: '4px 10px', color: 'white', fontSize: 11, fontFamily: 'Cairo, sans-serif', cursor: 'pointer', flexShrink: 0 }}>
              نسخ
            </button>
          </div>
        )}

        <iframe ref={iframeRef} src={pdfPreviewUrl} style={{ flex: 1, border: 'none', background: 'white' }} title="معاينة الملف" />
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, direction: 'rtl' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 520, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>

        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiFileText size={20} color="white"/>
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>تصدير الملف الطبي</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{patient.fullName}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiX size={16}/>
          </button>
        </div>

        <div style={{ padding: '18px 22px' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>وجهة التصدير</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>

              <button onClick={() => toggleDest('download')} style={{ padding: '14px 8px', borderRadius: 14, border: `2px solid ${dest.download ? '#2563eb' : '#e2e8f0'}`, background: dest.download ? '#eff6ff' : 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.15s', position: 'relative' }}>
                {dest.download && <div style={{ position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheck size={10} color="white" strokeWidth={3}/></div>}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: dest.download ? '#dbeafe' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiFileText size={22} color={dest.download ? '#2563eb' : '#94a3b8'}/>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: dest.download ? '#1e3a8a' : '#64748b' }}>معاينة / PDF</span>
              </button>

              <button onClick={() => toggleDest('whatsapp')} style={{ padding: '14px 8px', borderRadius: 14, border: `2px solid ${dest.whatsapp ? '#16a34a' : '#e2e8f0'}`, background: dest.whatsapp ? '#f0fdf4' : 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.15s', position: 'relative' }}>
                {dest.whatsapp && <div style={{ position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheck size={10} color="white" strokeWidth={3}/></div>}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: dest.whatsapp ? '#dcfce7' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaWhatsapp size={24} color={dest.whatsapp ? '#16a34a' : '#94a3b8'}/>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: dest.whatsapp ? '#166534' : '#64748b' }}>واتساب</span>
              </button>

              <button onClick={() => toggleDest('email')} style={{ padding: '14px 8px', borderRadius: 14, border: `2px solid ${dest.email ? '#7c3aed' : '#e2e8f0'}`, background: dest.email ? '#faf5ff' : 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'all 0.15s', position: 'relative' }}>
                {dest.email && <div style={{ position: 'absolute', top: 6, left: 6, width: 18, height: 18, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheck size={10} color="white" strokeWidth={3}/></div>}
                <div style={{ width: 44, height: 44, borderRadius: 12, background: dest.email ? '#ede9fe' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiMail size={22} color={dest.email ? '#7c3aed' : '#94a3b8'}/>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: dest.email ? '#5b21b6' : '#64748b' }}>بريد إلكتروني</span>
              </button>
            </div>
          </div>

          {dest.whatsapp && (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <FaWhatsapp size={16} color="#16a34a"/>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#166534' }}>رقم واتساب المريض</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #86efac', borderRadius: 8, background: 'white', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: '#f0fdf4', borderLeft: '1.5px solid #86efac', flexShrink: 0, userSelect: 'none' }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>🇪🇬</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#166534', letterSpacing: '0.5px' }}>+20</span>
                </div>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="1156798324"
                  dir="ltr"
                  maxLength={10}
                  style={{ flex: 1, padding: '8px 10px', border: 'none', fontSize: 14, fontFamily: 'monospace', outline: 'none', background: 'transparent', letterSpacing: '1px' }}
                />
              </div>
              <div style={{ fontSize: 11, color: '#16a34a', marginTop: 6 }}>
                📎 سيُرسل ملف PDF مباشرة عبر واتساب (على الموبايل)
              </div>
            </div>
          )}

          {dest.email && (
            <div style={{ background: '#faf5ff', border: '1.5px solid #c4b5fd', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <FiMail size={15} color="#7c3aed"/>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#5b21b6' }}>البريد الإلكتروني</span>
              </div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="patient@example.com" dir="ltr"
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #c4b5fd', borderRadius: 8, fontSize: 13, fontFamily: 'Cairo, sans-serif', outline: 'none', boxSizing: 'border-box', background: 'white' }} />
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 12, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>محتوى التقرير</div>
            <ContentRow checked={opts.includeTTT} onChange={() => toggleOpt('includeTTT')} icon={<FiFileText size={18}/>} label="الملف الطبي التفصيلي (TTT File)" sublabel="بيانات الأسنان والخطة العلاجية"/>
            <ContentRow checked={opts.includePhotos} onChange={() => toggleOpt('includePhotos')} icon={<FiCamera size={18}/>} label="الصور والأشعة" sublabel="صور الوجه والفم والأشعة التشخيصية"/>
            <ContentRow checked={opts.includeFinancials} onChange={() => toggleOpt('includeFinancials')} icon={<FiDollarSign size={18}/>} label="البيانات المالية" sublabel="المدفوعات والمتبقي والإيصالات"/>

            <div style={{ border: `1.5px solid ${opts.includeSessions ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: 12, overflow: 'hidden', marginBottom: 8 }}>
              <div onClick={() => toggleOpt('includeSessions')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: opts.includeSessions ? '#f0f9ff' : '#fafafa', cursor: 'pointer', transition: 'all 0.15s', userSelect: 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: opts.includeSessions ? '#dbeafe' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: opts.includeSessions ? '#2563eb' : '#94a3b8' }}>
                  <FiList size={18}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: opts.includeSessions ? '#1e3a8a' : '#475569' }}>جلسات المتابعة</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{sessions.length} جلسة مسجّلة</div>
                </div>
                <Toggle checked={opts.includeSessions} onChange={() => toggleOpt('includeSessions')} />
              </div>

              {opts.includeSessions && sessions.length > 0 && (
                <div style={{ padding: '10px 14px 12px', borderTop: '1px solid #e2e8f0', background: '#fafcff' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {[{ val: true, label: 'كل الجلسات' }, { val: false, label: 'جلسات محددة' }].map(opt => (
                      <button key={String(opt.val)} onClick={() => { setAllSessions(opt.val); if (opt.val) setOpts(o => ({ ...o, sessionIds: [] })); }}
                        style={{ flex: 1, padding: '7px 10px', border: `1.5px solid ${allSessions === opt.val ? '#93c5fd' : '#e2e8f0'}`, borderRadius: 8, background: allSessions === opt.val ? '#eff6ff' : 'white', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 12, color: allSessions === opt.val ? '#2563eb' : '#64748b' }}>
                        {allSessions === opt.val && '✓ '}{opt.label}
                      </button>
                    ))}
                  </div>
                  {!allSessions && (
                    <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {[...sessions].sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate)).map((s, i) => {
                        const checked = opts.sessionIds.includes(s._id);
                        return (
                          <label key={s._id} onClick={() => toggleSessionId(s._id)} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${checked ? '#93c5fd' : '#e2e8f0'}`, background: checked ? '#eff6ff' : 'white', userSelect: 'none' }}>
                            <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${checked ? '#2563eb' : '#cbd5e1'}`, background: checked ? '#2563eb' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {checked && <FiCheck size={10} color="white" strokeWidth={3}/>}
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: checked ? '#1e3a8a' : '#475569', flex: 1 }}>جلسة #{s.sessionNumber || i + 1}</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{format(new Date(s.sessionDate), 'd MMM yyyy', { locale: ar })}</span>
                          </label>
                        );
                      })}
                      {opts.sessionIds.length === 0 && <div style={{ fontSize: 11, color: '#f59e0b', padding: '4px 6px', fontWeight: 600 }}>⚠️ اختر جلسة واحدة على الأقل</div>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || (!allSessions && opts.includeSessions && opts.sessionIds.length === 0 && sessions.length > 0)}
            style={{ width: '100%', padding: '14px', background: loading ? '#93c5fd' : 'linear-gradient(135deg,#1e40af,#2563eb)', color: 'white', border: 'none', borderRadius: 13, fontWeight: 900, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: loading ? 'none' : '0 4px 16px rgba(37,99,235,0.35)' }}>
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
                {loadingStep || 'جاري الإنشاء...'}
              </>
            ) : (
              <><FiFileText size={17}/> إنشاء ملف PDF</>
            )}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.6 }}>
            يُعرض التقرير داخل النظام — ثم يمكنك تحميله كـ PDF أو إرساله
          </p>
        </div>
      </div>
    </div>
  );
}
