import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  FiArrowRight, FiSave, FiPlus, FiTrash2, FiUpload,
  FiDollarSign, FiCalendar, FiImage, FiFileText, FiActivity, FiEdit2, FiEdit3,
  FiEye, FiEyeOff, FiChevronDown, FiChevronUp, FiX, FiMaximize2,
  FiPrinter, FiMessageSquare, FiSend, FiUser, FiShare2,
} from 'react-icons/fi';
import { printInvoice } from '../utils/printInvoice';
import ExportModal from '../components/ExportModal';
import DrawingCanvas from '../components/DrawingCanvas';

const FACE_SLOTS = [
  { type: 'frontal_rest', label: 'Frontal - Rest' },
  { type: 'frontal_smile', label: 'Frontal - Smile' },
  { type: 'lateral', label: 'Lateral - Rest' },
];
const INTRAORAL_SLOTS = [
  { type: 'frontal_occlusion', label: 'Frontal Occlusion' },
  { type: 'upper_jaw', label: 'Upper Jaw' },
  { type: 'lower_jaw', label: 'Lower Jaw' },
  { type: 'right_lateral', label: 'Right Lateral' },
  { type: 'left_lateral', label: 'Left Lateral' },
];
const SESSION_SLOTS = [
  { type: 'frontal_occlusion', label: 'Frontal Occlusion' },
  { type: 'right_lateral', label: 'Right Lateral' },
  { type: 'left_lateral', label: 'Left Lateral' },
  { type: 'upper_jaw', label: 'Upper Jaw' },
  { type: 'lower_jaw', label: 'Lower Jaw' },
];
const XRAY_TYPES = [
  { type: 'panorama', label: 'Panoramic X-Ray' },
  { type: 'lateral', label: 'Lateral Ceph' },
  { type: 'cbct', label: 'CBCT' },
];
const VIS_LABELS = {
  diagnosis: 'التشخيص',
  treatmentPlan: 'خطة العلاج',
  treatmentStages: 'مراحل العلاج',
  instructions: 'التعليمات والملاحظات',
  faceImages: 'صور الوجه',
  intraOralImages: 'Intraoral Examination',
  xrays: 'الأشعة',
  sessions: 'الجلسات',
  financials: 'البيانات المالية',
  pdfDownload: '📥 تحميل PDF في بوابة المريض',
};
const tabs = [
  { id: 'info', label: 'البيانات', icon: <FiFileText size={13}/> },
  { id: 'diagnosis', label: 'التشخيص', icon: <FiActivity size={13}/> },
  { id: 'images', label: 'الصور', icon: <FiImage size={13}/> },
  { id: 'xrays', label: 'الأشعة', icon: <FiImage size={13}/> },
  { id: 'sessions', label: 'الجلسات', icon: <FiCalendar size={13}/> },
  { id: 'ttt', label: 'TTT File', icon: <span style={{fontSize:12}}>📋</span> },
  { id: 'financial', label: 'المالية', icon: <FiDollarSign size={13}/> },
  { id: 'comments', label: 'التعليقات', icon: <FiMessageSquare size={13}/> },
  { id: 'visibility', label: 'الظهور', icon: <FiEye size={13}/> },
];

