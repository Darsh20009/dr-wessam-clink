import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone, FiLock, FiEye, FiEyeOff, FiMapPin, FiCalendar, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
  .sr-root { font-family: 'Cairo', sans-serif; direction: rtl; background: linear-gradient(135deg, #f0f6ff 0%, #e8f4fd 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .sr-card { background: white; border-radius: 24px; box-shadow: 0 24px 80px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06); padding: 40px; width: 100%; max-width: 520px; animation: fadeUp 0.5s ease-out; border: 1px solid #e8f0fe; }
  .sr-input { width: 100%; padding: 12px 40px 12px 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-family: 'Cairo', sans-serif; font-size: 14px; color: #0f172a; outline: none; transition: all 0.18s; background: #fafbff; box-sizing: border-box; direction: rtl; }
  .sr-input:focus { border-color: #2563eb; background: white; box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
  .sr-input.error { border-color: #ef4444; }
  .sr-label { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .sr-btn { width: 100%; padding: 14px; border-radius: 11px; font-family: 'Cairo', sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 9px; }
  .sr-btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; box-shadow: 0 6px 20px rgba(37,99,235,0.3); }
  .sr-btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(37,99,235,0.4); }
  .sr-btn-primary:disabled { opacity: 0.6; cursor: default; transform: none; }
  .sr-consult-btn { flex: 1; padding: 12px 10px; border-radius: 10px; font-family: 'Cairo', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; border: 1.5px solid #e2e8f0; background: white; color: #64748b; transition: all 0.18s; text-align: center; }
  .sr-consult-btn.active { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
  .sr-consult-btn:hover:not(.active) { border-color: #bfdbfe; background: #f8fbff; }
  .sr-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; color: #94a3b8; font-size: 12px; }
  .sr-divider::before, .sr-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
`;

export default function SelfRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(null);
  const [form, setForm] = useState({
    fullName: '', phone: '', password: '', confirmPassword: '',
    age: '', address: '', consultationType: 'clinic',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error('يرجى إدخال الاسم الكامل');
    if (!form.phone.trim() || form.phone.length < 10) return toast.error('يرجى إدخال رقم جوال صحيح');
    if (form.password.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    if (form.password !== form.confirmPassword) return toast.error('كلمتا المرور غير متطابقتين');

    setLoading(true);
    try {
      const res = await axios.post('/auth/register-patient', {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password,
        age: form.age || undefined,
        address: form.address.trim() || undefined,
        consultationType: form.consultationType,
      });
      setDone({ patientId: String(res.data.patientId), name: form.fullName.trim() });
      toast.success('تم إنشاء ملفك بنجاح!');
      login(res.data.token, res.data.user);
    } catch (err) {
      const msg = err.response?.data?.message || 'خطأ في التسجيل';
      if (err.response?.data?.alreadyExists) {
        toast.error(msg);
        setTimeout(() => navigate('/login'), 1800);
      } else {
        toast.error(msg);
      }
    }
    setLoading(false);
  };

  if (done) {
    return (
      <>
        <style>{STYLE}</style>
        <div className="sr-root">
          <div className="sr-card" style={{ textAlign: 'center' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16,185,129,0.35)' }}>
              <FiCheck size={32} color="white" />
            </div>
            <h2 style={{ fontWeight: 900, fontSize: '22px', color: '#0f172a', marginBottom: '8px' }}>تم إنشاء ملفك بنجاح! 🎉</h2>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.8, marginBottom: '24px' }}>
              مرحباً <strong style={{ color: '#0f172a' }}>{done.name}</strong>، تم إنشاء ملفك الطبي بنجاح.
              <br />احتفظ برقم الملف لاستخدامه في استعادة كلمة المرور.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '20px', border: '1.5px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>رقم ملفك الطبي</div>
              <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#2563eb', wordBreak: 'break-all', letterSpacing: '0.5px', background: '#eff6ff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                {done.patientId}
              </div>
              <button
                onClick={() => { navigator.clipboard?.writeText(done.patientId); toast.success('تم نسخ رقم الملف'); }}
                style={{ marginTop: '10px', background: 'none', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: '8px', padding: '7px 16px', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}
              >
                📋 نسخ رقم الملف
              </button>
            </div>

            <button className="sr-btn sr-btn-primary" onClick={() => navigate('/portal')}>
              <FiArrowLeft size={16} /> الذهاب للوحة التحكم
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLE}</style>
      <div className="sr-root">
        <div className="sr-card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '72px', height: '72px', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo-transparent.png" alt="شعار العيادة" style={{ width: '72px', height: '72px', objectFit: 'contain' }} />
            </div>
            <h1 style={{ fontWeight: 900, fontSize: '22px', color: '#0f172a', marginBottom: '4px' }}>افتح ملفك الطبي الآن</h1>
            <p style={{ color: '#64748b', fontSize: '13.5px' }}>عيادة د. وسام يوسف — أخصائي تقويم الأسنان | بني مزار، المنيا</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Consultation type */}
            <div style={{ marginBottom: '20px' }}>
              <div className="sr-label">نوع الزيارة</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className={`sr-consult-btn${form.consultationType === 'clinic' ? ' active' : ''}`} onClick={() => set('consultationType', 'clinic')}>
                  🏥 كشف بالعيادة
                </button>
                <button type="button" className={`sr-consult-btn${form.consultationType === 'phone' ? ' active' : ''}`} onClick={() => set('consultationType', 'phone')}>
                  📞 استشارة هاتفية
                </button>
              </div>
            </div>

            {/* Name & Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <div className="sr-label"><FiUser size={13} /> الاسم الكامل *</div>
                <div style={{ position: 'relative' }}>
                  <FiUser size={15} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input className="sr-input" placeholder="الاسم الرباعي" value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
                </div>
              </div>
              <div>
                <div className="sr-label"><FiPhone size={13} /> رقم الجوال *</div>
                <div style={{ position: 'relative' }}>
                  <FiPhone size={15} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input className="sr-input" placeholder="01xxxxxxxxx" value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" required />
                </div>
              </div>
            </div>

            {/* Age & Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <div className="sr-label"><FiCalendar size={13} /> العمر</div>
                <div style={{ position: 'relative' }}>
                  <FiCalendar size={15} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input className="sr-input" placeholder="مثال: 25" value={form.age} onChange={e => set('age', e.target.value)} type="number" min="1" max="120" />
                </div>
              </div>
              <div>
                <div className="sr-label"><FiMapPin size={13} /> العنوان / المدينة</div>
                <div style={{ position: 'relative' }}>
                  <FiMapPin size={15} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input className="sr-input" placeholder="مثال: المنيا" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '14px' }}>
              <div className="sr-label"><FiLock size={13} /> كلمة المرور * (6 أحرف على الأقل)</div>
              <div style={{ position: 'relative' }}>
                <FiLock size={15} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input className="sr-input" placeholder="كلمة مرور قوية" value={form.password} onChange={e => set('password', e.target.value)} type={showPass ? 'text' : 'password'} required style={{ paddingLeft: '40px' }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div className="sr-label"><FiLock size={13} /> تأكيد كلمة المرور *</div>
              <div style={{ position: 'relative' }}>
                <FiLock size={15} style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input
                  className={`sr-input${form.confirmPassword && form.confirmPassword !== form.password ? ' error' : ''}`}
                  placeholder="أعد كتابة كلمة المرور"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  type={showConfirm ? 'text' : 'password'}
                  required
                  style={{ paddingLeft: '40px' }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '5px', fontWeight: 600 }}>كلمتا المرور غير متطابقتين</div>
              )}
            </div>

            <button type="submit" className="sr-btn sr-btn-primary" disabled={loading}>
              {loading ? <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <><FiCheck size={17} /> إنشاء الملف الطبي</>}
            </button>
          </form>

          <div className="sr-divider">أو</div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/login')} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: 'white', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '13px', color: '#475569', cursor: 'pointer', transition: 'all 0.18s' }}>
              🔑 تسجيل الدخول
            </button>
            <button onClick={() => navigate('/forgot-password')} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #bfdbfe', background: '#eff6ff', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '13px', color: '#2563eb', cursor: 'pointer', transition: 'all 0.18s' }}>
              🔓 نسيت كلمة المرور
            </button>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12.5px', color: '#94a3b8' }}>
            للاستفسار تواصل معنا على
            <a href="https://wa.me/201156798324" target="_blank" rel="noreferrer" style={{ color: '#25d366', fontWeight: 700, marginRight: '4px', textDecoration: 'none' }}>
              واتساب
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
