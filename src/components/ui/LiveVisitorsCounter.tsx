'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';

export default function LiveVisitorsCounter() {
  const [online, setOnline] = useState(0);
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    // Generate or retrieve session ID
    let sid = sessionStorage.getItem('wi_session_id');
    if (!sid) {
      sid = `s_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      sessionStorage.setItem('wi_session_id', sid);
    }
    setSessionId(sid);
  }, []);

  const heartbeat = useCallback(async () => {
    try {
      // Send heartbeat
      await fetch('/api/analytics/online', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, page: window.location.pathname }),
      });

      // Get count
      const res = await fetch('/api/analytics/online');
      if (res.ok) {
        const data = await res.json();
        setOnline(data.online || 0);
      }
    } catch { /* ignore */ }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    heartbeat();
    const interval = setInterval(heartbeat, 30000);
    return () => clearInterval(interval);
  }, [sessionId, heartbeat]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Users className="w-3.5 h-3.5" />
      <span>{online} {online === 1 ? 'vizitator' : 'vizitatori'} online</span>
    </div>
  );
}
