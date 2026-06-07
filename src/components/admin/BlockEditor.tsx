"use client";

import { useState } from "react";
import {
  Star, Target, Heart, Shield, Award, TrendingUp, Users, Package, Clock,
  Zap, Globe, Truck, Headphones, CheckCircle, XCircle,
  Plus, Trash2, ChevronUp, ChevronDown, Type, AlignLeft, Quote,
  ImageIcon, BarChart3, LayoutGrid, UserCircle, GripVertical,
} from "lucide-react";
import type {
  PageBlock, IconName, HeadingBlock, ParagraphBlock, QuoteBlock,
  ImageBlock, StatsBlock, CardsBlock, TeamBlock,
} from "@/lib/blocks";
import { ICON_NAMES, COLOR_OPTIONS, GRADIENT_OPTIONS } from "@/lib/blocks";

// ─── Icon map ──────────────────────────────────────────────────────
const lucideIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  star: Star, target: Target, heart: Heart, shield: Shield, award: Award,
  "trending-up": TrendingUp, users: Users, package: Package, clock: Clock,
  zap: Zap, globe: Globe, truck: Truck, headphones: Headphones,
  "check-circle": CheckCircle, "x-circle": XCircle,
};

function LucideIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const Comp = lucideIcons[name] || Star;
  return <Comp size={size} className={className} />;
}

// ─── Color helpers ─────────────────────────────────────────────────
const colorBg: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900/30", green: "bg-green-100 dark:bg-green-900/30",
  purple: "bg-purple-100 dark:bg-purple-900/30", amber: "bg-amber-100 dark:bg-amber-900/30",
  red: "bg-red-100 dark:bg-red-900/30", primary: "bg-amber-500/10",
};
const colorText: Record<string, string> = {
  blue: "text-blue-600 dark:text-blue-400", green: "text-green-600 dark:text-green-400",
  purple: "text-purple-600 dark:text-purple-400", amber: "text-amber-600 dark:text-amber-400",
  red: "text-red-600 dark:text-red-400", primary: "text-amber-600",
};

// ─── Inline editable text ──────────────────────────────────────────
function Editable({
  value, onChange, className, placeholder, multiline = false, tag: Tag = "span",
}: {
  value: string; onChange: (v: string) => void; className?: string;
  placeholder?: string; multiline?: boolean; tag?: "span" | "p" | "h2" | "h3" | "div";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const start = () => { setDraft(value); setEditing(true); };
  const commit = () => { setEditing(false); if (draft !== value) onChange(draft); };
  const cancel = () => { setEditing(false); setDraft(value); };

  if (editing) {
    if (multiline) {
      return (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === "Escape") cancel(); }}
          autoFocus
          rows={4}
          className={`${className} !bg-white dark:!bg-slate-700 !ring-2 !ring-amber-400 !outline-none rounded-lg p-1 w-full resize-y border border-amber-300`}
          placeholder={placeholder}
        />
      );
    }
    return (
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") cancel(); }}
        autoFocus
        className={`${className} !bg-white dark:!bg-slate-700 !ring-2 !ring-amber-400 !outline-none rounded px-1 w-full border border-amber-300`}
        placeholder={placeholder}
      />
    );
  }

  return (
    <Tag
      className={`${className} cursor-text hover:ring-2 hover:ring-amber-300/50 hover:rounded rounded transition-all ${!value ? "text-slate-300 italic" : ""}`}
      onClick={start}
      title="Click pentru editare"
    >
      {value || placeholder || "Click pentru editare"}
    </Tag>
  );
}

