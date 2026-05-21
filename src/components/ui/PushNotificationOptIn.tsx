'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Check } from 'lucide-react';

export default function PushNotificationOptIn() {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSupported('Notification' in window && 'serviceWorker' in navigator);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribe = async () => {
    if (!supported) return;
    setLoading(true);

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setLoading(false);
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');

      // Wait for ready
      await navigator.serviceWorker.ready;

      // Create push subscription using applicationServerKey
      // Note: For full functionality, you need VAPID keys
      // For now we just register the service worker for future push
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // We need VAPID public key for actual push
        // Store minimal subscription data
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: registration.scope,
            keys: JSON.stringify({ source: 'service-worker-registered' }),
          }),
        });
      }
    } catch (error) {
      console.error('Push subscription error:', error);
    }

    setLoading(false);
  };

  if (!supported) return null;

  if (permission === 'granted') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
        <Check className="w-4 h-4" />
        <span>Notificări activate</span>
      </div>
    );
  }

  return (
    <button
      onClick={subscribe}
      disabled={loading || permission === 'denied'}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:dark:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
    >
      {permission === 'denied' ? (
        <>
          <BellOff className="w-4 h-4" />
          Notificări blocate
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          {loading ? 'Se activează...' : 'Activează notificările'}
        </>
      )}
    </button>
  );
}
