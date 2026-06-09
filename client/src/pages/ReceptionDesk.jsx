import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiUser, FiPhone, FiPlus, FiPrinter, FiDollarSign, FiCalendar, FiLogOut, FiFileText } from 'react-icons/fi';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { printInvoice } from '../utils/printInvoice';

const statusMap = { paid: '#10b981', partial: '#f59e0b', overdue: '#ef4444', pending: '#94a3b8' };
const statusLabel = { paid: 'مدفوع', partial: 'جزئي', overdue: 'متأخر', pending: 'معلق' };

const STYLE = `
  .rd-wrap { min-height: 100vh; background: #f0f4ff; font-family: 'Cairo', sans-serif; }
  .rd-topbar { background: linear-gradient(135deg, #1e3a8a, #1d4ed8); color: white; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; }
  .rd-topbar h1 { font-size: 18px; font-weight: 800; margin: 0; }
  .rd-topbar .sub { font-size: 12px; opacity: 0.75; margin-top: 2px; }
  .rd-body { max-width: 700px; margin: 0 auto; padding: 24px 16px; }
  .rd-search-card { background: white; border-radius: 18px; padding: 24px; box-shadow: 0 4px 24px rgba(37,99,235,0.10); margin-bottom: 20px; }
  .rd-input-row { display: flex; gap: 10px; }
  .rd-input { flex: 1; padding: 13px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; font-family: 'Cairo', sans-serif; outline: none; direction: ltr; text-align: right; transition: border 0.2s; }
  .rd-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
  .rd-btn { padding: 13px 22px; background: #2563eb; color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; font-family: 'Cairo', sans-serif; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s; }
  .rd-btn:hover { background: #1d4ed8; }
  .rd-btn:disabled { background: #94a3b8; cursor: not-allowed; }
  .rd-patient-card { background: white; border-radius: 18px; padding: 22px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); margin-bottom: 20px; }
  .rd-patient-header { display: flex; align-items: center; gap: 16px; margin-bottom: 18px; padding-bottom: 18px; border-bottom: 1px solid #f1f5f9; }
  .rd-avatar { width: 64px; height: 64px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 800; flex-shrink: 0; overflow: hidden; }
  .rd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .rd-stat { background: #f8fafc; border-radius: 12px; padding: 14px 10px; text-align: center; border: 1.5px solid #e2e8f0; }
  .rd-stat .val { font-size: 20px; font-weight: 900; }
  .rd-stat .lbl { font-size: 11px; color: #64748b; margin-top: 2px; }
  .rd-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .rd-action-btn { padding: 14px 16px; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; font-family: 'Cairo', sans-serif; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; }
  .rd-new-session-form { background: #f0f9ff; border: 2px solid #bfdbfe; border-radius: 14px; padding: 18px; margin-top: 16px; }
  .rd-form-label { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 5px; display: block; }
  .rd-form-input { width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: 'Cairo', sans-serif; outline: none; margin-bottom: 12px; box-sizing: border-box; }
  .rd-form-input:focus { border-color: #2563eb; }
  .rd-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .rd-empty { text-align: center; padding: 48px 20px; color: #94a3b8; }
  @media (max-width: 480px) {
    .rd-stats { grid-template-columns: repeat(3, 1fr); }
    .rd-actions { grid-template-columns: 1fr; }
    .rd-grid2 { grid-template-columns: 1fr; }
  }
`;

