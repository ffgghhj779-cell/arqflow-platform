"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, CheckCircle2, ShoppingBag, Stethoscope, UtensilsCrossed, Building2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function LiveActivityToast() {
  const { lang } = useLang();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const activities = [
    {
      icon: UtensilsCrossed,
      iconColor: "text-amber-400 bg-amber-500/10",
      ar: "مطعم في التجمع الخامس استقبل أوردر بـ ٤٨٠ ج.م",
      en: "Restaurant in New Cairo received an order (480 EGP)",
      timeAr: "منذ دقيقة",
      timeEn: "1m ago",
    },
    {
      icon: Stethoscope,
      iconColor: "text-emerald-400 bg-emerald-500/10",
      ar: "عيادة في المعادي حجزت موعد كشف جديد",
      en: "Clinic in Maadi booked a new appointment",
      timeAr: "منذ دقيقتين",
      timeEn: "2m ago",
    },
    {
      icon: ShoppingBag,
      iconColor: "text-sky-400 bg-sky-500/10",
      ar: "متجر أزياء أونلاين أكد شحنة للإسكندرية",
      en: "Online fashion store confirmed an Alex delivery",
      timeAr: "منذ ٤ دقائق",
      timeEn: "4m ago",
    },
    {
      icon: Building2,
      iconColor: "text-teal-400 bg-teal-500/10",
      ar: "شركة عقارية سجلت بيانات عميل مهتم بزايد",
      en: "Real estate agency captured a Zayed lead",
      timeAr: "منذ ٦ دقائق",
      timeEn: "6m ago",
    },
  ];

  useEffect(() => {
    if (dismissed) return;

    // Initial show after 6 seconds
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 6000);

    // Rotate every 24 seconds
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % activities.length);
        setVisible(true);
      }, 800);
    }, 24000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed, activities.length]);

  if (dismissed) return null;

  const current = activities[index];
  const IconComponent = current.icon;

  return (
    <div className="fixed bottom-24 start-4 sm:start-6 z-40 pointer-events-none select-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="pointer-events-auto glass-strong border border-slate-700/50 dark:border-white/10 rounded-2xl p-3 shadow-xl flex items-center gap-3 max-w-[320px] sm:max-w-xs"
          >
            {/* Icon */}
            <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${current.iconColor}`}>
              <IconComponent className="w-4 h-4" />
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-app leading-snug line-clamp-2">
                {lang === "ar" ? current.ar : current.en}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-muted">
                  {lang === "ar" ? current.timeAr : current.timeEn}
                </span>
              </div>
            </div>

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="btn-ghost !p-1 text-muted hover:text-app shrink-0 -mt-2 -me-1"
              aria-label="Dismiss activity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default LiveActivityToast;
