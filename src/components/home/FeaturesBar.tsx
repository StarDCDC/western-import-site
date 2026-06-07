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
    icon: <Truck size={22} strokeWidth={1.8} />,
    titleKey: "features.transportFree",
    descriptionKey: "features.transportFreeDesc",
  },
  {
    icon: <ShieldCheck size={22} strokeWidth={1.8} />,
    titleKey: "features.warranty",
    descriptionKey: "features.warrantyDesc",
  },
  {
    icon: <Zap size={22} strokeWidth={1.8} />,
    titleKey: "features.fastDelivery",
    descriptionKey: "features.fastDeliveryDesc",
  },
  {
    icon: <Headphones size={22} strokeWidth={1.8} />,
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
              className="group relative p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-primary/20 dark:hover:border-primary/30"
            >
              <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/8 dark:bg-primary/15 flex items-center justify-center text-primary mb-3 transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-white mb-1">
                {t(feature.titleKey)}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
