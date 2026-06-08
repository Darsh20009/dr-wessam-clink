import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
};

export function usePushNotifications({ onNotification } = {}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const res = await axios.get('/api/push/subscriptions');
      setIsSubscribed(res.data.subscribed);
    } catch { /* not authenticated yet */ }
  };

  const registerServiceWorker = async () => {
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    return reg;
  };

  const subscribe = useCallback(async () => {
    if (!isSupported) return false;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setLoading(false); return false; }

      const reg = await registerServiceWorker();
      const { data } = await axios.get('/api/push/vapid-key');
      const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

      const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
      const sub = subscription.toJSON();

      await axios.post('/api/push/subscribe', {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
      });

      setIsSubscribed(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Push subscribe error:', err);
      setLoading(false);
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await axios.post('/api/push/unsubscribe', { endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (err) {
      console.error('Unsubscribe error:', err);
    }
    setLoading(false);
  }, []);

  const connectWs = useCallback((token) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${window.location.host}/ws?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'notification' && onNotification) onNotification(data);
      } catch {}
    };

    ws.onclose = () => {
      setTimeout(() => { if (token) connectWs(token); }, 3000);
    };
  }, [onNotification]);

  const disconnectWs = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  return { isSubscribed, isSupported, loading, subscribe, unsubscribe, connectWs, disconnectWs, checkSubscription };
}
