"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  condition: string;
  slug: string;
}

const MOCK_WISHLIST: WishlistItem[] = [
  {
    id: "1",
    name: "Lenovo ThinkPad T480",
    price: 4500,
    oldPrice: 5200,
    image: "",
    condition: "Refurbished",
    slug: "lenovo-thinkpad-t480",
  },
  {
    id: "2",
    name: "Samsung Galaxy A54 128GB",
    price: 3800,
    image: "",
    condition: "Nou",
    slug: "samsung-galaxy-a54",
  },
  {
    id: "3",
    name: "Dell UltraSharp U2722D 27\"",
    price: 6200,
    oldPrice: 7100,
    image: "",
    condition: "Nou",
    slug: "dell-ultrasharp-u2722d",
  },
];

export default function FavoritesPage() {
  const [items, setItems] = useState<WishlistItem[]>(MOCK_WISHLIST);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Favorite" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Produse favorite
                </h1>
                <div className="w-16 h-1 bg-primary rounded-full" />
              </div>
              {items.length > 0 && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {items.length} {items.length === 1 ? "produs" : "produse"}
                </span>
              )}
            </div>

            {items.length === 0 ? (
              <div className="text-center py-16">
                <Heart size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Nu ai produse favorite
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Explorează catalogul nostru și adaugă produsele care îți plac apăsând pe{" "}
                  <Heart size={14} className="inline text-primary" />.
                </p>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Package size={18} /> Explorează catalogul
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/30 transition-colors"
                  >
                    {/* Image placeholder */}
                    <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Package size={28} className="text-slate-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.id}`}
                        className="font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.condition}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-primary">
                          {item.price.toLocaleString()} MDL
                        </span>
                        {item.oldPrice && (
                          <span className="text-sm text-slate-400 line-through">
                            {item.oldPrice.toLocaleString()} MDL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                        <ShoppingCart size={16} /> Adaugă în coș
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Elimină din favorite"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setItems([])}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Golește lista
                  </button>
                  <Link
                    href="/catalog"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Continuă cumpărăturile →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
