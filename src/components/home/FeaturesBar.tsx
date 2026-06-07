// src/components/home/FeaturesBar.tsx
'use client';

import { Truck, ShieldCheck, Zap, Headphones } from "lucide-react";
import { useLanguage } from "@/components/ui/LanguageProvider";

interface Feature {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const FEATURES: Feature[] = [
  {
    icon: <Truck size={24} />,
    titleKey: "features.transportFree",
    descriptionKey: "features.transportFreeDesc",
  },
  {
    icon: <ShieldCheck size={24} />,
    titleKey: "features.warranty",
    descriptionKey: "features.warrantyDesc",
  },
  {
    icon: <Zap size={24} />,
    titleKey: "features.fastDelivery",
    descriptionKey: "features.fastDeliveryDesc",
  },
  {
    icon: <Headphones size={24} />,
    titleKey: "features.supportSchedule",
    descriptionKey: "features.supportScheduleDesc",
  },
];

export default function FeaturesBar() {
  const { t } = useLanguage();

  return (
    <section className="py-8 border-t border-slate-200 dark:border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-5">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.titleKey}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[var(--color-dark-elevated)] border border-slate-200 dark:border-white/[0.06] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 active:shadow-md active:-translate-y-0.5 active:bg-blue-50 dark:active:bg-blue-900/20 active:border-blue-300 dark:active:border-blue-700"
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-primary">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t(feature.descriptionKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
