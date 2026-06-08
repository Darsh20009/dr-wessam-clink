import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { FiKey, FiTrash2, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function PasskeyManager() {
  const [creds, setCreds] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCreds = async () => {
    try {
      const { data } = await axios.get('/webauthn/credentials');
      setCreds(data);
    } catch {}
  };

  useEffect(() => { fetchCreds(); }, []);

  const addPasskey = async () => {
    setLoading(true);
    try {
      const { data: options } = await axios.post('/webauthn/register-options');
      const deviceName = (() => {
        const ua = navigator.userAgent;
        if (/iPhone|iPad|iPod/.test(ua)) return 'iPhone/iPad';
        if (/Android/.test(ua)) return 'Android';
        if (/Mac/.test(ua)) return 'Mac';
        if (/Windows/.test(ua)) return 'Windows';
        return navigator.platform || 'جهازي';
      })();
      const response = await startRegistration({ optionsJSON: options });
      await axios.post('/webauthn/register-verify', { ...response, deviceName });
      toast.success('✅ تم إضافة البصمة بنجاح');
      fetchCreds();
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        toast.error('هذا الجهاز لديه بصمة مسجّلة بالفعل — يمكنك إضافة بصمة من جهاز آخر', { duration: 5000 });
      } else if (err.name === 'NotAllowedError') {
        toast.error('تم إلغاء التسجيل أو انتهت المهلة');
      } else if (err.name === 'NotSupportedError') {
        toast.error('جهازك لا يدعم هذا النوع من البصمة');
      } else if (err.name === 'SecurityError') {
        toast.error('خطأ أمني — تأكد من فتح التطبيق في نافذة المتصفح مباشرةً (ليس داخل إطار مضمّن)', { duration: 6000 });
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error(`خطأ في إضافة البصمة: ${err.message || err.name || 'خطأ غير معروف'}`);
      }
    }
    setLoading(false);
  };

  const deleteCred = async (id) => {
    try {
      await axios.delete(`/webauthn/credentials/${id}`);
      toast.success('تم حذف البصمة');
      fetchCreds();
    } catch { toast.error('خطأ في الحذف'); }
  };

  const isSupported = window.PublicKeyCredential !== undefined;

  if (!isSupported) return (
    <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '10px', color: '#92400e', fontSize: '13px' }}>
      ⚠️ متصفحك لا يدعم تسجيل الدخول بالبصمة
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>تسجيل الدخول بالبصمة</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{creds.length === 0 ? 'لا توجد بصمات مسجّلة' : `${creds.length} بصمة مسجّلة`}</div>
        </div>
        <button onClick={addPasskey} disabled={loading} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: '#2563eb', color: 'white', border: 'none',
          padding: '9px 16px', borderRadius: '8px', fontSize: '13px',
          fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo, sans-serif',
          opacity: loading ? 0.6 : 1,
        }}>
          <FiKey /> {loading ? 'جاري التسجيل...' : 'إضافة بصمة'}
        </button>
      </div>

      {creds.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {creds.map(c => (
            <div key={c._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', background: '#f8fafc', borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiKey style={{ color: '#2563eb', fontSize: '18px' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{c.deviceName || 'جهاز'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {format(new Date(c.createdAt), 'd MMM yyyy', { locale: ar })}
                    {c.credentialDeviceType === 'multiDevice' && ' · متزامن'}
                    {c.credentialBackedUp && ' · محفوظ احتياطياً'}
                  </div>
                </div>
              </div>
              <button onClick={() => deleteCred(c._id)} style={{
                background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', padding: '4px',
              }}><FiTrash2 /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PasskeyLoginButton({ phone, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const loginWithPasskey = async () => {
    if (!phone) return toast.error('أدخل رقم الجوال أولاً');
    setLoading(true);
    try {
      const { data } = await axios.post('/webauthn/login-options', { phone });
      const { options, userId } = data;
      const response = await startAuthentication({ optionsJSON: options });
      const { data: result } = await axios.post('/webauthn/login-verify', { userId, response });
      onSuccess(result);
    } catch (err) {
      if (err.name === 'NotAllowedError') toast.error('تم الإلغاء');
      else toast.error(err.response?.data?.message || 'لا توجد بصمة مسجّلة لهذا الرقم');
    }
    setLoading(false);
  };

  return (
    <button onClick={loginWithPasskey} disabled={loading} style={{
      flex: 1, padding: '12px',
      background: loading ? '#e2e8f0' : '#f0f9ff',
      color: loading ? '#94a3b8' : '#0369a1',
      border: '1.5px solid #bae6fd', borderRadius: '10px',
      fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
      fontFamily: 'Cairo, sans-serif',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      transition: 'all 0.2s',
    }}>
      <FiKey style={{ fontSize: '18px' }} />
      {loading ? 'جاري التحقق...' : 'بصمة'}
    </button>
  );
}
