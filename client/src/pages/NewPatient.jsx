import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowRight, FiSave } from 'react-icons/fi';

export default function NewPatient() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', age: '', dateOfBirth: '', address: '',
    diagnosis: '', treatmentPlan: '',
    totalCost: '', initialPayment: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) return toast.error('الاسم ورقم الجوال مطلوبان');
    setLoading(true);
    try {
      const totalCost = parseFloat(form.totalCost) || 0;
      const initialPayment = parseFloat(form.initialPayment) || 0;
      const data = {
        fullName: form.fullName, phone: form.phone,
        age: form.age ? parseInt(form.age) : undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        address: form.address, diagnosis: form.diagnosis, treatmentPlan: form.treatmentPlan,
        financials: {
          totalCost, initialPayment,
          totalPaid: initialPayment,
          remaining: totalCost - initialPayment,
          status: initialPayment >= totalCost && totalCost > 0 ? 'paid' : initialPayment > 0 ? 'partial' : 'pending',
        },
      };
      const res = await axios.post('/patients', data);
      toast.success('تم إنشاء الملف بنجاح!');
      navigate(`/doctor/patients/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الملف');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-secondary btn-sm" style={{ marginBottom: '8px' }} onClick={() => navigate('/doctor/patients')}>
            <FiArrowRight /> رجوع
          </button>
          <h1 className="page-title">ملف مريض جديد</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="card">
            <h3 className="section-title">البيانات الأساسية</h3>
            <div className="form-group">
              <label>الاسم الكامل *</label>
              <input className="form-control" value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="الاسم الكامل" required />
            </div>
            <div className="form-group">
              <label>رقم الجوال *</label>
              <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01XXXXXXXXX" required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>العمر</label>
                <input className="form-control" type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="العمر" min="1" max="120" />
              </div>
              <div className="form-group">
                <label>تاريخ الميلاد</label>
                <input className="form-control" type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label>العنوان</label>
              <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} placeholder="العنوان" />
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">النظام المالي</h3>
            <div className="form-group">
              <label>إجمالي تكلفة العلاج (ج.م)</label>
              <input className="form-control" type="number" value={form.totalCost} onChange={e => set('totalCost', e.target.value)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>المبلغ المقدم (ج.م)</label>
              <input className="form-control" type="number" value={form.initialPayment} onChange={e => set('initialPayment', e.target.value)} placeholder="0" min="0" />
            </div>
            {form.totalCost && (
              <div style={{ background: '#f0f9ff', borderRadius: '10px', padding: '16px', border: '1px solid #bae6fd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>المتبقي:</span>
                  <span style={{ fontWeight: 700, color: '#ef4444' }}>
                    {((parseFloat(form.totalCost) || 0) - (parseFloat(form.initialPayment) || 0)).toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ marginTop: '20px' }}>
          <h3 className="section-title">التشخيص وخطة العلاج</h3>
          <div className="form-group">
            <label>التشخيص</label>
            <textarea className="form-control" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} placeholder="اكتب التشخيص التفصيلي هنا..." rows={4} />
          </div>
          <div className="form-group">
            <label>خطة العلاج</label>
            <textarea className="form-control" value={form.treatmentPlan} onChange={e => set('treatmentPlan', e.target.value)} placeholder="اكتب خطة العلاج ومراحله هنا..." rows={4} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/doctor/patients')}>إلغاء</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FiSave /> {loading ? 'جاري الحفظ...' : 'حفظ الملف'}
          </button>
        </div>
      </form>
    </div>
  );
}
