import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiSearch, FiUserPlus, FiEye, FiTrash2, FiPhone, FiUser } from 'react-icons/fi';

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = async (q = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`/patients?search=${q}&limit=50`);
      setPatients(res.data.patients);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('خطأ في تحميل البيانات');
    }
    setLoading(false);
  };

  useEffect(() => { fetchPatients(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`هل أنت متأكد من حذف ملف ${name}؟`)) return;
    try {
      await axios.delete(`/patients/${id}`);
      toast.success('تم حذف الملف');
      fetchPatients(search);
    } catch { toast.error('فشل الحذف'); }
  };

  const statusBadge = (status) => {
    const map = { paid: ['badge-success', 'مدفوع'], partial: ['badge-warning', 'جزئي'], overdue: ['badge-danger', 'متأخر'], pending: ['badge-gray', 'معلق'] };
    const [cls, label] = map[status] || ['badge-gray', status];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">المرضى</h1>
          <p className="page-subtitle">إجمالي {total} مريض</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/doctor/patients/new')}>
          <FiUserPlus /> مريض جديد
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            className="form-control"
            style={{ paddingRight: '40px' }}
            placeholder="بحث بالاسم أو رقم الجوال..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : patients.length === 0 ? (
        <div className="empty-state card">
          <FiUser style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }} />
          <p>{search ? 'لا توجد نتائج للبحث' : 'لا يوجد مرضى بعد'}</p>
          {!search && <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/doctor/patients/new')}>إضافة أول مريض</button>}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>رقم الجوال</th>
                <th>تكلفة العلاج</th>
                <th>المدفوع</th>
                <th>المتبقي</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{p.age ? `${p.age} سنة` : ''}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FiPhone style={{ color: '#64748b' }} />
                      {p.phone}
                    </div>
                  </td>
                  <td>{(p.financials?.totalCost || 0).toLocaleString()} ج.م</td>
                  <td style={{ color: '#10b981', fontWeight: 600 }}>{(p.financials?.totalPaid || 0).toLocaleString()} ج.م</td>
                  <td style={{ color: (p.financials?.remaining || 0) > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {(p.financials?.remaining || 0).toLocaleString()} ج.م
                  </td>
                  <td>{statusBadge(p.financials?.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/doctor/patients/${p._id}`)}>
                        <FiEye /> ملف
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id, p.fullName)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
