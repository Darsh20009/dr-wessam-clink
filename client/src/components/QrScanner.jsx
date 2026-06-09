import React, { useEffect, useRef, useState } from 'react';

export default function QrScanner({ onScan, onClose }) {
  const divRef = useRef(null);
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let html5QrCode;
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('qr-scanner-div');
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            onScan(decodedText);
          },
          () => {}
        );
      } catch (err) {
        setError('تعذّر الوصول إلى الكاميرا. يرجى السماح بالإذن.');
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '20px',
    }}>
      <div style={{
        background: 'white', borderRadius: '20px',
        padding: '24px', width: '100%', maxWidth: '360px',
        fontFamily: 'Cairo, sans-serif', direction: 'rtl',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
            📷 مسح الباركود
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '8px',
              width: '32px', height: '32px', cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >✕</button>
        </div>

        {error ? (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
            padding: '16px', color: '#dc2626', fontSize: '13px', textAlign: 'center',
          }}>
            {error}
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '14px', textAlign: 'center' }}>
              وجّه الكاميرا نحو باركود البطاقة
            </p>
            <div id="qr-scanner-div" style={{
              width: '100%', borderRadius: '12px', overflow: 'hidden',
              border: '2px solid #e2e8f0',
            }} />
          </>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%', marginTop: '16px', padding: '11px',
            background: '#f1f5f9', border: 'none', borderRadius: '10px',
            color: '#475569', fontSize: '14px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          }}
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
