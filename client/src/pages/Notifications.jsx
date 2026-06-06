import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FiBell, FiCheck, FiTrash2, FiCalendar, FiDollarSign, FiInfo, FiAlertCircle } from 'react-icons/fi';

const typeConfig = {
  appointment: { icon: <FiCalendar />, color: '#2563eb', bg: '#dbeafe', label: 'موعد' },
  payment: { icon: <FiDollarSign />, color: '#10b981', bg: '#d1fae5', label: 'دفع' },
  reminder: { icon: <FiAlertCircle />, color: '#f59e0b', bg: '#fef3c7', label: 'تذكير' },
  system: { icon: <FiInfo />, color: '#7c3aed', bg: '#ede9fe', label: 'نظام' },
  info: { icon: <FiBell />, color: '#64748b', bg: '#f1f5f9', label: 'إشعار' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'info', patientId: '', isForDoctor: false });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch { toast.error('خطأ في تحميل الإشعارات'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
    axios.get('/patients?limit=100').then(r => setPatients(r.data.patients)).catch(() => {});
  }, []);

  const markRead = async (id) => {
    await axios.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await axios.put('/notifications/read-all');
    fetchNotifications();
    toast.success('تم تحديد الكل كمقروء');
  };

  const deleteNotif = async (id) => {
    await axios.delete(`/notifications/${id}`);
    fetchNotifications();
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return toast.error('يرجى ملء الحقول المطلوبة');
    try {
      await axios.post('/notifications', form);
      toast.success('تم إرسال الإشعار');
      setShowAdd(false);
      setForm({ title: '', message: '', type: 'info', patientId: '', isForDoctor: false });
      fetchNotifications();
    } catch { toast.error('خطأ في إرسال الإشعار'); }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">الإشعارات</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? <span className="badge badge-danger">{unreadCount} غير مقروء</span> : 'لا توجد إشعارات غير مقروءة'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}><FiCheck /> تحديد الكل كمقروء</button>
          )}
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><FiBell /> إشعار جديد</button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : notifications.length === 0 ? (
        <div className="empty-state card">
          <FiBell style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }} />
          <p>لا توجد إشعارات</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            return (
              <div key={n._id} style={{
                background: 'white', borderRadius: '12px',
                border: `1px solid ${n.isRead ? '#e2e8f0' : '#bfdbfe'}`,
                padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px',
                opacity: n.isRead ? 0.75 : 1,
                borderRight: n.isRead ? undefined : `4px solid ${cfg.color}`,
              }}>
                <div style={{ background: cfg.bg, color: cfg.color, borderRadius: '10px', padding: '10px', fontSize: '18px', flexShrink: 0 }}>
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '15px', color: '#1e293b' }}>{n.title}</div>
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <span className="badge badge-gray" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      {!n.isRead && (
                        <button className="btn btn-secondary btn-sm" onClick={() => markRead(n._id)} title="تحديد كمقروء">
                          <FiCheck />
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteNotif(n._id)}><FiTrash2 /></button>
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '14px', marginTop: '4px', lineHeight: 1.7 }}>{n.message}</p>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>
                    {format(new Date(n.createdAt), 'EEEE d MMMM yyyy - h:mm a', { locale: ar })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">إرسال إشعار جديد</span>
              <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <form onSubmit={sendNotification}>
              <div className="form-group">
                <label>العنوان *</label>
                <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="عنوان الإشعار" required />
              </div>
              <div className="form-group">
                <label>الرسالة *</label>
                <textarea className="form-control" value={form.message} onChange={e => set('message', e.target.value)} rows={3} placeholder="نص الإشعار..." required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>نوع الإشعار</label>
                  <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                    {Object.entries(typeConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>إرسال إلى</label>
                  <select className="form-control" value={form.isForDoctor ? 'doctor' : form.patientId || 'all'} onChange={e => {
                    if (e.target.value === 'doctor') { set('isForDoctor', true); set('patientId', ''); }
                    else { set('isForDoctor', false); set('patientId', e.target.value === 'all' ? '' : e.target.value); }
                  }}>
                    <option value="all">كل المرضى</option>
                    <option value="doctor">لوحة الطبيب</option>
                    {patients.map(p => <option key={p._id} value={p._id}>{p.fullName}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">إرسال الإشعار</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
