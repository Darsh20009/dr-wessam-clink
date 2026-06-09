import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPrinter, FiRotateCcw, FiArrowRight } from 'react-icons/fi';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
  .pc-root { font-family: 'Cairo', sans-serif; direction: rtl; }

  .pc-card-scene {
    width: 380px; height: 260px;
    perspective: 1000px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .pc-card-inner {
    width: 100%; height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 20px;
  }
  .pc-card-inner.flipped { transform: rotateY(180deg); }

  .pc-face {
    position: absolute; inset: 0;
    border-radius: 20px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(4,60,80,0.35), 0 4px 16px rgba(0,0,0,0.15);
  }
  .pc-back { transform: rotateY(180deg); }

  @media print {
    body * { visibility: hidden !important; }
    .pc-print-area, .pc-print-area * { visibility: visible !important; }
    .pc-print-area {
      position: fixed !important; top: 0; left: 0;
      width: 100vw; display: flex;
      justify-content: center; align-items: flex-start;
      padding: 40px; gap: 40px;
      background: white !important;
    }
    .pc-card-scene { break-inside: avoid; }
    .pc-card-inner { transform: none !important; box-shadow: none !important; }
    .pc-face { position: relative !important; }
    .pc-back { transform: none !important; margin-top: 24px; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const STATUS_COLORS = {
  paid:    { bg:'#dcfce7', color:'#15803d', label:'مسدد بالكامل' },
  partial: { bg:'#fef9c3', color:'#854d0e', label:'جزئي' },
  overdue: { bg:'#fee2e2', color:'#dc2626', label:'متأخر' },
  pending: { bg:'#f1f5f9', color:'#475569', label:'معلق' },
};

export default function PatientCard() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [patient, setPatient]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [flipped, setFlipped]   = useState(false);
  const appUrl = window.location.origin;

  useEffect(() => {
    axios.get(`/patients/${id}`)
      .then(r => setPatient(r.data))
      .catch(() => toast.error('خطأ في تحميل بيانات المريض'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  const qrValue = patient ? `${appUrl}/login?patientId=${id}&phone=${patient.phone}` : 'no-data';
  const photoSrc = patient?.user?.avatar || null;
  const statusInfo = STATUS_COLORS[patient?.financials?.status] || STATUS_COLORS.pending;
  const remaining = Math.max(0, (patient?.financials?.totalCost || 0) - (patient?.financials?.totalPaid || 0));
  const initial = patient?.fullName?.[0] || '؟';

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16, background:'#f0f6ff', fontFamily:'Cairo, sans-serif' }}>
      <div style={{ width:44, height:44, border:'4px solid #dbeafe', borderTopColor:'#2563eb', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <span style={{ color:'#64748b' }}>جاري تحميل بيانات المريض...</span>
    </div>
  );

  if (!patient) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Cairo, sans-serif', color:'#94a3b8', fontSize:16 }}>
      لم يتم العثور على المريض
    </div>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="pc-root" style={{
        minHeight:'100vh', background:'linear-gradient(135deg,#f0f6ff 0%,#e0f2fe 100%)',
        padding:'36px 24px', display:'flex', flexDirection:'column', alignItems:'center',
      }}>
        <div style={{ width:'100%', maxWidth:'860px' }}>

          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <button onClick={() => navigate(`/doctor/patients/${id}`)}
              style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', color:'#64748b', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Cairo, sans-serif', marginBottom:12, padding:0 }}>
              <FiArrowRight size={16} /> رجوع لملف المريض
            </button>
            <h1 style={{ fontSize:26, fontWeight:900, color:'#0f172a', marginBottom:6, display:'flex', alignItems:'center', gap:10 }}>
              🪪 بطاقة المريض
            </h1>
            <p style={{ color:'#64748b', fontSize:14 }}>
              انقر على البطاقة لقلبها — الوجه الأمامي يحوي بيانات المريض، والخلفي يحوي باركود الملف
            </p>
          </div>

          <div style={{ display:'flex', gap:40, flexWrap:'wrap', alignItems:'flex-start' }}>

            {/* ── Card ── */}
            <div className="pc-print-area" style={{ display:'flex', flexDirection:'column', gap:16, alignItems:'center' }}>
              <div className="pc-card-scene" onClick={() => setFlipped(f => !f)}>
                <div className={`pc-card-inner${flipped ? ' flipped' : ''}`}>

                  {/* ── FRONT ── */}
                  <div className="pc-face" style={{
                    background:'linear-gradient(145deg, #064e3b 0%, #065f46 40%, #047857 80%, #0e9f6e 100%)',
                    display:'flex', flexDirection:'column',
                  }}>
                    {/* decorative */}
                    <div style={{ position:'absolute', top:-50, right:-50, width:220, height:220, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.06)', pointerEvents:'none' }} />
                    <div style={{ position:'absolute', bottom:-60, left:-40, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />

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
                        PATIENT ID
                      </div>
                    </div>

                    {/* body: photo + info */}
                    <div style={{ flex:1, display:'flex', alignItems:'stretch', overflow:'hidden' }}>
                      {/* photo or logo */}
                      <div style={{ width:130, flexShrink:0, overflow:'hidden', borderLeft:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.15)' }}>
                        {photoSrc ? (
                          <img src={photoSrc} alt={patient.fullName} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top', display:'block' }} />
                        ) : (
                          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:12 }}>
                            <img src="/logo-transparent.png" alt="لوجو" style={{ width:52, height:52, objectFit:'contain', opacity:0.85 }} />
                            <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:22, fontWeight:900 }}>
                              {initial}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* info */}
                      <div style={{ flex:1, padding:'14px 16px', display:'flex', flexDirection:'column', justifyContent:'center', gap:5 }}>
                        <div style={{ color:'white', fontWeight:900, fontSize:'17px', lineHeight:1.2 }}>{patient.fullName}</div>
                        <div style={{ display:'inline-flex', alignSelf:'flex-start', background:statusInfo.bg, color:statusInfo.color, fontSize:'9px', fontWeight:800, borderRadius:99, padding:'2px 8px', marginBottom:8 }}>
                          {statusInfo.label}
                        </div>
                        {[
                          { label:'الجوال',  val: patient.phone },
                          { label:'العمر',   val: patient.age ? `${patient.age} سنة` : '—' },
                          { label:'التكلفة', val: `${(patient.financials?.totalCost||0).toLocaleString()} ج.م` },
                          { label:'المتبقي', val: remaining > 0 ? `${remaining.toLocaleString()} ج.م` : '✅ مسدد' },
                        ].map((r, i) => (
                          <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <span style={{ color:'rgba(255,255,255,0.4)', fontSize:'9px', minWidth:44 }}>{r.label}</span>
                            <span style={{ color: r.label==='المتبقي' && remaining>0 ? '#fca5a5' : 'rgba(255,255,255,0.88)', fontSize:'10px', fontWeight:700 }}>{r.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* bottom stripe */}
                    <div style={{ background:'rgba(0,0,0,0.3)', padding:'8px 20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <span style={{ color:'rgba(255,255,255,0.35)', fontSize:'8px', letterSpacing:'2px' }}>DR-WESSAM-CLINIC • PATIENT</span>
                      <div style={{ display:'flex', gap:3 }}>
                        {[...Array(10)].map((_, i) => (
                          <div key={i} style={{ width:i%3===0?4:2, height:16, background:'rgba(255,255,255,0.25)', borderRadius:1 }} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ── BACK ── */}
                  <div className="pc-face pc-back" style={{
                    background:'white', display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                    gap:12, padding:'22px 20px', border:'2px solid #e2e8f0',
                  }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:10, background:'linear-gradient(90deg,#064e3b,#047857,#064e3b)' }} />
                    <img src="/logo-transparent.png" alt="لوجو" style={{ width:44, height:44, objectFit:'contain' }} />
                    <div style={{ padding:10, background:'white', borderRadius:12, border:'2px solid #e2e8f0', boxShadow:'0 2px 10px rgba(0,0,0,0.08)' }}>
                      <QRCodeSVG value={qrValue} size={108} level="M" includeMargin={false} fgColor="#064e3b" />
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <div style={{ fontWeight:900, color:'#0f172a', fontSize:14 }}>{patient.fullName}</div>
                      <div style={{ color:'#047857', fontSize:11, fontWeight:700 }}>مريض — عيادة د. وسام يوسف</div>
                      <div style={{ color:'#94a3b8', fontSize:9, marginTop:4 }}>امسح الباركود لعرض ملف المريض</div>
                    </div>
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:10, background:'linear-gradient(90deg,#064e3b,#047857,#064e3b)' }} />
                  </div>

                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <FiRotateCcw size={13} color="#94a3b8" />
                <span style={{ fontSize:12, color:'#94a3b8' }}>انقر على البطاقة لقلبها</span>
              </div>
            </div>

            {/* ── Info & Controls ── */}
            <div style={{ flex:1, minWidth:'260px', display:'flex', flexDirection:'column', gap:16 }}>

              {/* Patient summary */}
              <div style={{ background:'white', borderRadius:18, padding:22, border:'1px solid #e2e8f0', boxShadow:'0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16, paddingBottom:14, borderBottom:'1px solid #f1f5f9' }}>
                  <div style={{ width:54, height:54, borderRadius:'50%', overflow:'hidden', background:'linear-gradient(135deg,#047857,#0e9f6e)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'2px solid #d1fae5' }}>
                    {photoSrc
                      ? <img src={photoSrc} alt={patient.fullName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <img src="/logo-transparent.png" alt="لوجو" style={{ width:32, height:32, objectFit:'contain' }} />
                    }
                  </div>
                  <div>
                    <div style={{ fontWeight:900, fontSize:17, color:'#0f172a' }}>{patient.fullName}</div>
                    <div style={{ fontSize:13, color:'#64748b' }}>{patient.phone}</div>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                  {[
                    { label:'التكلفة الكلية', val:`${(patient.financials?.totalCost||0).toLocaleString()} ج.م`, color:'#1e293b' },
                    { label:'المدفوع',        val:`${(patient.financials?.totalPaid||0).toLocaleString()} ج.م`, color:'#047857' },
                    { label:'المتبقي',        val:`${remaining.toLocaleString()} ج.م`, color: remaining>0?'#dc2626':'#047857' },
                    { label:'الحالة',         val:statusInfo.label, color:statusInfo.color },
                  ].map((s,i) => (
                    <div key={i} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 12px', border:'1px solid #e2e8f0' }}>
                      <div style={{ fontSize:10, color:'#94a3b8', marginBottom:2 }}>{s.label}</div>
                      <div style={{ fontWeight:800, fontSize:14, color:s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                <button onClick={handlePrint}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', background:'linear-gradient(135deg,#064e3b,#047857)', color:'white', border:'none', padding:'13px 20px', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'Cairo, sans-serif' }}>
                  <FiPrinter size={15} /> طباعة بطاقة المريض
                </button>
              </div>

              {/* Note */}
              <div style={{ background:'#f0fdf4', borderRadius:14, padding:16, border:'1px solid #bbf7d0' }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#166534', marginBottom:8 }}>💡 معلومات البطاقة</div>
                <ul style={{ margin:0, padding:'0 16px 0 0', color:'#14532d', fontSize:'12.5px', lineHeight:2 }}>
                  <li>الباركود يحتوي على بيانات تعريف المريض</li>
                  <li>يمكن طباعتها وتسليمها للمريض كهوية</li>
                  <li>لو المريض ليس لديه صورة، تظهر شعار العيادة</li>
                  <li>تُستخدم في الاستقبال للتعرف السريع</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
