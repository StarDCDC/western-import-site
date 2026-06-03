// ─── Block types for the visual page editor ────────────────────────

export interface HeadingBlock {
  type: "heading";
  text: string;
  icon?: string;
}

export interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

export interface QuoteBlock {
  type: "quote";
  text: string;
}

export interface ImageBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

export interface StatsBlock {
  type: "stats";
  items: Array<{ icon: string; value: string; label: string }>;
}

export interface CardsBlock {
  type: "cards";
  title?: string;
  columns: number;
  items: Array<{
    icon: string;
    color: string;
    title: string;
    text: string;
    imageUrl?: string;
  }>;
}

export interface TeamBlock {
  type: "team";
  title?: string;
  items: Array<{
    initials: string;
    name: string;
    role: string;
    gradient: string;
  }>;
}

export type PageBlock =
  | HeadingBlock
  | ParagraphBlock
  | QuoteBlock
  | ImageBlock
  | StatsBlock
  | CardsBlock
  | TeamBlock;

// ─── Constants ─────────────────────────────────────────────────────

export const ICON_NAMES = [
  "star",
  "target",
  "heart",
  "shield",
  "award",
  "trending-up",
  "users",
  "package",
  "clock",
  "zap",
  "globe",
  "truck",
  "headphones",
  "check-circle",
  "x-circle",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const COLOR_OPTIONS = [
  "blue",
  "green",
  "purple",
  "amber",
  "red",
  "primary",
] as const;

export type ColorOption = (typeof COLOR_OPTIONS)[number];

export const GRADIENT_OPTIONS = [
  "from-primary to-blue-400",
  "from-green-400 to-emerald-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
] as const;

export type GradientOption = (typeof GRADIENT_OPTIONS)[number];

// ─── Helpers ───────────────────────────────────────────────────────

export function parseBlocks(content: string | null): PageBlock[] {
  if (!content) return [];
  const trimmed = content.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fall through
    }
  }
  // Treat as plain text: wrap in paragraph blocks
  return trimmed
    .split("\n\n")
    .filter((p) => p.trim())
    .map((p) => ({ type: "paragraph" as const, text: p.trim() }));
}

export function serializeBlocks(blocks: PageBlock[]): string {
  return JSON.stringify(blocks, null, 2);
}
