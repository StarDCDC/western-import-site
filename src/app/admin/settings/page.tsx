"use client";

import { useState, useEffect, useCallback } from "react";

interface Settings {
  siteName: string;
  phone: string;
  email: string;
  address: string;
  schedule: string;
  metaTitle: string;
  metaDescription: string;
  gaId: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  viber: string;
  telegram: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  nineNineMdApiKey: string;
  nineNineMdEndpoint: string;
  nineNineMdActive: boolean;
  iuteCreditApiKey: string;
  iuteCreditPartnerId: string;
  iuteCreditEndpoint: string;
  iuteCreditActive: boolean;
  elfsightWidgetId: string;
  elfsightActive: boolean;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

const defaultSettings: Settings = {
  siteName: "Western Import",
  phone: "+373 22 123 456",
  email: "info@western.md",
  address: "str. Ion Creangă 12, Chișinău, MD-2001",
  schedule: "Luni-Vineri: 09:00-18:00, Sâmbătă: 09:00-14:00",
  metaTitle: "Western Import - Electronice și IT",
  metaDescription: "Magazin online de electronice, laptopuri, telefoane și accesorii. Livrare în toată Republica Moldova.",
  gaId: "G-XXXXXXXXXX",
  facebook: "https://facebook.com/westernimport",
  instagram: "https://instagram.com/westernimport",
  tiktok: "https://tiktok.com/@westernimport",
  whatsapp: "https://wa.me/37322123456",
  viber: "viber://chat?number=37322123456",
  telegram: "https://t.me/westernimport",
  smtpHost: "smtp.gmail.com",
  smtpPort: "587",
  smtpUser: "info@western.md",
  smtpPass: "",
  nineNineMdApiKey: '',
  nineNineMdEndpoint: 'https://api.999.md/api/v1',
  nineNineMdActive: false,
  iuteCreditApiKey: '',
  iuteCreditPartnerId: '',
  iuteCreditEndpoint: 'https://api.iute.md/v1',
  iuteCreditActive: false,
  elfsightWidgetId: '',
  elfsightActive: false,
  monday: '09:00 - 18:00',
  tuesday: '09:00 - 18:00',
  wednesday: '09:00 - 18:00',
  thursday: '09:00 - 18:00',
  friday: '09:00 - 18:00',
  saturday: '09:00 - 16:00',
  sunday: 'ÎNCHIS',
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success && json.data) {
        setForm({ ...defaultSettings, ...json.data });
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const set = (k: keyof Settings, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(json.error || 'Eroare');
      }
    } catch {
      alert('Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  const test999Connection = async () => {
    setTesting(prev => ({ ...prev, nineNineMd: true }));
    try {
      const res = await fetch('/api/integrations/999', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      const json = await res.json();
      alert(json.success ? (json.data?.message || 'Conexiune reușită!') : (json.error || 'Conexiune eșuată'));
    } catch {
      alert('Eroare de conexiune');
    } finally {
      setTesting(prev => ({ ...prev, nineNineMd: false }));
    }
  };

  const testIuteConnection = async () => {
    setTesting(prev => ({ ...prev, iuteCredit: true }));
    try {
      const res = await fetch('/api/integrations/iute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      const json = await res.json();
      alert(json.success ? (json.data?.message || 'Conexiune reușită!') : (json.error || 'Conexiune eșuată'));
    } catch {
      alert('Eroare de conexiune');
    } finally {
      setTesting(prev => ({ ...prev, iuteCredit: false }));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  const inputCls = "w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm";
  const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <div className="space-y-6 max-w-[1280px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Setări</h1>
        {saved && <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Setări salvate!</span>}
      </div>

      {/* General */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">📋 Informații generale</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Nume site</label><input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Telefon</label><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Email</label><input value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Adresă</label><input value={form.address} onChange={(e) => set("address", e.target.value)} className={inputCls} /></div>
          <div className="md:col-span-2"><label className={labelCls}>Program</label><input value={form.schedule} onChange={(e) => set("schedule", e.target.value)} className={inputCls} /></div>
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">🔍 SEO</h2>
        <div className="space-y-4">
          <div><label className={labelCls}>Meta Title</label><input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Meta Description</label><textarea value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} rows={3} className={inputCls + " resize-none"} /></div>
          <div><label className={labelCls}>Google Analytics ID</label><input value={form.gaId} onChange={(e) => set("gaId", e.target.value)} className={inputCls} placeholder="G-XXXXXXXXXX" /></div>
        </div>
      </div>

      {/* Social */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">🌐 Rețele sociale</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelCls}>Facebook</label><input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Instagram</label><input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>TikTok</label><input value={form.tiktok || ''} onChange={(e) => set("tiktok", e.target.value)} className={inputCls} placeholder="https://tiktok.com/@..." /></div>
          <div><label className={labelCls}>Telegram</label><input value={form.telegram} onChange={(e) => set("telegram", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>WhatsApp</label><input value={form.whatsapp || ''} onChange={(e) => set("whatsapp", e.target.value)} className={inputCls} placeholder="https://wa.me/373..." /></div>
          <div><label className={labelCls}>Viber</label><input value={form.viber || ''} onChange={(e) => set("viber", e.target.value)} className={inputCls} placeholder="viber://chat?number=373..." /></div>
        </div>
      </div>

      {/* Email */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">📧 Email (SMTP)</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelCls}>SMTP Host</label><input value={form.smtpHost} onChange={(e) => set("smtpHost", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Port</label><input value={form.smtpPort} onChange={(e) => set("smtpPort", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>User</label><input value={form.smtpUser} onChange={(e) => set("smtpUser", e.target.value)} className={inputCls} /></div>
        </div>
        <div><label className={labelCls}>Parolă</label><input type="password" value={form.smtpPass} onChange={(e) => set("smtpPass", e.target.value)} className={inputCls} /></div>
      </div>

      {/* Integrări — mereu active, configurare ascunsă */}
      {/* 999.md, IuteCredit și Elfsight sunt activate permanent — configurarea tehnică se face prin .env și cod */}

      {/* Program Magazin */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">🕐 Program Magazin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const).map((day) => (
            <div key={day}><label className={labelCls}>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
              <input value={form[day]} onChange={(e) => set(day, e.target.value)} className={inputCls} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition disabled:opacity-50">
          {saving ? "Se salvează..." : "Salvează setările"}
        </button>
      </div>
    </div>
  );
}