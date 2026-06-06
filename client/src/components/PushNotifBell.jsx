import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiBell, FiBellOff } from 'react-icons/fi';
import { usePushNotifications } from '../hooks/usePushNotifications';

export default function PushNotifBell() {
  const [showToast, setShowToast] = useState(false);

  const { isSubscribed, isSupported, loading, subscribe, unsubscribe } = usePushNotifications({
    onNotification: (data) => {
      toast(
        <div style={{ direction: 'rtl' }}>
          <div style={{ fontWeight: 700 }}>{data.title}</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>{data.body}</div>
        </div>,
        { icon: '🔔', duration: 5000 }
      );
    }
  });

  if (!isSupported) return null;

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast.success('تم إيقاف الإشعارات');
    } else {
      const success = await subscribe();
      if (success) toast.success('✅ تم تفعيل الإشعارات!');
      else toast.error('تعذّر تفعيل الإشعارات');
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isSubscribed ? 'إيقاف الإشعارات الخارجية' : 'تفعيل الإشعارات الخارجية'}
      style={{
        background: isSubscribed ? '#dbeafe' : '#f1f5f9',
        border: 'none', borderRadius: '8px', padding: '8px',
        color: isSubscribed ? '#2563eb' : '#64748b',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '16px', display: 'flex', alignItems: 'center',
        transition: 'all 0.2s', position: 'relative',
      }}
    >
      {isSubscribed ? <FiBell /> : <FiBellOff />}
      {isSubscribed && (
        <span style={{
          position: 'absolute', top: '-3px', right: '-3px',
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#10b981', border: '1.5px solid white',
        }} />
      )}
    </button>
  );
}
