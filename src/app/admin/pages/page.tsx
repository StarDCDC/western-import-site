"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Edit3, X, ExternalLink, Loader2 } from "lucide-react";

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
  const [editContent, setEditContent] = useState("");
  const [editContentRu, setEditContentRu] = useState("");
  const [activeTab, setActiveTab] = useState<"ro" | "ru">("ro");
  const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");
  const [iframeKey, setIframeKey] = useState(0);

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
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  const selectPage = (id: string) => {
    const p = pages.find((x) => x.id === id);
    if (p) {
      setSelectedId(id);
      setForm({ ...p });
      setViewMode("preview");
      setSaved(false);
      prepareEditContent(p);
    }
  };

  const prepareEditContent = (p: Page) => {
    // RO
    const divRo = document.createElement("div");
    divRo.innerHTML = p.contentRo || "";
    const sectionsRo: string[] = [];
    divRo.querySelectorAll("h1, h2, h3, p, li, blockquote").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || "";
      if (!text) return;
      if (tag === "h1") sectionsRo.push(`# ${text}`);
      else if (tag === "h2") sectionsRo.push(`## ${text}`);
      else if (tag === "h3") sectionsRo.push(`### ${text}`);
      else if (tag === "li") sectionsRo.push(`- ${text}`);
      else if (tag === "blockquote") sectionsRo.push(`> ${text}`);
      else sectionsRo.push(text);
    });
    setEditContent(sectionsRo.join("\n\n"));

    // RU
    const divRu = document.createElement("div");
    divRu.innerHTML = p.contentRu || "";
    const sectionsRu: string[] = [];
    divRu.querySelectorAll("h1, h2, h3, p, li, blockquote").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || "";
      if (!text) return;
      if (tag === "h1") sectionsRu.push(`# ${text}`);
      else if (tag === "h2") sectionsRu.push(`## ${text}`);
      else if (tag === "h3") sectionsRu.push(`### ${text}`);
      else if (tag === "li") sectionsRu.push(`- ${text}`);
      else if (tag === "blockquote") sectionsRu.push(`> ${text}`);
      else sectionsRu.push(text);
    });
    setEditContentRu(sectionsRu.join("\n\n"));
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
          contentRo: form.contentRo,
          contentRu: form.contentRu,
          metaTitle: form.metaTitle,
          metaDescription: form.metaDescription,
          isPublished: form.isPublished,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchPages();
        setSaved(true);
        setViewMode("preview");
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

  const applyEdit = () => {
    if (!form) return;
    const raw = activeTab === "ro" ? editContent : editContentRu;
    const html = raw
      .split("\n\n")
      .map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return "";
        if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2)}</h1>`;
        if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
        if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
        if (trimmed.startsWith("> ")) return `<blockquote>${trimmed.slice(2)}</blockquote>`;
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((l) => `<li>${l.replace(/^- /, "")}</li>`).join("");
          return `<ul>${items}</ul>`;
        }
        return `<p>${trimmed}</p>`;
      })
      .join("\n");

    if (activeTab === "ro") {
      setForm({ ...form, contentRo: html });
    } else {
      setForm({ ...form, contentRu: html });
    }
  };

  const pageSlug = form ? (activeTab === "ru" ? `ru/${form.slug}` : form.slug) : "";
  const previewSrc = `${siteUrl}/${pageSlug}`;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" /></div>;
  }

  if (!form) {
    return <div className="text-center py-20 text-slate-400">Nu sunt pagini</div>;
  }



  return (
    <div className="space-y-6">
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

        {/* Editor / Preview */}
        <div className="lg:col-span-3 space-y-4">
          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              {/* Left: page title + status */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{form.titleRo}</h2>
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

              {/* Right: tabs + actions */}
              <div className="flex items-center gap-2">
                {/* RO / RU */}
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setActiveTab("ro")}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "ro"
                        ? "bg-amber-500 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    RO
                  </button>
                  <button
                    onClick={() => setActiveTab("ru")}
                    className={`px-3 py-1.5 text-xs font-medium transition ${
                      activeTab === "ru"
                        ? "bg-amber-500 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    RU
                  </button>
                </div>

                {/* View / Edit toggle */}
                <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === "preview"
                        ? "bg-blue-500 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => setViewMode("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition ${
                      viewMode === "edit"
                        ? "bg-amber-500 text-white"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editează
                  </button>
                </div>

                {/* Open on site */}
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

          {/* Content area */}
          <AnimatePresence mode="wait">
            {viewMode === "preview" ? (
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
                    title="Reîncarcă preview"
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
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-5"
              >
                {/* Title edit */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Titlu pagină ({activeTab === "ro" ? "RO" : "RU"})
                  </label>
                  <input
                    value={activeTab === "ro" ? form.titleRo : form.titleRu}
                    onChange={(e) => setForm({ ...form, [activeTab === "ro" ? "titleRo" : "titleRu"]: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                {/* Content edit */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Conținut ({activeTab === "ro" ? "RO" : "RU"}) — Markdown
                  </label>
                  <textarea
                    value={activeTab === "ro" ? editContent : editContentRu}
                    onChange={(e) => activeTab === "ro" ? setEditContent(e.target.value) : setEditContentRu(e.target.value)}
                    rows={22}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 outline-none font-mono leading-relaxed"
                    placeholder={"# Titlu principal\n\n## Subtitlu\n\nParagraf text\n\n- List item\n\n> Citat"}
                  />
                  <p className="text-xs text-slate-400 mt-1.5">
                    Folosește Markdown: <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded"># h1</code> <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">## h2</code> <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">### h3</code> <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">- listă</code> <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">&gt; citat</code>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { applyEdit(); setViewMode("preview"); }}
                    className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" /> Aplică & Preview
                  </button>
                  <button
                    onClick={() => setViewMode("preview")}
                    className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    Anulează
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SEO — always visible */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              🔍 SEO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Save */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg text-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "💾"}
              {saving ? "Se salvează..." : "Salvează pagina"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
