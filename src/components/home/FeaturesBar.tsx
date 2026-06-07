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
    icon: <Truck size={20} strokeWidth={1.6} />,
    titleKey: "features.transportFree",
    descriptionKey: "features.transportFreeDesc",
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={1.6} />,
    titleKey: "features.warranty",
    descriptionKey: "features.warrantyDesc",
  },
  {
    icon: <Zap size={20} strokeWidth={1.6} />,
    titleKey: "features.fastDelivery",
    descriptionKey: "features.fastDeliveryDesc",
  },
  {
    icon: <Headphones size={20} strokeWidth={1.6} />,
    titleKey: "features.supportSchedule",
    descriptionKey: "features.supportScheduleDesc",
  },
];

export default function FeaturesBar() {
  const { t } = useLanguage();

  return (
    <section className="py-10">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.titleKey}
              className="group relative p-4 sm:p-5 rounded-2xl bg-[var(--color-light-surface)] dark:bg-white/[0.03] border border-[var(--color-light-border)] dark:border-white/[0.06] shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-md hover:shadow-black/[0.04] dark:hover:shadow-lg dark:hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/15 dark:hover:border-primary/30"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/6 dark:bg-primary/12 flex items-center justify-center text-primary mb-3 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--color-light-text)] dark:text-white mb-1">
                {t(feature.titleKey)}
              </h3>
              <p className="text-[11px] sm:text-xs text-[var(--color-light-muted)] dark:text-slate-400 leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
