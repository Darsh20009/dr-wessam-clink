import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  FiArrowRight, FiSave, FiPlus, FiTrash2, FiUpload,
  FiDollarSign, FiCalendar, FiImage, FiFileText, FiActivity, FiEdit2
} from 'react-icons/fi';

const tabs = [
  { id: 'info', label: 'البيانات', icon: <FiFileText /> },
  { id: 'diagnosis', label: 'التشخيص', icon: <FiActivity /> },
  { id: 'images', label: 'الصور', icon: <FiImage /> },
  { id: 'xrays', label: 'الأشعة', icon: <FiImage /> },
  { id: 'sessions', label: 'الجلسات', icon: <FiCalendar /> },
  { id: 'financial', label: 'المالية', icon: <FiDollarSign /> },
];

export default function PatientFile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({ sessionDate: '', notes: '', nextStep: '', nextAppointment: '', amountPaid: '', remainingAmount: '' });
  const [showPayment, setShowPayment] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', notes: '' });
  const fileInputRef = useRef();
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadType, setUploadType] = useState('');

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get(`/patients/${id}`),
        axios.get(`/sessions?patientId=${id}`),
      ]);
      setPatient(pRes.data);
      setForm({ ...pRes.data, financials: { ...pRes.data.financials } });
      setSessions(sRes.data);
    } catch { toast.error('خطأ في تحميل الملف'); navigate('/doctor/patients'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setFinancial = (k, v) => setForm(f => ({ ...f, financials: { ...f.financials, [k]: parseFloat(v) || 0 } }));
  const setS = (k, v) => setSessionForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const totalCost = form.financials?.totalCost || 0;
      const totalPaid = form.financials?.totalPaid || 0;
      const updates = {
        ...form,
        financials: {
          ...form.financials,
          remaining: totalCost - totalPaid,
          status: totalPaid >= totalCost && totalCost > 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending',
        },
      };
      const res = await axios.put(`/patients/${id}`, updates);
      setPatient(res.data);
      setForm(res.data);
      toast.success('تم الحفظ');
      setEditMode(false);
    } catch { toast.error('خطأ في الحفظ'); }
    setSaving(false);
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.sessionDate) return toast.error('يرجى إدخال تاريخ الجلسة');
    try {
      await axios.post('/sessions', {
        patientId: id,
        sessionDate: sessionForm.sessionDate,
        notes: sessionForm.notes,
        nextStep: sessionForm.nextStep,
        nextAppointment: sessionForm.nextAppointment || undefined,
        amountPaid: parseFloat(sessionForm.amountPaid) || 0,
        remainingAmount: parseFloat(sessionForm.remainingAmount) || 0,
      });
      if (parseFloat(sessionForm.amountPaid) > 0) {
        await axios.post('/payments', {
          patientId: id, patientName: patient.fullName,
          amount: parseFloat(sessionForm.amountPaid), type: 'session', method: 'cash',
          notes: `جلسة ${format(new Date(sessionForm.sessionDate), 'd/M/yyyy')}`,
        });
      }
      toast.success('تم إضافة الجلسة');
      setShowAddSession(false);
      setSessionForm({ sessionDate: '', notes: '', nextStep: '', nextAppointment: '', amountPaid: '', remainingAmount: '' });
      fetchData();
    } catch { toast.error('خطأ في إضافة الجلسة'); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payForm.amount) return toast.error('يرجى إدخال المبلغ');
    try {
      await axios.post('/payments', {
        patientId: id, patientName: patient.fullName,
        amount: parseFloat(payForm.amount), type: 'partial',
        method: payForm.method, notes: payForm.notes,
      });
      toast.success('تم تسجيل الدفع');
      setShowPayment(false);
      setPayForm({ amount: '', method: 'cash', notes: '' });
      fetchData();
    } catch { toast.error('خطأ'); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await axios.post(`/patients/${id}/images`, {
        category: uploadCategory,
        imageData: { type: uploadType, url: res.data.url, notes: '' },
      });
      toast.success('تم رفع الصورة');
      fetchData();
    } catch { toast.error('فشل رفع الصورة'); }
  };

  const triggerUpload = (cat, type) => {
    setUploadCategory(cat);
    setUploadType(type);
    fileInputRef.current?.click();
  };

  const deleteSession = async (sid) => {
    if (!confirm('حذف الجلسة؟')) return;
    try { await axios.delete(`/sessions/${sid}`); fetchData(); toast.success('تم الحذف'); }
    catch { toast.error('خطأ'); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!patient) return null;

  const remaining = patient.financials?.remaining || 0;
  const statusMap = { paid: 'badge-success', partial: 'badge-warning', overdue: 'badge-danger', pending: 'badge-gray' };
  const statusLabel = { paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر', pending: 'معلق' };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: '12px' }} onClick={() => navigate('/doctor/patients')}>
          <FiArrowRight /> رجوع للمرضى
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title">{patient.fullName}</h1>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>📱 {patient.phone}</span>
              {patient.age && <span style={{ color: '#64748b', fontSize: '14px' }}>🎂 {patient.age} سنة</span>}
              <span className={`badge ${statusMap[patient.financials?.status]}`}>{statusLabel[patient.financials?.status]}</span>
              {remaining > 0 && <span className="badge badge-danger">متبقي: {remaining.toLocaleString()} ج.م</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {!editMode ? (
              <button className="btn btn-secondary" onClick={() => setEditMode(true)}><FiEdit2 /> تعديل</button>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => { setEditMode(false); setForm({ ...patient, financials: { ...patient.financials } }); }}>إلغاء</button>
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}><FiSave /> {saving ? 'جاري...' : 'حفظ'}</button>
              </>
            )}
            <button className="btn btn-success" onClick={() => setShowPayment(true)}><FiDollarSign /> تسجيل دفع</button>
            <button className="btn btn-primary" onClick={() => { setShowAddSession(true); setActiveTab('sessions'); }}><FiPlus /> جلسة جديدة</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', background: 'white', padding: '4px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, minWidth: '80px', padding: '9px 12px', border: 'none', borderRadius: '8px',
            background: activeTab === t.id ? '#2563eb' : 'transparent',
            color: activeTab === t.id ? 'white' : '#64748b',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="section-title">البيانات الأساسية</h3>
            <div className="form-group">
              <label>الاسم الكامل</label>
              <input className="form-control" value={form.fullName || ''} onChange={e => setF('fullName', e.target.value)} disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>رقم الجوال</label>
              <input className="form-control" value={form.phone || ''} onChange={e => setF('phone', e.target.value)} disabled={!editMode} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>العمر</label>
                <input className="form-control" type="number" value={form.age || ''} onChange={e => setF('age', e.target.value)} disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>تاريخ الميلاد</label>
                <input className="form-control" type="date" value={form.dateOfBirth ? form.dateOfBirth.substring(0, 10) : ''} onChange={e => setF('dateOfBirth', e.target.value)} disabled={!editMode} />
              </div>
            </div>
            <div className="form-group">
              <label>العنوان</label>
              <input className="form-control" value={form.address || ''} onChange={e => setF('address', e.target.value)} disabled={!editMode} />
            </div>
          </div>
          <div className="card">
            <h3 className="section-title">النظام المالي</h3>
            {[
              ['إجمالي تكلفة العلاج (ج.م)', 'totalCost'],
              ['المبلغ المقدم (ج.م)', 'initialPayment'],
              ['إجمالي المدفوع (ج.م)', 'totalPaid'],
            ].map(([label, key]) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input className="form-control" type="number" value={form.financials?.[key] || 0} onChange={e => setFinancial(key, e.target.value)} disabled={!editMode} />
              </div>
            ))}
            <div style={{ background: (form.financials?.remaining || 0) > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: '10px', padding: '16px', border: `1px solid ${(form.financials?.remaining || 0) > 0 ? '#fecaca' : '#bbf7d0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>المبلغ المتبقي:</span>
                <span style={{ fontWeight: 800, color: (form.financials?.remaining || 0) > 0 ? '#ef4444' : '#10b981', fontSize: '18px' }}>
                  {((form.financials?.totalCost || 0) - (form.financials?.totalPaid || 0)).toLocaleString()} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis Tab */}
      {activeTab === 'diagnosis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 className="section-title">التشخيص</h3>
            <textarea className="form-control" rows={6} value={form.diagnosis || ''} onChange={e => setF('diagnosis', e.target.value)} disabled={!editMode} placeholder="اكتب التشخيص التفصيلي..." />
          </div>
          <div className="card">
            <h3 className="section-title">خطة العلاج</h3>
            <textarea className="form-control" rows={5} value={form.treatmentPlan || ''} onChange={e => setF('treatmentPlan', e.target.value)} disabled={!editMode} placeholder="اكتب خطة العلاج..." />
          </div>
          <div className="card">
            <h3 className="section-title">مراحل العلاج</h3>
            <textarea className="form-control" rows={4} value={form.treatmentStages || ''} onChange={e => setF('treatmentStages', e.target.value)} disabled={!editMode} placeholder="مراحل العلاج التفصيلية..." />
          </div>
          <div className="card">
            <h3 className="section-title">التعليمات والملاحظات</h3>
            <textarea className="form-control" rows={4} value={form.instructions || ''} onChange={e => setF('instructions', e.target.value)} disabled={!editMode} placeholder="تعليمات للمريض..." />
          </div>
          {editMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" disabled={saving} onClick={handleSave}><FiSave /> حفظ</button>
            </div>
          )}
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { title: 'صور الوجه الخارجية', cat: 'face', types: ['أمامية - راحة', 'أمامية - ابتسام', 'جانبية - راحة'], images: patient.faceImages },
            { title: 'صور الفم الداخلية', cat: 'intraoral', types: ['أمامية - إطباق', 'فك علوي', 'فك سفلي', 'جانبية يمين', 'جانبية يسار'], images: patient.intraOralImages },
          ].map(section => (
            <div key={section.cat} className="card">
              <h3 className="section-title">{section.title}</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {section.types.map(type => (
                  <button key={type} className="btn btn-secondary btn-sm" onClick={() => triggerUpload(section.cat, type)}>
                    <FiUpload /> {type}
                  </button>
                ))}
              </div>
              {section.images?.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                  {section.images.map((img, i) => (
                    <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={img.url} alt={img.type} style={{ width: '100%', height: '130px', objectFit: 'cover' }} />
                      <div style={{ padding: '8px', background: '#f8fafc' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{img.type}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!section.images?.length && <div className="empty-state" style={{ padding: '24px' }}><p>لا توجد صور - اضغط لرفع صورة</p></div>}
            </div>
          ))}
        </div>
      )}

      {/* X-rays Tab */}
      {activeTab === 'xrays' && (
        <div className="card">
          <h3 className="section-title">الأشعة</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {[['panorama', 'بانوراما'], ['lateral', 'جانبية'], ['cbct', 'CBCT']].map(([type, label]) => (
              <button key={type} className="btn btn-secondary" onClick={() => triggerUpload('xray', type)}>
                <FiUpload /> رفع {label}
              </button>
            ))}
          </div>
          {patient.xrays?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {patient.xrays.map((x, i) => (
                <div key={i} style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={x.url} alt={x.type} style={{ width: '100%', height: '180px', objectFit: 'cover', background: '#1e293b' }} />
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 700 }}>{x.type === 'panorama' ? 'بانوراما' : x.type === 'lateral' ? 'جانبية' : 'CBCT'}</div>
                    {x.description && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{x.description}</div>}
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{format(new Date(x.uploadedAt), 'd/M/yyyy')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>لا توجد أشعة بعد</p></div>}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 700, fontSize: '16px' }}>جلسات المتابعة ({sessions.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddSession(true)}><FiPlus /> جلسة جديدة</button>
          </div>
          {sessions.length === 0 ? (
            <div className="empty-state card"><p>لا توجد جلسات بعد</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {sessions.map((s, i) => (
                <div key={s._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '16px' }}>جلسة #{s.sessionNumber || i + 1}</div>
                      <div style={{ color: '#64748b', fontSize: '13px' }}>{format(new Date(s.sessionDate), 'EEEE d MMMM yyyy', { locale: ar })}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {s.amountPaid > 0 && <span className="badge badge-success">{s.amountPaid.toLocaleString()} ج.م</span>}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteSession(s._id)}><FiTrash2 /></button>
                    </div>
                  </div>
                  {s.notes && <p style={{ color: '#475569', lineHeight: 1.8, marginBottom: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>{s.notes}</p>}
                  {s.nextStep && (
                    <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '12px', border: '1px solid #bfdbfe', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 700, fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>الخطوة القادمة</div>
                      <p style={{ color: '#1e3a8a', fontSize: '14px' }}>{s.nextStep}</p>
                    </div>
                  )}
                  {s.nextAppointment && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#2563eb', fontSize: '13px', fontWeight: 600 }}>
                      <FiCalendar /> موعد المتابعة: {format(new Date(s.nextAppointment), 'd MMMM yyyy', { locale: ar })}
                    </div>
                  )}
                  {s.images?.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {s.images.map((img, j) => (
                        <img key={j} src={img.url} alt={img.type} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === 'financial' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 className="section-title">الملخص المالي</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'التكلفة الكلية', val: patient.financials?.totalCost || 0, color: '#1e293b', bg: '#f8fafc' },
                { label: 'المدفوع', val: patient.financials?.totalPaid || 0, color: '#10b981', bg: '#f0fdf4' },
                { label: 'المتبقي', val: patient.financials?.remaining || 0, color: '#ef4444', bg: '#fef2f2' },
              ].map((item, i) => (
                <div key={i} style={{ background: item.bg, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: item.color }}>{item.val.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{item.label} (ج.م)</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px' }}>
              <span style={{ fontWeight: 600 }}>حالة الحساب:</span>
              <span className={`badge ${statusMap[patient.financials?.status]}`}>{statusLabel[patient.financials?.status]}</span>
            </div>
            <button className="btn btn-success" style={{ marginTop: '16px', width: '100%' }} onClick={() => setShowPayment(true)}>
              <FiDollarSign /> تسجيل دفعة جديدة
            </button>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddSession && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddSession(false)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <span className="modal-title">إضافة جلسة جديدة</span>
              <button className="modal-close" onClick={() => setShowAddSession(false)}>×</button>
            </div>
            <form onSubmit={handleAddSession}>
              <div className="grid-2">
                <div className="form-group">
                  <label>تاريخ الجلسة *</label>
                  <input className="form-control" type="date" value={sessionForm.sessionDate} onChange={e => setS('sessionDate', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>موعد الجلسة القادمة</label>
                  <input className="form-control" type="date" value={sessionForm.nextAppointment} onChange={e => setS('nextAppointment', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>ملاحظات الجلسة</label>
                <textarea className="form-control" rows={3} value={sessionForm.notes} onChange={e => setS('notes', e.target.value)} placeholder="ما تم في هذه الجلسة..." />
              </div>
              <div className="form-group">
                <label>الخطوة القادمة</label>
                <textarea className="form-control" rows={2} value={sessionForm.nextStep} onChange={e => setS('nextStep', e.target.value)} placeholder="ما سيتم في الجلسة القادمة..." />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>المبلغ المدفوع في الجلسة (ج.م)</label>
                  <input className="form-control" type="number" value={sessionForm.amountPaid} onChange={e => setS('amountPaid', e.target.value)} placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label>المبلغ المتبقي بعد الجلسة (ج.م)</label>
                  <input className="form-control" type="number" value={sessionForm.remainingAmount} onChange={e => setS('remainingAmount', e.target.value)} placeholder="0" min="0" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSession(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary"><FiPlus /> إضافة الجلسة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPayment(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">تسجيل دفعة - {patient.fullName}</span>
              <button className="modal-close" onClick={() => setShowPayment(false)}>×</button>
            </div>
            <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: '1px solid #fecaca' }}>
              <span style={{ fontWeight: 700, color: '#991b1b' }}>المتبقي: {remaining.toLocaleString()} ج.م</span>
            </div>
            <form onSubmit={handlePayment}>
              <div className="form-group">
                <label>المبلغ (ج.م) *</label>
                <input className="form-control" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" min="0" required />
              </div>
              <div className="form-group">
                <label>طريقة الدفع</label>
                <select className="form-control" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
                  {[['cash', 'نقدي'], ['card', 'بطاقة'], ['transfer', 'تحويل'], ['wallet', 'محفظة']].map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>ملاحظات</label>
                <input className="form-control" value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات اختيارية" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPayment(false)}>إلغاء</button>
                <button type="submit" className="btn btn-success"><FiDollarSign /> تسجيل الدفع</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