export default function ReceptionDesk() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [patient, setPatient] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sessionForm, setSessionForm] = useState({ sessionDate: new Date().toISOString().slice(0,10), notes: '', nextAppointment: '', amountPaid: '', remainingAmount: '' });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSearching(true);
    setPatient(null);
    setSessions([]);
    try {
      let p = phone.trim();
      if (!p.startsWith('0') && p.length === 10) p = '0' + p;
      const res = await axios.get(`/patients/search?q=${encodeURIComponent(p)}`);
      const list = res.data || [];
      if (list.length === 0) { toast.error('لا يوجد مريض بهذا الرقم'); setSearching(false); return; }
      const pData = list[0];
      const [pFull, sData] = await Promise.all([
        axios.get(`/patients/${pData._id}`),
        axios.get(`/sessions?patientId=${pData._id}`),
      ]);
      setPatient(pFull.data);
      setSessions(sData.data || []);
    } catch { toast.error('خطأ في البحث'); }
    setSearching(false);
  };

  const handleAddSession = async (e) => {
    e.preventDefault();
    if (!sessionForm.sessionDate) return toast.error('يرجى إدخال تاريخ الجلسة');
    setSaving(true);
    try {
      await axios.post('/sessions', {
        patientId: patient._id,
        sessionDate: sessionForm.sessionDate,
        notes: sessionForm.notes,
        nextAppointment: sessionForm.nextAppointment || undefined,
        amountPaid: parseFloat(sessionForm.amountPaid) || 0,
        remainingAmount: parseFloat(sessionForm.remainingAmount) || 0,
      });
      if (parseFloat(sessionForm.amountPaid) > 0) {
        await axios.post('/payments', { patientId: patient._id, patientName: patient.fullName, amount: parseFloat(sessionForm.amountPaid), type: 'session', method: 'cash', notes: `كشف - استقبال` });
        const updatedPatient = await axios.get(`/patients/${patient._id}`);
        setPatient(updatedPatient.data);
      }
      const updatedSessions = await axios.get(`/sessions?patientId=${patient._id}`);
      setSessions(updatedSessions.data || []);
      toast.success('✅ تم إضافة الكشف بنجاح');
      setShowSessionForm(false);
      if (parseFloat(sessionForm.amountPaid) > 0) {
        setTimeout(() => {
          printInvoice({ patient: { ...patient, financials: { ...patient.financials, totalPaid: (patient.financials?.totalPaid || 0) + parseFloat(sessionForm.amountPaid) } }, session: { sessionDate: sessionForm.sessionDate, notes: sessionForm.notes, amountPaid: parseFloat(sessionForm.amountPaid) } });
        }, 300);
      }
      setSessionForm({ sessionDate: new Date().toISOString().slice(0,10), notes: '', nextAppointment: '', amountPaid: '', remainingAmount: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ في إضافة الكشف'); }
    setSaving(false);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const remaining = patient ? (patient.financials?.totalCost || 0) - (patient.financials?.totalPaid || 0) : 0;

  return (
    <>
      <style>{STYLE}</style>
      <div className="rd-wrap">
        <div className="rd-topbar">
          <div>
            <h1>🏥 لوحة الاستقبال</h1>
            <div className="sub">مرحباً، {user?.name || 'موظف الاستقبال'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {user?.role === 'doctor' && (
              <button onClick={() => navigate('/doctor')} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>
                لوحة الطبيب
              </button>
            )}
            <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: 'white', padding: '8px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'Cairo, sans-serif' }}>
              <FiLogOut size={15} /> خروج
            </button>
          </div>
        </div>

        <div className="rd-body">
          <div className="rd-search-card">
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiSearch size={18} color="#2563eb" /> البحث عن مريض
            </h2>
            <form onSubmit={handleSearch}>
              <div className="rd-input-row">
                <input
                  className="rd-input"
                  type="tel"
                  placeholder="أدخل رقم الجوال (مثال: 01156798324)"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="rd-btn" disabled={searching}>
                  <FiSearch size={16} />
                  {searching ? 'جاري البحث...' : 'بحث'}
                </button>
              </div>
            </form>
          </div>

          {!patient && !searching && (
            <div className="rd-empty">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#475569' }}>ابحث برقم جوال المريض</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>ستظهر بيانات المريض وإمكانية إضافة كشف جديد</div>
            </div>
          )}

          {patient && (
            <div className="rd-patient-card">
              <div className="rd-patient-header">
                <div className="rd-avatar">
                  {patient.user?.avatar ? (
                    <img src={patient.user.avatar} alt={patient.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : patient.fullName?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>{patient.fullName}</h2>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><FiPhone size={12} /> {patient.phone}</span>
                    {patient.age && <span style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}><FiUser size={12} /> {patient.age} سنة</span>}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 10px', borderRadius: 99, background: patient.financials?.status === 'paid' ? '#dcfce7' : patient.financials?.status === 'overdue' ? '#fee2e2' : '#fef9c3', color: patient.financials?.status === 'paid' ? '#16a34a' : patient.financials?.status === 'overdue' ? '#dc2626' : '#854d0e' }}>
                      {statusLabel[patient.financials?.status] || 'معلق'}
                    </span>
                  </div>
                </div>
                {user?.role === 'doctor' && (
                  <button onClick={() => navigate(`/doctor/patients/${patient._id}`)} style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#2563eb', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'Cairo, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiFileText size={14} /> ملف كامل
                  </button>
                )}
              </div>

              <div className="rd-stats">
                <div className="rd-stat">
                  <div className="val" style={{ color: '#1e293b' }}>{(patient.financials?.totalCost || 0).toLocaleString()}</div>
                  <div className="lbl">إجمالي التكلفة (ج.م)</div>
                </div>
                <div className="rd-stat">
                  <div className="val" style={{ color: '#10b981' }}>{(patient.financials?.totalPaid || 0).toLocaleString()}</div>
                  <div className="lbl">المدفوع (ج.م)</div>
                </div>
                <div className="rd-stat">
                  <div className="val" style={{ color: remaining > 0 ? '#ef4444' : '#10b981' }}>{Math.max(0, remaining).toLocaleString()}</div>
                  <div className="lbl">المتبقي (ج.م)</div>
                </div>
              </div>

              {sessions.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>آخر جلسة:</div>
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px', border: '1px solid #e2e8f0', fontSize: 13 }}>
                    <span style={{ fontWeight: 700 }}>{format(new Date(sessions[sessions.length - 1].sessionDate), 'd MMMM yyyy', { locale: ar })}</span>
                    {sessions[sessions.length - 1].notes && <span style={{ color: '#64748b', marginRight: 8 }}> — {sessions[sessions.length - 1].notes.slice(0, 60)}{sessions[sessions.length - 1].notes.length > 60 ? '...' : ''}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>إجمالي الجلسات: {sessions.length}</div>
                </div>
              )}

              <div className="rd-actions">
                <button className="rd-action-btn" style={{ background: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe' }} onClick={() => setShowSessionForm(!showSessionForm)}>
                  <FiPlus size={16} /> {showSessionForm ? 'إلغاء' : 'كشف جديد'}
                </button>
                <button className="rd-action-btn" style={{ background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0' }} onClick={() => printInvoice({ patient, session: sessions[sessions.length - 1] })}>
                  <FiPrinter size={16} /> طباعة إيصال
                </button>
              </div>

              {showSessionForm && (
                <div className="rd-new-session-form">
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1e3a8a', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiCalendar size={16} /> إضافة كشف جديد
                  </h3>
                  <form onSubmit={handleAddSession}>
                    <div className="rd-grid2">
                      <div>
                        <label className="rd-form-label">تاريخ الكشف *</label>
                        <input className="rd-form-input" type="date" value={sessionForm.sessionDate} onChange={e => setSessionForm(f => ({ ...f, sessionDate: e.target.value }))} required />
                      </div>
                      <div>
                        <label className="rd-form-label">الموعد القادم</label>
                        <input className="rd-form-input" type="date" value={sessionForm.nextAppointment} onChange={e => setSessionForm(f => ({ ...f, nextAppointment: e.target.value }))} />
                      </div>
                    </div>
                    <label className="rd-form-label">ملاحظات الكشف</label>
                    <textarea className="rd-form-input" rows={2} value={sessionForm.notes} onChange={e => setSessionForm(f => ({ ...f, notes: e.target.value }))} placeholder="ما تم في هذا الكشف..." />
                    <div className="rd-grid2">
                      <div>
                        <label className="rd-form-label">المبلغ المدفوع (ج.م)</label>
                        <input className="rd-form-input" type="number" min="0" value={sessionForm.amountPaid} onChange={e => setSessionForm(f => ({ ...f, amountPaid: e.target.value }))} placeholder="0" />
                      </div>
                      <div>
                        <label className="rd-form-label">المبلغ المتبقي (ج.م)</label>
                        <input className="rd-form-input" type="number" min="0" value={sessionForm.remainingAmount} onChange={e => setSessionForm(f => ({ ...f, remainingAmount: e.target.value }))} placeholder="0" />
                      </div>
                    </div>
                    <button type="submit" className="rd-btn" disabled={saving} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
                      <FiPlus size={16} /> {saving ? 'جاري الحفظ...' : 'حفظ الكشف'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
