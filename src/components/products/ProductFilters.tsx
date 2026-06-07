"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  X,
  Laptop,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

interface FilterSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  options: { label: string; value: string; count?: number }[];
}

const CATEGORIES_FILTER: FilterSection = {
  id: "category",
  title: "Categorie",
  icon: <Laptop size={14} />,
  options: [
    { label: "Laptopuri", value: "laptopuri", count: 45 },
    { label: "Telefoane", value: "telefoane", count: 32 },
    { label: "Monitoare", value: "monitoare", count: 18 },
    { label: "Tablete", value: "tablete", count: 12 },
    { label: "PC All in One", value: "pc-aio", count: 8 },
    { label: "Componente", value: "componente", count: 25 },
    { label: "Accesorii", value: "accesorii", count: 40 },
  ],
};

const BRANDS_FILTER: FilterSection = {
  id: "brand",
  title: "Brand",
  icon: <Smartphone size={14} />,
  options: [
    { label: "Lenovo", value: "lenovo" },
    { label: "HP", value: "hp" },
    { label: "Dell", value: "dell" },
    { label: "Samsung", value: "samsung" },
    { label: "Apple", value: "apple" },
    { label: "ASUS", value: "asus" },
    { label: "MSI", value: "msi" },
    { label: "Acer", value: "acer" },
    { label: "LG", value: "lg" },
  ],
};

const CONDITION_FILTER: FilterSection = {
  id: "condition",
  title: "Stare",
  icon: <Monitor size={14} />,
  options: [
    { label: "Nou", value: "nou" },
    { label: "Ca nou", value: "ca-nou" },
    { label: "Refurbished", value: "refurbished" },
    { label: "Second Hand", value: "second-hand" },
  ],
};

const SORT_OPTIONS = [
  { label: "Relevanță", value: "relevance" },
  { label: "Preț: mic → mare", value: "price-asc" },
  { label: "Preț: mare → mic", value: "price-desc" },
  { label: "Cele mai noi", value: "newest" },
  { label: "Discount", value: "discount" },
];

interface ProductFiltersProps {
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onSortChange?: (sort: string) => void;
}

export default function ProductFilters({ onFilterChange, onSortChange }: ProductFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    category: [],
    brand: [],
    condition: [],
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [sort, setSort] = useState("relevance");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    brand: true,
    price: true,
    condition: false,
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleFilter = (sectionId: string, value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[sectionId] || [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const updated = { ...prev, [sectionId]: next };
      onFilterChange?.(updated);
      return updated;
    });
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSort = (value: string) => {
    setSort(value);
    onSortChange?.(value);
  };

  const clearAll = () => {
    setSelectedFilters({ category: [], brand: [], condition: [] });
    setPriceRange([0, 30000]);
    setSort("relevance");
  };

  const totalActive =
    Object.values(selectedFilters).flat().length + (priceRange[0] > 0 || priceRange[1] < 30000 ? 1 : 0);

  const renderFilterSection = (section: FilterSection) => {
    const expanded = expandedSections[section.id];
    const selected = selectedFilters[section.id] || [];

    return (
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 mb-4">
        <button
          onClick={() => toggleSection(section.id)}
          className="w-full flex items-center justify-between py-1"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {section.icon} {section.title}
            {selected.length > 0 && (
              <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full font-bold">
                {selected.length}
              </span>
            )}
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-2 max-h-[240px] overflow-y-auto">
                {section.options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-500 dark:text-slate-500er hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(opt.value)}
                      onChange={() => toggleFilter(section.id, opt.value)}
                      className="w-4 h-4 rounded border-slate-200 dark:border-white/[0.06] text-primary focus:ring-primary/30"
                    />
                    <span>{opt.label}</span>
                    {opt.count !== undefined && (
                      <span className="ml-auto text-xs text-slate-500er">({opt.count})</span>
                    )}
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const filtersContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <SlidersHorizontal size={16} /> Filtre
          {totalActive > 0 && (
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{totalActive}</span>
          )}
        </h3>
        {totalActive > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-accent font-medium hover:underline"
          >
            Șterge tot
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mb-4">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 block">
          Sortare
        </label>
        <select
          value={sort}
          onChange={(e) => handleSort(e.target.value)}
          className="w-full border border-slate-200 dark:border-white/[0.06] rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-[var(--color-dark-elevated)] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {renderFilterSection(CATEGORIES_FILTER)}
      {renderFilterSection(BRANDS_FILTER)}

      {/* Price range */}
      <div className="border-b border-slate-200 dark:border-white/[0.06] pb-4 mb-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-1"
        >
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Preț</span>
          {expandedSections.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-3">
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={priceRange[0] || ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                      setPriceRange([v, Math.max(v, priceRange[1])]);
                    }}
                    placeholder="Min"
                    min={0}
                    className="w-full border border-slate-200 dark:border-white/[0.06] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[var(--color-dark-elevated)] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
                  />
                  <span className="text-slate-500er">—</span>
                  <input
                    type="number"
                    value={priceRange[1] || ''}
                    onChange={(e) => {
                      const v = e.target.value === '' ? 30000 : Math.min(30000, Number(e.target.value));
                      setPriceRange([Math.min(priceRange[0], v), v]);
                    }}
                    placeholder="Max"
                    min={0}
                    max={30000}
                    className="w-full border border-slate-200 dark:border-white/[0.06] rounded-lg px-3 py-2 text-sm bg-white dark:bg-[var(--color-dark-elevated)] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={30000}
                  step={500}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-slate-500er">
                  <span>{priceRange[0].toLocaleString()} MDL</span>
                  <span>{priceRange[1].toLocaleString()} MDL</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {renderFilterSection(CONDITION_FILTER)}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[260px] shrink-0">
        <div className="sticky top-24 bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] rounded-2xl p-5">
          {filtersContent}
        </div>
      </aside>

      {/* Mobile: filter button + drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-[var(--color-dark-elevated)]"
        >
          <SlidersHorizontal size={14} /> Filtre
          {totalActive > 0 && (
            <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">{totalActive}</span>
          )}
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[70]"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 bottom-0 w-[300px] bg-bg dark:bg-[var(--color-dark-surface)] z-[80] overflow-y-auto p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Filtre</h3>
                  <button onClick={() => setMobileOpen(false)}>
                    <X size={20} className="text-slate-500 dark:text-slate-500er" />
                  </button>
                </div>
                {filtersContent}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
