"use client";

import { useLang } from "@/lib/i18n";
import {
  UtensilsCrossed, Stethoscope, ShoppingBag, Dumbbell,
  Building2, Hotel, Scissors, GraduationCap, Pill, Sparkles,
} from "lucide-react";

export function IndustryMarquee() {
  const { lang } = useLang();

  const items = [
    { icon: UtensilsCrossed, ar: "مطاعم وكافيهات كبرى", en: "Leading Restaurants & Cafés" },
    { icon: Stethoscope,     ar: "عيادات ومراكز طبية تخصصية", en: "Specialized Medical Clinics" },
    { icon: ShoppingBag,     ar: "متاجر أزياء وتجارة إلكترونية", en: "Fashion & E-Commerce Stores" },
    { icon: Dumbbell,        ar: "أندية رياضية وجيمات", en: "Fitness Centers & Gyms" },
    { icon: Building2,       ar: "شركات عقارية وتسويق", en: "Real Estate & Brokerages" },
    { icon: Hotel,           ar: "فنادق ومنتجعات ساحلية", en: "Hotels & Coastal Resorts" },
    { icon: Scissors,        ar: "صالونات ومراكز تجميل", en: "Salons & Beauty Centers" },
    { icon: GraduationCap,   ar: "أكاديميات ومراكز تدريب", en: "Training Academies & Education" },
    { icon: Pill,            ar: "صيدليات وسلاسل أدوية", en: "Pharmacies & Healthcare" },
  ];

  // Duplicate items for infinite seamless looping
  const marqueeItems = [...items, ...items, ...items];

  return (
    <div className="w-full py-8 border-b border-app overflow-hidden bg-[rgba(var(--accent-rgb),0.02)] relative select-none touch-pan-y">
      {/* Edge gradient masks for seamless fade */}
      <div className="absolute inset-y-0 start-0 w-24 sm:w-40 bg-gradient-to-r rtl:bg-gradient-to-l from-[var(--bg)] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 end-0 w-24 sm:w-40 bg-gradient-to-l rtl:bg-gradient-to-r from-[var(--bg)] to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 mb-3 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-accent" />
          {lang === "ar" ? "موثوق به في أكثر من ٩ مجالات تجارية في السعودية ومصر" : "TRUSTED ACROSS 9+ INDUSTRIES IN SAUDI ARABIA & EGYPT"}
        </p>
      </div>

      {/* Marquee Track */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-3 sm:gap-4 py-2">
        {marqueeItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-app hover:border-[rgba(var(--accent-rgb),0.4)] transition-colors duration-200 shrink-0 shadow-sm"
          >
            <span className="w-7 h-7 rounded-full bg-[rgba(var(--accent-rgb),0.1)] text-accent flex items-center justify-center shrink-0">
              <item.icon className="w-3.5 h-3.5" aria-hidden />
            </span>
            <span className="text-xs sm:text-sm font-semibold text-app whitespace-nowrap">
              {lang === "ar" ? item.ar : item.en}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IndustryMarquee;
