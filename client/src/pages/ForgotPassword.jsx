import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowRight, FiLock, FiEye, FiEyeOff, FiCheck, FiHash } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
  body { background: #f0f6ff !important; }
  .fp-root { font-family: 'Cairo', sans-serif; direction: rtl; -webkit-font-smoothing: antialiased; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes stepIn { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }

  .fp-input {
    width: 100%; padding: 12px 42px 12px 14px;
    border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 14.5px; color: #1e293b; background: white;
    font-family: 'Cairo', sans-serif; outline: none; transition: all 0.2s;
  }
  .fp-input:hover { border-color: #cbd5e1; }
  .fp-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .fp-input::placeholder { color: #94a3b8; }

  .fp-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white; border: none; border-radius: 11px;
    font-size: 15px; font-weight: 800; cursor: pointer;
    font-family: 'Cairo', sans-serif; transition: all 0.2s;
    box-shadow: 0 6px 20px rgba(37,99,235,0.35);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .fp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(37,99,235,0.45); }
  .fp-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
  .fp-btn-outline {
    width: 100%; padding: 11px; background: white;
    color: #475569; border: 1.5px solid #e2e8f0; border-radius: 10px;
    font-size: 14px; font-weight: 700; cursor: pointer;
    font-family: 'Cairo', sans-serif; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .fp-btn-outline:hover { border-color: #bfdbfe; color: #2563eb; background: #f8fbff; }

  .fp-label { display: block; font-weight: 700; font-size: 13px; color: #475569; margin-bottom: 7px; }
  .fp-step { animation: stepIn 0.3s ease-out; }
  .fp-step-dot { width: 10px; height: 10px; border-radius: 50%; transition: all 0.3s; }
`;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [patientId, setPatientId] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifiedName, setVerifiedName] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!patientId.trim() || !phone.trim()) return toast.error('يرجى ملء جميع الحقول');
    setLoading(true);
    try {
      const res = await axios.post('/auth/verify-identity', { patientId: patientId.trim(), phone: phone.trim() });
      setVerifiedName(res.data.name);
      setStep(2);
      toast.success(`تم التحقق، أهلاً ${res.data.name}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'بيانات غير صحيحة');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('كلمتا المرور غير متطابقتين');
    if (newPassword.length < 6) return toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
    setLoading(true);
    try {
      const res = await axios.post('/auth/reset-password', {
        patientId: patientId.trim(),
        phone: phone.trim(),
        newPassword,
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      toast.success('تم تعيين كلمة المرور بنجاح!');
      navigate('/portal');
    } catch (err) {
      toast.error(err.response?.data?.message || 'خطأ في تعيين كلمة المرور');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="fp-root" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #f0f6ff 0%, #e8f2ff 50%, #f5f0ff 100%)',
        padding: '20px', position: 'relative', overflow: 'hidden',
      }}>
        {/* BG shapes */}
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)', top: '-100px', right: '-80px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.07), transparent 70%)', bottom: '-60px', left: '20%', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: '460px', animation: 'fadeUp 0.5s ease-out' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '70px', height: '70px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '32px', margin: '0 auto 16px',
              boxShadow: '0 10px 28px rgba(37,99,235,0.3)',
            }}>🔐</div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '6px' }}>استعادة كلمة المرور</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>أدخل بيانات هويتك لإعادة تعيين كلمة المرور</p>
          </div>

          {/* Steps indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '28px' }}>
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className="fp-step-dot" style={{
                  background: step >= s ? '#2563eb' : '#e2e8f0',
                  width: step === s ? '28px' : '10px', height: '10px', borderRadius: '5px',
                }}/>
                {s < 2 && <div style={{ width: '40px', height: '2px', background: step > s ? '#2563eb' : '#e2e8f0', borderRadius: '2px', transition: 'all 0.3s' }} />}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div style={{
            background: 'white', borderRadius: '20px', padding: '32px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.8)',
          }}>

            {/* STEP 1: Verify Identity */}
            {step === 1 && (
              <div className="fp-step">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', padding: '12px 16px', background: '#f0f9ff', borderRadius: '10px', border: '1px solid #bae6fd' }}>
                  <FiHash size={18} color="#0369a1" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: '#0369a1' }}>كيف أعرف رقم ملفي؟</div>
                    <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '2px', lineHeight: 1.5 }}>
                      تواصل مع الدكتور عبر واتساب وأرسل له اسمك ورقم جوالك وسيعطيك رقم ملفك
                    </div>
                  </div>
                </div>

                <a href="https://wa.me/201156798324?text=مرحباً، أريد معرفة رقم ملفي الطبي" target="_blank" rel="noreferrer" style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px',
                  padding: '10px 14px', color: '#16a34a', fontWeight: 700, fontSize: '13.5px',
                  textDecoration: 'none', marginBottom: '20px', transition: 'all 0.2s',
                }}>
                  <FaWhatsapp size={18} /> اضغط هنا للتواصل مع الدكتور عبر واتساب
                </a>

                <form onSubmit={handleVerify}>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="fp-label">رقم الملف الطبي (Patient ID)</label>
                    <div style={{ position: 'relative' }}>
                      <FiHash style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        value={patientId}
                        onChange={e => setPatientId(e.target.value)}
                        placeholder="مثال: 673abc123def..."
                        required
                        className="fp-input"
                        style={{ direction: 'ltr', textAlign: 'left' }}
                        autoComplete="off"
                      />
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '5px' }}>رقم من 24 حرف يبدأ بأرقام وحروف إنجليزية</div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="fp-label">رقم الجوال المسجل</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: 'white', overflow: 'hidden', transition: 'all 0.2s' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                      onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ padding: '12px', background: '#f8fafc', borderLeft: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                        <span style={{ fontSize: '18px' }}>🇪🇬</span>
                        <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '13px' }}>+20</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="1156798324"
                        required
                        style={{ flex: 1, border: 'none', outline: 'none', padding: '12px', fontSize: '14.5px', fontFamily: 'Cairo, sans-serif', direction: 'ltr', textAlign: 'left', background: 'transparent', color: '#1e293b' }}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="fp-btn">
                    {loading ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        جاري التحقق...
                      </>
                    ) : '✓ تحقق من هويتي'}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: New Password */}
            {step === 2 && (
              <div className="fp-step">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px',
                  padding: '14px 16px', background: '#f0fdf4', borderRadius: '11px', border: '1px solid #bbf7d0',
                }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FiCheck style={{ color: 'white', fontSize: '18px' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#15803d', fontSize: '14px' }}>تم التحقق بنجاح!</div>
                    <div style={{ fontSize: '13px', color: '#16a34a', marginTop: '2px' }}>أهلاً {verifiedName}، عيّن كلمة مرور جديدة</div>
                  </div>
                </div>

                <form onSubmit={handleReset}>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="fp-label">كلمة المرور الجديدة</label>
                    <div style={{ position: 'relative' }}>
                      <FiLock style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="fp-input"
                        style={{ paddingLeft: '42px' }}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', display: 'flex', padding: '2px' }}>
                        {showPass ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label className="fp-label">تأكيد كلمة المرور</label>
                    <div style={{ position: 'relative' }}>
                      <FiLock style={{ position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="fp-input"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  {newPassword && confirmPassword && (
                    <div style={{ marginBottom: '16px', fontSize: '12px', color: newPassword === confirmPassword ? '#16a34a' : '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {newPassword === confirmPassword ? <><FiCheck /> كلمتا المرور متطابقتان</> : '⚠ كلمتا المرور غير متطابقتين'}
                    </div>
                  )}

                  {/* Password strength */}
                  {newPassword.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '4px', background: newPassword.length >= i * 2 ? (newPassword.length >= 8 ? '#22c55e' : '#f59e0b') : '#e2e8f0', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        {newPassword.length < 4 ? 'ضعيفة جداً' : newPassword.length < 6 ? 'ضعيفة' : newPassword.length < 8 ? 'مقبولة' : 'قوية'}
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="fp-btn" style={{ marginBottom: '10px' }}>
                    {loading ? (
                      <>
                        <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        جاري الحفظ...
                      </>
                    ) : <><FiLock size={14} /> حفظ كلمة المرور الجديدة</>}
                  </button>

                  <button type="button" onClick={() => setStep(1)} className="fp-btn-outline">
                    العودة للخطوة السابقة
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Back to login */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button onClick={() => navigate('/login')} style={{
              background: 'none', border: 'none', color: '#64748b', fontSize: '14px',
              cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#2563eb'}
              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
            >
              <FiArrowRight size={14} /> العودة لتسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
