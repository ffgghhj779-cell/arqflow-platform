"use client";

import { useLang, useT } from "@/lib/i18n";
import { MessageCircle, Globe, Settings, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { SUPPORT_WHATSAPP } from "@/lib/plans";

interface Props {
  whatsapp?: string;
}

export default function MaintenanceClient({ whatsapp }: Props) {
  const { lang, setLang, dir } = useLang();
  const t = useT({
    ar: {
      title: "صيانة مجدولة حالياً",
      subtitle: "نقوم بتحسين خدماتنا لنقدم لكم تجربة أفضل. سنعود للعمل قريباً جداً!",
      contactText: "هل تحتاج لمساعدة عاجلة؟",
      whatsappBtn: "تواصل معنا عبر الواتساب",
      langBtn: "English",
      meta: "وضع الصيانة — ArqFlow",
    },
    en: {
      title: "Under Scheduled Maintenance",
      subtitle: "We are upgrading our systems to bring you a better experience. We'll be back online very shortly!",
      contactText: "Need urgent support?",
      whatsappBtn: "Chat with us on WhatsApp",
      langBtn: "عربي",
      meta: "Maintenance Mode — ArqFlow",
    },
  });

  const whatsappNumber = whatsapp || SUPPORT_WHATSAPP || "201012345678";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Header Actions */}
      <div className="absolute top-6 right-6 left-6 flex justify-between items-center z-10">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 font-extrabold text-lg select-none">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-brand-sky flex items-center justify-center text-white shrink-0">
            <MessageCircle className="w-5 h-5" aria-hidden />
          </span>
          <span className="gradient-text font-display">ArqFlow</span>
        </div>

        {/* Theme and Language buttons */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="btn-outline !py-2 !px-3 text-xs flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-[1px] shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            aria-label="Switch language"
          >
            <Globe className="w-3.5 h-3.5" aria-hidden />
            <span>{t.langBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-strong p-8 sm:p-12 text-center rounded-2xl max-w-lg w-full relative overflow-hidden flex flex-col items-center justify-center border border-strong"
      >
        {/* Animated Gears Widget */}
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          {/* Main Large Gear */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="text-[var(--accent)]"
          >
            <Settings className="w-16 h-16 stroke-[1.5]" />
          </motion.div>

          {/* Secondary Wrench Icon Overlaid inside the gear */}
          <motion.div
            animate={{ scale: [1, 1.08, 1], rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute text-app"
          >
            <Wrench className="w-6 h-6 stroke-[2]" />
          </motion.div>

          {/* Small Secondary Gear */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute top-1 right-2 text-muted/40"
          >
            <Settings className="w-8 h-8 stroke-[1.5]" />
          </motion.div>
        </div>

        {/* Text Details */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-app mb-4 leading-tight">
          {t.title}
        </h1>
        <p className="text-muted text-sm leading-relaxed mb-8 max-w-sm">
          {t.subtitle}
        </p>

        {/* Divider */}
        <div className="w-full border-t border-app mb-8" />

        {/* Support Section */}
        <div className="space-y-4 w-full">
          <p className="text-xs text-muted font-medium uppercase tracking-wider">
            {t.contactText}
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full !py-3 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
          >
            <MessageCircle className="w-5 h-5 fill-white/10" />
            <span className="font-semibold text-sm">{t.whatsappBtn}</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