const DEFAULT_TTT = {
  oh:'', skeletalAP:'', skeletalV:'', skeletalT:'',
  dentalAP:'', dentalV:'', dentalT:'', st:'', habit:'',
  obj1:'', obj2:'',
  obj3:'Align and level both arches.',
  obj4:'Maintain/ Correct OJ.',
  obj5:'Maintain/ Correct OB.',
  obj6:'Maintain/ Correct Midline',
  obj7:'Achieve Class I Canine and Incisors.',
  obj8:'Achieve Class I Molar Relationship',
  obj9:'Coordinate both arches with good Buccal Interdigitation.',
  obj10:'Retention.',
  boltonAnterior:'', boltonOverall:'',
  upperArchLength:'', upperToothSize:'', upperDiscrepancy:'',
  lowerArchLength:'', lowerToothSize:'', lowerDiscrepancy:'',
  srCrowding:'', srLevelling:'', srArchWidth:'', srIncisorSagittal:'', srIncisorInclination:'',
  upperArchLengthening:false, upperTransverse:false, upperIER:false, upperExtractions:false,
  upperTimingExtr:'', upperTeethExtr:'', upperTimingBond:'', upperTeethBond:'', upperTeethSkip:'',
  lowerArchLengthening:false, lowerTransverse:false, lowerIER:false, lowerExtractions:false,
  lowerTimingExtr:'', lowerTeethExtr:'', lowerTimingBond:'', lowerTeethBond:'', lowerTeethSkip:'',
};
const statusMap = { paid: 'badge-success', partial: 'badge-warning', overdue: 'badge-danger', pending: 'badge-gray' };
const statusLabel = { paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر', pending: 'معلق' };

function ImgNote({ initialNote, onSave }) {
  const [val, setVal] = React.useState(initialNote || '');
  React.useEffect(() => { setVal(initialNote || ''); }, [initialNote]);
  return (
    <textarea
      rows={2}
      value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => { if (val !== (initialNote || '')) onSave(val); }}
      placeholder="ملاحظة..."
      style={{ width: '100%', fontSize: 10, border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 5px', resize: 'none', fontFamily: 'inherit', direction: 'rtl', boxSizing: 'border-box', marginTop: 4, color: '#475569' }}
    />
  );
}

function ImageSlot({ cat, slotType, slotLabel, images, triggerUpload, toggleVis, deleteImg, patchImage, openLightbox, onPenClick }) {
  const slotImages = (images || []).filter(img => img.type === slotType);
  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: 'white' }}>
      <div style={{ background: '#f8fafc', padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#334155', fontFamily: 'monospace, sans-serif' }}>{slotLabel}</span>
        <span style={{ fontSize: 11, color: '#94a3b8', background: '#e2e8f0', borderRadius: 99, padding: '1px 8px' }}>{slotImages.length}</span>
      </div>
      {slotImages.length > 0 && (
        <div style={{ padding: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {slotImages.map(img => (
            <div key={img._id} style={{ width: 110 }}>
              <div style={{ position: 'relative' }}>
                <img src={img.url} alt={slotLabel} style={{ width: 110, height: 82, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e2e8f0', cursor: 'pointer', display: 'block' }} onClick={() => openLightbox(img.url)} />
                <button onClick={() => openLightbox(img.url)} style={{ position: 'absolute', top: 3, left: 3, background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', color: 'white', lineHeight: 1 }}><FiMaximize2 size={10}/></button>
              </div>
              <ImgNote
                initialNote={img.notes || ''}
                onSave={val => patchImage(cat, img._id, { notes: val })}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <button title={img.isVisibleToPatient !== false ? 'ظاهر - اضغط للإخفاء' : 'مخفي - اضغط للإظهار'} onClick={() => toggleVis(cat, img._id, img.isVisibleToPatient !== false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: img.isVisibleToPatient !== false ? '#10b981' : '#cbd5e1' }}>
                  {img.isVisibleToPatient !== false ? <FiEye size={13}/> : <FiEyeOff size={13}/>}
                </button>
                <button onClick={() => onPenClick && onPenClick(cat, img._id, img.url, img.penNote)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: img.penNote ? '#2563eb' : '#94a3b8' }} title={img.penNote ? 'تعديل نوت القلم' : 'إضافة نوت القلم'}><FiEdit3 size={12}/></button>
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
  const [sessionForm, setSessionForm] = useState({ sessionDate: '', notes: '', nextStep: '', nextAppointment: '', amountPaid: '' });

  const emptyIntraoral = () => INTRAORAL_SLOTS.map(s => ({ key: s.type, file: null, preview: null, note: '' }));
  const [sessionIntraoral, setSessionIntraoral] = useState(emptyIntraoral);
  const intraoralRefs = useRef(INTRAORAL_SLOTS.map(() => React.createRef()));
  const [showPayment, setShowPayment] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', notes: '' });

  const fileInputRef = useRef();
  const sessionFileInputRef = useRef();
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadType, setUploadType] = useState('');
  const [sessionUpload, setSessionUpload] = useState(null);

  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionEditMode, setSessionEditMode] = useState(false);
  const [sessionEditForm, setSessionEditForm] = useState({});
  const [editingSessionImg, setEditingSessionImg] = useState(null);
  const [sessionImgForm, setSessionImgForm] = useState({ notes: '' });
  const [lightbox, setLightbox] = useState(null);
  const [editingImg, setEditingImg] = useState(null);
  const [imgForm, setImgForm] = useState({});

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [savingComment, setSavingComment] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [drawingModal, setDrawingModal] = useState(null);
  const [tttData, setTttData] = useState(DEFAULT_TTT);
  const [tttSaving, setTttSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [pRes, sRes, cRes] = await Promise.all([
        axios.get(`/patients/${id}`),
        axios.get(`/sessions?patientId=${id}`),
        axios.get(`/comments?patientId=${id}`),
      ]);
      setPatient(pRes.data);
      setForm({ ...pRes.data, financials: { ...pRes.data.financials } });
      setSessions(sRes.data);
      setComments(cRes.data || []);
      if (pRes.data.tttFile && Object.keys(pRes.data.tttFile).length > 0) {
        setTttData({ ...DEFAULT_TTT, ...pRes.data.tttFile });
      }
    } catch { toast.error('خطأ في تحميل الملف'); navigate('/doctor/patients'); }
    setLoading(false);
  };

  const handleSaveTTT = async () => {
    setTttSaving(true);
    try {
      await axios.patch(`/patients/${id}/ttt`, tttData);
      toast.success('تم حفظ TTT File بنجاح ✓');
    } catch { toast.error('خطأ في الحفظ'); }
    setTttSaving(false);
  };

  const setT = (k, v) => setTttData(d => ({ ...d, [k]: v }));

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSavingComment(true);
    try {
      const { data } = await axios.post('/comments', { patientId: id, text: commentText.trim() });
      setComments(prev => [...prev, data]);
      setCommentText('');
    } catch { toast.error('خطأ في إضافة التعليق'); }
    setSavingComment(false);
  };

  const handleReply = async (commentId) => {
    const text = replyText[commentId];
    if (!text?.trim()) return;
    setSavingComment(true);
    try {
      const { data } = await axios.post(`/comments/${commentId}/reply`, { text: text.trim() });
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, replies: [...(c.replies || []), data] } : c));
      setReplyText(p => ({ ...p, [commentId]: '' }));
      setReplyingTo(null);
    } catch { toast.error('خطأ في إضافة الرد'); }
    setSavingComment(false);
  };

  const handleDeleteComment = async (commentId, parentId) => {
    if (!window.confirm('حذف هذا التعليق؟')) return;
    try {
      await axios.delete(`/comments/${commentId}`);
      if (parentId) {
        setComments(prev => prev.map(c => c._id === parentId ? { ...c, replies: (c.replies || []).filter(r => r._id !== commentId) } : c));
      } else {
        setComments(prev => prev.filter(c => c._id !== commentId));
      }
    } catch { toast.error('خطأ في الحذف'); }
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
      const { data: newSession } = await axios.post('/sessions', { patientId: id, sessionDate: sessionForm.sessionDate, notes: sessionForm.notes, nextStep: sessionForm.nextStep, nextAppointment: sessionForm.nextAppointment || undefined, amountPaid: parseFloat(sessionForm.amountPaid) || 0 });
      if (parseFloat(sessionForm.amountPaid) > 0) {
        await axios.post('/payments', { patientId: id, patientName: patient.fullName, amount: parseFloat(sessionForm.amountPaid), type: 'session', method: 'cash', notes: `جلسة ${format(new Date(sessionForm.sessionDate), 'd/M/yyyy')}` });
      }
      const slotsWithFiles = sessionIntraoral.filter(s => s.file);
      for (const slot of slotsWithFiles) {
        const fd = new FormData();
        fd.append('file', slot.file);
        const { data: uploaded } = await axios.post('/uploads', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        await axios.post(`/sessions/${newSession._id}/images`, { url: uploaded.url, type: slot.key, notes: slot.note });
      }
      toast.success('تم إضافة الجلسة');
      setShowAddSession(false);
      setSessionForm({ sessionDate: '', notes: '', nextStep: '', nextAppointment: '', amountPaid: '' });
      setSessionIntraoral(emptyIntraoral());
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

  const patchPatientImage = async (category, imageId, updates) => {
    try { await axios.patch(`/patients/${id}/images/${category}/${imageId}`, updates); fetchData(); }
    catch { toast.error('خطأ في الحفظ'); }
  };

  const getAllPenNotes = () => {
    const notes = [];
    [...(patient?.faceImages || []), ...(patient?.intraOralImages || [])].forEach(img => {
      if (img.penNote) notes.push({ data: img.penNote, label: img.type?.replace(/_/g, ' ') || 'صورة' });
    });
    (sessions || []).forEach(s => {
      (s.images || []).forEach(img => {
        if (img.penNote) notes.push({ data: img.penNote, label: img.type?.replace(/_/g, ' ') || 'جلسة' });
      });
    });
    return notes;
  };

  const openDrawingModal = (category, imageId, imageUrl, existingNote, sessionId = null) => {
    setDrawingModal({ category, imageId, imageUrl, existingNote: existingNote || null, sessionId, allNotes: getAllPenNotes() });
  };

  const saveDrawingNote = async (base64) => {
    if (!drawingModal) return;
    const { category, imageId, sessionId } = drawingModal;
    try {
      if (sessionId) {
        await axios.patch(`/sessions/${sessionId}/images/${imageId}`, { penNote: base64 });
      } else {
        await axios.patch(`/patients/${id}/images/${category}/${imageId}`, { penNote: base64 });
      }
      toast.success('✅ تم حفظ نوت القلم');
      setDrawingModal(null);
      fetchData();
    } catch { toast.error('خطأ في حفظ نوت القلم'); }
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

  const openSessionDetail = (s) => {
    setSelectedSession(s);
    setSessionEditMode(false);
    setSessionEditForm({
      notes: s.notes || '',
      nextStep: s.nextStep || '',
      nextAppointment: s.nextAppointment ? s.nextAppointment.substring(0, 10) : '',
      amountPaid: s.amountPaid || 0,
    });
  };

  const saveSessionEdit = async () => {
    if (!selectedSession) return;
    try {
      const res = await axios.put(`/sessions/${selectedSession._id}`, sessionEditForm);
      setSessions(prev => prev.map(s => s._id === selectedSession._id ? res.data : s));
      setSelectedSession(res.data);
      setSessionEditMode(false);
      toast.success('تم حفظ الجلسة');
    } catch { toast.error('خطأ في الحفظ'); }
  };

  const openSessionImgEdit = (sessionId, img) => {
    setEditingSessionImg({ sessionId, img });
    setSessionImgForm({ notes: img.notes || '' });
  };

  const saveSessionImgEdit = async () => {
    if (!editingSessionImg) return;
    try {
      await axios.patch(`/sessions/${editingSessionImg.sessionId}/images/${editingSessionImg.img._id}`, sessionImgForm);
      toast.success('تم الحفظ');
      const sRes = await axios.get(`/sessions?patientId=${id}`);
      setSessions(sRes.data);
      const updated = sRes.data.find(s => s._id === editingSessionImg.sessionId);
      if (updated) setSelectedSession(updated);
      setEditingSessionImg(null);
    } catch { toast.error('خطأ في الحفظ'); }
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

      {/* ── Session Detail Full-Page Overlay ── */}
      {selectedSession && (
        <div style={{ position: 'fixed', inset: 0, background: '#f8fafc', zIndex: 9000, overflowY: 'auto', direction: 'rtl' }}>
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 16px 60px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <button onClick={() => setSelectedSession(null)} style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                <FiArrowRight size={14}/> رجوع للجلسات
              </button>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontWeight: 900, fontSize: 20, color: '#0f172a', margin: 0 }}>
                  جلسة #{selectedSession.sessionNumber} — {patient.fullName}
                </h1>
                <div style={{ color: '#64748b', fontSize: 13, marginTop: 3 }}>
                  {format(new Date(selectedSession.sessionDate), 'EEEE d MMMM yyyy', { locale: ar })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!sessionEditMode ? (
                  <button className="btn btn-secondary btn-sm" onClick={() => setSessionEditMode(true)}><FiEdit2 size={13}/> تعديل</button>
                ) : (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSessionEditMode(false)}>إلغاء</button>
                    <button className="btn btn-primary btn-sm" onClick={saveSessionEdit}><FiSave size={13}/> حفظ</button>
                  </>
                )}
                <button className="btn btn-danger btn-sm" onClick={async () => { if(window.confirm('حذف الجلسة؟')) { await deleteSession(selectedSession._id); setSelectedSession(null); } }}>
                  <FiTrash2 size={13}/>
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Notes */}
              <div className="card" style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>📝 ملاحظات الجلسة</h3>
                {sessionEditMode ? (
                  <textarea className="form-control" rows={4} value={sessionEditForm.notes} onChange={e => setSessionEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="ما تم في هذه الجلسة..." />
                ) : (
                  <p style={{ color: '#475569', lineHeight: 1.9, margin: 0, fontSize: 14, whiteSpace: 'pre-wrap', minHeight: 40 }}>{selectedSession.notes || <span style={{ color: '#cbd5e1' }}>لا توجد ملاحظات</span>}</p>
                )}
              </div>

              {/* Next Step */}
              <div className="card" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <h3 style={{ fontWeight: 800, fontSize: 14, color: '#1e40af', marginBottom: 10 }}>📋 الخطوة القادمة</h3>
                {sessionEditMode ? (
                  <textarea className="form-control" rows={3} value={sessionEditForm.nextStep} onChange={e => setSessionEditForm(f => ({ ...f, nextStep: e.target.value }))} placeholder="ما سيتم في الجلسة القادمة..." />
                ) : (
                  <p style={{ color: '#1e3a8a', lineHeight: 1.8, margin: 0, fontSize: 14, whiteSpace: 'pre-wrap', minHeight: 36 }}>{selectedSession.nextStep || <span style={{ color: '#93c5fd' }}>لم تُحدَّد بعد</span>}</p>
                )}
              </div>

              {/* Appointment + Payment */}
              <div className="card">
                <h3 style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', marginBottom: 10 }}>💰 المالية والموعد</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>المبلغ المدفوع:</span>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#10b981' }}>{selectedSession.amountPaid?.toLocaleString() || 0} ج.م</span>
                  </div>
                  {selectedSession.nextAppointment && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>موعد المتابعة:</span>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#2563eb', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <FiCalendar size={13}/> {format(new Date(selectedSession.nextAppointment), 'd MMMM yyyy', { locale: ar })}
                      </span>
                    </div>
                  )}
                  {sessionEditMode && (
                    <>
                      <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: 12 }}>موعد الجلسة القادمة</label><input className="form-control" type="date" value={sessionEditForm.nextAppointment} onChange={e => setSessionEditForm(f => ({ ...f, nextAppointment: e.target.value }))} /></div>
                      <div className="form-group" style={{ margin: 0 }}><label style={{ fontSize: 12 }}>المبلغ المدفوع (ج.م)</label><input className="form-control" type="number" value={sessionEditForm.amountPaid} onChange={e => setSessionEditForm(f => ({ ...f, amountPaid: parseFloat(e.target.value) || 0 }))} /></div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Session Images */}
            <div className="card">
              <h3 style={{ fontWeight: 800, fontSize: 14, color: '#1e293b', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>📷 صور الجلسة</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
                {SESSION_SLOTS.map(slot => {
                  const slotImgs = (selectedSession.images || []).filter(img => img.type === slot.type || img.type === `intraoral_${slot.type.split('_')[0]}`);
                  return (
                    <div key={slot.type} style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: 'white' }}>
                      <div style={{ background: '#0f172a', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>{slot.label}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.1)', borderRadius: 99, padding: '1px 6px' }}>{slotImgs.length}</span>
                      </div>
                      {slotImgs.length > 0 && (
                        <div style={{ padding: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {slotImgs.map(img => (
                            <div key={img._id} style={{ width: 80 }}>
                              <div style={{ position: 'relative' }}>
                                <img src={img.url} alt={slot.label} style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #e2e8f0', display: 'block', cursor: 'pointer' }} onClick={() => setLightbox(img.url)} />
                                <button onClick={() => setLightbox(img.url)} style={{ position: 'absolute', top: 2, left: 2, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 3, padding: '1px 3px', cursor: 'pointer', color: 'white' }}><FiMaximize2 size={9}/></button>
                              </div>
                              {img.notes && <div style={{ fontSize: 9, color: '#64748b', marginTop: 2, lineHeight: 1.3 }}>{img.notes}</div>}
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                                <button onClick={() => toggleSessionImageVis(selectedSession._id, img._id, img.isVisibleToPatient !== false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: img.isVisibleToPatient !== false ? '#10b981' : '#cbd5e1' }}>
                                  {img.isVisibleToPatient !== false ? <FiEye size={11}/> : <FiEyeOff size={11}/>}
                                </button>
                                <button onClick={() => openSessionImgEdit(selectedSession._id, img)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2563eb' }} title="ملاحظات الصورة"><FiEdit2 size={10}/></button>
                                <button onClick={() => openDrawingModal('session', img._id, img.url, img.penNote, selectedSession._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: img.penNote ? '#2563eb' : '#94a3b8' }} title="نوت القلم"><FiEdit3 size={10}/></button>
                                <button onClick={() => deleteSessionImage(selectedSession._id, img._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444' }}><FiTrash2 size={11}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ padding: '6px 8px', borderTop: slotImgs.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
                        <button style={{ width: '100%', padding: '5px', border: '1.5px dashed #bfdbfe', borderRadius: 6, background: '#f8fbff', color: '#2563eb', fontWeight: 600, fontSize: 11, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }} onClick={() => triggerSessionUpload(selectedSession._id, slot.type)}>
                          <FiUpload size={10}/> أضف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Image Notes Modal */}
      {editingSessionImg && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingSessionImg(null)}>
          <div className="modal">
            <div className="modal-header"><span className="modal-title">📝 ملاحظات الصورة</span><button className="modal-close" onClick={() => setEditingSessionImg(null)}>×</button></div>
            {editingSessionImg?.img?.url && (
              <div style={{ marginBottom: 14, textAlign: 'center' }}>
                <img src={editingSessionImg.img.url} alt="" style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </div>
            )}
            <div className="form-group">
              <label>📝 ملاحظات الصورة</label>
              <textarea className="form-control" rows={3} value={sessionImgForm.notes} onChange={e => setSessionImgForm(f => ({ ...f, notes: e.target.value }))} placeholder="أضف ملاحظة طبية لهذه الصورة..." />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setEditingSessionImg(null)}>إلغاء</button>
              <button className="btn btn-primary" onClick={saveSessionImgEdit}><FiSave /> حفظ</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Edit Modal */}
      {editingImg && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditingImg(null)}>
          <div className="modal">
            <div className="modal-header"><span className="modal-title">تعديل وصف الصورة</span><button className="modal-close" onClick={() => setEditingImg(null)}>×</button></div>
            {editingImg?.img?.url && (
              <div style={{ marginBottom: 14, textAlign: 'center' }}>
                <img src={editingImg.img.url} alt="" style={{ maxWidth: '100%', maxHeight: 160, objectFit: 'contain', borderRadius: 8, border: '1px solid #e2e8f0' }} />
              </div>
            )}
            {[['description1', '📌 العنوان / Title'], ['description2', 'تفاصيل إضافية'], ['description3', 'وصف 3'], ['notes', '📝 ملاحظات']].map(([k, l]) => (
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, fontWeight: 900, flexShrink: 0, overflow: 'hidden', border: '2.5px solid #bfdbfe' }}>
              {patient.user?.avatar
                ? <img src={patient.user.avatar} alt={patient.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : patient.fullName?.[0]}
            </div>
          <div>
            <h1 className="page-title">{patient.fullName}</h1>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>{patient.phone}</span>
              {patient.age && <span style={{ color: '#64748b', fontSize: '14px' }}>{patient.age} سنة</span>}
              <span className={`badge ${statusMap[patient.financials?.status]}`}>{statusLabel[patient.financials?.status]}</span>
              {remaining > 0 && <span className="badge badge-danger">متبقي: {remaining.toLocaleString()} ج.م</span>}
            </div>
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
            <button className="btn btn-secondary" onClick={() => setShowPrintModal(true)} title="طباعة إيصال" disabled={printing}><FiPrinter /> {printing ? 'جاري...' : 'طباعة'}</button>
            <button className="btn btn-secondary" onClick={() => navigate(`/doctor/patients/${id}/card`)} title="بطاقة المريض" style={{ background: 'linear-gradient(135deg,#064e3b,#047857)', color: 'white', border: 'none' }}>🪪 بطاقة</button>
            <button className="btn btn-secondary" onClick={() => setShowExport(true)} title="تصدير ملف المريض" style={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: 'white', border: 'none' }}><FiShare2 /> تصدير</button>
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
              <h3 className="section-title" style={{ margin: 0 }}>📸 Extraoral Examination</h3>
              <VisToggleBtn isVisible={vis.faceImages !== false} label="صور الوجه" onClick={() => saveVisibility('faceImages', !(vis.faceImages !== false))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, opacity: vis.faceImages === false ? 0.55 : 1 }}>
              {FACE_SLOTS.map(slot => (
                <ImageSlot key={slot.type} cat="face" slotType={slot.type} slotLabel={slot.label} images={patient.faceImages} triggerUpload={triggerUpload} toggleVis={togglePatientImageVis} deleteImg={deletePatientImage} patchImage={patchPatientImage} openLightbox={setLightbox} onPenClick={openDrawingModal} />
              ))}
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="section-title" style={{ margin: 0 }}>🦷 Intraoral Examination</h3>
              <VisToggleBtn isVisible={vis.intraOralImages !== false} label="صور الفم" onClick={() => saveVisibility('intraOralImages', !(vis.intraOralImages !== false))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, opacity: vis.intraOralImages === false ? 0.55 : 1 }}>
              {INTRAORAL_SLOTS.map(slot => (
                <ImageSlot key={slot.type} cat="intraoral" slotType={slot.type} slotLabel={slot.label} images={patient.intraOralImages} triggerUpload={triggerUpload} toggleVis={togglePatientImageVis} deleteImg={deletePatientImage} patchImage={patchPatientImage} openLightbox={setLightbox} onPenClick={openDrawingModal} />
              ))}
            </div>
          </div>

          {sessions.some(s => s.images && s.images.length > 0) && (
            <div className="card">
              <h3 className="section-title" style={{ margin: '0 0 16px' }}>🗂️ صور الجلسات</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {sessions.filter(s => s.images && s.images.length > 0).map((s, i) => (
                  <div key={s._id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{s.sessionNumber || i + 1}</div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#334155' }}>
                        جلسة #{s.sessionNumber || i + 1} — {format(new Date(s.sessionDate), 'd MMMM yyyy', { locale: ar })}
                      </span>
                      <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', borderRadius: 99, padding: '2px 10px' }}>{s.images.length} صورة</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, paddingRight: 40 }}>
                      {s.images.map((img, idx) => (
                        <div key={img._id || idx} style={{ borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${img.penNote ? '#bfdbfe' : '#e2e8f0'}`, background: '#f8fafc', width: 120, flexShrink: 0 }}>
                          <img src={img.url} alt={img.type} style={{ width: 120, height: 90, objectFit: 'cover', display: 'block', cursor: 'pointer' }} onClick={() => setLightbox(img.url)} />
                          <div style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', fontFamily: 'monospace, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.type?.replace(/_/g, ' ') || 'صورة'}</div>
                              {img.notes && <div style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.notes}</div>}
                            </div>
                            <button onClick={e => { e.stopPropagation(); openDrawingModal('session', img._id, img.url, img.penNote, s._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: img.penNote ? '#2563eb' : '#cbd5e1', flexShrink: 0 }} title="نوت القلم"><FiEdit3 size={11}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {sessions.map((s, i) => (
                <div key={s._id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s', border: '1.5px solid #e2e8f0' }}
                  onClick={() => openSessionDetail(s)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                  <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 15, flexShrink: 0 }}>{s.sessionNumber || i + 1}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>جلسة #{s.sessionNumber || i + 1}</div>
                        <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{format(new Date(s.sessionDate), 'EEEE d MMMM yyyy', { locale: ar })}</div>
                        {s.notes && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.notes}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {s.amountPaid > 0 && <span className="badge badge-success">{s.amountPaid.toLocaleString()} ج.م</span>}
                      {s.images?.length > 0 && <span style={{ fontSize: 11, background: '#eff6ff', color: '#2563eb', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>📷 {s.images.length}</span>}
                      {s.nextStep && <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', borderRadius: 99, padding: '2px 8px', fontWeight: 600 }}>📋 خطوة</span>}
                      <button title={s.isVisibleToPatient !== false ? 'ظاهر للمريض' : 'مخفي'} onClick={e => { e.stopPropagation(); toggleSessionVis(s._id, s.isVisibleToPatient !== false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: s.isVisibleToPatient !== false ? '#10b981' : '#cbd5e1', padding: 4 }}>
                        {s.isVisibleToPatient !== false ? <FiEye size={15}/> : <FiEyeOff size={15}/>}
                      </button>
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>←</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TTT File Tab ── */}
      {activeTab === 'ttt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Problem List */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 16, borderRight: '4px solid #2563eb', paddingRight: 12 }}>Problem List</h3>
            <div className="form-group"><label>1. OH</label><textarea className="form-control" rows={2} value={tttData.oh} onChange={e => setT('oh', e.target.value)} placeholder="Oral hygiene status..." /></div>
            <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 13, color: '#334155' }}>2. Skeletal</div>
            <div className="grid-3" style={{ gap: 10, marginBottom: 12 }}>
              <div className="form-group" style={{ margin: 0 }}><label>AP</label><input className="form-control" value={tttData.skeletalAP} onChange={e => setT('skeletalAP', e.target.value)} placeholder="Class I / II / III" /></div>
              <div className="form-group" style={{ margin: 0 }}><label>V (Vertical)</label><input className="form-control" value={tttData.skeletalV} onChange={e => setT('skeletalV', e.target.value)} placeholder="Normo / Hyper / Hypo" /></div>
              <div className="form-group" style={{ margin: 0 }}><label>T (Transverse)</label><input className="form-control" value={tttData.skeletalT} onChange={e => setT('skeletalT', e.target.value)} placeholder="Normal / Narrow / Wide" /></div>
            </div>
            <div style={{ marginBottom: 8, fontWeight: 700, fontSize: 13, color: '#334155' }}>3. Dental</div>
            <div className="grid-3" style={{ gap: 10, marginBottom: 12 }}>
              <div className="form-group" style={{ margin: 0 }}><label>AP</label><input className="form-control" value={tttData.dentalAP} onChange={e => setT('dentalAP', e.target.value)} placeholder="Class I / II / III" /></div>
              <div className="form-group" style={{ margin: 0 }}><label>V (Vertical)</label><input className="form-control" value={tttData.dentalV} onChange={e => setT('dentalV', e.target.value)} placeholder="Normal / Deep / Open" /></div>
              <div className="form-group" style={{ margin: 0 }}><label>T (Transverse)</label><input className="form-control" value={tttData.dentalT} onChange={e => setT('dentalT', e.target.value)} placeholder="Normal / Crossbite" /></div>
            </div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>4. S.T (Soft Tissue)</label><textarea className="form-control" rows={2} value={tttData.st} onChange={e => setT('st', e.target.value)} placeholder="Soft tissue profile..." /></div>
              <div className="form-group"><label>5. Habit</label><textarea className="form-control" rows={2} value={tttData.habit} onChange={e => setT('habit', e.target.value)} placeholder="Thumb sucking, mouth breathing..." /></div>
            </div>
          </div>

          {/* TTT Objectives */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 16, borderRight: '4px solid #2563eb', paddingRight: 12 }}>TTT Objectives</h3>
            <div className="grid-2" style={{ gap: 10 }}>
              <div className="form-group"><label>1. OH Objective</label><input className="form-control" value={tttData.obj1} onChange={e => setT('obj1', e.target.value)} placeholder="Oral hygiene improvement..." /></div>
              <div className="form-group"><label>2. Skeletal Objective</label><input className="form-control" value={tttData.obj2} onChange={e => setT('obj2', e.target.value)} placeholder="Growth modification..." /></div>
            </div>
            {[
              ['obj3', '3. Align & Level'], ['obj4', '4. OJ'], ['obj5', '5. OB'],
              ['obj6', '6. Midline'], ['obj7', '7. Canine/Incisors Class'],
              ['obj8', '8. Molar Relationship'], ['obj9', '9. Buccal Interdigitation'], ['obj10', '10. Retention'],
            ].map(([k, l]) => (
              <div className="form-group" key={k}><label>{l}</label><input className="form-control" value={tttData[k]} onChange={e => setT(k, e.target.value)} /></div>
            ))}
          </div>

          {/* Bolton Analysis */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 16, borderRight: '4px solid #2563eb', paddingRight: 12 }}>Bolton Analysis</h3>
            <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: '#334155', border: '1px solid #bae6fd', lineHeight: 1.8 }}>
              <div><strong>Anterior Ratio (%) =</strong> Sum M-D (#33–#43) ÷ Sum M-D (#13–#23) × 100</div>
              <div><strong>Overall Ratio (%) =</strong> Sum M-D (#36–#46) ÷ Sum M-D (#16–#26) × 100</div>
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div className="form-group"><label>Anterior Ratio (%)</label><input className="form-control" type="number" step="0.01" value={tttData.boltonAnterior} onChange={e => setT('boltonAnterior', e.target.value)} placeholder="77.2" /></div>
              <div className="form-group"><label>Overall Ratio (%)</label><input className="form-control" type="number" step="0.01" value={tttData.boltonOverall} onChange={e => setT('boltonOverall', e.target.value)} placeholder="91.3" /></div>
            </div>
          </div>

          {/* Arch Length Analysis */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 16, borderRight: '4px solid #2563eb', paddingRight: 12 }}>Tooth Size & Arch Length Analysis</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#1e3a8a', color: 'white' }}>
                    {['', 'Total Arch Length', 'Total Tooth Size', 'Discrepancy'].map((h, i) => (
                      <th key={i} style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[['Upper (U)', 'upperArchLength', 'upperToothSize', 'upperDiscrepancy'], ['Lower (L)', 'lowerArchLength', 'lowerToothSize', 'lowerDiscrepancy']].map(([row, k1, k2, k3]) => (
                    <tr key={row} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 14px', fontWeight: 700, background: '#f8fafc', whiteSpace: 'nowrap' }}>{row}</td>
                      {[k1, k2, k3].map(k => (
                        <td key={k} style={{ padding: '6px 8px' }}>
                          <input className="form-control" type="number" step="0.1" value={tttData[k]} onChange={e => setT(k, e.target.value)} placeholder="0.0" style={{ margin: 0 }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Space Requirements Summary */}
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 16, borderRight: '4px solid #2563eb', paddingRight: 12 }}>Summary of Space Requirements</h3>
            {[
              ['srCrowding', 'Crowding and spacing'],
              ['srLevelling', 'Levelling occlusal curve'],
              ['srArchWidth', 'Arch width change'],
              ['srIncisorSagittal', 'Incisor sagittal position change (bodily retraction or protraction)'],
              ['srIncisorInclination', 'Incisor inclination'],
            ].map(([k, l]) => (
              <div className="form-group" key={k}>
                <label style={{ fontFamily: 'monospace, sans-serif', fontSize: 12 }}>{l}</label>
                <input className="form-control" value={tttData[k]} onChange={e => setT(k, e.target.value)} placeholder="— mm" />
              </div>
            ))}
          </div>

          {/* Space Gaining Methods */}
          {[
            {
              title: 'Space Gaining Method — Upper Arch',
              prefix: 'upper',
              color: '#1d4ed8',
              bg: '#eff6ff',
              border: '#bfdbfe',
            },
            {
              title: 'Space Gaining Method — Lower Arch',
              prefix: 'lower',
              color: '#065f46',
              bg: '#ecfdf5',
              border: '#a7f3d0',
            },
          ].map(({ title, prefix, color, bg, border }) => {
            const p = prefix;
            return (
              <div className="card" key={p}>
                <h3 className="section-title" style={{ marginBottom: 16, borderRight: `4px solid ${color}`, paddingRight: 12, color }}>{title}</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                  {[
                    [`${p}ArchLengthening`, 'Arch lengthening'],
                    [`${p}Transverse`, 'Transverse arch expansion'],
                    [`${p}IER`, 'Interdental enamel reduction'],
                    [`${p}Extractions`, 'Dental extractions'],
                  ].map(([k, l]) => (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', border: `1.5px solid ${tttData[k] ? color : '#e2e8f0'}`, borderRadius: 10, background: tttData[k] ? bg : 'white', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: tttData[k] ? color : '#64748b', userSelect: 'none', transition: 'all 0.15s' }}>
                      <input type="checkbox" checked={!!tttData[k]} onChange={e => setT(k, e.target.checked)} style={{ accentColor: color }} />
                      {l}
                    </label>
                  ))}
                </div>
                <div className="grid-2" style={{ gap: 10 }}>
                  <div className="form-group"><label style={{ fontFamily: 'monospace,sans-serif', fontSize: 12 }}>TIMING OF EXTRACTIONS</label><input className="form-control" value={tttData[`${p}TimingExtr`]} onChange={e => setT(`${p}TimingExtr`, e.target.value)} placeholder="e.g. Before bonding" /></div>
                  <div className="form-group"><label style={{ fontFamily: 'monospace,sans-serif', fontSize: 12 }}>TEETH OF EXTRACTIONS</label><input className="form-control" value={tttData[`${p}TeethExtr`]} onChange={e => setT(`${p}TeethExtr`, e.target.value)} placeholder="e.g. #14, #24" /></div>
                  <div className="form-group"><label style={{ fontFamily: 'monospace,sans-serif', fontSize: 12 }}>TIMING OF BONDING</label><input className="form-control" value={tttData[`${p}TimingBond`]} onChange={e => setT(`${p}TimingBond`, e.target.value)} placeholder="e.g. After extractions" /></div>
                  <div className="form-group"></div>
                  <div className="form-group"><label style={{ fontFamily: 'monospace,sans-serif', fontSize: 12, color: '#166534' }}>BOND</label><input className="form-control" value={tttData[`${p}TeethBond`]} onChange={e => setT(`${p}TeethBond`, e.target.value)} placeholder="e.g. All except #18,28" /></div>
                  <div className="form-group"><label style={{ fontFamily: 'monospace,sans-serif', fontSize: 12, color: '#991b1b' }}>SKIP</label><input className="form-control" value={tttData[`${p}TeethSkip`]} onChange={e => setT(`${p}TeethSkip`, e.target.value)} placeholder="e.g. #18, #28" /></div>
                </div>
              </div>
            );
          })}

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 24 }}>
            <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 15, fontWeight: 800 }} onClick={handleSaveTTT} disabled={tttSaving}>
              {tttSaving ? '⏳ جاري الحفظ...' : <><FiSave /> حفظ TTT File</>}
            </button>
          </div>
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

      {/* ── Comments Tab ── */}
      {activeTab === 'comments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FiMessageSquare size={16} /> تعليقات المريض وردود الطبيب</h3>
            {comments.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94a3b8' }}>
                <FiMessageSquare size={32} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div style={{ fontSize: 14 }}>لا توجد تعليقات بعد</div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {comments.map(comment => (
                <div key={comment._id} style={{ background: '#f8fafc', borderRadius: 14, padding: 16, border: '1.5px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: comment.authorRole === 'patient' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'linear-gradient(135deg, #2563eb, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                      {comment.authorName?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{comment.authorName}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: comment.authorRole === 'patient' ? '#e0f2fe' : '#eff6ff', color: comment.authorRole === 'patient' ? '#0284c7' : '#2563eb' }}>
                          {comment.authorRole === 'patient' ? '🙍 مريض' : '🩺 طبيب'}
                        </span>
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{format(new Date(comment.createdAt), 'd/M/yyyy - HH:mm', { locale: ar })}</span>
                      </div>
                      <p style={{ fontSize: 14, color: '#334155', margin: '8px 0 0', lineHeight: 1.7 }}>{comment.text}</p>
                    </div>
                    <button onClick={() => handleDeleteComment(comment._id, null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', opacity: 0.6, flexShrink: 0 }} title="حذف">✕</button>
                  </div>

                  {(comment.replies || []).map(reply => (
                    <div key={reply._id} style={{ marginRight: 48, marginTop: 10, background: '#eff6ff', borderRadius: 10, padding: '10px 14px', border: '1px solid #dbeafe' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: '#1e40af' }}>{reply.authorName}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99, background: '#dbeafe', color: '#1e40af' }}>رد الطبيب</span>
                        <span style={{ fontSize: 11, color: '#94a3b8', flex: 1 }}>{format(new Date(reply.createdAt), 'd/M/yyyy', { locale: ar })}</span>
                        <button onClick={() => handleDeleteComment(reply._id, comment._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0, fontSize: 12, opacity: 0.6 }}>✕</button>
                      </div>
                      <p style={{ fontSize: 13, color: '#1e293b', margin: 0, lineHeight: 1.6 }}>{reply.text}</p>
                    </div>
                  ))}

                  {replyingTo === comment._id ? (
                    <div style={{ marginRight: 48, marginTop: 10, display: 'flex', gap: 8 }}>
                      <textarea
                        value={replyText[comment._id] || ''}
                        onChange={e => setReplyText(p => ({ ...p, [comment._id]: e.target.value }))}
                        placeholder="اكتب ردك هنا..."
                        rows={2}
                        style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #bfdbfe', borderRadius: 10, fontSize: 13, fontFamily: 'Cairo, sans-serif', resize: 'none', outline: 'none' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <button onClick={() => handleReply(comment._id)} disabled={savingComment} style={{ padding: '6px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>
                          <FiSend size={11} /> إرسال
                        </button>
                        <button onClick={() => setReplyingTo(null)} style={{ padding: '6px 14px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 9, fontSize: 12, cursor: 'pointer', fontFamily: 'Cairo, sans-serif' }}>إلغاء</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReplyingTo(comment._id)} style={{ marginRight: 48, marginTop: 8, background: 'none', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Cairo, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiSend size={11} /> رد على التعليق
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title" style={{ marginBottom: 12 }}>💬 إضافة ملاحظة للمريض</h3>
            <form onSubmit={handleAddComment} style={{ display: 'flex', gap: 10 }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="اكتب ملاحظة أو تعليقاً للمريض..."
                rows={3}
                style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, fontFamily: 'Cairo, sans-serif', resize: 'none', outline: 'none' }}
              />
              <button type="submit" className="btn btn-primary" disabled={savingComment || !commentText.trim()} style={{ alignSelf: 'flex-end' }}>
                <FiSend size={14} /> إرسال
              </button>
            </form>
          </div>
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
              <div className="form-group">
                <label>المبلغ المدفوع في هذه الجلسة (ج.م)</label>
                <input className="form-control" type="number" value={sessionForm.amountPaid} onChange={e => setS('amountPaid', e.target.value)} placeholder="0" min="0" />
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                  المتبقي الحالي: <strong style={{ color: '#ef4444' }}>{remaining.toLocaleString()} ج.م</strong>
                  {sessionForm.amountPaid > 0 && <span> → بعد الدفع: <strong style={{ color: '#10b981' }}>{Math.max(0, remaining - parseFloat(sessionForm.amountPaid || 0)).toLocaleString()} ج.م</strong></span>}
                </div>
              </div>

              {/* ── Intraoral Photos ── */}
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <FiImage /> صور Intraoral Examination
                  <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>(اختياري)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {INTRAORAL_SLOTS.map((slot, idx) => {
                    const slotData = sessionIntraoral[idx];
                    return (
                      <div key={slot.type} style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#f8fafc' }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          ref={intraoralRefs.current[idx]}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const preview = URL.createObjectURL(file);
                            setSessionIntraoral(prev => prev.map((s, i) => i === idx ? { ...s, file, preview } : s));
                            e.target.value = '';
                          }}
                        />
                        <div
                          onClick={() => intraoralRefs.current[idx].current.click()}
                          style={{ cursor: 'pointer', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', background: slotData.preview ? 'transparent' : '#f1f5f9', position: 'relative', overflow: 'hidden' }}
                        >
                          {slotData.preview ? (
                            <>
                              <img src={slotData.preview} alt={slot.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                type="button"
                                onClick={e => { e.stopPropagation(); setSessionIntraoral(prev => prev.map((s, i) => i === idx ? { ...s, file: null, preview: null } : s)); }}
                                style={{ position: 'absolute', top: 4, left: 4, background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                              ><FiX size={12} /></button>
                            </>
                          ) : (
                            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                              <FiUpload size={20} />
                              <div style={{ fontSize: 11, marginTop: 4 }}>اضغط للرفع</div>
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '8px 8px 4px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{slot.label}</div>
                          <textarea
                            rows={2}
                            placeholder="ملاحظة..."
                            value={slotData.note}
                            onChange={e => setSessionIntraoral(prev => prev.map((s, i) => i === idx ? { ...s, note: e.target.value } : s))}
                            style={{ width: '100%', fontSize: 11, border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 6px', resize: 'none', fontFamily: 'inherit', direction: 'rtl', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    );
                  })}
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

      {/* ── Print Type Modal ── */}
      {showPrintModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowPrintModal(false)}>
          <div style={{ background: 'white', borderRadius: 20, padding: 28, maxWidth: 400, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 900, fontSize: 17, color: '#0f172a', margin: 0 }}>🖨️ اختر نوع الطباعة</h2>
              <button onClick={() => setShowPrintModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 22 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              {[
                { type: 'full',    icon: '📄', label: 'فاتورة A4',    sub: 'طابعة مكتبية / مستشفى' },
                { type: 'thermal', icon: '🧾', label: 'إيصال حراري', sub: 'طابعة 72mm / إيصالات' },
              ].map(opt => (
                <button key={opt.type}
                  onClick={async () => {
                    setShowPrintModal(false);
                    setPrinting(true);
                    await printInvoice({ patient, session: sessions[sessions.length - 1], type: opt.type });
                    setPrinting(false);
                  }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 14px', borderRadius: 14, border: '2px solid #e2e8f0', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: 15, background: 'white', color: '#0f172a', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#2563eb'; e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.color='#2563eb'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='white'; e.currentTarget.style.color='#0f172a'; }}>
                  <span style={{ fontSize: 32 }}>{opt.icon}</span>
                  <span>{opt.label}</span>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{opt.sub}</span>
                </button>
              ))}
            </div>
            <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#0369a1', lineHeight: 1.7 }}>
              💡 وصّل الطابعة عبر USB ثم اختر النوع المناسب. ستفتح نافذة الطباعة تلقائياً.
            </div>
          </div>
        </div>
      )}

      {showExport && patient && (
        <ExportModal
          patient={patient}
          sessions={sessions}
          ttt={tttData}
          siteInfo={{}}
          onClose={() => setShowExport(false)}
        />
      )}
      {drawingModal && (
        <DrawingCanvas
          imageUrl={drawingModal.imageUrl}
          existingNote={drawingModal.existingNote}
          allNotes={drawingModal.allNotes}
          onSave={saveDrawingNote}
          onClose={() => setDrawingModal(null)}
        />
      )}
    </div>
  );
}
