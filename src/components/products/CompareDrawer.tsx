"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ShoppingCart, Trash2, Columns3 } from "lucide-react";
import type { Product } from "@/components/products/ProductCard";

interface CompareDrawerProps {
  maxItems?: number;
}

const SAMPLE_COMPARE: Product[] = [
  {
    id: "1",
    title: "Lenovo ThinkPad P15",
    specs: "i7-10750H, 16GB, 512GB, Quadro T1000, 15.6\"",
    price: 10990,
    oldPrice: 13590,
    badge: { type: "sale" },
    href: "/produs/lenovo-thinkpad-p15",
    image: <div className="w-full h-20 bg-slate-100 dark:bg-slate-700 rounded-lg" />,
  },
  {
    id: "2",
    title: "Dell Latitude 5590",
    specs: "i7-8650U, 16GB, 512GB, 15.6\"",
    price: 6200,
    badge: { type: "refurb" },
    href: "/produs/dell-latitude-5590",
    image: <div className="w-full h-20 bg-slate-100 dark:bg-slate-700 rounded-lg" />,
  },
];

const COMPARE_ATTRIBUTES = [
  { label: "Procesor", key: "cpu" },
  { label: "RAM", key: "ram" },
  { label: "Stocare", key: "storage" },
  { label: "Ecran", key: "screen" },
  { label: "GPU", key: "gpu" },
  { label: "Baterie", key: "battery" },
  { label: "Greutate", key: "weight" },
];

// Placeholder specs for comparison
const SPECS_MAP: Record<string, Record<string, string>> = {
  "1": { cpu: "i7-10750H", ram: "16GB DDR4", storage: "512GB SSD", screen: '15.6" FHD IPS', gpu: "Quadro T1000", battery: "6 celule, ~6h", weight: "2.5 kg" },
  "2": { cpu: "i7-8650U", ram: "16GB DDR4", storage: "512GB SSD", screen: '15.6" FHD', gpu: "Intel UHD 620", battery: "3 celule, ~4h", weight: "2.0 kg" },
};

export default function CompareDrawer({ maxItems = 4 }: CompareDrawerProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Product[]>(SAMPLE_COMPARE);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show the floating bar when there are items to compare
    setVisible(items.length >= 2);
  }, [items]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const bestPrice = items.length > 0 ? Math.min(...items.map((p) => p.price)) : 0;

  return (
    <>
      {/* Floating compare bar */}
      <AnimatePresence>
        {visible && !open && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl px-5 py-3 flex items-center gap-4"
          >
            <div className="flex items-center gap-2">
              {items.slice(0, maxItems).map((item) => (
                <div
                  key={item.id}
                  className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-primary"
                >
                  {item.title.charAt(0)}
                </div>
              ))}
              {items.length < maxItems && (
                <div className="w-10 h-10 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs text-slate-500er">
                  +
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {items.length} produse
            </span>
            <button
              onClick={() => setOpen(true)}
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors hover:bg-primary-dark"
            >
              <Columns3 size={14} /> Compară
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[70]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[80] bg-white dark:bg-slate-900 rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between rounded-t-3xl">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
                  Comparare Produse ({items.length})
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} className="text-slate-500 dark:text-slate-500er" />
                </button>
              </div>

              <div className="p-6">
                {/* Product headers */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}>
                  <div />
                  {items.map((item) => (
                    <div key={item.id} className="text-center relative">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-1 -right-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <X size={12} className="text-slate-500" />
                      </button>
                      <div className="w-full h-24 bg-slate-50 dark:bg-slate-800 rounded-xl mb-2 flex items-center justify-center text-primary font-bold">
                        {item.title.split(" ").slice(0, 2).join(" ")}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        {item.title}
                      </h4>
                      <p
                        className={`text-lg font-extrabold ${
                          item.price === bestPrice
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-primary-dark dark:text-blue-300"
                        }`}
                      >
                        {item.price.toLocaleString("ro-MD")} MDL
                      </p>
                      {item.price === bestPrice && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          ★ Cel mai bun preț
                        </span>
                      )}
                      <button className="mt-2 w-full flex items-center justify-center gap-1.5 bg-primary text-white py-2 rounded-xl text-xs font-semibold hover:bg-primary-dark transition-colors">
                        <ShoppingCart size={13} /> Adaugă în coș
                      </button>
                    </div>
                  ))}
                </div>

                {/* Attribute comparison */}
                <div className="mt-6 space-y-0">
                  {COMPARE_ATTRIBUTES.map((attr, i) => (
                    <div
                      key={attr.key}
                      className={`grid gap-4 py-3 ${
                        i % 2 === 0 ? "bg-slate-50 dark:bg-slate-800/50" : ""
                      } rounded-lg px-3`}
                      style={{ gridTemplateColumns: `180px repeat(${items.length}, 1fr)` }}
                    >
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-500er self-center">
                        {attr.label}
                      </span>
                      {items.map((item) => (
                        <span
                          key={item.id}
                          className="text-sm text-slate-800 dark:text-slate-200 text-center"
                        >
                          {SPECS_MAP[item.id]?.[attr.key] ?? "—"}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
