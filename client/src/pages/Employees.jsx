import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiUserPlus, FiTrash2, FiEdit2, FiUser, FiPhone, FiX, FiSave, FiKey, FiShield } from 'react-icons/fi';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const ROLE_LABELS = { receptionist: 'موظف استقبال', assistant: 'مساعد طبي', accountant: 'محاسب', other: 'أخرى' };
const ROLE_COLORS = { receptionist: { bg: '#eff6ff', color: '#2563eb' }, assistant: { bg: '#f0fdf4', color: '#16a34a' }, accountant: { bg: '#fef9c3', color: '#854d0e' }, other: { bg: '#f8fafc', color: '#475569' } };

const ALL_PERMISSIONS = [
  { key: 'reception',    label: 'الاستقبال',     icon: '🏥', desc: 'البحث عن مرضى وإضافة كشوف' },
  { key: 'patients',     label: 'المرضى',         icon: '👥', desc: 'عرض قائمة المرضى' },
  { key: 'appointments', label: 'المواعيد',       icon: '📅', desc: 'عرض وإدارة المواعيد' },
  { key: 'payments',     label: 'المدفوعات',      icon: '💰', desc: 'عرض سجل المدفوعات' },
  { key: 'messages',     label: 'الرسائل',        icon: '💬', desc: 'الرسائل الداخلية' },
];

