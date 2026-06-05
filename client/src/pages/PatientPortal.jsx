import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FiLogOut, FiCalendar, FiDollarSign, FiFileText, FiImage, FiUser, FiActivity } from 'react-icons/fi';

export default function PatientPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.patientId) return;
    Promise.all([
      axios.get(`/patients/${user.patientId}`),
      axios.get('/appointments'),
      axios.get('/sessions'),
    ]).then(([pRes, aRes, sRes]) => {
      setPatient(pRes.data);
      setAppointments(aRes.data.filter(a => a.status === 'scheduled'));
      setSessions(sRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!patient) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
      <h2>لا يوجد ملف طبي مرتبط بحسابك</h2>
      <button className="btn btn-primary" onClick={handleLogout}>تسجيل الخروج</button>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: <FiActivity /> },
    { id: 'file', label: 'الملف الطبي', icon: <FiFileText /> },
    { id: 'images', label: 'الصور والأشعة', icon: <FiImage /> },
    { id: 'sessions', label: 'الجلسات', icon: <FiCalendar /> },
    { id: 'financial', label: 'المدفوعات', icon: <FiDollarSign /> },
  ];

  const statusBadge = (status) => {
    const map = { paid: ['badge-success', 'مدفوع بالكامل'], partial: ['badge-warning', 'مدفوع جزئياً'], overdue: ['badge-danger', 'متأخر'], pending: ['badge-gray', 'معلق'] };
    const [cls, label] = map[status] || ['badge-gray', status];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #1e40af)', padding: '20px 24px', color: 'white' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/logo.png" alt="logo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '18px' }}>أهلاً {patient.fullName}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>بوابة المريض - عيادة د. وسام يوسف</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiLogOut /> خروج
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              flex: '1', minWidth: '100px', padding: '10px 12px', border: 'none', borderRadius: '8px',
              background: activeTab === t.id ? '#2563eb' : 'transparent',
              color: activeTab === t.id ? 'white' : '#64748b',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="stat-card">
                <div className="stat-icon green"><FiDollarSign /></div>
                <div>
                  <div className="stat-value">{(patient.financials?.totalPaid || 0).toLocaleString()}</div>
                  <div className="stat-label">المبلغ المدفوع (ج.م)</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon red"><FiDollarSign /></div>
                <div>
                  <div className="stat-value">{(patient.financials?.remaining || 0).toLocaleString()}</div>
                  <div className="stat-label">المبلغ المتبقي (ج.م)</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue"><FiCalendar /></div>
                <div>
                  <div className="stat-value">{appointments.length}</div>
                  <div className="stat-label">مواعيد قادمة</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon purple"><FiActivity /></div>
                <div>
                  <div className="stat-value">{sessions.length}</div>
                  <div className="stat-label">جلسات علاج</div>
                </div>
              </div>
            </div>

            {/* Next appointment */}
            {appointments.length > 0 && (
              <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)' }}>
                <h3 className="section-title"><FiCalendar /> موعدك القادم</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: '#2563eb', color: 'white', borderRadius: '12px', padding: '16px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '28px', fontWeight: 900 }}>{format(new Date(appointments[0].date), 'd')}</div>
                    <div style={{ fontSize: '13px', opacity: 0.9 }}>{format(new Date(appointments[0].date), 'MMM', { locale: ar })}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{format(new Date(appointments[0].date), 'EEEE', { locale: ar })}</div>
                    <div style={{ color: '#64748b' }}>{appointments[0].time} - {appointments[0].type}</div>
                    {appointments[0].notes && <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>{appointments[0].notes}</div>}
                  </div>
                </div>
              </div>
            )}

            {/* Financial summary */}
            <div className="card">
              <h3 className="section-title"><FiDollarSign /> الملخص المالي</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#64748b' }}>حالة الحساب:</span>
                {statusBadge(patient.financials?.status)}
              </div>
              {[
                ['إجمالي تكلفة العلاج', patient.financials?.totalCost],
                ['المبلغ المدفوع', patient.financials?.totalPaid],
                ['المبلغ المتبقي', patient.financials?.remaining],
              ].map(([label, val], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <span style={{ fontWeight: 700, color: i === 2 && val > 0 ? '#ef4444' : i === 1 ? '#10b981' : '#1e293b' }}>
                    {(val || 0).toLocaleString()} ج.م
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medical File */}
        {activeTab === 'file' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card">
              <h3 className="section-title"><FiUser /> البيانات الشخصية</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  ['الاسم الكامل', patient.fullName],
                  ['رقم الجوال', patient.phone],
                  ['العمر', patient.age ? `${patient.age} سنة` : '-'],
                  ['العنوان', patient.address || '-'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{k}</div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {patient.diagnosis && (
              <div className="card">
                <h3 className="section-title">التشخيص</h3>
                <p style={{ color: '#475569', lineHeight: 1.8 }}>{patient.diagnosis}</p>
              </div>
            )}
            {patient.treatmentPlan && (
              <div className="card">
                <h3 className="section-title">خطة العلاج</h3>
                <p style={{ color: '#475569', lineHeight: 1.8 }}>{patient.treatmentPlan}</p>
              </div>
            )}
          </div>
        )}

        {/* Images */}
        {activeTab === 'images' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {patient.faceImages?.length > 0 && (
              <div className="card">
                <h3 className="section-title">صور الوجه الخارجية</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                  {patient.faceImages.map((img, i) => (
                    <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={img.url} alt={img.type} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                      <div style={{ padding: '8px', fontSize: '12px', color: '#64748b' }}>{img.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {patient.xrays?.length > 0 && (
              <div className="card">
                <h3 className="section-title">الأشعة</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {patient.xrays.map((x, i) => (
                    <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={x.url} alt={x.type} style={{ width: '100%', height: '160px', objectFit: 'cover', background: '#1e293b' }} />
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{x.type === 'panorama' ? 'بانوراما' : x.type === 'lateral' ? 'جانبية' : 'CBCT'}</div>
                        {x.description && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{x.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!patient.faceImages?.length && !patient.xrays?.length && (
              <div className="empty-state card"><p>لا توجد صور أو أشعة بعد</p></div>
            )}
          </div>
        )}

        {/* Sessions */}
        {activeTab === 'sessions' && (
          sessions.length === 0 ? (
            <div className="empty-state card"><p>لا توجد جلسات بعد</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sessions.map((s, i) => (
                <div key={s._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '16px' }}>جلسة #{s.sessionNumber || i + 1}</h3>
                      <p style={{ color: '#64748b', fontSize: '13px' }}>{format(new Date(s.sessionDate), 'EEEE d MMMM yyyy', { locale: ar })}</p>
                    </div>
                    {s.amountPaid > 0 && <span className="badge badge-success">{s.amountPaid.toLocaleString()} ج.م</span>}
                  </div>
                  {s.notes && <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '12px' }}>{s.notes}</p>}
                  {s.nextStep && (
                    <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '12px', border: '1px solid #bae6fd' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0369a1', marginBottom: '4px' }}>الخطوة القادمة:</div>
                      <p style={{ color: '#0c4a6e', fontSize: '14px' }}>{s.nextStep}</p>
                    </div>
                  )}
                  {s.nextAppointment && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2563eb', fontWeight: 600, fontSize: '13px' }}>
                      <FiCalendar />
                      موعد المتابعة: {format(new Date(s.nextAppointment), 'd MMMM yyyy', { locale: ar })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* Financial */}
        {activeTab === 'financial' && (
          <div className="card">
            <h3 className="section-title"><FiDollarSign /> التفاصيل المالية</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                ['إجمالي تكلفة العلاج', patient.financials?.totalCost, '#1e293b'],
                ['المبلغ المقدم', patient.financials?.initialPayment, '#10b981'],
                ['إجمالي المدفوع', patient.financials?.totalPaid, '#10b981'],
                ['المبلغ المتبقي', patient.financials?.remaining, '#ef4444'],
              ].map(([label, val, color], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', color }}>{(val || 0).toLocaleString()} ج.م</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>حالة الحساب:</span>
              {statusBadge(patient.financials?.status)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
