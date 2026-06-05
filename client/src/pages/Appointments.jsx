import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FiCalendar, FiPlus, FiX, FiTrash2, FiCheck, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const statusMap = {
  scheduled: ['badge-info', 'مجدول'],
  completed: ['badge-success', 'مكتمل'],
  cancelled: ['badge-danger', 'ملغي'],
  'no-show': ['badge-warning', 'غائب'],
};

export default function Appointments() {
  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', date: '', time: '', type: 'متابعة', notes: '' });

  const fetchAppointments = async () => {
    setLoading(true);
    let startDate, endDate;
    if (view === 'day') { startDate = currentDate; endDate = currentDate; }
    else if (view === 'week') { startDate = startOfWeek(currentDate, { weekStartsOn: 0 }); endDate = endOfWeek(currentDate, { weekStartsOn: 0 }); }
    else { startDate = startOfMonth(currentDate); endDate = endOfMonth(currentDate); }

    try {
      const res = await axios.get(`/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      setAppointments(res.data);
    } catch { toast.error('خطأ في تحميل المواعيد'); }
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, [view, currentDate]);
  useEffect(() => {
    axios.get('/patients?limit=100').then(res => setPatients(res.data.patients)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.date || !form.time) return toast.error('يرجى ملء الحقول المطلوبة');
    try {
      const patient = patients.find(p => p._id === form.patientId);
      const dateTime = new Date(`${form.date}T${form.time}`);
      await axios.post('/appointments', {
        patientId: form.patientId, patientName: patient?.fullName,
        patientPhone: patient?.phone, date: dateTime,
        time: form.time, type: form.type, notes: form.notes,
      });
      toast.success('تم إضافة الموعد');
      setShowModal(false);
      setForm({ patientId: '', date: '', time: '', type: 'متابعة', notes: '' });
      fetchAppointments();
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/appointments/${id}`, { status });
      fetchAppointments();
      toast.success('تم تحديث الحالة');
    } catch { toast.error('خطأ'); }
  };

  const deleteApt = async (id) => {
    if (!confirm('حذف الموعد؟')) return;
    try { await axios.delete(`/appointments/${id}`); fetchAppointments(); toast.success('تم الحذف'); }
    catch { toast.error('خطأ'); }
  };

  const navigate = (dir) => {
    const offset = view === 'day' ? 1 : view === 'week' ? 7 : 30;
    setCurrentDate(d => addDays(d, dir * offset));
  };

  const getTitle = () => {
    if (view === 'day') return format(currentDate, 'EEEE d MMMM yyyy', { locale: ar });
    if (view === 'week') return `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'd MMM', { locale: ar })} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'd MMM yyyy', { locale: ar })}`;
    return format(currentDate, 'MMMM yyyy', { locale: ar });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">المواعيد</h1>
          <p className="page-subtitle">{appointments.length} موعد</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> موعد جديد</button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div className="tab-list" style={{ marginBottom: 0, width: 'auto' }}>
            {['day', 'week', 'month'].map(v => (
              <button key={v} className={`tab-btn${view === v ? ' active' : ''}`} onClick={() => setView(v)}>
                {v === 'day' ? 'يوم' : v === 'week' ? 'أسبوع' : 'شهر'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}><FiChevronRight /></button>
            <span style={{ fontWeight: 700, fontSize: '15px', minWidth: '180px', textAlign: 'center' }}>{getTitle()}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(1)}><FiChevronLeft /></button>
          </div>
        </div>
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        appointments.length === 0 ? (
          <div className="empty-state card">
            <FiCalendar style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }} />
            <p>لا توجد مواعيد في هذه الفترة</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {appointments.map(apt => {
              const [cls, label] = statusMap[apt.status] || ['badge-gray', apt.status];
              return (
                <div key={apt._id} className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ background: '#dbeafe', borderRadius: '10px', padding: '10px 14px', textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>{format(new Date(apt.date), 'd')}</div>
                    <div style={{ fontSize: '11px', color: '#3b82f6' }}>{format(new Date(apt.date), 'MMM', { locale: ar })}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#1e40af' }}>{apt.time}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: '160px' }}>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{apt.patientName || apt.patientId?.fullName}</div>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>{apt.type}</div>
                    {apt.notes && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{apt.notes}</div>}
                  </div>
                  <span className={`badge ${cls}`}>{label}</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {apt.status === 'scheduled' && (
                      <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(apt._id, 'completed')}><FiCheck /> مكتمل</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(apt._id, 'cancelled')}><FiX /> إلغاء</button>
                      </>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => deleteApt(apt._id)}><FiTrash2 /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">موعد جديد</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>المريض *</label>
                <select className="form-control" value={form.patientId} onChange={e => set('patientId', e.target.value)} required>
                  <option value="">اختر المريض</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.fullName} - {p.phone}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>التاريخ *</label>
                  <input className="form-control" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>الوقت *</label>
                  <input className="form-control" type="time" value={form.time} onChange={e => set('time', e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>نوع الموعد</label>
                <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                  {['متابعة', 'فحص أولي', 'تركيب', 'تعديل', 'صور', 'استشارة'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>ملاحظات</label>
                <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="ملاحظات اختيارية..." />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">إضافة الموعد</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
