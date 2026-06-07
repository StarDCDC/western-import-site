"use client";

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
  ImageIcon,
} from "lucide-react";
import type { PageBlock, IconName } from "@/lib/blocks";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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

function Icon({ name, size = 20, className }: { name?: string; size?: number; className?: string }) {
  const Comp = name ? iconMap[name] : Star;
  if (!Comp) return null;
  return <Comp size={size} className={className} />;
}

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400" },
  green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400" },
  purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400" },
  amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400" },
  red: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
  primary: { bg: "bg-primary/10", text: "text-primary" },
};

function colorBg500(color: string): string {
  const map: Record<string, string> = {
    blue: "bg-blue-500/10",
    green: "bg-green-500/10",
    purple: "bg-purple-500/10",
    amber: "bg-amber-500/10",
    red: "bg-red-500/10",
    primary: "bg-primary/10",
  };
  return map[color] || map.primary;
}

function colorText500(color: string): string {
  const map: Record<string, string> = {
    blue: "text-blue-500",
    green: "text-green-500",
    purple: "text-purple-500",
    amber: "text-amber-500",
    red: "text-red-500",
    primary: "text-primary",
  };
  return map[color] || map.primary;
}

function HeadingBlock({ block }: { block: Extract<PageBlock, { type: "heading" }> }) {
  return (
    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
      {block.icon && <Icon name={block.icon} size={20} className="text-primary" />}
      {block.text}
    </h2>
  );
}

function ParagraphBlock({ block }: { block: Extract<PageBlock, { type: "paragraph" }> }) {
  return <p className="text-slate-600 dark:text-slate-400 mb-3">{block.text}</p>;
}

function QuoteBlock({ block }: { block: Extract<PageBlock, { type: "quote" }> }) {
  return (
    <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 mb-6">
      <p className="text-slate-700 dark:text-slate-300 text-lg italic">{block.text}</p>
    </div>
  );
}

function ImageBlockComp({ block }: { block: Extract<PageBlock, { type: "image" }> }) {
  return (
    <div className="mb-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={block.src} alt={block.alt} className="rounded-xl w-full" />
      {block.caption && (
        <p className="text-sm text-slate-500 mt-2 text-center">{block.caption}</p>
      )}
    </div>
  );
}

function StatsBlockComp({ block }: { block: Extract<PageBlock, { type: "stats" }> }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-10">
      {block.items.map((item, i) => (
        <div key={i} className="text-center p-5 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl">
          <Icon name={item.icon} size={28} className="text-primary mx-auto mb-2" />
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{item.value}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

function CardsBlockComp({ block }: { block: Extract<PageBlock, { type: "cards" }> }) {
  const cols = block.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className="mb-10">
      {block.title && (
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{block.title}</h2>
      )}
      <div className={`grid grid-cols-1 ${cols} gap-4`}>
        {block.items.map((item, i) => (
          <div key={i} className="p-5 border border-slate-200 dark:border-white/[0.06] rounded-xl">
            <div
              className={`w-12 h-12 rounded-xl ${colorBg500(item.color)} flex items-center justify-center mb-3`}
            >
              <Icon name={item.icon} size={24} className={colorText500(item.color)} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamBlockComp({ block }: { block: Extract<PageBlock, { type: "team" }> }) {
  return (
    <div className="mb-4">
      {block.title && (
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          {block.title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {block.items.map((item, i) => (
          <div key={i} className="text-center p-5 bg-slate-50 dark:bg-[var(--color-dark-elevated)] rounded-xl">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl`}
            >
              {item.initials}
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">{item.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{item.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return <HeadingBlock key={i} block={block} />;
          case "paragraph":
            return <ParagraphBlock key={i} block={block} />;
          case "quote":
            return <QuoteBlock key={i} block={block} />;
          case "image":
            return <ImageBlockComp key={i} block={block} />;
          case "stats":
            return <StatsBlockComp key={i} block={block} />;
          case "cards":
            return <CardsBlockComp key={i} block={block} />;
          case "team":
            return <TeamBlockComp key={i} block={block} />;
          default:
            return null;
        }
      })}
    </>
  );
}
