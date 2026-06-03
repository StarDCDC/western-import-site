"use client";

import { useState } from "react";
import {
  Star,
  Target,
  Heart,
  Shield,
  Award,
  TrendingUp,
  Users,
  Package,
  Clock,
  Zap,
  Globe,
  Truck,
  Headphones,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  AlignLeft,
  Quote,
  ImageIcon,
  BarChart3,
  LayoutGrid,
  UserCircle,
} from "lucide-react";
import type {
  PageBlock,
  IconName,
  ColorOption,
  GradientOption,
  HeadingBlock,
  ParagraphBlock,
  QuoteBlock,
  ImageBlock,
  StatsBlock,
  CardsBlock,
  TeamBlock,
} from "@/lib/blocks";
import {
  ICON_NAMES,
  COLOR_OPTIONS,
  GRADIENT_OPTIONS,
} from "@/lib/blocks";

// ─── Icon component for editor ─────────────────────────────────────

const lucideIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  star: Star,
  target: Target,
  heart: Heart,
  shield: Shield,
  award: Award,
  "trending-up": TrendingUp,
  users: Users,
  package: Package,
  clock: Clock,
  zap: Zap,
  globe: Globe,
  truck: Truck,
  headphones: Headphones,
  "check-circle": CheckCircle,
  "x-circle": XCircle,
};

function LucideIcon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const Comp = lucideIcons[name];
  if (!Comp) return <Star size={size} className={className} />;
  return <Comp size={size} className={className} />;
}

// ─── Block type config ─────────────────────────────────────────────

const BLOCK_TYPES = [
  { type: "heading", label: "Heading", icon: Type },
  { type: "paragraph", label: "Paragraph", icon: AlignLeft },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "stats", label: "Stats", icon: BarChart3 },
  { type: "cards", label: "Cards", icon: LayoutGrid },
  { type: "team", label: "Team", icon: UserCircle },
] as const;

function defaultBlock(type: PageBlock["type"]): PageBlock {
  switch (type) {
    case "heading":
      return { type: "heading", text: "", icon: "star" };
    case "paragraph":
      return { type: "paragraph", text: "" };
    case "quote":
      return { type: "quote", text: "" };
    case "image":
      return { type: "image", src: "", alt: "" };
    case "stats":
      return { type: "stats", items: [{ icon: "users", value: "", label: "" }] };
    case "cards":
      return { type: "cards", columns: 2, items: [{ icon: "star", color: "primary", title: "", text: "" }] };
    case "team":
      return { type: "team", items: [{ initials: "", name: "", role: "", gradient: GRADIENT_OPTIONS[0] }] };
  }
}

function blockLabel(block: PageBlock): string {
  switch (block.type) {
    case "heading":
      return block.text || "Heading";
    case "paragraph":
      return block.text ? block.text.slice(0, 50) : "Paragraph";
    case "quote":
      return block.text ? block.text.slice(0, 50) : "Quote";
    case "image":
      return block.alt || "Image";
    case "stats":
      return `${block.items.length} stat(s)`;
    case "cards":
      return `${block.items.length} card(s)`;
    case "team":
      return `${block.items.length} member(s)`;
  }
}

// ─── Shared form field styles ──────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none";

const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Block-specific editors ────────────────────────────────────────

function HeadingEditor({
  block,
  onChange,
}: {
  block: HeadingBlock;
  onChange: (b: HeadingBlock) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Text</label>
        <input
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          className={inputCls}
          placeholder="Heading text..."
        />
      </div>
      <SelectField
        label="Icon"
        value={block.icon || "star"}
        options={ICON_NAMES.map((n) => ({ value: n, label: n }))}
        onChange={(v) => onChange({ ...block, icon: v as IconName })}
      />
    </div>
  );
}

function ParagraphEditor({
  block,
  onChange,
}: {
  block: ParagraphBlock;
  onChange: (b: ParagraphBlock) => void;
}) {
  return (
    <div>
      <label className={labelCls}>Text</label>
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        rows={6}
        className={inputCls}
        placeholder="Paragraph text..."
      />
    </div>
  );
}

function QuoteEditor({
  block,
  onChange,
}: {
  block: QuoteBlock;
  onChange: (b: QuoteBlock) => void;
}) {
  return (
    <div>
      <label className={labelCls}>Text</label>
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        rows={4}
        className={inputCls}
        placeholder="Quote text..."
      />
    </div>
  );
}

function ImageEditor({
  block,
  onChange,
}: {
  block: ImageBlock;
  onChange: (b: ImageBlock) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>URL</label>
        <input
          value={block.src}
          onChange={(e) => onChange({ ...block, src: e.target.value })}
          className={inputCls}
          placeholder="https://..."
        />
      </div>
      <div>
        <label className={labelCls}>Alt text</label>
        <input
          value={block.alt}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          className={inputCls}
          placeholder="Image description"
        />
      </div>
      <div>
        <label className={labelCls}>Caption (optional)</label>
        <input
          value={block.caption || ""}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          className={inputCls}
          placeholder="Image caption..."
        />
      </div>
      {block.src && (
        <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src} alt={block.alt} className="max-h-48 mx-auto" />
        </div>
      )}
    </div>
  );
}

