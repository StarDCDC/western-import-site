"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit3, ExternalLink, Loader2 } from "lucide-react";
import BlockEditor from "@/components/admin/BlockEditor";
import PageBlocks from "@/components/public/PageBlocks";
import { parseBlocks, serializeBlocks } from "@/lib/blocks";
import type { PageBlock } from "@/lib/blocks";

interface Page {
  id: string;
  slug: string;
  titleRo: string;
  titleRu: string;
  contentRo: string | null;
  contentRu: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Page | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"ro" | "ru">("ro");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("edit");
  const [iframeKey, setIframeKey] = useState(0);

  const [blocksRo, setBlocksRo] = useState<PageBlock[]>([]);
  const [blocksRu, setBlocksRu] = useState<PageBlock[]>([]);
  const [seeding, setSeeding] = useState(false);

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pages");
      const json = await res.json();
      if (json.success) {
        setPages(json.data || []);
        if (json.data?.length && !selectedId) {
          setSelectedId(json.data[0].id);
          setForm(json.data[0]);
          loadBlocks(json.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const loadBlocks = (p: Page) => {
    setBlocksRo(parseBlocks(p.contentRo));
    setBlocksRu(parseBlocks(p.contentRu));
  };

  const selectPage = (id: string) => {
    const p = pages.find((x) => x.id === id);
    if (p) {
      setSelectedId(id);
      setForm({ ...p });
      setViewMode("edit");
      setSaved(false);
      loadBlocks(p);
    }
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: form.id,
          titleRo: form.titleRo,
          titleRu: form.titleRu,
          contentRo: serializeBlocks(blocksRo),
          contentRu: serializeBlocks(blocksRu),
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          isPublished: form.isPublished,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPages();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert(json.error || "Eroare la salvare");
      }
    } catch {
      alert("Eroare la salvare");
    } finally {
      setSaving(false);
    }
  };

  const pageSlug = form ? (activeTab === "ru" ? `ru/${form.slug}` : form.slug) : "";
  const previewSrc = `${siteUrl}/${pageSlug}`;
  const currentBlocks = activeTab === "ro" ? blocksRo : blocksRu;
  const currentSetBlocks = activeTab === "ro" ? setBlocksRo : setBlocksRu;
  const currentTitle = form ? (activeTab === "ro" ? form.titleRo : form.titleRu) : "";

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  if (!form) {
    return <div className="text-center py-20 text-slate-400">Nu sunt pagini</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pagini Site</h1>
        <div className="flex items-center gap-3">
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1"
            >
              ✓ Salvat cu succes!
            </motion.span>
          )}
          {/* Seed button */}
          <button
            onClick={async () => {
              setSeeding(true);
              try {
                const res = await fetch("/api/admin/pages/seed-all", { method: "POST" });
                const json = await res.json();
                if (json.success) {
                  setSaved(true);
                  fetchPages();
                  setTimeout(() => setSaved(false), 3000);
                } else {
                  alert("Eroare: " + (json.error || "Unknown"));
                }
              } catch {
                alert("Eroare de conexiune");
              } finally {
                setSeeding(false);
              }
            }}
            disabled={seeding}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : "🌱"}
            {seeding ? "Seeding..." : "Seed All Pages"}
          </button>
          {/* Save always visible */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "💾"}
            {saving ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Page list */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pagini disponibile</p>
          </div>
          <div>
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPage(p.id)}
                className={`w-full text-left px-4 py-3.5 text-sm border-b border-slate-100 dark:border-slate-700/50 transition ${
                  selectedId === p.id
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                }`}
              >
                <span className="font-medium">{p.titleRo}</span>
                <span className="block text-xs text-slate-400 mt-0.5">/{p.slug}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                {/* Inline title edit */}
                <input
                  value={activeTab === "ro" ? form.titleRo : form.titleRu}
                  onChange={(e) => setForm({ ...form, [activeTab === "ro" ? "titleRo" : "titleRu"]: e.target.value })}
                  className="text-lg font-semibold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 outline-none px-1 py-0.5 transition"
                />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className={`text-xs font-medium ${form.isPublished ? "text-green-600" : "text-slate-400"}`}>
                    {form.isPublished ? "Publicat" : "Draft"}
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                {/* RO / RU */}
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveTab("ro")}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "ro" ? "bg-amber-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    🇷🇴 RO
                  </button>
                  <button
                    onClick={() => setActiveTab("ru")}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "ru" ? "bg-amber-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    🇷🇺 RU
                  </button>
                </div>

                {/* View / Edit */}
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === "edit" ? "bg-amber-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editare
                  </button>
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === "preview" ? "bg-blue-500 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </div>

                <a
                  href={`${siteUrl}/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Site
                </a>
              </div>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {viewMode === "edit" ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 min-h-[500px]"
              >
                {/* Page title like on site */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {currentTitle || "Titlu pagină"}
                  </h1>
                  <div className="w-16 h-1 bg-amber-500 rounded-full" />
                </div>

                {/* Inline block editor — renders exactly like site */}
                <BlockEditor blocks={currentBlocks} onChange={currentSetBlocks} />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white"
              >
                {/* Browser chrome */}
                <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                    {siteUrl}/{pageSlug}
                  </div>
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    title="Reîncarcă"
                  >
                    ↻
                  </button>
                </div>
                <iframe
                  key={iframeKey}
                  src={previewSrc}
                  className="w-full border-0"
                  style={{ height: "70vh", minHeight: 500 }}
                  title={`Preview /${pageSlug}`}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* SEO */}
          <details className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <summary className="p-4 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 select-none hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl transition">
              🔍 SEO
            </summary>
            <div className="px-5 pb-5 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Meta Title</label>
                <input
                  value={form.metaTitle || ""}
                  onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Meta Description</label>
                <input
                  value={form.metaDescription || ""}
                  onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
