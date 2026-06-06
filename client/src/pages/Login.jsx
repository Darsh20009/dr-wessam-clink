import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiKey, FiUser } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { PasskeyLoginButton } from '../components/PasskeyButton';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
  .login-root { font-family: 'Cairo', sans-serif; direction: rtl; }

  @keyframes float1 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-25px) rotate(6deg)} }
  @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
  @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes pulse-orb { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.05)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

  .gradient-text-login {
    background: linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #0ea5e9 70%, #38bdf8 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }

  .login-input {
    width: 100%;
    padding: 13px 16px;
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    font-size: 15px;
    color: white;
    font-family: 'Cairo', sans-serif;
    outline: none;
    transition: all 0.25s;
    direction: ltr;
    text-align: right;
  }
  .login-input::placeholder { color: rgba(255,255,255,0.3); }
  .login-input:focus { border-color: rgba(14,165,233,0.6); background: rgba(14,165,233,0.06); box-shadow: 0 0 0 4px rgba(14,165,233,0.1); }

  .phone-input {
    flex: 1;
    padding: 13px 16px;
    background: transparent;
    border: none;
    font-size: 15px;
    color: white;
    font-family: 'Cairo', sans-serif;
    outline: none;
    direction: ltr;
    text-align: left;
  }
  .phone-input::placeholder { color: rgba(255,255,255,0.3); }

  .phone-wrapper {
    display: flex;
    align-items: center;
    background: rgba(255,255,255,0.06);
    border: 1.5px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.25s;
  }
  .phone-wrapper:focus-within { border-color: rgba(14,165,233,0.6); background: rgba(14,165,233,0.06); box-shadow: 0 0 0 4px rgba(14,165,233,0.1); }

  .btn-login {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #0ea5e9, #2563eb);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 800;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    transition: all 0.3s;
    box-shadow: 0 0 25px rgba(14,165,233,0.3), 0 4px 12px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
  }
  .btn-login:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 40px rgba(14,165,233,0.45), 0 8px 20px rgba(0,0,0,0.4); }
  .btn-login:disabled { opacity: 0.55; cursor: not-allowed; }

  .mode-tab {
    flex: 1; padding: 11px; border: none;
    background: transparent; font-weight: 700; font-size: 14px;
    cursor: pointer; font-family: 'Cairo', sans-serif;
    color: rgba(255,255,255,0.45); border-radius: 10px;
    transition: all 0.25s;
  }
  .mode-tab.active {
    background: rgba(14,165,233,0.18);
    color: #38bdf8;
    box-shadow: 0 0 15px rgba(14,165,233,0.15);
  }

  .login-label { display: block; font-weight: 700; font-size: 13px; color: rgba(255,255,255,0.65); margin-bottom: 8px; }

  .orb-login { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
`;

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
    <>
      <style>{STYLE}</style>
      <div className="login-root" style={{
        minHeight: '100vh', display: 'flex',
        background: 'linear-gradient(135deg, #030b1a 0%, #061428 50%, #050f20 100%)',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Background orbs */}
        <div className="orb-login" style={{ width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 70%)', top: '-150px', right: '-200px', animation: 'pulse-orb 8s ease-in-out infinite' }} />
        <div className="orb-login" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', bottom: '-150px', left: '20%', animation: 'pulse-orb 10s ease-in-out infinite 2s' }} />

        {/* Floating shapes */}
        <div style={{ position: 'absolute', top: '12%', right: '52%', width: '70px', height: '70px', border: '1.5px solid rgba(14,165,233,0.2)', borderRadius: '16px', animation: 'float1 8s ease-in-out infinite', transform: 'rotate(20deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '55%', width: '40px', height: '40px', border: '1.5px solid rgba(245,158,11,0.2)', borderRadius: '50%', animation: 'float2 6s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '55%', left: '4%', width: '55px', height: '55px', border: '1.5px solid rgba(99,102,241,0.2)', borderRadius: '12px', animation: 'float2 9s ease-in-out infinite', transform: 'rotate(-15deg)', pointerEvents: 'none' }} />

        {/* ── LEFT BRAND PANEL ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 40px', position: 'relative', zIndex: 1,
          animation: 'fadeUp 0.7s ease-out',
        }}>
          {/* Logo ring */}
          <div style={{ position: 'relative', marginBottom: '32px' }}>
            <div style={{
              position: 'absolute', inset: '-12px', borderRadius: '50%',
              background: 'conic-gradient(from 0deg, #0ea5e9, #6366f1, #0ea5e9)',
              animation: 'float1 6s ease-in-out infinite',
              opacity: 0.5,
            }} />
            <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6366f1)', opacity: 0.7 }} />
            <img src="/logo-transparent.png" alt="logo" style={{
              width: '130px', height: '130px', borderRadius: '50%',
              objectFit: 'cover', position: 'relative', zIndex: 1,
              mixBlendMode: 'screen', filter: 'brightness(1.1)',
            }} />
          </div>

          <h1 style={{ color: 'white', fontSize: '36px', fontWeight: 900, textAlign: 'center', marginBottom: '12px', lineHeight: 1.3 }}>
            عيادة<br /><span className="gradient-text-login">د. وسام يوسف</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', textAlign: 'center', lineHeight: 1.8, marginBottom: '8px' }}>
            أخصائي تقويم الأسنان
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', textAlign: 'center', marginBottom: '36px' }}>
            نظام إدارة العيادة المتكامل
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '28px', marginBottom: '40px' }}>
            {[
              { val: '+1000', label: 'مريض' },
              { val: '98%', label: 'نجاح' },
              { val: '+10', label: 'سنوات' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8' }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div style={{ display: 'flex', flex: 'column', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
            <a href="tel:01156798324" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
              📞 +20 115 679 8324
            </a>
          </div>

          <button onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.12)', padding: '10px 22px',
            borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
            fontSize: '14px', fontWeight: 600, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}>
            <FiArrowRight /> العودة للموقع
          </button>
        </div>

        {/* ── RIGHT FORM ── */}
        <div style={{
          width: '480px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '40px',
          position: 'relative', zIndex: 1,
          animation: 'fadeUp 0.7s ease-out 0.1s both',
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '24px', padding: '40px', width: '100%',
            boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          }}>

            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'white', marginBottom: '6px' }}>
                {mode === 'setup' ? 'إنشاء كلمة مرور' : 'تسجيل الدخول'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                {mode === 'setup' ? 'أدخل كلمة مرور لتفعيل حسابك' : 'أدخل بياناتك للوصول لحسابك'}
              </p>
            </div>

            {/* Mode tabs */}
            {mode !== 'setup' && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)' }}>
                {[
                  { key: 'patient', icon: <FiUser size={14} />, label: 'مريض' },
                  { key: 'doctor', icon: '🩺', label: 'طبيب' },
                ].map(m => (
                  <button key={m.key} onClick={() => setMode(m.key)} className={`mode-tab${mode === m.key ? ' active' : ''}`}>
                    <span style={{ marginLeft: '6px' }}>{m.icon}</span> {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Phone field with Egypt flag */}
            <div style={{ marginBottom: '18px' }}>
              <label className="login-label">رقم الجوال</label>
              <div className="phone-wrapper">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '13px 14px', borderLeft: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0, whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>🇪🇬</span>
                  <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '14px', fontFamily: 'Cairo, sans-serif' }}>+20</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="1156798324"
                  className="phone-input"
                  autoComplete="tel"
                />
              </div>
            </div>

            <form onSubmit={mode === 'setup' ? handleSetup : handleLogin}>
              {/* Password */}
              <div style={{ marginBottom: '18px' }}>
                <label className="login-label">
                  {mode === 'setup' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
                </label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '16px' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="login-input"
                    style={{ paddingRight: '44px', paddingLeft: '44px' }}
                    autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
                    cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center',
                  }}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {mode === 'setup' && (
                <div style={{ marginBottom: '18px' }}>
                  <label className="login-label">تأكيد كلمة المرور</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '16px' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="login-input"
                      style={{ paddingRight: '44px' }}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-login">
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'float1 0.7s linear infinite' }} />
                    جاري الدخول...
                  </>
                ) : (
                  mode === 'setup' ? 'إنشاء الحساب' : 'دخول'
                )}
              </button>
            </form>

            {/* Passkey */}
            {mode !== 'setup' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>أو</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                </div>
                <PasskeyLoginButton phone={phone} onSuccess={handlePasskeySuccess} />
              </div>
            )}

            {mode === 'patient' && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '16px', lineHeight: 1.6 }}>
                أول مرة تدخل؟ سيطلب منك إنشاء كلمة مرور تلقائياً
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