function StatsEditor({
  block,
  onChange,
}: {
  block: StatsBlock;
  onChange: (b: StatsBlock) => void;
}) {
  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...block.items];
    items[idx] = { ...items[idx], [field]: value };
    onChange({ ...block, items });
  };
  const addItem = () =>
    onChange({ ...block, items: [...block.items, { icon: "star", value: "", label: "" }] });
  const removeItem = (idx: number) => {
    const items = block.items.filter((_, i) => i !== idx);
    onChange({ ...block, items });
  };

  return (
    <div className="space-y-4">
      {block.items.map((item, i) => (
        <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg space-y-2 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">Stat #{i + 1}</span>
            <button
              onClick={() => removeItem(i)}
              className="text-red-400 hover:text-red-600 transition"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <SelectField
            label="Icon"
            value={item.icon}
            options={ICON_NAMES.map((n) => ({ value: n, label: n }))}
            onChange={(v) => updateItem(i, "icon", v)}
          />
          <div>
            <label className={labelCls}>Value</label>
            <input
              value={item.value}
              onChange={(e) => updateItem(i, "value", e.target.value)}
              className={inputCls}
              placeholder="1000+"
            />
          </div>
          <div>
            <label className={labelCls}>Label</label>
            <input
              value={item.label}
              onChange={(e) => updateItem(i, "label", e.target.value)}
              className={inputCls}
              placeholder="Clienți mulțumiți"
            />
          </div>
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition"
      >
        <Plus size={14} /> Add stat
      </button>
    </div>
  );
}

function CardsEditor({
  block,
  onChange,
}: {
  block: CardsBlock;
  onChange: (b: CardsBlock) => void;
}) {
  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...block.items];
    items[idx] = { ...items[idx], [field]: value };
    onChange({ ...block, items });
  };
  const addItem = () =>
    onChange({
      ...block,
      items: [...block.items, { icon: "star", color: "primary", title: "", text: "" }],
    });
  const removeItem = (idx: number) => {
    const items = block.items.filter((_, i) => i !== idx);
    onChange({ ...block, items });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Section title (optional)</label>
        <input
          value={block.title || ""}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          className={inputCls}
          placeholder="Title..."
        />
      </div>
      <SelectField
        label="Columns"
        value={String(block.columns)}
        options={[
          { value: "2", label: "2 columns" },
          { value: "3", label: "3 columns" },
        ]}
        onChange={(v) => onChange({ ...block, columns: parseInt(v) })}
      />
      {block.items.map((item, i) => (
        <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg space-y-2 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">Card #{i + 1}</span>
            <button
              onClick={() => removeItem(i)}
              className="text-red-400 hover:text-red-600 transition"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <SelectField
              label="Icon"
              value={item.icon}
              options={ICON_NAMES.map((n) => ({ value: n, label: n }))}
              onChange={(v) => updateItem(i, "icon", v)}
            />
            <SelectField
              label="Color"
              value={item.color}
              options={COLOR_OPTIONS.map((c) => ({ value: c, label: c }))}
              onChange={(v) => updateItem(i, "color", v)}
            />
          </div>
          <div>
            <label className={labelCls}>Title</label>
            <input
              value={item.title}
              onChange={(e) => updateItem(i, "title", e.target.value)}
              className={inputCls}
              placeholder="Card title"
            />
          </div>
          <div>
            <label className={labelCls}>Text</label>
            <textarea
              value={item.text}
              onChange={(e) => updateItem(i, "text", e.target.value)}
              rows={3}
              className={inputCls}
              placeholder="Card description..."
            />
          </div>
          <div>
            <label className={labelCls}>Image URL (optional)</label>
            <input
              value={item.imageUrl || ""}
              onChange={(e) => updateItem(i, "imageUrl", e.target.value)}
              className={inputCls}
              placeholder="https://..."
            />
          </div>
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition"
      >
        <Plus size={14} /> Add card
      </button>
    </div>
  );
}

function TeamEditor({
  block,
  onChange,
}: {
  block: TeamBlock;
  onChange: (b: TeamBlock) => void;
}) {
  const updateItem = (idx: number, field: string, value: string) => {
    const items = [...block.items];
    items[idx] = { ...items[idx], [field]: value };
    onChange({ ...block, items });
  };
  const addItem = () =>
    onChange({
      ...block,
      items: [...block.items, { initials: "", name: "", role: "", gradient: GRADIENT_OPTIONS[0] }],
    });
  const removeItem = (idx: number) => {
    const items = block.items.filter((_, i) => i !== idx);
    onChange({ ...block, items });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls}>Section title (optional)</label>
        <input
          value={block.title || ""}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          className={inputCls}
          placeholder="Title..."
        />
      </div>
      {block.items.map((item, i) => (
        <div key={i} className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg space-y-2 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-slate-500">Member #{i + 1}</span>
            <button
              onClick={() => removeItem(i)}
              className="text-red-400 hover:text-red-600 transition"
              title="Remove"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={labelCls}>Initials</label>
              <input
                value={item.initials}
                onChange={(e) => updateItem(i, "initials", e.target.value)}
                className={inputCls}
                placeholder="VI"
                maxLength={3}
              />
            </div>
            <SelectField
              label="Gradient"
              value={item.gradient}
              options={GRADIENT_OPTIONS.map((g) => ({ value: g, label: g }))}
              onChange={(v) => updateItem(i, "gradient", v)}
            />
          </div>
          <div>
            <label className={labelCls}>Name</label>
            <input
              value={item.name}
              onChange={(e) => updateItem(i, "name", e.target.value)}
              className={inputCls}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <input
              value={item.role}
              onChange={(e) => updateItem(i, "role", e.target.value)}
              className={inputCls}
              placeholder="Role"
            />
          </div>
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition"
      >
        <Plus size={14} /> Add member
      </button>
    </div>
  );
}

// ─── Block type icon for the sidebar list ──────────────────────────

function BlockTypeIcon({ type }: { type: PageBlock["type"] }) {
  const cfg = BLOCK_TYPES.find((b) => b.type === type);
  if (!cfg) return null;
  const Comp = cfg.icon;
  return <Comp size={16} className="text-slate-400" />;
}

// ─── Main component ────────────────────────────────────────────────

interface BlockEditorProps {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const updateBlock = (idx: number, block: PageBlock) => {
    const next = [...blocks];
    next[idx] = block;
    onChange(next);
  };

  const addBlock = (type: PageBlock["type"]) => {
    const newBlock = defaultBlock(type);
    const next = [...blocks, newBlock];
    onChange(next);
    setSelectedIdx(next.length - 1);
    setShowAddMenu(false);
  };

  const removeBlock = (idx: number) => {
    if (!confirm("Ștergi acest bloc?")) return;
    const next = blocks.filter((_, i) => i !== idx);
    onChange(next);
    if (selectedIdx === idx) setSelectedIdx(null);
    else if (selectedIdx !== null && selectedIdx > idx) setSelectedIdx(selectedIdx - 1);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...blocks];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
    setSelectedIdx(idx - 1);
  };

  const moveDown = (idx: number) => {
    if (idx === blocks.length - 1) return;
    const next = [...blocks];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
    setSelectedIdx(idx + 1);
  };

  const selectedBlock = selectedIdx !== null ? blocks[selectedIdx] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Block list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Blocks ({blocks.length})
          </h3>
        </div>
        {blocks.map((block, i) => (
          <div
            key={i}
            onClick={() => setSelectedIdx(i)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition group border ${
              selectedIdx === i
                ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30"
            }`}
          >
            <BlockTypeIcon type={block.type} />
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300 truncate">
              {blockLabel(block)}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={(e) => { e.stopPropagation(); moveUp(i); }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                disabled={i === 0}
                title="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); moveDown(i); }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                disabled={i === blocks.length - 1}
                title="Move down"
              >
                <ChevronDown size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); removeBlock(i); }}
                className="p-1 text-red-400 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Add block */}
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-500 hover:text-amber-600 hover:border-amber-400 transition"
          >
            <Plus size={14} /> Add block
          </button>
          {showAddMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 overflow-hidden">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
                >
                  <bt.icon size={16} className="text-slate-400" />
                  {bt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block editor */}
      <div className="lg:col-span-2">
        {selectedBlock && selectedIdx !== null ? (
          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
              <BlockTypeIcon type={selectedBlock.type} />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                {selectedBlock.type} block
              </span>
            </div>
            {selectedBlock.type === "heading" && (
              <HeadingEditor
                block={selectedBlock}
                onChange={(b) => updateBlock(selectedIdx, b)}
              />
            )}
            {selectedBlock.type === "paragraph" && (
              <ParagraphEditor
                block={selectedBlock}
                onChange={(b) => updateBlock(selectedIdx, b)}
              />
            )}
            {selectedBlock.type === "quote" && (
              <QuoteEditor
                block={selectedBlock}
                onChange={(b) => updateBlock(selectedIdx, b)}
              />
            )}
            {selectedBlock.type === "image" && (
              <ImageEditor
                block={selectedBlock}
                onChange={(b) => updateBlock(selectedIdx, b)}
              />
            )}
            {selectedBlock.type === "stats" && (
              <StatsEditor
                block={selectedBlock}
                onChange={(b) => updateBlock(selectedIdx, b)}
              />
            )}
            {selectedBlock.type === "cards" && (
              <CardsEditor
                block={selectedBlock}
                onChange={(b) => updateBlock(selectedIdx, b)}
              />
            )}
            {selectedBlock.type === "team" && (
              <TeamEditor
                block={selectedBlock}
                onChange={(b) => updateBlock(selectedIdx, b)}
              />
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            Select a block to edit
          </div>
        )}
      </div>
    </div>
  );
}
