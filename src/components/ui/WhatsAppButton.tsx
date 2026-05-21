'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function loadPhone() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const settings: Record<string, string> = {};
          if (Array.isArray(data)) {
            data.forEach((s: { key: string; value: string }) => { settings[s.key] = s.value; });
          }
          setPhoneNumber(settings.WHATSAPP_NUMBER || '37369466585');
        }
      } catch { setPhoneNumber('37369466585'); }
    }
    loadPhone();

    // Show tooltip after 5s
    const timer = setTimeout(() => {
      if (!dismissed) setShowTooltip(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  const openWhatsApp = () => {
    const message = encodeURIComponent('Salut! Am o întrebare despre produsele de pe Western Import.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Tooltip */}
      {showTooltip && !dismissed && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-3 max-w-[200px] relative animate-fade-in">
          <button onClick={() => { setDismissed(true); setShowTooltip(false); }} className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
            <X className="w-3 h-3" />
          </button>
          <p className="text-xs text-slate-600 dark:text-slate-300">Ai întrebări? Scrie-ne pe WhatsApp! 💬</p>
        </div>
      )}

      {/* Button */}
      <button
        onClick={openWhatsApp}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group animate-pulse-subtle"
        aria-label="Contactează-ne pe WhatsApp"
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>

      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
