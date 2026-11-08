"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle, Globe } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { SUPPORT_WHATSAPP } from "@/lib/plans";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

const NAV = [
  { href: "/", label: { ar: "الرئيسية", en: "Home" } },
  { href: "/features", label: { ar: "المميزات", en: "Features" } },
  { href: "/how-it-works", label: { ar: "كيف يعمل", en: "How it Works" } },
  { href: "/pricing", label: { ar: "الأسعار", en: "Pricing" } },
  { href: "/about", label: { ar: "من نحن", en: "About" } },
  { href: "/faq", label: { ar: "الأسئلة الشائعة", en: "FAQ" } },
  { href: "/contact", label: { ar: "تواصل معنا", en: "Contact" } },
];

function BrandMark() {
  return (
    <>
      <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-brand-sky flex items-center justify-center text-white shrink-0 shadow-sm">
        <MessageCircle className="w-5 h-5" aria-hidden />
      </span>
      <span className="gradient-text font-display font-extrabold text-xl tracking-tight">ArqFlow</span>
    </>
  );
}

export function SiteHeader() {
  const { lang, setLang, pick } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const t = useT({
    ar: { login: "تسجيل الدخول", demo: "احجز ديمو", start: "ابدأ الآن", menu: "القائمة", close: "إغلاق" },
    en: { login: "Login", demo: "Book a Demo", start: "Get Started", menu: "Menu", close: "Close" },
  });

  // Track scroll for header elevation change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // close the drawer whenever navigation happens
  useEffect(() => { setOpen(false); }, [pathname]);

  // lock page scroll while the drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <header className="sticky top-0 z-40">
      <motion.div
        className="glass-strong !rounded-none border-x-0 border-t-0"
        animate={{
          boxShadow: scrolled
            ? "0 4px 24px rgba(13,34,54,0.06)"
            : "0 0 0 rgba(13,34,54,0)",
          borderColor: scrolled
            ? "rgba(var(--accent-rgb), 0.2)"
            : "var(--border)",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto safe-x px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-extrabold text-lg shrink-0" aria-label="ArqFlow">
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="flex items-center gap-2">
              <BrandMark />
            </motion.div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 group",
                    isActive ? "text-app" : "text-muted hover:text-app"
                  )}
                >
                  {pick(item.label)}
                  {/* Animated underline */}
                  <motion.span
                    className="absolute bottom-0.5 start-2.5 end-2.5 h-[2px] rounded-full bg-[var(--accent)]"
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    style={{ transformOrigin: "0% 50%" }}
                  />
                  {/* Hover bg */}
                  <motion.span
                    className="absolute inset-0 rounded-lg bg-[var(--bg-solid)] -z-10"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeSwitcher />
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-muted hover:text-app hover:bg-[var(--bg-solid)] transition-all duration-150"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5" aria-hidden />
              <span>{lang === "ar" ? "English" : "العربية"}</span>
            </button>
            <Link href="/login" className="px-3 py-1.5 rounded-lg text-xs font-bold text-muted hover:text-app transition-colors">
              {t.login}
            </Link>
            <Link
              href="/pricing"
              className="btn-primary !py-2 !px-4 text-xs font-bold shadow-sm shadow-[rgba(var(--accent-rgb),0.2)] rounded-lg"
            >
              {t.start}
            </Link>
          </div>

          {/* Mobile Right Bar */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="btn-ghost !px-2.5 !py-1 text-xs font-bold flex items-center gap-1"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5" aria-hidden />
              <span>{lang === "ar" ? "EN" : "عربي"}</span>
            </button>
            <button
              className="btn-ghost !p-2 -me-1"
              onClick={() => setOpen(!open)}
              aria-label={open ? t.close : t.menu}
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              <AnimatePresence mode="wait">
                {open
                  ? <motion.div key="x" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}><X className="w-5 h-5" aria-hidden /></motion.div>
                  : <motion.div key="m" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}><Menu className="w-5 h-5" aria-hidden /></motion.div>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label={t.close}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 top-16 z-40 bg-[rgba(4,9,17,0.6)] backdrop-blur-sm cursor-default"
            />
            <motion.nav
              id="mobile-nav"
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed inset-x-0 top-16 z-50 glass-strong !rounded-none !rounded-b-2xl border-x-0 border-t-0 px-4 pt-3 pb-5 safe-x safe-b flex flex-col gap-1 max-h-[calc(100dvh-4rem)] overflow-y-auto"
            >
              {NAV.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center min-h-12 px-4 rounded-xl text-base font-medium transition-colors",
                      pathname === item.href
                        ? "text-accent bg-[rgba(var(--accent-rgb),0.08)] border border-[rgba(var(--accent-rgb),0.2)]"
                        : "text-muted hover:text-app active:bg-[var(--bg-solid)]"
                    )}
                  >
                    {pick(item.label)}
                  </Link>
                </motion.div>
              ))}
              <div className="section-divider my-3" />
              <div className="flex items-center gap-2.5">
                <div className="flex bg-[var(--bg-solid)] rounded-lg p-1">
                  <ThemeSwitcher />
                </div>
                <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="btn-outline !py-3 flex-1 text-sm">
                  <Globe className="w-4 h-4" aria-hidden />
                  {lang === "ar" ? "English" : "عربي"}
                </button>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline !py-3 flex-1 text-sm">{t.login}</Link>
              </div>
              <Link href="/pricing" onClick={() => setOpen(false)} className="btn-primary !py-3.5 mt-2.5">{t.start}</Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