// ─── Inline select (icon/color/gradient) ───────────────────────────
function InlineSelect({
  value, options, onChange, renderOption,
}: {
  value: string; options: readonly string[];
  onChange: (v: string) => void;
  renderOption?: (v: string) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-700 text-xs hover:border-amber-400 transition"
        title="Schimbă"
      >
        {renderOption ? renderOption(value) : value}
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 top-full left-0 mt-1 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.08] rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-[120px]">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 transition flex items-center gap-2 ${opt === value ? "bg-amber-50 dark:bg-amber-900/20 font-medium" : ""}`}
              >
                {renderOption ? renderOption(opt) : opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Block type config ─────────────────────────────────────────────
const BLOCK_TYPES = [
  { type: "heading" as const, label: "Titlu", icon: Type },
  { type: "paragraph" as const, label: "Paragraf", icon: AlignLeft },
  { type: "quote" as const, label: "Citat", icon: Quote },
  { type: "image" as const, label: "Imagine", icon: ImageIcon },
  { type: "stats" as const, label: "Statistici", icon: BarChart3 },
  { type: "cards" as const, label: "Carduri", icon: LayoutGrid },
  { type: "team" as const, label: "Echipă", icon: UserCircle },
];

function defaultBlock(type: PageBlock["type"]): PageBlock {
  switch (type) {
    case "heading": return { type: "heading", text: "", icon: "star" };
    case "paragraph": return { type: "paragraph", text: "" };
    case "quote": return { type: "quote", text: "" };
    case "image": return { type: "image", src: "", alt: "" };
    case "stats": return { type: "stats", items: [{ icon: "users", value: "", label: "" }] };
    case "cards": return { type: "cards", columns: 2, items: [{ icon: "star", color: "primary", title: "", text: "" }] };
    case "team": return { type: "team", items: [{ initials: "AB", name: "", role: "", gradient: GRADIENT_OPTIONS[0] }] };
  }
}

// ─── Block renderers with inline editing ───────────────────────────

function HeadingEdit({ block, onChange }: { block: HeadingBlock; onChange: (b: HeadingBlock) => void }) {
  return (
    <div className="mb-4 flex items-center gap-3 group">
      <InlineSelect
        value={block.icon || "star"}
        options={ICON_NAMES}
        onChange={(v) => onChange({ ...block, icon: v as IconName })}
        renderOption={(v) => (
          <span className="flex items-center gap-1">
            <LucideIcon name={v} size={14} className="text-amber-500" />
          </span>
        )}
      />
      <Editable
        value={block.text}
        onChange={(v) => onChange({ ...block, text: v })}
        className="text-xl font-bold text-slate-900 dark:text-white flex-1"
        placeholder="Titlu secțiune..."
      />
    </div>
  );
}

function ParagraphEdit({ block, onChange }: { block: ParagraphBlock; onChange: (b: ParagraphBlock) => void }) {
  return (
    <div className="mb-3">
      <Editable
        value={block.text}
        onChange={(v) => onChange({ ...block, text: v })}
        className="text-slate-600 dark:text-slate-400 leading-relaxed w-full"
        placeholder="Scrie paragraful aici..."
        multiline
        tag="div"
      />
    </div>
  );
}

function QuoteEdit({ block, onChange }: { block: QuoteBlock; onChange: (b: QuoteBlock) => void }) {
  return (
    <div className="p-5 bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/20 mb-6">
      <Editable
        value={block.text}
        onChange={(v) => onChange({ ...block, text: v })}
        className="text-slate-700 dark:text-slate-300 text-lg italic w-full"
        placeholder="Citat..."
        multiline
        tag="div"
      />
    </div>
  );
}

function ImageEdit({ block, onChange }: { block: ImageBlock; onChange: (b: ImageBlock) => void }) {
  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.06]">
      {block.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.src} alt={block.alt} className="w-full" />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 dark:bg-[var(--color-dark-elevated)] text-slate-400">
          <ImageIcon size={48} className="mb-2 opacity-30" />
          <p className="text-sm">Click pe URL pentru a adăuga imagine</p>
        </div>
      )}
      <div className="p-3 space-y-2 bg-slate-50 dark:bg-[var(--color-dark-elevated)]/50 border-t border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-10 shrink-0">URL</span>
          <Editable
            value={block.src}
            onChange={(v) => onChange({ ...block, src: v })}
            className="text-xs text-slate-600 dark:text-slate-300 flex-1"
            placeholder="https://..."
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-10 shrink-0">Alt</span>
          <Editable
            value={block.alt}
            onChange={(v) => onChange({ ...block, alt: v })}
            className="text-xs text-slate-600 dark:text-slate-300 flex-1"
            placeholder="Descriere imagine"
          />
        </div>
        {block.caption !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-10 shrink-0">Text</span>
            <Editable
              value={block.caption}
              onChange={(v) => onChange({ ...block, caption: v })}
              className="text-xs text-slate-600 dark:text-slate-300 flex-1"
              placeholder="Caption (opțional)"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StatsEdit({ block, onChange }: { block: StatsBlock; onChange: (b: StatsBlock) => void }) {
  const updateItem = (i: number, field: string, val: string) => {
    const items = [...block.items];
    items[i] = { ...items[i], [field]: val };
    onChange({ ...block, items });
  };
  const addItem = () => onChange({ ...block, items: [...block.items, { icon: "star", value: "", label: "" }] });
  const removeItem = (i: number) => onChange({ ...block, items: block.items.filter((_, j) => j !== i) });

  return (
    <div className="mb-10">
      <div className="grid grid-cols-3 gap-4">
        {block.items.map((item, i) => (
          <div key={i} className="text-center p-5 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl relative group">
            {/* Remove button */}
            <button
              onClick={() => removeItem(i)}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 opacity-0 group-hover:opacity-100 transition"
              title="Șterge"
            >
              <Trash2 size={12} />
            </button>
            {/* Icon */}
            <div className="flex justify-center mb-2">
              <InlineSelect
                value={item.icon}
                options={ICON_NAMES}
                onChange={(v) => updateItem(i, "icon", v)}
                renderOption={(v) => <LucideIcon name={v} size={24} className="text-amber-500" />}
              />
            </div>
            {/* Value */}
            <Editable
              value={item.value}
              onChange={(v) => updateItem(i, "value", v)}
              className="text-3xl font-extrabold text-slate-900 dark:text-white"
              placeholder="1000+"
            />
            {/* Label */}
            <Editable
              value={item.label}
              onChange={(v) => updateItem(i, "label", v)}
              className="text-sm text-slate-600 dark:text-slate-400"
              placeholder="Descriere"
            />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-3 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition mx-auto">
        <Plus size={12} /> Adaugă stat
      </button>
    </div>
  );
}

function CardsEdit({ block, onChange }: { block: CardsBlock; onChange: (b: CardsBlock) => void }) {
  const updateItem = (i: number, field: string, val: string) => {
    const items = [...block.items];
    items[i] = { ...items[i], [field]: val };
    onChange({ ...block, items });
  };
  const addItem = () => onChange({ ...block, items: [...block.items, { icon: "star", color: "primary", title: "", text: "" }] });
  const removeItem = (i: number) => onChange({ ...block, items: block.items.filter((_, j) => j !== i) });
  const cols = block.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className="mb-10">
      {/* Columns selector */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-400">Coloane:</span>
        <InlineSelect
          value={String(block.columns)}
          options={["2", "3"]}
          onChange={(v) => onChange({ ...block, columns: parseInt(v) })}
        />
      </div>
      <div className={`grid grid-cols-1 ${cols} gap-4`}>
        {block.items.map((item, i) => (
          <div key={i} className="p-5 border border-slate-200 dark:border-white/[0.06] rounded-xl relative group">
            {/* Remove */}
            <button
              onClick={() => removeItem(i)}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 opacity-0 group-hover:opacity-100 transition"
              title="Șterge"
            >
              <Trash2 size={12} />
            </button>
            {/* Icon + Color */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-12 h-12 rounded-xl ${colorBg[item.color] || colorBg.primary} flex items-center justify-center`}>
                <InlineSelect
                  value={item.icon}
                  options={ICON_NAMES}
                  onChange={(v) => updateItem(i, "icon", v)}
                  renderOption={(v) => <LucideIcon name={v} size={24} className={colorText[item.color] || colorText.primary} />}
                />
              </div>
              <InlineSelect
                value={item.color}
                options={COLOR_OPTIONS}
                onChange={(v) => updateItem(i, "color", v)}
                renderOption={(v) => (
                  <span className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-full ${colorBg[v] || "bg-slate-200"}`} />
                    <span className="capitalize">{v}</span>
                  </span>
                )}
              />
            </div>
            {/* Title */}
            <Editable
              value={item.title}
              onChange={(v) => updateItem(i, "title", v)}
              className="font-bold text-slate-900 dark:text-white mb-2"
              placeholder="Titlu card"
            />
            {/* Text */}
            <Editable
              value={item.text}
              onChange={(v) => updateItem(i, "text", v)}
              className="text-sm text-slate-600 dark:text-slate-400"
              placeholder="Descriere card..."
              multiline
              tag="div"
            />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-3 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition mx-auto">
        <Plus size={12} /> Adaugă card
      </button>
    </div>
  );
}

function TeamEdit({ block, onChange }: { block: TeamBlock; onChange: (b: TeamBlock) => void }) {
  const updateItem = (i: number, field: string, val: string) => {
    const items = [...block.items];
    items[i] = { ...items[i], [field]: val };
    onChange({ ...block, items });
  };
  const addItem = () => onChange({ ...block, items: [...block.items, { initials: "AB", name: "", role: "", gradient: GRADIENT_OPTIONS[0] }] });
  const removeItem = (i: number) => onChange({ ...block, items: block.items.filter((_, j) => j !== i) });

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {block.items.map((item, i) => (
          <div key={i} className="text-center p-5 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl relative group">
            {/* Remove */}
            <button
              onClick={() => removeItem(i)}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 opacity-0 group-hover:opacity-100 transition"
              title="Șterge"
            >
              <Trash2 size={12} />
            </button>
            {/* Avatar */}
            <div className="flex justify-center mb-3">
              <InlineSelect
                value={item.gradient}
                options={GRADIENT_OPTIONS}
                onChange={(v) => updateItem(i, "gradient", v)}
                renderOption={(v) => (
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${v} flex items-center justify-center text-white font-bold text-xl`}>
                    <Editable
                      value={item.initials}
                      onChange={(val) => updateItem(i, "initials", val)}
                      className="!text-white font-bold text-xl bg-transparent text-center w-full"
                      placeholder="VI"
                    />
                  </div>
                )}
              />
            </div>
            {/* Name */}
            <Editable
              value={item.name}
              onChange={(v) => updateItem(i, "name", v)}
              className="font-bold text-slate-900 dark:text-white"
              placeholder="Nume complet"
            />
            {/* Role */}
            <Editable
              value={item.role}
              onChange={(v) => updateItem(i, "role", v)}
              className="text-sm text-slate-600 dark:text-slate-400"
              placeholder="Rol"
            />
          </div>
        ))}
      </div>
      <button onClick={addItem} className="mt-3 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition mx-auto">
        <Plus size={12} /> Adaugă membru
      </button>
    </div>
  );
}

// ─── Block wrapper with controls ───────────────────────────────────
function BlockWrapper({
  children, index, total, onMoveUp, onMoveDown, onRemove, blockType,
}: {
  children: React.ReactNode; index: number; total: number;
  onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void;
  blockType: string;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = BLOCK_TYPES.find((b) => b.type === blockType);
  const IconComp = cfg?.icon || Type;

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Floating controls */}
      {hovered && (
        <div className="absolute -left-12 top-2 flex flex-col gap-1 z-10">
          <div className="flex items-center bg-white dark:bg-slate-700 rounded-lg shadow-md border border-slate-200 dark:border-white/[0.08] overflow-hidden">
            <div className="px-1.5 py-1 border-r border-slate-200 dark:border-white/[0.08] flex items-center justify-center" title={cfg?.label}>
              <IconComp size={12} className="text-amber-500" />
            </div>
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition"
              title="Mută sus"
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-30 transition"
              title="Mută jos"
            >
              <ChevronDown size={14} />
            </button>
            <button
              onClick={onRemove}
              className="p-1 text-red-400 hover:text-red-600 transition"
              title="Șterge bloc"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
      {/* Dashed outline on hover */}
      <div className={`${hovered ? "ring-2 ring-amber-300/50 ring-offset-2 rounded-xl" : ""} transition-all`}>
        {children}
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────
interface BlockEditorProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const updateBlock = (idx: number, block: PageBlock) => {
    const next = [...blocks];
    next[idx] = block;
    onChange(next);
  };

  const addBlock = (type: PageBlock["type"]) => {
    const newBlock = defaultBlock(type);
    onChange([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const removeBlock = (idx: number) => {
    onChange(blocks.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...blocks];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === blocks.length - 1) return;
    const next = [...blocks];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div className="pl-14">
      {blocks.map((block, i) => (
        <BlockWrapper
          key={i}
          index={i}
          total={blocks.length}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
          onRemove={() => removeBlock(i)}
          blockType={block.type}
        >
          {block.type === "heading" && <HeadingEdit block={block} onChange={(b) => updateBlock(i, b)} />}
          {block.type === "paragraph" && <ParagraphEdit block={block} onChange={(b) => updateBlock(i, b)} />}
          {block.type === "quote" && <QuoteEdit block={block} onChange={(b) => updateBlock(i, b)} />}
          {block.type === "image" && <ImageEdit block={block} onChange={(b) => updateBlock(i, b)} />}
          {block.type === "stats" && <StatsEdit block={block} onChange={(b) => updateBlock(i, b)} />}
          {block.type === "cards" && <CardsEdit block={block} onChange={(b) => updateBlock(i, b)} />}
          {block.type === "team" && <TeamEdit block={block} onChange={(b) => updateBlock(i, b)} />}
        </BlockWrapper>
      ))}

      {/* Add block */}
      <div className="relative mt-4">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/[0.08] text-sm text-slate-400 hover:text-amber-600 hover:border-amber-400 transition"
        >
          <Plus size={16} /> Adaugă bloc nou
        </button>
        {showAddMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-xl shadow-lg z-20 overflow-hidden">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                >
                  <bt.icon size={16} className="text-slate-400" />
                  {bt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
