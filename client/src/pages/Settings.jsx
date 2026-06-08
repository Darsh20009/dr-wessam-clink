import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PasskeyManager } from '../components/PasskeyButton';
import { usePushNotifications } from '../hooks/usePushNotifications';
import toast from 'react-hot-toast';
import { FiKey, FiBell, FiShield, FiUser } from 'react-icons/fi';

export default function Settings() {
  const { user } = useAuth();
  const { isSubscribed, isSupported, loading, subscribe, unsubscribe } = usePushNotifications();

  const togglePush = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast.success('تم إيقاف الإشعارات الخارجية');
    } else {
      const ok = await subscribe();
      if (ok) toast.success('✅ تم تفعيل الإشعارات الخارجية!');
      else toast.error('تعذّر تفعيل الإشعارات - تأكد من السماح للمتصفح');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">الإعدادات والأمان</h1>
          <p className="page-subtitle">إدارة طرق تسجيل الدخول والإشعارات</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px' }}>

        {/* Account Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#dbeafe', color: '#2563eb', borderRadius: '12px', padding: '12px', fontSize: '22px' }}>
              <FiUser />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>معلومات الحساب</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{user?.name}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>الاسم</div>
              <div style={{ fontWeight: 600 }}>{user?.name || '—'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>رقم الجوال</div>
              <div style={{ fontWeight: 600 }}>{user?.phone || '—'}</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>الدور</div>
              <div style={{ fontWeight: 600 }}>{user?.role === 'doctor' ? 'طبيب' : 'مريض'}</div>
            </div>
          </div>
        </div>

        {/* Passkey */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#ede9fe', color: '#7c3aed', borderRadius: '12px', padding: '12px', fontSize: '22px' }}>
              <FiKey />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>البصمة / Passkey</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>تسجيل الدخول بدون كلمة مرور باستخدام بصمة الجهاز</div>
            </div>
          </div>
          <PasskeyManager />
        </div>

        {/* Push Notifications */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#d1fae5', color: '#065f46', borderRadius: '12px', padding: '12px', fontSize: '22px' }}>
              <FiBell />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>الإشعارات الخارجية</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>استقبال إشعارات على جهازك حتى عند إغلاق التطبيق</div>
            </div>
          </div>

          {!isSupported ? (
            <div style={{ padding: '14px', background: '#fef3c7', borderRadius: '10px', color: '#92400e', fontSize: '13px' }}>
              ⚠️ متصفحك لا يدعم الإشعارات الخارجية
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '10px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>إشعارات النظام</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {isSubscribed ? 'مفعّل — تصلك إشعارات حتى لو التطبيق مغلق' : 'غير مفعّل'}
                  </div>
                </div>
                <button onClick={togglePush} disabled={loading} style={{
                  background: isSubscribed ? '#fee2e2' : '#2563eb',
                  color: isSubscribed ? '#991b1b' : 'white',
                  border: 'none', borderRadius: '8px', padding: '9px 18px',
                  fontWeight: 600, fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Cairo, sans-serif', transition: 'all 0.2s',
                }}>
                  {loading ? 'جاري...' : isSubscribed ? 'إيقاف' : 'تفعيل'}
                </button>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.7 }}>
                📌 تأكد من السماح للمتصفح بإرسال الإشعارات عند الطلب.
                يمكنك إيقاف الإشعارات في أي وقت من هنا.
              </div>
            </div>
          )}
        </div>

        {/* Security Info */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#f0fdf4', color: '#15803d', borderRadius: '12px', padding: '12px', fontSize: '22px' }}>
              <FiShield />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>معلومات الأمان</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: <FiKey size={16} color="#2563eb"/>, title: 'البصمة (Passkey)', desc: 'المفتاح الخاص لا يغادر جهازك أبداً — أعلى مستويات الأمان' },
              { icon: <FiBell size={16} color="#2563eb"/>, title: 'Web Push (VAPID)', desc: 'الإشعارات مشفّرة من الطرف إلى الطرف' },
              { icon: <FiShield size={16} color="#2563eb"/>, title: 'الإشعارات الفورية', desc: 'WebSocket مشفّر — يصلك الإشعار في الثانية ذاتها' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <span style={{ marginTop: '2px' }}>{item.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