export function SiteFooter() {
  const { pick } = useLang();
  const t = useT({
    ar: {
      tagline: "وكلاء ذكاء اصطناعي يردّوا على عملاءك على الواتساب — ٢٤ ساعة، بالعربي والإنجليزي.",
      product: "المنتج",
      company: "الشركة",
      legal: "قانوني",
      rights: "جميع الحقوق محفوظة",
      whatsapp: "كلمنا واتساب",
    },
    en: {
      tagline: "AI agents that answer your customers on WhatsApp — 24/7, in Arabic & English.",
      product: "Product",
      company: "Company",
      legal: "Legal",
      rights: "All rights reserved",
      whatsapp: "WhatsApp us",
    },
  });

  const cols = [
    {
      title: t.product,
      links: [
        { href: "/features", label: { ar: "المميزات", en: "Features" } },
        { href: "/how-it-works", label: { ar: "كيف يعمل", en: "How it Works" } },
        { href: "/pricing", label: { ar: "الأسعار", en: "Pricing" } },
        { href: "/why-arqflow", label: { ar: "ليه ArqFlow", en: "Why ArqFlow" } },
      ],
    },
    {
      title: t.company,
      links: [
        { href: "/about", label: { ar: "من نحن", en: "About" } },
        { href: "/testimonials", label: { ar: "آراء العملاء", en: "Testimonials" } },
        { href: "/contact", label: { ar: "تواصل معنا", en: "Contact" } },
        { href: "/onboarding?plan=free_trial", label: { ar: "احجز ديمو", en: "Book a Demo" } },
      ],
    },
    {
      title: t.legal,
      links: [
        { href: "/privacy", label: { ar: "سياسة الخصوصية", en: "Privacy Policy" } },
        { href: "/terms", label: { ar: "الشروط والأحكام", en: "Terms" } },
      ],
    },
  ];

  return (
    <footer className="mt-20 sm:mt-24 border-t border-app">
      <div className="max-w-7xl mx-auto safe-x px-4 sm:px-6 py-12 sm:py-14 grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-10">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg" aria-label="ArqFlow">
            <BrandMark />
          </Link>
          <p className="text-muted text-sm mt-4 max-w-xs leading-relaxed">{t.tagline}</p>
          <a
            href={`https://api.whatsapp.com/send?phone=${SUPPORT_WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline !py-2.5 text-sm mt-5 inline-flex"
          >
            <MessageCircle className="w-4 h-4" aria-hidden /> {t.whatsapp}
          </a>
        </div>
        {cols.map((col) => (
          <div key={col.title}>
            <p className="label-caps text-muted mb-4">{col.title}</p>
            <ul className="space-y-1">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="inline-flex items-center min-h-9 text-muted hover:text-app text-sm transition-colors link-underline"
                  >
                    {pick(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-app">
        <div className="max-w-7xl mx-auto safe-x px-4 sm:px-6 py-5 safe-b text-xs text-muted flex flex-wrap items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} ArqFlow. {t.rights}.</span>
          <span>Built with purpose. Designed to convert.</span>
        </div>
      </div>
    </footer>
  );
}
