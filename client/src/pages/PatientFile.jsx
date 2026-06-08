import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  FiArrowRight, FiSave, FiPlus, FiTrash2, FiUpload,
  FiDollarSign, FiCalendar, FiImage, FiFileText, FiActivity, FiEdit2,
  FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiX, FiMaximize2,
} from 'react-icons/fi';

const FACE_SLOTS = [
  { type: 'frontal_rest', label: 'أمامية - راحة' },
  { type: 'frontal_smile', label: 'أمامية - ابتسام' },
  { type: 'lateral', label: 'جانبية - راحة' },
];
const INTRAORAL_SLOTS = [
  { type: 'frontal_occlusion', label: 'أمامية - إطباق' },
  { type: 'upper_jaw', label: 'فك علوي' },
  { type: 'lower_jaw', label: 'فك سفلي' },
  { type: 'right_lateral', label: 'جانبية يمين' },
  { type: 'left_lateral', label: 'جانبية يسار' },
];
const SESSION_SLOTS = [
  { type: 'frontal_occlusion', label: 'أمامية - إطباق' },
  { type: 'right_lateral', label: 'جانبية يمين' },
  { type: 'left_lateral', label: 'جانبية يسار' },
  { type: 'upper_jaw', label: 'فك علوي' },
  { type: 'lower_jaw', label: 'فك سفلي' },
];
const XRAY_TYPES = [
  { type: 'panorama', label: 'بانوراما' },
  { type: 'lateral', label: 'جانبية' },
  { type: 'cbct', label: 'CBCT' },
];
const VIS_LABELS = {
  diagnosis: 'التشخيص',
  treatmentPlan: 'خطة العلاج',
  treatmentStages: 'مراحل العلاج',
  instructions: 'التعليمات والملاحظات',
  faceImages: 'صور الوجه',
  intraOralImages: 'صور الفم الداخلية',
  xrays: 'الأشعة',
  sessions: 'الجلسات',
  financials: 'البيانات المالية',
};
const tabs = [
  { id: 'info', label: 'البيانات', icon: <FiFileText size={13}/> },
  { id: 'diagnosis', label: 'التشخيص', icon: <FiActivity size={13}/> },
  { id: 'images', label: 'الصور', icon: <FiImage size={13}/> },
  { id: 'xrays', label: 'الأشعة', icon: <FiImage size={13}/> },
  { id: 'sessions', label: 'الجلسات', icon: <FiCalendar size={13}/> },
  { id: 'financial', label: 'المالية', icon: <FiDollarSign size={13}/> },
  { id: 'visibility', label: 'الظهور', icon: <FiEye size={13}/> },
];
const statusMap = { paid: 'badge-success', partial: 'badge-warning', overdue: 'badge-danger', pending: 'badge-gray' };
const statusLabel = { paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر', pending: 'معلق' };

function ImageSlot({ cat, slotType, slotLabel, images, triggerUpload, toggleVis, deleteImg, openEdit, openLightbox }) {
  const slotImages = (images || []).filter(img => img.type === slotType);
  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <div style={{ background: '#f8fafc', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{slotLabel}</span>
        <span style={{ fontSize: 11, color: '#94a3b8', background: '#e2e8f0', borderRadius: 99, padding: '1px 8px' }}>{slotImages.length}</span>
      </div>
      {slotImages.length > 0 && (
        <div style={{ padding: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {slotImages.map(img => (
            <div key={img._id} style={{ width: 90 }}>
              <div style={{ position: 'relative' }}>
                <img src={img.url} alt={slotLabel} style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e2e8f0', cursor: 'pointer', display: 'block' }} onClick={() => openLightbox(img.url)} />
                <button onClick={() => openLightbox(img.url)} style={{ position: 'absolute', top: 3, left: 3, background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', color: 'white', lineHeight: 1 }}><FiMaximize2 size={10}/></button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <button title={img.isVisibleToPatient !== false ? 'ظاهر - اضغط للإخفاء' : 'مخفي - اضغط للإظهار'} onClick={() => toggleVis(cat, img._id, img.isVisibleToPatient !== false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: img.isVisibleToPatient !== false ? '#10b981' : '#cbd5e1' }}>
                  {img.isVisibleToPatient !== false ? <FiEye size={13}/> : <FiEyeOff size={13}/>}
                </button>
                <button onClick={() => openEdit(cat, img)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#2563eb' }} title="تعديل الوصف"><FiEdit2 size={12}/></button>
                <button onClick={() => deleteImg(cat, img._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#ef4444' }}><FiTrash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: '8px 10px', borderTop: slotImages.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
        <button style={{ width: '100%', padding: '6px', border: '1.5px dashed #bfdbfe', borderRadius: 8, background: '#eff6ff', color: '#2563eb', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onClick={() => triggerUpload(cat, slotType)}>
          <FiUpload size={11}/> أضف صورة
        </button>
      </div>
    </div>
  );
}

function XraySlot({ xrayType, xrayLabel, xrays, triggerUpload, toggleVis, deleteImg, openLightbox }) {
  const slotItems = (xrays || []).filter(x => x.type === xrayType);
  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <div style={{ background: '#0f172a', padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{xrayLabel}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', borderRadius: 99, padding: '1px 8px' }}>{slotItems.length}</span>
      </div>
      {slotItems.length > 0 && (
        <div style={{ padding: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {slotItems.map(x => (
            <div key={x._id} style={{ width: 120 }}>
              <div style={{ position: 'relative' }}>
                <img src={x.url} alt={xrayLabel} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', background: '#0f172a', display: 'block', border: '1px solid #1e293b' }} onClick={() => openLightbox(x.url)} />
                <button onClick={() => openLightbox(x.url)} style={{ position: 'absolute', top: 3, left: 3, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', color: 'white', lineHeight: 1 }}><FiMaximize2 size={10}/></button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, padding: '0 2px' }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{x.uploadedAt ? format(new Date(x.uploadedAt), 'd/M/yy') : ''}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button title={x.isVisibleToPatient !== false ? 'ظاهر' : 'مخفي'} onClick={() => toggleVis('xray', x._id, x.isVisibleToPatient !== false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: x.isVisibleToPatient !== false ? '#10b981' : '#cbd5e1' }}>
                    {x.isVisibleToPatient !== false ? <FiEye size={12}/> : <FiEyeOff size={12}/>}
                  </button>
                  <button onClick={() => deleteImg('xray', x._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444' }}><FiTrash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ padding: '8px 10px', borderTop: slotItems.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
        <button style={{ width: '100%', padding: '6px', border: '1.5px dashed #94a3b8', borderRadius: 8, background: '#1e293b', color: '#94a3b8', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }} onClick={() => triggerUpload('xray', xrayType)}>
          <FiUpload size={11}/> رفع أشعة
        </button>
      </div>
    </div>
  );
}

function VisToggleBtn({ isVisible, label, onClick }) {
  return (
    <button onClick={onClick} title={isVisible ? 'ظاهر للمريض — اضغط لإخفائه' : 'مخفي — اضغط لإظهاره'} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, border: 'none', cursor: 'pointer', background: isVisible ? '#f0fdf4' : '#f8fafc', color: isVisible ? '#16a34a' : '#94a3b8', fontSize: 12, fontWeight: 600, fontFamily: 'Cairo, sans-serif' }}>
      {isVisible ? <FiEye size={12}/> : <FiEyeOff size={12}/>}
      {isVisible ? 'ظاهر للمريض' : 'مخفي'}
    </button>
  );
}

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
  const sessionFileInputRef = useRef();
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [sessionUpload, setSessionUpload] = useState(null);

  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [lightbox, setLightbox] = useState(null);
  const [editingImg, setEditingImg] = useState(null);
  const [imgForm, setImgForm] = useState({});

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
      const updates = { ...form, financials: { ...form.financials, remaining: totalCost - totalPaid, status: totalPaid >= totalCost && totalCost > 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'pending' } };
      const res = await axios.put(`/patients/${id}`, updates);
      setPatient(res.data); setForm(res.data);
      toast.success('تم الحفظ'); setEditMode(false);
    } catch { toast.error('خطأ في الحفظ'); }
    setSaving(false);
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.sessionDate) return toast.error('يرجى إدخال تاريخ الجلسة');
    try {
      await axios.post('/sessions', { patientId: id, sessionDate: sessionForm.sessionDate, notes: sessionForm.notes, nextStep: sessionForm.nextStep, nextAppointment: sessionForm.nextAppointment || undefined, amountPaid: parseFloat(sessionForm.amountPaid) || 0, remainingAmount: parseFloat(sessionForm.remainingAmount) || 0 });
      if (parseFloat(sessionForm.amountPaid) > 0) {
        await axios.post('/payments', { patientId: id, patientName: patient.fullName, amount: parseFloat(sessionForm.amountPaid), type: 'session', method: 'cash', notes: `جلسة ${format(new Date(sessionForm.sessionDate), 'd/M/yyyy')}` });
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
      await axios.post('/payments', { patientId: id, patientName: patient.fullName, amount: parseFloat(payForm.amount), type: 'partial', method: payForm.method, notes: payForm.notes });
      toast.success('تم تسجيل الدفع'); setShowPayment(false);
      setPayForm({ amount: '', method: 'cash', notes: '' }); fetchData();
    } catch { toast.error('خطأ'); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await axios.post(`/patients/${id}/images`, { category: uploadCategory, imageData: { type: uploadType, url: res.data.url } });
      toast.success('تم رفع الصورة'); fetchData();
    } catch { toast.error('فشل رفع الصورة'); }
  };

  const triggerUpload = (cat, type) => {
    setUploadCategory(cat); setUploadType(type);
    fileInputRef.current?.click();
  };

  const handleSessionFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !sessionUpload) return;
    e.target.value = '';
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await axios.post(`/sessions/${sessionUpload.sessionId}/images`, { type: sessionUpload.type, url: res.data.url, notes: '' });
      toast.success('تم رفع الصورة'); fetchData();
    } catch { toast.error('فشل رفع الصورة'); }
  };

  const triggerSessionUpload = (sessionId, type) => {
    setSessionUpload({ sessionId, type });
    sessionFileInputRef.current?.click();
  };

  const deletePatientImage = async (category, imageId) => {
    if (!window.confirm('حذف هذه الصورة نهائياً؟')) return;
    try { await axios.delete(`/patients/${id}/images/${category}/${imageId}`); toast.success('تم الحذف'); fetchData(); }
    catch { toast.error('خطأ'); }
  };

  const togglePatientImageVis = async (category, imageId, current) => {
    try { await axios.patch(`/patients/${id}/images/${category}/${imageId}`, { isVisibleToPatient: !current }); fetchData(); }
    catch { toast.error('خطأ'); }
  };

  const openImgEdit = (cat, img) => {
    setEditingImg({ cat, imgId: img._id });
    setImgForm({ description1: img.description1 || '', description2: img.description2 || '', description3: img.description3 || '', notes: img.notes || '' });
  };

  const saveImgEdit = async () => {
    try {
      await axios.patch(`/patients/${id}/images/${editingImg.cat}/${editingImg.imgId}`, imgForm);
      toast.success('تم الحفظ'); setEditingImg(null); fetchData();
    } catch { toast.error('خطأ'); }
  };

  const deleteSessionImage = async (sessionId, imageId) => {
    if (!window.confirm('حذف هذه الصورة؟')) return;
    try { await axios.delete(`/sessions/${sessionId}/images/${imageId}`); toast.success('تم الحذف'); fetchData(); }
    catch { toast.error('خطأ'); }
  };

  const toggleSessionImageVis = async (sessionId, imageId, current) => {
    try { await axios.patch(`/sessions/${sessionId}/images/${imageId}`, { isVisibleToPatient: !current }); fetchData(); }
    catch { toast.error('خطأ'); }
  };

  const toggleSessionVis = async (sessionId, current) => {
    try { await axios.patch(`/sessions/${sessionId}/visibility`, { isVisibleToPatient: !current }); fetchData(); }
    catch { toast.error('خطأ'); }
  };

  const deleteSession = async (sid) => {
    if (!window.confirm('حذف الجلسة؟')) return;
    try { await axios.delete(`/sessions/${sid}`); fetchData(); toast.success('تم الحذف'); }
    catch { toast.error('خطأ'); }
  };

  const saveVisibility = async (key, value) => {
    try {
      const updated = { ...(patient.visibility || {}), [key]: value };
      const res = await axios.patch(`/patients/${id}/visibility`, updated);
      setPatient(res.data);
    } catch { toast.error('خطأ'); }
  };

  const toggleExpanded = (sid) => {
    setExpandedSessions(prev => { const n = new Set(prev); n.has(sid) ? n.delete(sid) : n.add(sid); return n; });
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!patient) return null;

  const remaining = patient.financials?.remaining || 0;
  const vis = patient.visibility || {};

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
      <input ref={sessionFileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSessionFileUpload} />

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="صورة" style={{ maxWidth: '95vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: 12 }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={18}/></button>
        </div>
      )}

      {/* Image Edit Modal */}
      {editingImg && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingImg(null)}>
          <div className="modal">
            <div className="modal-header"><span className="modal-title">تعديل وصف الصورة</span><button className="modal-close" onClick={() => setEditingImg(null)}>×</button></div>
            {[['description1', 'الوصف 1'], ['description2', 'الوصف 2'], ['description3', 'الوصف 3'], ['notes', 'ملاحظات']].map(([k, l]) => (
              <div className="form-group" key={k}>
                <label>{l}</label>
                <input className="form-control" value={imgForm[k] || ''} onChange={e => setImgForm(f => ({ ...f, [k]: e.target.value }))} placeholder={l} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setEditingImg(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={saveImgEdit}><FiSave /> حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button className="btn btn-secondary btn-sm" style={{ marginBottom: '12px' }} onClick={() => navigate('/doctor/patients')}><FiArrowRight /> رجوع للمرضى</button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="page-title">{patient.fullName}</h1>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>{patient.phone}</span>
              {patient.age && <span style={{ color: '#64748b', fontSize: '14px' }}>{patient.age} سنة</span>}
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
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, minWidth: '72px', padding: '8px 10px', border: 'none', borderRadius: '8px', background: activeTab === t.id ? '#2563eb' : 'transparent', color: activeTab === t.id ? 'white' : '#64748b', fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Info Tab ── */}
      {activeTab === 'info' && (
        <div className="grid-2">
          <div className="card">
            <h3 className="section-title">البيانات الأساسية</h3>
            {[['الاسم الكامل', 'fullName', 'text'], ['رقم الجوال', 'phone', 'text'], ['العنوان', 'address', 'text']].map(([l, k, t]) => (
              <div className="form-group" key={k}><label>{l}</label><input className="form-control" type={t} value={form[k] || ''} onChange={e => setF(k, e.target.value)} disabled={!editMode} /></div>
            ))}
            <div className="grid-2">
              <div className="form-group"><label>العمر</label><input className="form-control" type="number" value={form.age || ''} onChange={e => setF('age', e.target.value)} disabled={!editMode} /></div>
              <div className="form-group"><label>تاريخ الميلاد</label><input className="form-control" type="date" value={form.dateOfBirth ? form.dateOfBirth.substring(0, 10) : ''} onChange={e => setF('dateOfBirth', e.target.value)} disabled={!editMode} /></div>
            </div>
          </div>
          <div className="card">
            <h3 className="section-title">النظام المالي</h3>
            {[['إجمالي تكلفة العلاج (ج.م)', 'totalCost'], ['المبلغ المقدم (ج.م)', 'initialPayment'], ['إجمالي المدفوع (ج.م)', 'totalPaid']].map(([label, key]) => (
              <div className="form-group" key={key}><label>{label}</label><input className="form-control" type="number" value={form.financials?.[key] || 0} onChange={e => setFinancial(key, e.target.value)} disabled={!editMode} /></div>
            ))}
            <div style={{ background: remaining > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: '10px', padding: '16px', border: `1px solid ${remaining > 0 ? '#fecaca' : '#bbf7d0'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>المبلغ المتبقي:</span>
                <span style={{ fontWeight: 800, color: remaining > 0 ? '#ef4444' : '#10b981', fontSize: '18px' }}>{((form.financials?.totalCost || 0) - (form.financials?.totalPaid || 0)).toLocaleString()} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Diagnosis Tab ── */}
      {activeTab === 'diagnosis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'diagnosis', label: 'التشخيص', placeholder: 'اكتب التشخيص التفصيلي...', rows: 6 },
            { key: 'treatmentPlan', label: 'خطة العلاج', placeholder: 'اكتب خطة العلاج...', rows: 5 },
            { key: 'treatmentStages', label: 'مراحل العلاج', placeholder: 'مراحل العلاج التفصيلية...', rows: 4 },
            { key: 'instructions', label: 'التعليمات والملاحظات', placeholder: 'تعليمات للمريض...', rows: 4 },
          ].map(sec => (
            <div className="card" key={sec.key}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 className="section-title" style={{ margin: 0 }}>{sec.label}</h3>
                <VisToggleBtn isVisible={vis[sec.key] !== false} label={sec.label} onClick={() => saveVisibility(sec.key, !(vis[sec.key] !== false))} />
              </div>
              <textarea className="form-control" rows={sec.rows} value={form[sec.key] || ''} onChange={e => setF(sec.key, e.target.value)} disabled={!editMode} placeholder={sec.placeholder} style={{ opacity: vis[sec.key] === false ? 0.5 : 1 }} />
            </div>
          ))}
          {editMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" disabled={saving} onClick={handleSave}><FiSave /> حفظ</button>
            </div>
          )}
        </div>
      )}

      {/* ── Images Tab ── */}
      {activeTab === 'images' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>📸 صور الوجه الخارجية</h3>
              <VisToggleBtn isVisible={vis.faceImages !== false} label="صور الوجه" onClick={() => saveVisibility('faceImages', !(vis.faceImages !== false))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, opacity: vis.faceImages === false ? 0.55 : 1 }}>
              {FACE_SLOTS.map(slot => (
                <ImageSlot key={slot.type} cat="face" slotType={slot.type} slotLabel={slot.label} images={patient.faceImages} triggerUpload={triggerUpload} toggleVis={togglePatientImageVis} deleteImg={deletePatientImage} openEdit={openImgEdit} openLightbox={setLightbox} />
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>🦷 صور الفم الداخلية</h3>
              <VisToggleBtn isVisible={vis.intraOralImages !== false} label="صور الفم" onClick={() => saveVisibility('intraOralImages', !(vis.intraOralImages !== false))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, opacity: vis.intraOralImages === false ? 0.55 : 1 }}>
              {INTRAORAL_SLOTS.map(slot => (
                <ImageSlot key={slot.type} cat="intraoral" slotType={slot.type} slotLabel={slot.label} images={patient.intraOralImages} triggerUpload={triggerUpload} toggleVis={togglePatientImageVis} deleteImg={deletePatientImage} openEdit={openImgEdit} openLightbox={setLightbox} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── X-rays Tab ── */}
      {activeTab === 'xrays' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>☢️ الأشعة</h3>
            <VisToggleBtn isVisible={vis.xrays !== false} label="الأشعة" onClick={() => saveVisibility('xrays', !(vis.xrays !== false))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, opacity: vis.xrays === false ? 0.55 : 1 }}>
            {XRAY_TYPES.map(x => (
              <XraySlot key={x.type} xrayType={x.type} xrayLabel={x.label} xrays={patient.xrays} triggerUpload={triggerUpload} toggleVis={togglePatientImageVis} deleteImg={deletePatientImage} openLightbox={setLightbox} />
            ))}
          </div>
        </div>
      )}

      {/* ── Sessions Tab ── */}
      {activeTab === 'sessions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>جلسات المتابعة ({sessions.length})</h3>
              <VisToggleBtn isVisible={vis.sessions !== false} label="الجلسات" onClick={() => saveVisibility('sessions', !(vis.sessions !== false))} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddSession(true)}><FiPlus /> جلسة جديدة</button>
          </div>
          {sessions.length === 0 ? (
            <div className="empty-state card"><p>لا توجد جلسات بعد</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {sessions.map((s, i) => {
                const isExpanded = expandedSessions.has(s._id);
                return (
                  <div key={s._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: isExpanded ? '#f8fafc' : 'white', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none' }} onClick={() => toggleExpanded(s._id)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#2563eb', fontSize: 14, flexShrink: 0 }}>{s.sessionNumber || i + 1}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 15 }}>جلسة #{s.sessionNumber || i + 1}</div>
                          <div style={{ color: '#64748b', fontSize: 12 }}>{format(new Date(s.sessionDate), 'EEEE d MMMM yyyy', { locale: ar })}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {s.amountPaid > 0 && <span className="badge badge-success">{s.amountPaid.toLocaleString()} ج.م</span>}
                        {s.images?.length > 0 && <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>📷 {s.images.length}</span>}
                        <button title={s.isVisibleToPatient !== false ? 'ظاهر للمريض' : 'مخفي'} onClick={e => { e.stopPropagation(); toggleSessionVis(s._id, s.isVisibleToPatient !== false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.isVisibleToPatient !== false ? '#10b981' : '#cbd5e1', padding: 4 }}>
                          {s.isVisibleToPatient !== false ? <FiEye size={15}/> : <FiEyeOff size={15}/>}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); deleteSession(s._id); }}><FiTrash2 size={12}/></button>
                        {isExpanded ? <FiChevronUp size={15} color="#94a3b8"/> : <FiChevronDown size={15} color="#94a3b8"/>}
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {s.notes && <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', color: '#475569', lineHeight: 1.8, fontSize: 14 }}><div style={{ fontWeight: 700, fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>ملاحظات الجلسة</div>{s.notes}</div>}
                        {s.nextStep && <div style={{ background: '#eff6ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bfdbfe' }}><div style={{ fontWeight: 700, fontSize: 11, color: '#1e40af', marginBottom: 4 }}>الخطوة القادمة</div><p style={{ color: '#1e3a8a', fontSize: 14, margin: 0 }}>{s.nextStep}</p></div>}
                        {s.nextAppointment && <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#2563eb', fontSize: 13, fontWeight: 600 }}><FiCalendar size={13}/> موعد المتابعة: {format(new Date(s.nextAppointment), 'd MMMM yyyy', { locale: ar })}</div>}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 10 }}>📷 صور الجلسة</div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                            {SESSION_SLOTS.map(slot => {
                              const slotImgs = (s.images || []).filter(img => img.type === slot.type);
                              return (
                                <div key={slot.type} style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
                                  <div style={{ background: '#f8fafc', padding: '6px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: '#334155' }}>{slot.label}</span>
                                    <span style={{ fontSize: 10, color: '#94a3b8', background: '#e2e8f0', borderRadius: 99, padding: '1px 6px' }}>{slotImgs.length}</span>
                                  </div>
                                  {slotImgs.length > 0 && (
                                    <div style={{ padding: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                      {slotImgs.map(img => (
                                        <div key={img._id} style={{ width: 68 }}>
                                          <img src={img.url} alt={slot.label} style={{ width: 68, height: 52, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0', display: 'block', cursor: 'pointer' }} onClick={() => setLightbox(img.url)} />
                                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                                            <button onClick={() => toggleSessionImageVis(s._id, img._id, img.isVisibleToPatient !== false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: img.isVisibleToPatient !== false ? '#10b981' : '#cbd5e1' }}>
                                              {img.isVisibleToPatient !== false ? <FiEye size={11}/> : <FiEyeOff size={11}/>}
                                            </button>
                                            <button onClick={() => deleteSessionImage(s._id, img._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444' }}><FiTrash2 size={11}/></button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div style={{ padding: '6px 8px', borderTop: slotImgs.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
                                    <button style={{ width: '100%', padding: '5px', border: '1.5px dashed #bfdbfe', borderRadius: 6, background: '#f8fbff', color: '#2563eb', fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }} onClick={() => triggerSessionUpload(s._id, slot.type)}>
                                      <FiUpload size={10}/> أضف
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Financial Tab ── */}
      {activeTab === 'financial' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 className="section-title" style={{ margin: 0 }}>الملخص المالي</h3>
            <VisToggleBtn isVisible={vis.financials !== false} label="البيانات المالية" onClick={() => saveVisibility('financials', !(vis.financials !== false))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {[{ label: 'التكلفة الكلية', val: patient.financials?.totalCost || 0, color: '#1e293b', bg: '#f8fafc' }, { label: 'المدفوع', val: patient.financials?.totalPaid || 0, color: '#10b981', bg: '#f0fdf4' }, { label: 'المتبقي', val: patient.financials?.remaining || 0, color: '#ef4444', bg: '#fef2f2' }].map((item, i) => (
              <div key={i} style={{ background: item.bg, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: item.color }}>{item.val.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{item.label} (ج.م)</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>حالة الحساب:</span>
            <span className={`badge ${statusMap[patient.financials?.status]}`}>{statusLabel[patient.financials?.status]}</span>
          </div>
          <button className="btn btn-success" style={{ width: '100%' }} onClick={() => setShowPayment(true)}><FiDollarSign /> تسجيل دفعة جديدة</button>
        </div>
      )}

      {/* ── Visibility Tab ── */}
      {activeTab === 'visibility' && (
        <div className="card">
          <h3 className="section-title" style={{ marginBottom: 6 }}>🔒 إعدادات ظهور الملف للمريض</h3>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>تحكم في ما يراه المريض عند دخوله على ملفه. التغييرات تُطبّق فوراً.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(VIS_LABELS).map(([key, label]) => {
              const isOn = vis[key] !== false;
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, border: `1.5px solid ${isOn ? '#dcfce7' : '#f1f5f9'}`, background: isOn ? '#f0fdf4' : '#f8fafc' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{label}</div>
                    <div style={{ fontSize: 12, color: isOn ? '#16a34a' : '#94a3b8', marginTop: 2 }}>{isOn ? '✓ ظاهر للمريض' : '✕ مخفي عن المريض'}</div>
                  </div>
                  <button onClick={() => saveVisibility(key, !isOn)} style={{ width: 50, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: isOn ? '#16a34a' : '#cbd5e1', position: 'relative', transition: 'background 0.25s' }}>
                    <div style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 0.25s', left: isOn ? 27 : 3, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, padding: '14px 16px', background: '#fefce8', borderRadius: 10, border: '1px solid #fde047', fontSize: 13, color: '#713f12' }}>
            💡 <strong>ملاحظة:</strong> إخفاء القسم يخفيه كاملاً. لإخفاء صورة بعينها فقط، استخدم أيقونة 👁️ بجوار الصورة.
          </div>
        </div>
      )}

      {/* ── Add Session Modal ── */}
      {showAddSession && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddSession(false)}>
          <div className="modal modal-lg">
            <div className="modal-header"><span className="modal-title">إضافة جلسة جديدة</span><button className="modal-close" onClick={() => setShowAddSession(false)}>×</button></div>
            <form onSubmit={handleAddSession}>
              <div className="grid-2">
                <div className="form-group"><label>تاريخ الجلسة *</label><input className="form-control" type="date" value={sessionForm.sessionDate} onChange={e => setS('sessionDate', e.target.value)} required /></div>
                <div className="form-group"><label>موعد الجلسة القادمة</label><input className="form-control" type="date" value={sessionForm.nextAppointment} onChange={e => setS('nextAppointment', e.target.value)} /></div>
              </div>
              <div className="form-group"><label>ملاحظات الجلسة</label><textarea className="form-control" rows={3} value={sessionForm.notes} onChange={e => setS('notes', e.target.value)} placeholder="ما تم في هذه الجلسة..." /></div>
              <div className="form-group"><label>الخطوة القادمة</label><textarea className="form-control" rows={2} value={sessionForm.nextStep} onChange={e => setS('nextStep', e.target.value)} placeholder="ما سيتم في الجلسة القادمة..." /></div>
              <div className="grid-2">
                <div className="form-group"><label>المبلغ المدفوع (ج.م)</label><input className="form-control" type="number" value={sessionForm.amountPaid} onChange={e => setS('amountPaid', e.target.value)} placeholder="0" min="0" /></div>
                <div className="form-group"><label>المبلغ المتبقي (ج.م)</label><input className="form-control" type="number" value={sessionForm.remainingAmount} onChange={e => setS('remainingAmount', e.target.value)} placeholder="0" min="0" /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddSession(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary"><FiPlus /> إضافة الجلسة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Payment Modal ── */}
      {showPayment && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPayment(false)}>
          <div className="modal">
            <div className="modal-header"><span className="modal-title">تسجيل دفعة - {patient.fullName}</span><button className="modal-close" onClick={() => setShowPayment(false)}>×</button></div>
            <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: '1px solid #fecaca' }}>
              <span style={{ fontWeight: 700, color: '#991b1b' }}>المتبقي: {remaining.toLocaleString()} ج.م</span>
            </div>
            <form onSubmit={handlePayment}>
              <div className="form-group"><label>المبلغ (ج.م) *</label><input className="form-control" type="number" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" min="0" required /></div>
              <div className="form-group"><label>طريقة الدفع</label>
                <select className="form-control" value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}>
                  {[['cash', 'نقدي'], ['card', 'بطاقة'], ['transfer', 'تحويل'], ['wallet', 'محفظة']].map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group"><label>ملاحظات</label><input className="form-control" value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات اختيارية" /></div>
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