const STYLE = `
  .emp-page { padding: 0; }
  .emp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
  .emp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .emp-card { background: white; border-radius: 16px; padding: 20px; border: 1.5px solid #e2e8f0; transition: box-shadow 0.2s; }
  .emp-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
  .emp-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #2563eb, #06b6d4); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: 800; flex-shrink: 0; }
  .emp-role-badge { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 99px; display: inline-flex; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; overflow-y: auto; }
  .modal-box { background: white; border-radius: 20px; padding: 28px; max-width: 500px; width: 100%; margin: auto; }
  .form-label { font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 5px; display: block; }
  .form-input { width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: 'Cairo', sans-serif; outline: none; margin-bottom: 14px; box-sizing: border-box; }
  .form-input:focus { border-color: #2563eb; }
  .form-select { width: 100%; padding: 10px 12px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: 'Cairo', sans-serif; outline: none; margin-bottom: 14px; box-sizing: border-box; background: white; }
  .empty-state { text-align: center; padding: 60px 20px; color: #94a3b8; }
  .perm-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.15s; border: 1.5px solid #e2e8f0; margin-bottom: 8px; }
  .perm-row:hover { background: #f8fafc; }
  .perm-row.active { border-color: #2563eb; background: #eff6ff; }
  .perm-check { width: 18px; height: 18px; border-radius: 5px; border: 2px solid #cbd5e1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
  .perm-check.on { background: #2563eb; border-color: #2563eb; }
`;

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', employeeRole: 'receptionist', password: '', permissions: ['reception'] });
  const [saving, setSaving] = useState(false);

  const fetchEmployees = async () => {
    try {
      const { data } = await axios.get('/employees');
      setEmployees(data);
    } catch { toast.error('خطأ في تحميل الموظفين'); }
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const togglePerm = (key) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter(p => p !== key)
        : [...f.permissions, key],
    }));
  };

  const openAdd = () => {
    setForm({ name: '', phone: '', employeeRole: 'receptionist', password: '', permissions: ['reception'] });
    setEditingId(null); setShowModal(true);
  };
  const openEdit = (emp) => {
    setForm({ name: emp.name, phone: emp.phone, employeeRole: emp.employeeRole || 'receptionist', password: '', permissions: emp.permissions?.length ? emp.permissions : ['reception'] });
    setEditingId(emp._id); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.permissions.length) return toast.error('يجب اختيار صلاحية واحدة على الأقل');
    setSaving(true);
    try {
      if (editingId) {
        const updates = { name: form.name, phone: form.phone, employeeRole: form.employeeRole, permissions: form.permissions };
        if (form.password) updates.password = form.password;
        await axios.patch(`/employees/${editingId}`, updates);
        toast.success('تم التعديل');
      } else {
        if (!form.password) return toast.error('كلمة المرور مطلوبة');
        await axios.post('/employees', form);
        toast.success('✅ تم إضافة الموظف بنجاح');
      }
      setShowModal(false);
      fetchEmployees();
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ في الحفظ'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل تريد حذف موظف "${name}"؟`)) return;
    try {
      await axios.delete(`/employees/${id}`);
      toast.success('تم الحذف');
      fetchEmployees();
    } catch { toast.error('خطأ في الحذف'); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>جاري التحميل...</div>;

  return (
    <>
      <style>{STYLE}</style>
      <div className="emp-page">
        <div className="emp-header">
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>👥 إدارة الموظفين</h1>
            <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>إضافة وإدارة موظفي العيادة وصلاحياتهم</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}><FiUserPlus /> إضافة موظف</button>
        </div>

        {employees.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>لا يوجد موظفون مضافون</div>
            <div style={{ fontSize: 13, marginBottom: 20 }}>أضف موظفي العيادة لمنحهم صلاحية الدخول</div>
            <button className="btn btn-primary" onClick={openAdd}><FiUserPlus /> إضافة موظف</button>
          </div>
        ) : (
          <div className="emp-grid">
            {employees.map(emp => {
              const rc = ROLE_COLORS[emp.employeeRole] || ROLE_COLORS.other;
              const perms = emp.permissions?.length ? emp.permissions : ['reception'];
              return (
                <div key={emp._id} className="emp-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div className="emp-avatar">{emp.name?.[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{emp.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <FiPhone size={11} /> {emp.phone}
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <span className="emp-role-badge" style={{ background: rc.bg, color: rc.color }}>{ROLE_LABELS[emp.employeeRole] || emp.employeeRole}</span>
                      </div>
                    </div>
                  </div>

                  {/* Permissions badges */}
                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#7c3aed', fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
                      <FiShield size={12} /> الصلاحيات
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {ALL_PERMISSIONS.map(p => (
                        <span key={p.key} style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                          background: perms.includes(p.key) ? '#eff6ff' : '#f1f5f9',
                          color: perms.includes(p.key) ? '#2563eb' : '#94a3b8',
                          border: `1px solid ${perms.includes(p.key) ? '#bfdbfe' : '#e2e8f0'}`,
                        }}>{p.icon} {p.label}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', borderRadius: 10, padding: '8px 12px', marginBottom: 12, fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', fontWeight: 700 }}>
                      <FiKey size={11} /> بيانات الدخول: <strong>{emp.phone}</strong>
                    </div>
                  </div>

                  {emp.createdAt && (
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>أُضيف: {format(new Date(emp.createdAt), 'd MMMM yyyy', { locale: ar })}</div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => openEdit(emp)}><FiEdit2 size={13} /> تعديل</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp._id, emp.name)}><FiTrash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <div className="modal-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#0f172a' }}>{editingId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h2>
                <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <label className="form-label">الاسم الكامل *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الموظف" required />
                <label className="form-label">رقم الجوال *</label>
                <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="01xxxxxxxxx" required />
                <label className="form-label">الوظيفة</label>
                <select className="form-select" value={form.employeeRole} onChange={e => setForm(f => ({ ...f, employeeRole: e.target.value }))}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <label className="form-label">{editingId ? 'كلمة مرور جديدة (اتركها فارغة لعدم التغيير)' : 'كلمة المرور *'}</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder={editingId ? '••••••' : 'كلمة مرور قوية'} required={!editingId} />

                {/* Permissions */}
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiShield size={13} color="#7c3aed" /> الصلاحيات — ماذا يستطيع هذا الموظف رؤيته؟
                </label>
                <div style={{ marginBottom: 14 }}>
                  {ALL_PERMISSIONS.map(p => {
                    const active = form.permissions.includes(p.key);
                    return (
                      <div key={p.key} className={`perm-row ${active ? 'active' : ''}`} onClick={() => togglePerm(p.key)}>
                        <div className={`perm-check ${active ? 'on' : ''}`}>
                          {active && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span style={{ fontSize: 16 }}>{p.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: active ? '#1e3a8a' : '#334155' }}>{p.label}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{p.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>إلغاء</button>
                  <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}><FiSave /> {saving ? 'جاري...' : editingId ? 'حفظ التعديل' : 'إضافة'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
