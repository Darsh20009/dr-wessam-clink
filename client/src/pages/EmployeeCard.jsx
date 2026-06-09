import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiPrinter, FiRotateCcw } from 'react-icons/fi';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
  .ec-root { font-family: 'Cairo', sans-serif; direction: rtl; }

  .ec-card-scene {
    width: 380px; height: 260px;
    perspective: 1000px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .ec-card-inner {
    width: 100%; height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px;
  }
  .ec-card-inner.flipped { transform: rotateY(180deg); }

  .ec-face {
    position: absolute; inset: 0;
    border-radius: 20px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(15,37,87,0.35), 0 4px 16px rgba(0,0,0,0.15);
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
    .ec-card-inner { transform: none !important; box-shadow: none !important; }
    .ec-face { position: relative !important; }
    .ec-back { transform: none !important; margin-top: 24px; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes shimmer { 0%{opacity:0.6} 50%{opacity:1} 100%{opacity:0.6} }
`;

export default function EmployeeCard() {
  const [qrToken, setQrToken]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [flipped, setFlipped]       = useState(false);
  const user   = JSON.parse(localStorage.getItem('user') || '{}');
  const appUrl = window.location.origin;

  useEffect(() => { fetchQrToken(); }, []);

  const fetchQrToken = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/auth/me');
      if (data.qrToken) setQrToken(data.qrToken);
    } catch {}
    setLoading(false);
  };

  const generateQr = async () => {
    setGenerating(true);
    try {
      const { data } = await axios.post('/auth/qr-generate');
      setQrToken(data.qrToken);
      toast.success('تم إنشاء الباركود بنجاح');
    } catch { toast.error('خطأ في إنشاء الباركود'); }
    setGenerating(false);
  };

  const handlePrint = () => window.print();
  const qrValue = qrToken ? `${appUrl}/login?qr=${qrToken}` : 'no-token';

  return (
    <>
      <style>{STYLE}</style>
      <div className="ec-root" style={{
        minHeight: '100vh', background: 'linear-gradient(135deg,#f0f6ff 0%,#e8eeff 100%)',
        padding: '36px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: '860px' }}>

          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: 10 }}>
              🪪 بطاقة الطبيب
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              انقر على البطاقة لقلبها — الوجه الأمامي يحوي بياناتك، والخلفي يحوي باركود الدخول
            </p>
          </div>

          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

            {/* ── Card ── */}
            <div className="ec-print-area" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <div className="ec-card-scene" onClick={() => setFlipped(f => !f)}>
                <div className={`ec-card-inner${flipped ? ' flipped' : ''}`}>

                  {/* ── FRONT ── */}
                  <div className="ec-face" style={{
                    background: 'linear-gradient(145deg, #0a1f5c 0%, #1440a8 55%, #1e6fe0 100%)',
                    display: 'flex', flexDirection: 'column',
                  }}>
                    {/* decorative circles */}
                    <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', top:-70, right:-70, width:300, height:300, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.04)', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', bottom:-50, left:-30, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

                    {/* top bar */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <img src="/logo-transparent.png" alt="لوجو" style={{ width:38, height:38, objectFit:'contain', background:'white', borderRadius:10, padding:3 }} />
                        <div>
                          <div style={{ color:'white', fontWeight:900, fontSize:'12px', lineHeight:1.2 }}>عيادة د. وسام يوسف</div>
                          <div style={{ color:'rgba(255,255,255,0.55)', fontSize:'9px', letterSpacing:'0.5px' }}>ORTHODONTIC CLINIC</div>
                        </div>
                      </div>
                      <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:8, padding:'5px 10px', color:'rgba(255,255,255,0.85)', fontSize:'9px', fontWeight:800, letterSpacing:'1px' }}>
                        DOCTOR ID
                      </div>
                    </div>

                    {/* body: photo + info */}
                    <div style={{ flex:1, display:'flex', alignItems:'stretch', overflow:'hidden' }}>
                      {/* photo */}
                      <div style={{ width:130, flexShrink:0, overflow:'hidden', borderLeft:'1px solid rgba(255,255,255,0.1)' }}>
                        <img
                          src="/doctor-photo.png"
                          alt="د. وسام يوسف"
                          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'60% top', display:'block' }}
                          onError={e => { e.target.src='/logo-transparent.png'; e.target.style.objectFit='contain'; e.target.style.padding='20px'; e.target.style.background='rgba(255,255,255,0.08)'; }}
                        />
                      </div>

                      {/* info */}
                      <div style={{ flex:1, padding:'14px 18px', display:'flex', flexDirection:'column', justifyContent:'center', gap:4 }}>
                        <div style={{ color:'white', fontWeight:900, fontSize:'18px', lineHeight:1.2 }}>د. وسام يوسف</div>
                        <div style={{ color:'#93c5fd', fontSize:'11px', fontWeight:700, marginBottom:10 }}>أخصائي تقويم الأسنان</div>
                        {[
                          { label:'التخصص', val:'Orthodontist' },
                          { label:'الجوال',  val:'01156798324' },
                          { label:'العيادة', val:'المنيا، بني مزار' },
                          { label:'رقم الترخيص', val:'EG-ORTH-2024' },
                        ].map((r, i) => (
                          <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'9px', minWidth:52 }}>{r.label}</span>
                            <span style={{ color:'rgba(255,255,255,0.88)', fontSize:'10px', fontWeight:700 }}>{r.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* bottom stripe */}
                    <div style={{ background:'rgba(0,0,0,0.3)', padding:'8px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'8px', letterSpacing:'2.5px' }}>DR-WESSAM-CLINIC • 2024</span>
                      <div style={{ display:'flex', gap:3 }}>
                        {[...Array(10)].map((_, i) => (
                          <div key={i} style={{ width: i%3===0?4:2, height:16, background:'rgba(255,255,255,0.25)', borderRadius:1 }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── BACK ── */}
                  <div className="ec-face ec-back" style={{
                    background:'white', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    gap:14, padding:'24px 20px',
                    border:'2px solid #e2e8f0',
                  }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:10, background:'linear-gradient(90deg,#0a1f5c,#1e6fe0,#0a1f5c)' }} />
                    <img src="/logo-transparent.png" alt="لوجو" style={{ width:48, height:48, objectFit:'contain' }} />
                    {loading ? (
                      <div style={{ color:'#94a3b8', fontSize:13 }}>جاري التحميل...</div>
                    ) : qrToken ? (
                      <div style={{ padding:10, background:'white', borderRadius:12, border:'2px solid #e2e8f0', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' }}>
                        <QRCodeSVG value={qrValue} size={110} level="M" includeMargin={false} fgColor="#0a1f5c" />
                      </div>
                    ) : (
                      <div style={{ color:'#94a3b8', fontSize:11, textAlign:'center' }}>لم يتم إنشاء الباركود بعد</div>
                    )}
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:900, color:'#0f172a', fontSize:14 }}>د. وسام يوسف</div>
                      <div style={{ color:'#2563eb', fontSize:11, fontWeight:700 }}>أخصائي تقويم الأسنان | بني مزار، المنيا</div>
                      <div style={{ color:'#94a3b8', fontSize:9, marginTop:4 }}>امسح الباركود لتسجيل الدخول الفوري</div>
                    </div>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:10, background:'linear-gradient(90deg,#0a1f5c,#1e6fe0,#0a1f5c)' }} />
                  </div>

                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <FiRotateCcw size={13} color="#94a3b8" />
                <span style={{ fontSize:12, color:'#94a3b8' }}>انقر على البطاقة لقلبها</span>
              </div>
            </div>

            {/* ── Controls ── */}
            <div style={{ flex:1, minWidth:'260px', display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:'white', borderRadius:18, padding:22, border:'1px solid #e2e8f0', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontWeight:800, fontSize:16, color:'#0f172a', marginBottom:6 }}>🔐 باركود الدخول</div>
                <p style={{ color:'#64748b', fontSize:13, lineHeight:1.7, marginBottom:16 }}>
                  الباركود يُستخدم لتسجيل الدخول الفوري بمجرد المسح.{!qrToken && ' قم بإنشائه أولاً.'}
                </p>
                {qrToken && (
                  <div style={{ background:'#f0fdf4', borderRadius:10, padding:'10px 14px', border:'1px solid #bbf7d0', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:18 }}>✅</span>
                    <span style={{ color:'#166534', fontSize:13, fontWeight:700 }}>الباركود جاهز ومفعّل</span>
                  </div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <button onClick={generateQr} disabled={generating}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background: qrToken?'#f1f5f9':'linear-gradient(135deg,#2563eb,#1d4ed8)', color:qrToken?'#475569':'white', border:qrToken?'1.5px solid #e2e8f0':'none', padding:'12px 20px', borderRadius:12, fontSize:14, fontWeight:700, cursor:generating?'not-allowed':'pointer', fontFamily:'Cairo, sans-serif', opacity:generating?0.6:1, transition:'all 0.2s' }}>
                    <FiRefreshCw size={15} style={{ animation:generating?'spin 1s linear infinite':'none' }} />
                    {generating ? 'جاري الإنشاء...' : qrToken ? 'تجديد الباركود' : 'إنشاء الباركود'}
                  </button>
                  <button onClick={handlePrint}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#0f172a,#1e293b)', color:'white', border:'none', padding:'12px 20px', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Cairo, sans-serif' }}>
                    <FiPrinter size={15} /> طباعة البطاقة
                  </button>
                </div>
              </div>

              <div style={{ background:'#fffbeb', borderRadius:16, padding:18, border:'1px solid #fde68a' }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#92400e', marginBottom:8 }}>💡 تعليمات الاستخدام</div>
                <ul style={{ margin:0, padding:'0 16px 0 0', color:'#78350f', fontSize:'12.5px', lineHeight:2 }}>
                  <li>افتح صفحة تسجيل الدخول على أي جهاز</li>
                  <li>اضغط على زر "دخول بالباركود"</li>
                  <li>اسمح بالكاميرا ثم وجّهها نحو الباركود</li>
                  <li>يتم الدخول فوراً بدون كلمة مرور</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
