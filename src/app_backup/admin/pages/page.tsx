"use client";

import { useState, useEffect } from "react";

interface PageData {
  id: string;
  slug: string;
  titleRO: string;
  titleRU: string;
  contentRO: string;
  contentRU: string;
  metaTitle: string;
  metaDescription: string;
  updatedAt: string;
}

const defaultPages: PageData[] = [
  { id: "1", slug: "termeni", titleRO: "Termeni și Condiții", titleRU: "Условия и положения", contentRO: "Acești termeni și condiții reglementează utilizarea site-ului Western Import...\n\n1. Generalități\nWestern Import oferă servicii de vânzare a materialelor de construcție și finisaje.\n\n2. Produse\nToate prețurile sunt în MDL și includ TVA.\n\n3. Comenzi\nComenzile sunt confirmate prin email în maxim 24h.", contentRU: "Настоящие Условия регулируют использование сайта Western Import...\n\n1. Общие положения\nWestern Import предлагает строительные и отделочные материалы.\n\n2. Продукция\nВсе цены указаны в MDL с учётом НДС.", metaTitle: "Termeni și Condiții - Western Import", metaDescription: "Termenii și condițiile de utilizare a site-ului Western Import", updatedAt: "2024-12-01" },
  { id: "2", slug: "confidentialitate", titleRO: "Politica de Confidențialitate", titleRU: "Политика конфиденциальности", contentRO: "Western Import respectă confidențialitatea datelor personale...\n\n1. Date colectate\nColectăm: nume, email, telefon, adresă de livrare.\n\n2. Utilizare\nDatele sunt folosite exclusiv pentru procesarea comenzilor.", contentRU: "Western Import уважает конфиденциальность персональных данных...\n\n1. Собираемые данные\nМы собираем: имя, email, телефон, адрес доставки.", metaTitle: "Politica de Confidențialitate - Western Import", metaDescription: "Politica de confidențialitate Western Import", updatedAt: "2024-12-01" },
  { id: "3", slug: "cookies", titleRO: "Politica Cookies", titleRU: "Политика cookies", contentRO: "Acest site folosește cookies pentru a îmbunătăți experiența...\n\n1. Ce sunt cookies?\nMici fișiere text stocate pe dispozitivul dumneavoastră.\n\n2. Tipuri utilizate\nCookies esențiale, de performanță și de marketing.", contentRU: "Этот сайт использует cookies...\n\n1. Что такое cookies?\nНебольшие текстовые файлы, сохраняемые на вашем устройстве.", metaTitle: "Politica Cookies - Western Import", metaDescription: "Politica cookies Western Import", updatedAt: "2024-12-01" },
  { id: "4", slug: "livrare", titleRO: "Livrare și Returnare", titleRU: "Доставка и возврат", contentRO: "Livrăm în toată Republica Moldova.\n\n1. Cost livrare\n- Chișinău: gratuit peste 3000 MDL, altfel 150 MDL\n- Raioane: 200-400 MDL\n\n2. Timp livrare\n- Chișinău: 1-2 zile\n- Raioane: 2-5 zile\n\n3. Returnare\nProdusele pot fi returnate în 14 zile în ambalajul original.", contentRU: "Доставка по всей Республике Молдова.\n\n1. Стоимость доставки\n- Кишинёв: бесплатно свыше 3000 MDL\n- Районы: 200-400 MDL", metaTitle: "Livrare și Returnare - Western Import", metaDescription: "Informații despre livrare și returnare Western Import", updatedAt: "2024-12-01" },
  { id: "5", slug: "garantie", titleRO: "Garanție", titleRU: "Гарантия", contentRO: "Toate produsele beneficiază de garanție conform legii.\n\n1. Perioadă garanție\n- Parchet/Laminat: 10-25 ani (depinde de producător)\n- Uși: 5 ani\n- Accesorii: 2 ani\n\n2. Condiții\nGaranția se aplică pentru defecte de fabricație, nu pentru uzură normală.", contentRU: "Все товары имеют гарантию согласно законодательству.\n\n1. Срок гарантии\n- Паркет/Ламинат: 10-25 лет\n- Двери: 5 лет\n- Аксессуары: 2 года", metaTitle: "Garanție - Western Import", metaDescription: "Politica de garanție Western Import", updatedAt: "2024-12-01" },
  { id: "6", slug: "despre", titleRO: "Despre Noi", titleRU: "О нас", contentRO: "Western Import este un magazin de materiale de finisaje și construcție din Chișinău.\n\nCu o experiență de peste 10 ani, oferim:\n- Parchet, laminat, uși, tapet\n- Consultanță gratuită\n- Livrare în toată țara\n- Prețuri competitive", contentRU: "Western Import — магазин отделочных и строительных материалов в Кишинёве.\n\nБолее 10 лет опыта:\n- Паркет, ламинат, двери, обои\n- Бесплатные консультации\n- Доставка по всей стране", metaTitle: "Despre Western Import", metaDescription: "Despre Western Import - materiale de construcție și finisaje", updatedAt: "2024-12-01" },
  { id: "7", slug: "contact", titleRO: "Contact", titleRU: "Контакты", contentRO: "Western Import SRL\n\n📍 Adresă: str. Ion Creangă 12, Chișinău, MD-2001\n📞 Telefon: +373 22 123 456\n📱 Mobil: +373 69 123 456\n✉️ Email: info@western.md\n\n🕐 Program:\nLuni - Vineri: 09:00 - 18:00\nSâmbătă: 09:00 - 14:00\nDuminică: Închis", contentRU: "Western Import SRL\n\n📍 Адрес: ул. Ион Крянгэ 12, Кишинёв\n📞 Телефон: +373 22 123 456\n📱 Моб.: +373 69 123 456\n✉️ Email: info@western.md", metaTitle: "Contact - Western Import", metaDescription: "Contact Western Import - adresă, telefon, email", updatedAt: "2024-12-01" },
];

