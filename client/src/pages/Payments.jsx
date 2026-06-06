import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiDollarSign, FiPlus, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const methodMap = { cash: 'نقدي', card: 'بطاقة', transfer: 'تحويل', wallet: 'محفظة' };
const typeMap = { deposit: 'دفعة أولى', session: 'جلسة', full: 'كامل', partial: 'جزئي' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ patientId: '', amount: '', type: 'session', method: 'cash', notes: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        axios.get('/payments'),
        axios.get('/payments/stats?period=month'),
      ]);
      setPayments(paymentsRes.data);
      setStats(statsRes.data);
    } catch { toast.error('خطأ في التحميل'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    axios.get('/patients?limit=100').then(res => setPatients(res.data.patients)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.amount) return toast.error('يرجى ملء الحقول المطلوبة');
    try {
      await axios.post('/payments', { ...form, amount: parseFloat(form.amount) });
      toast.success('تم تسجيل الدفع');
      setShowModal(false);
      setForm({ patientId: '', amount: '', type: 'session', method: 'cash', notes: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">المدفوعات</h1>
          <p className="page-subtitle">{payments.length} عملية</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> تسجيل دفع</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'إيرادات الشهر', value: `${(stats?.total || 0).toLocaleString()} ج.م`, color: '#10b981', bg: '#d1fae5' },
          { label: 'عدد العمليات', value: stats?.count || 0, color: '#2563eb', bg: '#dbeafe' },
          { label: 'إجمالي المدفوعات', value: `${payments.reduce((s, p) => s + p.amount, 0).toLocaleString()} ج.م`, color: '#7c3aed', bg: '#ede9fe' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: s.bg, color: s.color, borderRadius: '10px', padding: '10px', fontSize: '20px' }}><FiDollarSign /></div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? <div className="loading"><div className="spinner"></div></div> : (
        payments.length === 0 ? (
          <div className="empty-state card">
            <FiDollarSign style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }} />
            <p>لا توجد مدفوعات بعد</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>المريض</th>
                  <th>المبلغ</th>
                  <th>النوع</th>
                  <th>طريقة الدفع</th>
                  <th>التاريخ</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 700 }}>{p.patientName}</td>
                    <td style={{ color: '#10b981', fontWeight: 700, fontSize: '16px' }}>{p.amount.toLocaleString()} ج.م</td>
                    <td><span className="badge badge-info">{typeMap[p.type] || p.type}</span></td>
                    <td><span className="badge badge-gray">{methodMap[p.method] || p.method}</span></td>
                    <td style={{ color: '#64748b', fontSize: '13px' }}>{format(new Date(p.date), 'd MMMM yyyy', { locale: ar })}</td>
                    <td style={{ color: '#94a3b8', fontSize: '13px' }}>{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">تسجيل دفع جديد</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>المريض *</label>
                <select className="form-control" value={form.patientId} onChange={e => set('patientId', e.target.value)} required>
                  <option value="">اختر المريض</option>
                  {patients.map(p => (
                    <option key={p._id} value={p._id}>{p.fullName} - متبقي: {(p.financials?.remaining || 0).toLocaleString()} ج.م</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>المبلغ (ج.م) *</label>
                <input className="form-control" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" min="0" required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>نوع الدفع</label>
                  <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                    {Object.entries(typeMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>طريقة الدفع</label>
                  <select className="form-control" value={form.method} onChange={e => set('method', e.target.value)}>
                    {Object.entries(methodMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>ملاحظات</label>
                <textarea className="form-control" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>إلغاء</button>
                <button type="submit" className="btn btn-primary">تسجيل الدفع</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
