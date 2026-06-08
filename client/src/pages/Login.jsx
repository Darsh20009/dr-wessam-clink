import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { PasskeyLoginButton } from '../components/PasskeyButton';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');

  body { background: #f0f6ff !important; }
  .login-root { font-family: 'Cairo', sans-serif; direction: rtl; -webkit-font-smoothing: antialiased; }

  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(4deg)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }

  .l-input {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14.5px;
    color: #1e293b;
    background: white;
    font-family: 'Cairo', sans-serif;
    outline: none;
    transition: all 0.2s;
  }
  .l-input:hover { border-color: #cbd5e1; }
  .l-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .l-input::placeholder { color: #94a3b8; }

  .l-phone-wrap {
    display: flex; align-items: center;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    background: white; overflow: hidden; transition: all 0.2s;
  }
  .l-phone-wrap:focus-within { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .l-phone-prefix {
    display: flex; align-items: center; gap: 6px;
    padding: 12px 12px; border-left: 1.5px solid #f1f5f9;
    background: #f8fafc; white-space: nowrap; flex-shrink: 0;
  }
  .l-phone-input {
    flex: 1; border: none; outline: none;
    padding: 12px 12px; font-size: 14.5px;
    font-family: 'Cairo', sans-serif; color: #1e293b;
    background: transparent; direction: ltr; text-align: left;
  }
  .l-phone-input::placeholder { color: #94a3b8; direction: rtl; text-align: right; }

  .l-btn-submit {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white; border: none; border-radius: 11px;
    font-size: 15px; font-weight: 800;
    cursor: pointer; font-family: 'Cairo', sans-serif;
    transition: all 0.2s;
    box-shadow: 0 6px 20px rgba(37,99,235,0.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .l-btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(37,99,235,0.45); background: linear-gradient(135deg, #1d4ed8, #1e40af); }
  .l-btn-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

  .l-tab-btn {
    flex: 1; padding: 10px; border: none;
    background: transparent; font-weight: 700; font-size: 14px;
    cursor: pointer; font-family: 'Cairo', sans-serif;
    color: #64748b; border-radius: 8px; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .l-tab-btn.active { background: white; color: #2563eb; box-shadow: 0 2px 8px rgba(0,0,0,0.07); }

  .l-label { display: block; font-weight: 700; font-size: 13px; color: #475569; margin-bottom: 7px; }

  .l-feature-item {
    display: flex; align-items: center; gap: 12px;
    padding: 13px 16px; border-radius: 11px;
    background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.9);
    backdrop-filter: blur(8px); margin-bottom: 10px;
  }
  .l-feature-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }

  .l-bg-shape {
    position: absolute; border-radius: 50%; pointer-events: none;
  }
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
        background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f2ff 50%, #f5f0ff 100%)',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Background shapes */}
        <div className="l-bg-shape" style={{ width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)', top: '-150px', right: '-100px' }} />
        <div className="l-bg-shape" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', bottom: '-100px', left: '30%' }} />
        <div className="l-bg-shape" style={{ width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', top: '30%', left: '5%' }} />

        {/* Floating geometric shapes */}
        <div style={{ position: 'absolute', top: '12%', right: '42%', width: '64px', height: '64px', border: '2px solid rgba(37,99,235,0.15)', borderRadius: '16px', animation: 'float 8s ease-in-out infinite', transform: 'rotate(20deg)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '18%', right: '44%', width: '40px', height: '40px', border: '2px solid rgba(6,182,212,0.2)', borderRadius: '50%', animation: 'float 6s ease-in-out infinite 1s', pointerEvents: 'none' }} />

        {/* ── LEFT BRAND PANEL ── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '60px 48px', position: 'relative', zIndex: 1,
          animation: 'fadeUp 0.6s ease-out',
        }}>

          {/* Logo */}
          <div style={{
            width: '100px', height: '100px', borderRadius: '24px',
            background: 'white', marginBottom: '24px',
            boxShadow: '0 12px 32px rgba(37,99,235,0.2), 0 4px 12px rgba(0,0,0,0.08)',
            border: '2px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="/icon-512.png" alt="شعار عيادة د. وسام يوسف" style={{ width: '94px', height: '94px', objectFit: 'cover' }} />
          </div>

          <h1 style={{ color: '#0f172a', fontSize: '32px', fontWeight: 900, textAlign: 'center', marginBottom: '6px', lineHeight: 1.25 }}>
            عيادة د. وسام يوسف
          </h1>
          <p style={{ color: '#2563eb', fontSize: '15px', fontWeight: 700, textAlign: 'center', marginBottom: '4px' }}>
            أخصائي تقويم الأسنان
          </p>
          <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', marginBottom: '36px' }}>
            نظام إدارة العيادة المتكامل
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '0', background: 'rgba(255,255,255,0.7)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', marginBottom: '32px', overflow: 'hidden' }}>
            {[
              { val: '+1000', label: 'مريض', color: '#2563eb' },
              { val: '98%', label: 'نجاح', color: '#0891b2' },
              { val: '+10', label: 'سنوات', color: '#16a34a' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '14px 22px', borderLeft: i < 2 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ width: '100%', maxWidth: '320px' }}>
            {[
              { icon: '🔒', label: 'نظام آمن ومحمي', sub: 'تشفير كامل للبيانات', bg: '#eff6ff' },
              { icon: '📋', label: 'ملف طبي شامل', sub: 'جلسات ومدفوعات وصور', bg: '#f0fdf4' },
              { icon: '📅', label: 'إدارة المواعيد', sub: 'تنظيم الجدول الزمني', bg: '#fdf4ff' },
            ].map((f, i) => (
              <div key={i} className="l-feature-item">
                <div className="l-feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1e293b' }}>{f.label}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '1px' }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => navigate('/')} style={{
            display: 'flex', alignItems: 'center', gap: '7px', marginTop: '24px',
            background: 'rgba(255,255,255,0.7)', color: '#475569',
            border: '1.5px solid rgba(255,255,255,0.9)', padding: '9px 20px',
            borderRadius: '10px', cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
            fontSize: '13.5px', fontWeight: 600, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#2563eb'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.color = '#475569'; }}>
            <FiArrowRight size={14} /> العودة للموقع
          </button>
        </div>

        {/* ── RIGHT FORM ── */}
        <div style={{
          width: '480px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', padding: '40px',
          position: 'relative', zIndex: 1,
          animation: 'fadeUp 0.6s ease-out 0.1s both',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px', padding: '36px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}>

            {/* Header */}
            <div style={{ marginBottom: '26px' }}>
              <h2 style={{ fontSize: '23px', fontWeight: 900, color: '#0f172a', marginBottom: '5px' }}>
                {mode === 'setup' ? '🔐 إنشاء كلمة مرور' : 'مرحباً بك'}
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '13.5px' }}>
                {mode === 'setup' ? 'أدخل كلمة مرور لتفعيل حسابك' : 'سجّل دخولك للوصول إلى حسابك'}
              </p>
            </div>

            {/* Mode tabs */}
            {mode !== 'setup' && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#f1f5f9', padding: '4px', borderRadius: '11px' }}>
                {[
                  { key: 'patient', icon: '🧑‍⚕️', label: 'مريض' },
                  { key: 'doctor', icon: '🩺', label: 'طبيب' },
                ].map(m => (
                  <button key={m.key} onClick={() => setMode(m.key)} className={`l-tab-btn${mode === m.key ? ' active' : ''}`}>
                    <span>{m.icon}</span> {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Phone field */}
            <div style={{ marginBottom: '16px' }}>
              <label className="l-label">رقم الجوال</label>
              <div className="l-phone-wrap">
                <div className="l-phone-prefix">
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>🇪🇬</span>
                  <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '13px' }}>+20</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="1156798324"
                  className="l-phone-input"
                  autoComplete="tel"
                />
              </div>
            </div>

            <form onSubmit={mode === 'setup' ? handleSetup : handleLogin}>
              {/* Password */}
              <div style={{ marginBottom: '16px' }}>
                <label className="l-label">
                  {mode === 'setup' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
                </label>
                <div style={{ position: 'relative' }}>
                  <FiLock style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="l-input"
                    style={{ paddingRight: '42px', paddingLeft: '42px' }}
                    autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                    fontSize: '16px', display: 'flex', alignItems: 'center', padding: '2px',
                  }}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {mode === 'setup' && (
                <div style={{ marginBottom: '16px' }}>
                  <label className="l-label">تأكيد كلمة المرور</label>
                  <div style={{ position: 'relative' }}>
                    <FiLock style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '16px' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="l-input"
                      style={{ paddingRight: '42px' }}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="l-btn-submit">
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    جاري الدخول...
                  </>
                ) : mode === 'setup' ? '✓ إنشاء الحساب' : 'تسجيل الدخول'}
              </button>
            </form>

            {/* Passkey */}
            {mode !== 'setup' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
                  <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                  <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 600 }}>أو</span>
                  <div style={{ flex: 1, height: '1px', background: '#f1f5f9' }} />
                </div>
                <PasskeyLoginButton phone={phone} onSuccess={handlePasskeySuccess} />
              </div>
            )}

            {mode === 'patient' && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ padding: '12px 14px', background: '#f0f9ff', borderRadius: '9px', border: '1px solid #bae6fd', marginBottom: '10px' }}>
                  <p style={{ textAlign: 'center', color: '#0369a1', fontSize: '12.5px', fontWeight: 500, lineHeight: 1.6 }}>
                    أول مرة تدخل؟ سيطلب منك إنشاء كلمة مرور تلقائياً
                  </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    style={{
                      background: 'none', border: 'none', color: '#2563eb',
                      fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif', textDecoration: 'underline',
                      textDecorationStyle: 'dotted', textUnderlineOffset: '3px',
                      padding: '4px', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#1d4ed8'}
                    onMouseLeave={e => e.currentTarget.style.color = '#2563eb'}
                  >
                    🔑 نسيت كلمة المرور؟
                  </button>
                </div>
              </div>
            )}

            {/* Contact */}
            <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>تحتاج مساعدة؟</p>
              <a href="https://wa.me/201156798324" target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: '#16a34a', fontSize: '13px', fontWeight: 700, textDecoration: 'none',
              }}>
                <FaWhatsapp size={15} /> تواصل معنا على واتساب
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
