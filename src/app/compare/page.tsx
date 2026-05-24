"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { X, Package, GitCompare } from "lucide-react";

interface CompareProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  condition: string;
  specs: {
    "Procesor": string;
    "RAM": string;
    "Stocare": string;
    "Ecran": string;
    "Baterie": string;
    "Sistem de operare": string;
    "Garanție": string;
  };
}

const MOCK_PRODUCTS: CompareProduct[] = [
  {
    id: "1",
    name: "Lenovo ThinkPad T480",
    price: 4500,
    image: "",
    condition: "Refurbished",
    specs: {
      "Procesor": "Intel Core i5-8350U",
      "RAM": "8 GB DDR4",
      "Stocare": "256 GB SSD",
      "Ecran": '14" Full HD IPS',
      "Baterie": "6 celule, ~6h",
      "Sistem de operare": "Windows 11 Pro",
      "Garanție": "6 luni",
    },
  },
  {
    id: "2",
    name: "HP EliteBook 840 G5",
    price: 4200,
    image: "",
    condition: "Refurbished",
    specs: {
      "Procesor": "Intel Core i5-8250U",
      "RAM": "8 GB DDR4",
      "Stocare": "256 GB SSD",
      "Ecran": '14" Full HD IPS',
      "Baterie": "3 celule, ~5h",
      "Sistem de operare": "Windows 11 Pro",
      "Garanție": "6 luni",
    },
  },
  {
    id: "3",
    name: "Dell Latitude 5590",
    price: 4800,
    image: "",
    condition: "Refurbished",
    specs: {
      "Procesor": "Intel Core i5-8350U",
      "RAM": "8 GB DDR4",
      "Stocare": "512 GB SSD",
      "Ecran": '15.6" Full HD',
      "Baterie": "6 celule, ~7h",
      "Sistem de operare": "Windows 11 Pro",
      "Garanție": "6 luni",
    },
  },
];

export default function ComparePage() {
  const [products, setProducts] = useState<CompareProduct[]>(MOCK_PRODUCTS);

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const specKeys = products.length > 0 ? Object.keys(products[0].specs) : [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Comparare" }]} />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Comparare produse
                </h1>
                <div className="w-16 h-1 bg-primary rounded-full" />
              </div>
              {products.length > 0 && (
                <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <GitCompare size={14} /> {products.length}/4 produse
                </span>
              )}
            </div>

            {products.length === 0 ? (
              <div className="text-center py-16">
                <GitCompare size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Niciun produs de comparat
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Adaugă produse din catalog folosind butonul de comparare.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-3 px-4 w-40 text-slate-500 dark:text-slate-400 font-medium text-sm">
                        Caracteristică
                      </th>
                      {products.map((product) => (
                        <th key={product.id} className="py-3 px-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 mx-auto">
                              <Package size={28} className="text-slate-400" />
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {product.name}
                            </span>
                            <span className="text-primary font-extrabold text-lg">
                              {product.price.toLocaleString()} MDL
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                              {product.condition}
                            </span>
                            <button
                              onClick={() => removeProduct(product.id)}
                              className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
                            >
                              <X size={12} /> Elimină
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specKeys.map((key, i) => (
                      <tr
                        key={key}
                        className={
                          i % 2 === 0
                            ? "bg-slate-50 dark:bg-slate-800/50"
                            : "bg-white dark:bg-slate-900"
                        }
                      >
                        <td className="py-3 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {key}
                        </td>
                        {products.map((product) => (
                          <td
                            key={product.id}
                            className="py-3 px-4 text-sm text-center text-slate-600 dark:text-slate-400"
                          >
                            {product.specs[key as keyof typeof product.specs]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