function loadPages(): PageData[] {
  if (typeof window === "undefined") return defaultPages;
  const s = localStorage.getItem("wi_admin_pages");
  if (s) { try { return JSON.parse(s); } catch {} }
  localStorage.setItem("wi_admin_pages", JSON.stringify(defaultPages));
  return defaultPages;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<PageData | null>(null);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const p = loadPages(); setPages(p); setMounted(true);
    if (p.length) { setSelectedId(p[0].id); setForm(p[0]); }
  }, []);

  const selectPage = (id: string) => {
    const p = pages.find((x) => x.id === id);
    if (p) { setSelectedId(id); setForm({ ...p }); setSaved(false); }
  };

  const set = (k: keyof PageData, v: string) => {
    if (!form) return;
    setForm({ ...form, [k]: v });
  };

  const handleSave = () => {
    if (!form) return;
    const updated = pages.map((p) => p.id === form.id ? { ...form, updatedAt: new Date().toISOString().slice(0, 10) } : p);
    setPages(updated);
    localStorage.setItem("wi_admin_pages", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!mounted || !form) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pagini</h1>
        {saved && <span className="text-green-600 dark:text-green-400 text-sm font-medium">✓ Salvat!</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page list */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pagini site</p>
          </div>
          <div>
            {pages.map((p) => (
              <button key={p.id} onClick={() => selectPage(p.id)} className={`w-full text-left px-4 py-3 text-sm border-b border-slate-100 dark:border-slate-700/50 transition ${selectedId === p.id ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30"}`}>
                <span className="font-medium">{p.titleRO}</span>
                <span className="block text-xs text-slate-400 mt-0.5">/{p.slug}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.titleRO}</h2>
            <span className="text-xs text-slate-400">Actualizat: {form.updatedAt}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titlu (RO)</label>
              <input value={form.titleRO} onChange={(e) => set("titleRO", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titlu (RU)</label>
              <input value={form.titleRU} onChange={(e) => set("titleRU", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conținut (RO)</label>
              <textarea value={form.contentRO} onChange={(e) => set("contentRO", e.target.value)} rows={12} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conținut (RU)</label>
              <textarea value={form.contentRU} onChange={(e) => set("contentRU", e.target.value)} rows={12} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none font-mono" />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">SEO</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Title</label>
                <input value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Meta Description</label>
                <input value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button onClick={handleSave} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition">
              Salvează pagina
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
