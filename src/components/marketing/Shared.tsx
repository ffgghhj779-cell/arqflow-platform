"use client";

import Link from "next/link";
import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeft, ArrowRight, Check, MessageCircle } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import { cn, formatEGP } from "@/lib/utils";
import type { Plan } from "@/lib/plans";

/* ---------- Scroll reveal wrapper (Ultra-Smooth, Zero-Blur, 120Hz Hardware-Accelerated) ---------- */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 18,
  duration,
  className,
}: {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "zoom" | "fade";
  distance?: number;
  duration?: number;
  className?: string;
}) {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || window.matchMedia("(pointer: coarse)").matches)
    );
  }, []);

  const d = isTouch ? Math.min(distance, 10) : distance;
  const dur = duration ?? (isTouch ? 0.32 : 0.45);
  const del = isTouch ? Math.min(delay, 0.03) : delay;

  const getInitial = () => {
    switch (direction) {
      case "up":
        return {
          opacity: 0,
          y: d,
          scale: isTouch ? 1 : 0.99,
        };
      case "down":
        return {
          opacity: 0,
          y: -d,
          scale: isTouch ? 1 : 0.99,
        };
      case "left":
        return {
          opacity: 0,
          x: d,
        };
      case "right":
        return {
          opacity: 0,
          x: -d,
        };
      case "zoom":
        return {
          opacity: 0,
          scale: 0.98,
        };
      case "fade":
      default:
        return {
          opacity: 0,
        };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: isTouch ? "40px 0px 0px 0px" : "-10px" }}
      transition={{
        duration: dur,
        delay: del,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Direction-aware arrow ---------- */
export function DirArrow({ className }: { className?: string }) {
  const { dir } = useLang();
  const cls = className ?? "w-4 h-4";
  return dir === "rtl" ? <ArrowLeft className={cls} /> : <ArrowRight className={cls} />;
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  badge,
  title,
  subtitle,
  center = true,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <Reveal className={cn("max-w-3xl", center && "mx-auto text-center")}>
      {badge && (
        <span className={cn("badge badge-accent label-caps mb-4", center && "mx-auto")}>
          {badge}
        </span>
      )}
      <h2 className="text-xl leading-7 sm:text-[1.75rem] sm:leading-9 md:text-4xl md:leading-[1.2] font-extrabold">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted mt-3 sm:mt-4 text-sm sm:text-base md:text-lg leading-relaxed">{subtitle}</p>
      )}
    </Reveal>
  );
}

/* ---------- Accessible accordion ---------- */
export type AccordionItem = { q: string; a: string };

