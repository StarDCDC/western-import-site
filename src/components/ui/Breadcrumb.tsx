"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm py-3">
      <Link
        href="/"
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
      >
        <Home size={14} />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-slate-500 dark:text-slate-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-800 dark:text-slate-200 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
