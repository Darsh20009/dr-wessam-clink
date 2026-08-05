import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiDownload, FiAlertCircle } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { htmlToPdfBlob } from '../utils/pdfScreenshot';

export default function ViewReport() {
  const { token } = useParams();
  const [html, setHtml] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    axios.get(`/api/shared-reports/${token}`)
      .then(r => {
        setHtml(r.data.htmlContent);
        setPatientName(r.data.patientName);
      })
      .catch(() => setError('الرابط غير موجود أو انتهت صلاحيته'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownload = async () => {
    if (!html) return;
    setDownloading(true);
    try {
      const blob = await htmlToPdfBlob(html, { filename: `ملف-${patientName || 'المريض'}.pdf` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ملف-${patientName || 'المريض'}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success('تم تحميل الملف ✅');
    } catch (e) {
      console.error(e);
      toast.error('فشل تحميل الملف');
    }
    setDownloading(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#f8fafc', fontFamily: 'Cairo, sans-serif' }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={{ width: 44, height: 44, border: '4px solid #dbeafe', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#64748b', fontSize: 14 }}>جاري تحميل الملف...</span>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: '#f8fafc', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <FiAlertCircle size={48} color="#ef4444" />
      <h2 style={{ color: '#1e293b', fontWeight: 800, fontSize: 18, margin: 0 }}>{error}</h2>
      <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>الرابط صالح لمدة 30 يوماً من تاريخ الإرسال</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Cairo, sans-serif', direction: 'rtl' } }} />

      <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, boxShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🦷</div>
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 14 }}>عيادة د. وسام يوسف</div>
            {patientName && <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>ملف {patientName}</div>}
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{ background: downloading ? '#94a3b8' : 'white', color: downloading ? 'white' : '#1e3a8a', border: 'none', borderRadius: 10, padding: '9px 18px', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: 13, cursor: downloading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}
        >
          {downloading ? (
            <>
              <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              جاري التحميل...
            </>
          ) : (
            <>
              <FiDownload size={15} />
              تحميل PDF
            </>
          )}
        </button>
      </div>

      <iframe
        ref={iframeRef}
        srcDoc={html}
        style={{ flex: 1, border: 'none', width: '100%', minHeight: 'calc(100vh - 62px)' }}
        title="تقرير المريض"
        sandbox="allow-same-origin"
      />
    </div>
  );
}
