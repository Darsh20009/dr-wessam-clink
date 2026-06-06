import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiKey } from 'react-icons/fi';
import { PasskeyLoginButton } from '../components/PasskeyButton';

export default function Login() {
  const navigate = useNavigate();
  const { login, setupPassword } = useAuth();
  const [mode, setMode] = useState('patient');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) return toast.error('يرجى إدخال جميع البيانات');
    setLoading(true);
    try {
      const user = await login(phone, password, mode === 'doctor');
      toast.success(`أهلاً ${user.name}`);
      navigate(user.role === 'doctor' ? '/doctor' : '/portal');
    } catch (err) {
      const msg = err.response?.data?.message || 'خطأ في تسجيل الدخول';
      if (err.response?.data?.needsSetup) {
        setMode('setup');
        toast('يرجى تعيين كلمة مرور لحسابك', { icon: '🔐' });
      } else {
        toast.error(msg);
      }
    }
    setLoading(false);
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('كلمات المرور غير متطابقة');
    if (password.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    try {
      const user = await setupPassword(phone, password);
      toast.success('تم إنشاء حسابك بنجاح!');
      navigate('/portal');
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في إنشاء الحساب');
    }
    setLoading(false);
  };

  const handlePasskeySuccess = (result) => {
    const { token, role, user, patient } = result;
    localStorage.setItem('token', token);
    if (patient) localStorage.setItem('patientData', JSON.stringify(patient));
    window.location.href = role === 'doctor' ? '/doctor' : '/portal';
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #1a3a6b 0%, #1e3a8a 50%, #1e40af 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '-150px', right: '-100px', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', bottom: '-200px', left: '-100px', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />

      {/* Left brand */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
        <img src="/logo.png" alt="logo" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }} />
        <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 900, textAlign: 'center', marginBottom: '12px' }}>عيادة د. وسام يوسف</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', textAlign: 'center', lineHeight: 1.8 }}>
          أخصائي تقويم الأسنان<br />نظام إدارة العيادة المتكامل
        </p>
        <button onClick={() => navigate('/')} style={{
          marginTop: '32px', display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px',
          borderRadius: '8px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          fontSize: '14px', fontWeight: 600,
        }}>
          <FiArrowRight /> العودة للموقع
        </button>
      </div>

      {/* Right form */}
      <div style={{ width: '460px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '36px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1a3a6b', marginBottom: '6px' }}>
            {mode === 'setup' ? 'إنشاء كلمة مرور' : 'تسجيل الدخول'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
            {mode === 'setup' ? 'أدخل كلمة مرور لتفعيل حسابك' : 'أدخل بياناتك للوصول لحسابك'}
          </p>

          {mode !== 'setup' && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '10px' }}>
              {['patient', 'doctor'].map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                  background: mode === m ? 'white' : 'transparent',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
                  color: mode === m ? '#1a3a6b' : '#64748b',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}>{m === 'patient' ? 'مريض' : 'طبيب'}</button>
              ))}
            </div>
          )}

          {/* Phone field (always shown) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '6px' }}>رقم الجوال</label>
            <div style={{ position: 'relative' }}>
              <FiPhone style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX" required
                style={{ width: '100%', padding: '11px 40px 11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'Cairo, sans-serif', outline: 'none' }}
              />
            </div>
          </div>

          <form onSubmit={mode === 'setup' ? handleSetup : handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
                {mode === 'setup' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ width: '100%', padding: '11px 40px 11px 40px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'Cairo, sans-serif', outline: 'none' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {mode === 'setup' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '6px' }}>تأكيد كلمة المرور</label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={{ width: '100%', padding: '11px 40px 11px 14px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: 'Cairo, sans-serif', outline: 'none' }}
                  />
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px', background: loading ? '#94a3b8' : '#2563eb',
              color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px',
              fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Cairo, sans-serif',
              transition: 'background 0.2s', marginTop: '8px',
            }}>
              {loading ? '...جاري التحميل' : mode === 'setup' ? 'إنشاء الحساب' : 'دخول'}
            </button>
          </form>

          {/* Passkey login - shown for patient and doctor modes */}
          {mode !== 'setup' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>أو</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>
              <PasskeyLoginButton phone={phone} onSuccess={handlePasskeySuccess} />
            </div>
          )}

          {mode === 'patient' && (
            <p style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '16px' }}>
              أول مرة تدخل؟ سيطلب منك إنشاء كلمة مرور تلقائياً
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
