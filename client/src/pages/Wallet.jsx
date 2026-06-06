import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FiDollarSign, FiArrowUp, FiArrowDown, FiPlus, FiSearch } from 'react-icons/fi';

const txTypeMap = {
  deposit: { label: 'إيداع', color: '#10b981', bg: '#d1fae5', icon: <FiArrowDown /> },
  withdrawal: { label: 'سحب', color: '#ef4444', bg: '#fee2e2', icon: <FiArrowUp /> },
  payment: { label: 'دفع', color: '#2563eb', bg: '#dbeafe', icon: <FiArrowUp /> },
  refund: { label: 'استرداد', color: '#f59e0b', bg: '#fef3c7', icon: <FiArrowDown /> },
};

export default function Wallet() {
  const [wallets, setWallets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [form, setForm] = useState({ patientId: '', amount: '', description: '' });
  const [patients, setPatients] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [walletsRes, summaryRes] = await Promise.all([
        axios.get('/wallet'),
        axios.get('/wallet/clinic-summary'),
      ]);
      setWallets(walletsRes.data.wallets);
      setSummary(walletsRes.data);
    } catch { toast.error('خطأ في التحميل'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    axios.get('/patients?limit=100').then(r => setPatients(r.data.patients)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.amount) return toast.error('يرجى ملء الحقول');
    try {
      await axios.post('/wallet/deposit', { patientId: form.patientId, amount: parseFloat(form.amount), description: form.description });
      toast.success('تم الإيداع بنجاح');
      setShowDeposit(false);
      setForm({ patientId: '', amount: '', description: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ'); }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.amount) return toast.error('يرجى ملء الحقول');
    try {
      await axios.post('/wallet/withdraw', { patientId: form.patientId, amount: parseFloat(form.amount), description: form.description });
      toast.success('تم السحب بنجاح');
      setShowWithdraw(false);
      setForm({ patientId: '', amount: '', description: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ'); }
  };

  const filtered = wallets.filter(w =>
    w.patientName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">المحفظة الإلكترونية</h1>
          <p className="page-subtitle">إدارة محافظ المرضى</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-success" onClick={() => setShowDeposit(true)}><FiArrowDown /> إيداع</button>
          <button className="btn btn-danger" onClick={() => setShowWithdraw(true)}><FiArrowUp /> سحب</button>
        </div>
      </div>

      {/* Clinic Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'إجمالي الأرصدة', value: `${(summary?.totalBalance || 0).toLocaleString()} ج.م`, color: '#2563eb', bg: '#dbeafe', icon: <FiDollarSign /> },
          { label: 'إجمالي المودع', value: `${(summary?.totalDeposited || 0).toLocaleString()} ج.م`, color: '#10b981', bg: '#d1fae5', icon: <FiArrowDown /> },
          { label: 'عدد المحافظ', value: wallets.length, color: '#7c3aed', bg: '#ede9fe', icon: <FiDollarSign /> },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ background: s.bg, color: s.color, borderRadius: '12px', padding: '12px', fontSize: '20px', flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Wallets list */}
        <div>
          <div className="card" style={{ padding: '12px', marginBottom: '16px' }}>
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input className="form-control" style={{ paddingRight: '40px' }} placeholder="بحث باسم المريض..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? <div className="loading"><div className="spinner"></div></div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtered.length === 0 ? (
                <div className="empty-state card"><p>لا توجد محافظ بعد</p></div>
              ) : filtered.map(w => (
                <div key={w._id} onClick={() => setSelected(selected?._id === w._id ? null : w)} style={{
                  background: 'white', borderRadius: '12px', padding: '16px 18px',
                  border: selected?._id === w._id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{w.patientName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {w.transactions?.length || 0} عملية
                      </div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: '18px', color: w.balance > 0 ? '#10b981' : '#94a3b8' }}>
                        {w.balance.toLocaleString()} ج.م
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>الرصيد</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Transaction detail */}
        <div>
          {selected ? (
            <div className="card">
              <h3 className="section-title">سجل معاملات {selected.patientName}</h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                {[
                  ['الرصيد', selected.balance, '#2563eb'],
                  ['المودع', selected.totalDeposited, '#10b981'],
                  ['المسحوب', selected.totalWithdrawn, '#ef4444'],
                ].map(([l, v, c]) => (
                  <div key={l} style={{ flex: 1, textAlign: 'center', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: c }}>{(v || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{l} (ج.م)</div>
                  </div>
                ))}
              </div>
              {!selected.transactions?.length ? (
                <div className="empty-state"><p>لا توجد معاملات</p></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {[...selected.transactions].reverse().map((tx, i) => {
                    const cfg = txTypeMap[tx.type] || txTypeMap.deposit;
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ background: cfg.bg, color: cfg.color, borderRadius: '8px', padding: '8px', fontSize: '16px' }}>{cfg.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{tx.description || cfg.label}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{format(new Date(tx.date), 'd/M/yyyy h:mm a', { locale: ar })}</div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, color: cfg.color }}>
                            {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}{tx.amount.toLocaleString()} ج.م
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>رصيد: {(tx.balanceAfter || 0).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state card" style={{ height: '300px' }}>
              <FiDollarSign style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }} />
              <p>اختر محفظة لعرض تفاصيلها</p>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDeposit && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowDeposit(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">إيداع في المحفظة</span>
              <button className="modal-close" onClick={() => setShowDeposit(false)}>×</button>
            </div>
            <form onSubmit={handleDeposit}>
              <div className="form-group">
                <label>المريض *</label>
                <select className="form-control" value={form.patientId} onChange={e => set('patientId', e.target.value)} required>
                  <option value="">اختر المريض</option>
                  {patients.map(p => <option key={p._id} value={p._id}>{p.fullName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>المبلغ (ج.م) *</label>
                <input className="form-control" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" min="1" required />
              </div>
              <div className="form-group">
                <label>ملاحظات</label>
                <input className="form-control" value={form.description} onChange={e => set('description', e.target.value)} placeholder="وصف العملية" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeposit(false)}>إلغاء</button>
                <button type="submit" className="btn btn-success"><FiArrowDown /> إيداع</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowWithdraw(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">سحب من المحفظة</span>
              <button className="modal-close" onClick={() => setShowWithdraw(false)}>×</button>
            </div>
            <form onSubmit={handleWithdraw}>
              <div className="form-group">
                <label>المريض *</label>
                <select className="form-control" value={form.patientId} onChange={e => set('patientId', e.target.value)} required>
                  <option value="">اختر المريض</option>
                  {wallets.filter(w => w.balance > 0).map(w => (
                    <option key={w._id} value={w.patientId}>{w.patientName} - رصيد: {w.balance.toLocaleString()} ج.م</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>المبلغ (ج.م) *</label>
                <input className="form-control" type="number" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" min="1" required />
              </div>
              <div className="form-group">
                <label>ملاحظات</label>
                <input className="form-control" value={form.description} onChange={e => set('description', e.target.value)} placeholder="سبب السحب" />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdraw(false)}>إلغاء</button>
                <button type="submit" className="btn btn-danger"><FiArrowUp /> سحب</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
