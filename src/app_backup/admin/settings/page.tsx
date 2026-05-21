"use client";

import { useState, useEffect } from "react";

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
  telegram: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  // Integrări
  nineNineMdApiKey: string;
  nineNineMdEndpoint: string;
  nineNineMdActive: boolean;
  iuteCreditApiKey: string;
  iuteCreditPartnerId: string;
  iuteCreditEndpoint: string;
  iuteCreditActive: boolean;
  elfsightWidgetId: string;
  elfsightActive: boolean;
  // Program Magazin
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
  // Program Magazin
  monday: '10:00 - 18:00',
  tuesday: '10:00 - 18:00',
  wednesday: '10:00 - 18:00',
  thursday: '10:00 - 18:00',
  friday: '10:00 - 18:00',
  saturday: '10:00 - 18:00',
  sunday: '10:00 - 16:00',
};

function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings;
  const s = localStorage.getItem("wi_admin_settings");
  if (s) { try { return { ...defaultSettings, ...JSON.parse(s) }; } catch {} }
  return defaultSettings;
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [testing, setTesting] = useState<Record<string, boolean>>({});

  useEffect(() => { setForm(loadSettings()); setMounted(true); }, []);

  const set = (k: keyof Settings, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    localStorage.setItem("wi_admin_settings", JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("Sigur vrei să resetezi toate setările la valori implicite?")) {
      setForm(defaultSettings);
      localStorage.setItem("wi_admin_settings", JSON.stringify(defaultSettings));
    }
  };

  // Test connection functions
  const test999Connection = async () => {
    setTesting(prev => ({ ...prev, nineNineMd: true }));
    try {
      const res = await fetch('/api/integrations/999', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.data.message || 'Conexiune reușită!');
      } else {
        alert(json.error || 'Conexiune eșuată');
      }
    } catch (e) {
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
      if (json.success) {
        alert(json.data.message || 'Conexiune reușită!');
      } else {
        alert(json.error || 'Conexiune eșuată');
      }
    } catch (e) {
      alert('Eroare de conexiune');
    } finally {
      setTesting(prev => ({ ...prev, iuteCredit: false }));
    }
  };

  if (!mounted) return null;

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
          <div><label className={labelCls}>Telegram</label><input value={form.telegram} onChange={(e) => set("telegram", e.target.value)} className={inputCls} /></div>
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
      </div>

      {/* 999.md Integration */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 w-full">📦 Integrare 999.md</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <label className={labelCls} style={{ margin: 0 }}>Activare</label>
          <button
            type="button"
            onClick={() => set("nineNineMdActive", !form.nineNineMdActive)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${form.nineNineMdActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${form.nineNineMdActive ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        {form.nineNineMdActive && (
          <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
            <div><label className={labelCls}>API Key</label><input value={form.nineNineMdApiKey} onChange={(e) => set("nineNineMdApiKey", e.target.value)} type="password" className={inputCls} /></div>
            <div><label className={labelCls}>Endpoint URL</label><input value={form.nineNineMdEndpoint} onChange={(e) => set("nineNineMdEndpoint", e.target.value)} className={inputCls} /></div>
            <button
              onClick={test999Connection}
              disabled={testing.nineNineMd}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${testing.nineNineMd ? 'bg-slate-400 text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}
            >
              {testing.nineNineMd ? 'Testare...' : 'Test Connection'}
            </button>
          </div>
        )}
      </div>

      {/* IuteCredit Integration */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 w-full">💳 Integrare IuteCredit</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <label className={labelCls} style={{ margin: 0 }}>Activare</label>
          <button
            type="button"
            onClick={() => set("iuteCreditActive", !form.iuteCreditActive)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${form.iuteCreditActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${form.iuteCreditActive ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        {form.iuteCreditActive && (
          <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
            <div><label className={labelCls}>API Key</label><input value={form.iuteCreditApiKey} onChange={(e) => set("iuteCreditApiKey", e.target.value)} type="password" className={inputCls} /></div>
            <div><label className={labelCls}>Partner ID</label><input value={form.iuteCreditPartnerId} onChange={(e) => set("iuteCreditPartnerId", e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Endpoint URL</label><input value={form.iuteCreditEndpoint} onChange={(e) => set("iuteCreditEndpoint", e.target.value)} className={inputCls} /></div>
            <button
              onClick={testIuteConnection}
              disabled={testing.iuteCredit}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${testing.iuteCredit ? 'bg-slate-400 text-white' : 'bg-primary text-white hover:bg-primary-dark'}`}
            >
              {testing.iuteCredit ? 'Testare...' : 'Test Connection'}
            </button>
          </div>
        )}
      </div>

      {/* Elfsight Widget */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 w-full">💬 Chatbot Elfsight</h2>
        </div>
        <div className="flex items-center justify-between py-2">
          <label className={labelCls} style={{ margin: 0 }}>Activare</label>
          <button
            type="button"
            onClick={() => set("elfsightActive", !form.elfsightActive)}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${form.elfsightActive ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${form.elfsightActive ? 'translate-x-5' : ''}`} />
          </button>
        </div>
        {form.elfsightActive && (
          <div className="space-y-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
            <div><label className={labelCls}>Widget ID</label><input value={form.elfsightWidgetId} onChange={(e) => set("elfsightWidgetId", e.target.value)} className={inputCls} /></div>
          </div>
        )}
      </div>

      {/* Program Magazin */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2 w-full">🕐 Program Magazin</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div><label className={labelCls}>Luni</label><select value={form.monday} onChange={(e) => set("monday", e.target.value)} className={inputCls}>
            <option>09:00 - 18:00</option>
            <option>10:00 - 18:00</option>
            <option>10:00 - 20:00</option>
            <option>08:00 - 17:00</option>
          </select></div>
          <div><label className={labelCls}>Marți</label><select value={form.tuesday} onChange={(e) => set("tuesday", e.target.value)} className={inputCls}>
            <option>09:00 - 18:00</option>
            <option>10:00 - 18:00</option>
            <option>10:00 - 20:00</option>
            <option>08:00 - 17:00</option>
          </select></div>
          <div><label className={labelCls}>Miercuri</label><select value={form.wednesday} onChange={(e) => set("wednesday", e.target.value)} className={inputCls}>
            <option>09:00 - 18:00</option>
            <option>10:00 - 18:00</option>
            <option>10:00 - 20:00</option>
            <option>08:00 - 17:00</option>
          </select></div>
          <div><label className={labelCls}>Joi</label><select value={form.thursday} onChange={(e) => set("thursday", e.target.value)} className={inputCls}>
            <option>09:00 - 18:00</option>
            <option>10:00 - 18:00</option>
            <option>10:00 - 20:00</option>
            <option>08:00 - 17:00</option>
          </select></div>
          <div><label className={labelCls}>Vineri</label><select value={form.friday} onChange={(e) => set("friday", e.target.value)} className={inputCls}>
            <option>09:00 - 18:00</option>
            <option>10:00 - 18:00</option>
            <option>10:00 - 20:00</option>
            <option>08:00 - 17:00</option>
          </select></div>
          <div><label className={labelCls}>Sâmbătă</label><select value={form.saturday} onChange={(e) => set("saturday", e.target.value)} className={inputCls}>
            <option>09:00 - 18:00</option>
            <option>10:00 - 18:00</option>
            <option>10:00 - 15:00</option>
            <option>ÎNCHIS</option>
          </select></div>
          <div><label className={labelCls}>Duminică</label><select value={form.sunday} onChange={(e) => set("sunday", e.target.value)} className={inputCls}>
            <option>09:00 - 18:00</option>
            <option>10:00 - 18:00</option>
            <option>10:00 - 16:00</option>
            <option>ÎNCHIS</option>
          </select></div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleSave} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition">
          Salvează setările
        </button>
        <button onClick={handleReset} className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition">
          Resetare
        </button>
      </div>
    </div>
  );
}