export function Accordion({
  items,
  idPrefix,
  defaultOpen = 0,
}: {
  items: AccordionItem[];
  idPrefix: string;
  defaultOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={cn("card overflow-hidden", isOpen && "border-strong")}>
            <h3>
              <button
                type="button"
                className="group w-full flex items-center justify-between gap-4 p-4 sm:p-5 min-h-14 text-start font-semibold cursor-pointer hover:text-accent transition-all duration-200"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`${idPrefix}-panel-${i}`}
                id={`${idPrefix}-trigger-${i}`}
              >
                <span>{item.q}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 shrink-0 text-accent transition-all duration-200 group-hover:scale-115 group-hover:translate-y-0.5",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${idPrefix}-panel-${i}`}
                  role="region"
                  aria-labelledby={`${idPrefix}-trigger-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-4 sm:px-5 pb-5 text-muted text-sm leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Plan card (pricing preview + full pricing) ---------- */
export function PlanCard({
  plan,
  delay = 0,
  detailed = false,
}: {
  plan: Plan;
  delay?: number;
  detailed?: boolean;
}) {
  const { lang, pick } = useLang();
  const t = useT({
    ar: {
      setup: "رسوم تأسيس لمرة واحدة",
      monthly: "للباقة",
      subscribe: "اشترك الآن",
      popular: "الأكثر طلباً ✦",
      msgs: "رصيد محادثات ذكية · صلاحية ٣٠ يوم",
    },
    en: {
      setup: "one-time setup fee",
      monthly: "/ package",
      subscribe: "Subscribe Now",
      popular: "Most Popular ✦",
      msgs: "AI conversation credit · 30-day validity",
    },
  });

  const isHighlighted = plan.highlighted;

  return (
    <Reveal delay={delay} className="h-full">
      <motion.div
        className={cn(
          "h-full flex flex-col p-6 sm:p-8 relative overflow-hidden rounded-2xl border transition-all duration-300",
          isHighlighted
            ? /* dark navy card — premium */
              "bg-[#2a6b73] border-[rgba(var(--accent-rgb),0.4)] text-white"
            : /* light card */
              "card bg-elev text-app"
        )}
        whileHover={{
          y: -6,
          boxShadow: isHighlighted
            ? "0 24px 64px rgba(var(--accent-rgb), 0.25), 0 0 0 1px rgba(var(--accent-rgb), 0.3)"
            : "0 16px 48px rgba(13,34,54,0.08), 0 0 0 1px rgba(var(--accent-rgb),0.15)",
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        }}
      >
        {/* Shimmer border for highlighted */}
        {isHighlighted && (
          <>
            {/* Animated conic border */}
            <div className="absolute inset-0 rounded-2xl border-animated pointer-events-none" />
            {/* Inner glow */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: "radial-gradient(circle at 50% 0%, rgba(var(--accent-rgb),0.15) 0%, transparent 60%)",
              }}
            />
          </>
        )}

        {/* Popular badge */}
        {isHighlighted && (
          <span className="badge-premium absolute -top-px left-1/2 -translate-x-1/2 whitespace-nowrap shadow-lg z-10">
            {t.popular}
          </span>
        )}

        {/* Plan name */}
        <h3 className={cn("text-xl font-extrabold mt-2", isHighlighted ? "text-white" : "text-app")}>
          {pick(plan.name)}
        </h3>
        <p className={cn("text-sm mt-2 leading-relaxed min-h-10", isHighlighted ? "text-[rgba(255,255,255,0.65)]" : "text-muted")}>
          {pick(plan.tagline)}
        </p>

        {/* Price */}
        <div className="mt-6">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={cn("text-4xl sm:text-5xl font-extrabold font-display", isHighlighted ? "text-white" : "gradient-text-aurora")}>
              {formatEGP(plan.monthlyFee, lang, plan.currency)}
            </span>
            <span className={cn("text-sm", isHighlighted ? "text-[rgba(255,255,255,0.5)]" : "text-muted")}>
              {t.monthly}
            </span>
          </div>
          <p className={cn("text-xs mt-2", isHighlighted ? "text-[rgba(255,255,255,0.4)]" : "text-muted")}>
            + {formatEGP(plan.setupFee, lang, plan.currency)} {t.setup}
          </p>
          <p className={cn("text-xs mt-1 font-semibold", isHighlighted ? "text-[var(--accent)]" : "text-accent")}>
            {t.msgs}
          </p>
        </div>

        {/* Features */}
        <ul className={cn("mt-6 space-y-3 flex-1", !detailed && "mb-2")}>
          {pick(plan.features).map((f, fi) => (
            <motion.li
              key={f}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: fi * 0.06, duration: 0.4, ease: "easeOut" }}
              className="flex items-start gap-2.5 text-sm leading-relaxed"
            >
              <Check
                className={cn("w-4 h-4 shrink-0 mt-0.5", isHighlighted ? "text-[var(--accent)]" : "text-success")}
                aria-hidden
              />
              <span className={isHighlighted ? "text-[rgba(255,255,255,0.8)]" : detailed ? "" : "text-muted"}>
                {f}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={`/onboarding?plan=${plan.id}`}
          className={cn(
            "mt-7 w-full text-center py-3.5 px-6 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2",
            isHighlighted
              ? "bg-[var(--accent)] text-[#fbfaf7] hover:bg-white hover:text-[#2a6b73] shadow-lg shadow-[rgba(var(--accent-rgb),0.3)]"
              : "btn-outline"
          )}
        >
          {t.subscribe}
          <DirArrow />
        </Link>
      </motion.div>
    </Reveal>
  );
}

/* ---------- Closing CTA banner ---------- */
export function CTABanner({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const t = useT({
    ar: {
      title: "جاهز توظّف أول موظف ذكاء اصطناعي في نشاطك؟",
      subtitle: "خلال دقائق من الاشتراك، عملاءك هيلاقوا حد بيرد عليهم — في أي وقت، بأي لغة.",
      start: "ابدأ الآن",
      demo: "احجز ديمو مجاني",
      badge: "جاهز تبدأ؟",
    },
    en: {
      title: "Ready to hire your first AI employee?",
      subtitle:
        "Minutes after subscribing, your customers get instant answers — any time, in any language.",
      start: "Get Started",
      demo: "Book a Free Demo",
      badge: "Ready to start?",
    },
  });

  return (
    <section className="w-full relative overflow-hidden py-16 sm:py-20 md:py-28">
      {/* Top divider */}
      <div className="absolute top-0 inset-x-0 section-divider-fancy" aria-hidden />

      {/* Dark aurora background */}
      <div
        className="absolute inset-0 -z-0"
        style={{
          background: "linear-gradient(135deg, #2a6b73 0%, #0d2236 50%, #0d2a2a 100%)",
        }}
        aria-hidden
      />

      {/* Mesh orbs */}
      <motion.div
        className="absolute -top-32 -start-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(95,212,189,0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="absolute -bottom-20 -end-10 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(18,160,138,0.1) 0%, transparent 70%)" }}
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        aria-hidden
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Reveal>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="badge-premium inline-flex items-center gap-2 mb-6">
              ✦ {t.badge}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-[1.1] pb-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="gradient-text-aurora">{title ?? t.title}</span>
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            className="mt-5 text-[rgba(255,255,255,0.65)] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {subtitle ?? t.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-10 max-w-sm sm:max-w-none mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-sm bg-[var(--accent)] text-[#fbfaf7] hover:bg-white hover:text-[#2a6b73] transition-all duration-300 shadow-lg shadow-[rgba(var(--accent-rgb),0.3)] hover:shadow-[rgba(var(--accent-rgb),0.5)] hover:-translate-y-1"
            >
              {t.start}
              <DirArrow />
            </Link>
            <Link
              href="/onboarding?plan=free_trial"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-sm border border-[rgba(255,255,255,0.2)] text-white hover:border-[rgba(255,255,255,0.5)] hover:bg-[rgba(255,255,255,0.08)] transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              {t.demo}
            </Link>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Page hero (inner pages) ---------- */
export function PageHero({
  badge,
  title,
  subtitle,
}: {
  badge?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24">
      {/* Mesh background and grid */}
      <div className="absolute inset-0 grid-bg opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
      <div
        className="absolute -top-32 start-1/2 -translate-x-1/2 w-[600px] h-[350px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(var(--accent-rgb),0.12) 0%, transparent 70%)" }}
        aria-hidden
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {badge && (
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="badge-premium">✦ {badge}</span>
            </div>
          )}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-app font-display tracking-tight max-w-4xl mx-auto leading-[1.15] pb-1">
            <span className="gradient-text-aurora">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-muted mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>

      <div className="absolute bottom-0 inset-x-0 section-divider-fancy" aria-hidden />
    </section>
  );
}
