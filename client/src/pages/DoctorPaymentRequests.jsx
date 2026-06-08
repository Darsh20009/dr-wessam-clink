import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FiCheck, FiX, FiRefreshCw, FiEye, FiClock, FiDollarSign, FiUser, FiMessageSquare } from 'react-icons/fi';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
  .pr-root { font-family: 'Cairo', sans-serif; direction: rtl; }
  .pr-card { background: white; border-radius: 14px; border: 1.5px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }
  .pr-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }
  .pr-badge.pending   { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .pr-badge.approved  { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
  .pr-badge.rejected  { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
  .pr-badge.reupload-requested { background: #ede9fe; color: #5b21b6; border: 1px solid #ddd6fe; }
  .pr-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: none; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Cairo', sans-serif; transition: all 0.18s; }
  .pr-btn:hover:not(:disabled) { filter: brightness(0.92); transform: translateY(-1px); }
  .pr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .pr-btn.approve  { background: #22c55e; color: white; }
  .pr-btn.reject   { background: #ef4444; color: white; }
  .pr-btn.reupload { background: #8b5cf6; color: white; }
  .pr-filter-btn { padding: 7px 16px; border-radius: 8px; border: 1.5px solid #e2e8f0; background: white; font-family: 'Cairo', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; color: #64748b; transition: all 0.18s; }
  .pr-filter-btn.active { background: #2563eb; color: white; border-color: #2563eb; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .pr-anim { animation: fadeUp 0.25s ease both; }
`;

const STATUS_LABELS = {
  pending:            { label: 'في الانتظار', icon: '⏳' },
  approved:           { label: 'تم التأكيد',  icon: '✅' },
  rejected:           { label: 'مرفوض',       icon: '❌' },
  'reupload-requested': { label: 'إعادة رفع مطلوبة', icon: '🔄' },
};

const PAYMENT_TYPE_LABELS = {
  remaining:     'المبلغ المتبقي',
  'next-session': 'الجلسة القادمة',
  custom:        'مبلغ محدد',
};

export default function DoctorPaymentRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [imgModal, setImgModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`/payment-requests${filter !== 'all' ? `?status=${filter}` : ''}`);
      setRequests(data);
    } catch {
      toast.error('خطأ في تحميل الطلبات');
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const doAction = async (id, action) => {
    setActionLoading(true);
    try {
      const endpoint = `/payment-requests/${id}/${action}`;
      await axios.patch(endpoint, { doctorNotes });
      const msgs = {
        approve: 'تم تأكيد الدفع ✅',
        reject: 'تم رفض الطلب',
        'request-reupload': 'تم طلب إعادة الرفع',
      };
      toast.success(msgs[action]);
      setSelected(null);
      setDoctorNotes('');
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
    setActionLoading(false);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="pr-root" style={{ padding: '24px', maxWidth: '900px' }}>
      <style>{STYLE}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '22px', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/instapay.png" alt="InstaPay" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '8px' }} />
            طلبات الدفع عبر InstaPay
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0', fontWeight: 500 }}>
            مراجعة وتأكيد دفعات المرضى
          </p>
        </div>
        {pendingCount > 0 && (
          <div style={{ background: '#fef3c7', border: '1.5px solid #fde68a', borderRadius: '10px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiClock size={16} color="#92400e" />
            <span style={{ fontWeight: 800, color: '#92400e', fontSize: '14px' }}>{pendingCount} طلب في الانتظار</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all',                 label: 'الكل' },
          { key: 'pending',             label: '⏳ انتظار' },
          { key: 'approved',            label: '✅ مؤكد' },
          { key: 'rejected',            label: '❌ مرفوض' },
          { key: 'reupload-requested',  label: '🔄 إعادة رفع' },
        ].map(f => (
          <button key={f.key} className={`pr-filter-btn${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <button className="pr-filter-btn" onClick={load} style={{ marginRight: 'auto' }}>
          <FiRefreshCw size={13} style={{ marginLeft: '4px' }} />
          تحديث
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          جارٍ التحميل...
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: 'white', borderRadius: '14px', border: '1.5px solid #e2e8f0' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#475569' }}>لا توجد طلبات دفع</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {requests.map((r, idx) => (
            <div key={r._id} className="pr-card pr-anim" style={{ animationDelay: `${idx * 0.04}s` }}>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Left info */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FiUser size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                          {r.patientId?.fullName || 'مريض'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8', direction: 'ltr', textAlign: 'right' }}>
                          {r.patientId?.phone || ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`pr-badge ${r.status}`}>{STATUS_LABELS[r.status]?.icon} {STATUS_LABELS[r.status]?.label}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {format(new Date(r.createdAt), 'd MMM yyyy — HH:mm', { locale: ar })}
                      </span>
                    </div>

                    {r.notes && (
                      <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#475569', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', border: '1px solid #e2e8f0' }}>
                        <span style={{ fontWeight: 700 }}>ملاحظة المريض: </span>{r.notes}
                      </div>
                    )}
                    {r.doctorNotes && (
                      <div style={{ marginTop: '6px', fontSize: '12.5px', color: '#5b21b6', background: '#f5f3ff', borderRadius: '8px', padding: '8px 12px', border: '1px solid #ddd6fe' }}>
                        <span style={{ fontWeight: 700 }}>ملاحظة الدكتور: </span>{r.doctorNotes}
                      </div>
                    )}
                  </div>

                  {/* Right — amount + actions */}
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: '24px', color: '#2563eb', lineHeight: 1 }}>
                      {r.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>ج.م</div>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                      {PAYMENT_TYPE_LABELS[r.paymentType] || ''}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {r.receiptImage && (
                        <button className="pr-btn" style={{ background: '#f1f5f9', color: '#334155' }} onClick={() => setImgModal(r.receiptImage)}>
                          <FiEye size={13} /> السند
                        </button>
                      )}
                      <button className="pr-btn" style={{ background: '#f1f5f9', color: '#334155' }} onClick={() => setSelected(selected?._id === r._id ? null : r)}>
                        <FiMessageSquare size={13} /> إجراء
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action panel */}
                {selected?._id === r._id && (
                  <div style={{ marginTop: '14px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontWeight: 700, fontSize: '13px', color: '#475569', display: 'block', marginBottom: '8px' }}>
                      ملاحظة (اختياري)
                    </label>
                    <textarea
                      value={doctorNotes}
                      onChange={e => setDoctorNotes(e.target.value)}
                      placeholder="رسالة للمريض..."
                      rows={2}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '9px', fontFamily: 'Cairo, sans-serif', fontSize: '13px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      <button className="pr-btn approve" disabled={actionLoading} onClick={() => doAction(r._id, 'approve')}>
                        <FiCheck size={14} /> تأكيد الدفع
                      </button>
                      <button className="pr-btn reupload" disabled={actionLoading} onClick={() => doAction(r._id, 'request-reupload')}>
                        <FiRefreshCw size={13} /> طلب إعادة رفع
                      </button>
                      <button className="pr-btn reject" disabled={actionLoading} onClick={() => doAction(r._id, 'reject')}>
                        <FiX size={14} /> رفض
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image modal */}
      {imgModal && (
        <div
          onClick={() => setImgModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', cursor: 'zoom-out' }}
        >
          <img
            src={imgModal}
            alt="سند التحويل"
            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '16px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setImgModal(null)}
            style={{ position: 'absolute', top: '20px', left: '20px', background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
          >×</button>
        </div>
      )}
    </div>
  );
}
