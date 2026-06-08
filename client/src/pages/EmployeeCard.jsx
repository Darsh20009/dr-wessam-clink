import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiPrinter, FiRotateCcw } from 'react-icons/fi';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
  .ec-root { font-family: 'Cairo', sans-serif; direction: rtl; }

  .ec-card-scene {
    width: 340px; height: 210px;
    perspective: 1000px;
    cursor: pointer;
  }
  .ec-card-inner {
    width: 100%; height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 18px;
  }
  .ec-card-inner.flipped { transform: rotateY(180deg); }

  .ec-face {
    position: absolute; inset: 0;
    border-radius: 18px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    overflow: hidden;
  }
  .ec-back { transform: rotateY(180deg); }

  @media print {
    body * { visibility: hidden !important; }
    .ec-print-area, .ec-print-area * { visibility: visible !important; }
    .ec-print-area {
      position: fixed !important; top: 0; left: 0;
      width: 100vw; display: flex;
      justify-content: center; align-items: flex-start;
      padding: 40px; gap: 40px;
      background: white !important;
    }
    .ec-card-scene { break-inside: avoid; }
    .ec-card-inner { transform: none !important; }
    .ec-face { position: relative !important; }
    .ec-back { transform: none !important; margin-top: 20px; }
  }
`;

export default function EmployeeCard() {
  const [qrToken, setQrToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const appUrl = window.location.origin;

  useEffect(() => {
    fetchQrToken();
  }, []);

  const fetchQrToken = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/auth/me');
      if (data.qrToken) {
        setQrToken(data.qrToken);
      }
    } catch {}
    setLoading(false);
  };

  const generateQr = async () => {
    setGenerating(true);
    try {
      const { data } = await axios.post('/auth/qr-generate');
      setQrToken(data.qrToken);
      toast.success('تم إنشاء الباركود بنجاح');
    } catch {
      toast.error('خطأ في إنشاء الباركود');
    }
    setGenerating(false);
  };

  const handlePrint = () => window.print();

  const qrValue = qrToken ? `${appUrl}/login?qr=${qrToken}` : 'no-token';

  return (
    <>
      <style>{STYLE}</style>
      <div className="ec-root" style={{
        minHeight: '100vh', background: '#f0f6ff',
        padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: '800px' }}>

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
              🪪 بطاقة التوظيف
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              انقر على البطاقة لقلبها — الوجه الأمامي يحوي بياناتك، والخلفي يحوي باركود الدخول
            </p>
          </div>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            <div className="ec-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              <div className="ec-card-scene" onClick={() => setFlipped(f => !f)}>
                <div className={`ec-card-inner${flipped ? ' flipped' : ''}`}>

                  <div className="ec-face" style={{
                    background: 'linear-gradient(135deg, #0f2557 0%, #1a3a8f 40%, #1e56c8 100%)',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)',
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: '-30px', right: '-30px',
                      width: '160px', height: '160px', borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.07)',
                      pointerEvents: 'none',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: '-60px', right: '-60px',
                      width: '240px', height: '240px', borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.04)',
                      pointerEvents: 'none',
                    }} />

                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '14px 18px 10px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="/logo-transparent.png" alt="لوجو" style={{
                          width: '32px', height: '32px', objectFit: 'contain',
                          background: 'white', borderRadius: '8px', padding: '2px',
                        }} />
                        <div>
                          <div style={{ color: 'white', fontWeight: 800, fontSize: '11px', lineHeight: 1.2 }}>
                            عيادة د. وسام يوسف
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px' }}>
                            ORTHODONTIC CLINIC
                          </div>
                        </div>
                      </div>
                      <div style={{
                        background: 'rgba(255,255,255,0.15)', borderRadius: '6px',
                        padding: '4px 8px', color: 'rgba(255,255,255,0.8)', fontSize: '9px', fontWeight: 700,
                        letterSpacing: '0.5px',
                      }}>
                        STAFF ID
                      </div>
                    </div>

                    <div style={{
                      flex: 1, display: 'flex', alignItems: 'stretch',
                      padding: '0 0 0 0', gap: '0', overflow: 'hidden',
                    }}>
                      <div style={{
                        width: '110px', flexShrink: 0,
                        overflow: 'hidden',
                        borderLeft: '1px solid rgba(255,255,255,0.12)',
                      }}>
                        <img
                          src="/doctor-photo.png"
                          alt="د. وسام يوسف"
                          style={{
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                            objectPosition: '60% top',
                            display: 'block',
                          }}
                        />
                      </div>

                      <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ color: 'white', fontWeight: 900, fontSize: '16px', marginBottom: '3px', lineHeight: 1.2 }}>
                          د. وسام يوسف
                        </div>
                        <div style={{
                          color: '#93c5fd', fontSize: '11px', fontWeight: 700,
                          marginBottom: '12px', letterSpacing: '0.3px',
                        }}>
                          أخصائي تقويم الأسنان — بني مزار، المنيا
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {[
                            { label: 'التخصص', val: 'Orthodontist' },
                            { label: 'الجوال', val: '01156798324' },
                            { label: 'العيادة', val: 'المنيا، بني مزار' },
                          ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px', minWidth: '42px' }}>
                                {item.label}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '9.5px', fontWeight: 600 }}>
                                {item.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(0,0,0,0.25)',
                      padding: '7px 18px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', letterSpacing: '2px' }}>
                        DR-WESSAM-CLINIC
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[...Array(8)].map((_, i) => (
                          <div key={i} style={{
                            width: i % 3 === 0 ? '3px' : '1.5px',
                            height: '14px',
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '1px',
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ec-face ec-back" style={{
                    background: 'white',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '12px', padding: '20px',
                    border: '2px solid #e2e8f0',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, height: '8px',
                      background: 'linear-gradient(90deg, #0f2557, #1e56c8, #0f2557)',
                    }} />

                    <img src="/logo-transparent.png" alt="لوجو" style={{
                      width: '42px', height: '42px', objectFit: 'contain',
                    }} />

                    {loading ? (
                      <div style={{ color: '#94a3b8', fontSize: '13px' }}>جاري التحميل...</div>
                    ) : qrToken ? (
                      <div style={{
                        padding: '8px', background: 'white',
                        borderRadius: '10px', border: '2px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}>
                        <QRCodeSVG
                          value={qrValue}
                          size={90}
                          level="M"
                          includeMargin={false}
                          fgColor="#0f2557"
                        />
                      </div>
                    ) : (
                      <div style={{ color: '#94a3b8', fontSize: '11px', textAlign: 'center' }}>
                        لم يتم إنشاء الباركود بعد
                      </div>
                    )}

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>د. وسام يوسف</div>
                      <div style={{ color: '#2563eb', fontSize: '10px', fontWeight: 600 }}>أخصائي تقويم الأسنان | بني مزار، المنيا</div>
                      <div style={{ color: '#94a3b8', fontSize: '9px', marginTop: '3px' }}>امسح الباركود لتسجيل الدخول</div>
                    </div>

                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0, height: '8px',
                      background: 'linear-gradient(90deg, #0f2557, #1e56c8, #0f2557)',
                    }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiRotateCcw size={13} color="#94a3b8" />
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>انقر على البطاقة لقلبها</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{
                background: 'white', borderRadius: '16px', padding: '20px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>
                  🔐 باركود الدخول
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
                  الباركود يُستخدم لتسجيل الدخول الفوري بمجرد المسح.
                  {!qrToken && ' قم بإنشائه أولاً.'}
                </p>

                {qrToken && (
                  <div style={{
                    background: '#f0fdf4', borderRadius: '10px', padding: '10px 14px',
                    border: '1px solid #bbf7d0', marginBottom: '14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    <span style={{ fontSize: '18px' }}>✅</span>
                    <span style={{ color: '#166534', fontSize: '13px', fontWeight: 600 }}>
                      الباركود جاهز ومفعّل
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={generateQr}
                    disabled={generating}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: qrToken ? '#f1f5f9' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: qrToken ? '#475569' : 'white',
                      border: qrToken ? '1.5px solid #e2e8f0' : 'none',
                      padding: '11px 20px', borderRadius: '10px',
                      fontSize: '14px', fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer',
                      fontFamily: 'Cairo, sans-serif', opacity: generating ? 0.6 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <FiRefreshCw size={15} style={{ animation: generating ? 'spin 1s linear infinite' : 'none' }} />
                    {generating ? 'جاري الإنشاء...' : qrToken ? 'تجديد الباركود' : 'إنشاء الباركود'}
                  </button>

                  <button
                    onClick={handlePrint}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                      color: 'white', border: 'none',
                      padding: '11px 20px', borderRadius: '10px',
                      fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif', transition: 'all 0.2s',
                    }}
                  >
                    <FiPrinter size={15} />
                    طباعة البطاقة
                  </button>
                </div>
              </div>

              <div style={{
                background: '#fffbeb', borderRadius: '14px', padding: '16px',
                border: '1px solid #fde68a',
              }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400e', marginBottom: '8px' }}>
                  💡 تعليمات الاستخدام
                </div>
                <ul style={{ margin: 0, padding: '0 16px 0 0', color: '#78350f', fontSize: '12.5px', lineHeight: 2 }}>
                  <li>افتح صفحة تسجيل الدخول على أي جهاز</li>
                  <li>اضغط على زر "دخول بالباركود"</li>
                  <li>اسمح بالكاميرا ثم وجّهها نحو الباركود</li>
                  <li>يتم الدخول فوراً بدون كلمة مرور</li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}
