"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import {
  Zap, ShoppingCart, Mic, Users, BarChart3, Languages,
  MessageCircle, UtensilsCrossed, Stethoscope, ShoppingBag, Dumbbell,
  Building2, Hotel, Scissors, GraduationCap, Pill,
  ChevronLeft, ChevronRight, Star, CheckCircle2, ArrowDown,
  Clock, Sparkles, TrendingUp,
} from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { PLANS, type Plan } from "@/lib/plans";
import {
  Reveal, SectionHeading, Accordion, PlanCard, CTABanner, DirArrow,
} from "@/components/marketing/Shared";
import ParticleText from "@/components/ui/ParticleText";
import { MeshBackground, TiltCard } from "@/components/ui/PremiumEffects";
import { InteractivePlayground } from "@/components/marketing/InteractivePlayground";
import { BentoGrid } from "@/components/marketing/BentoGrid";
import { IndustryMarquee } from "@/components/marketing/IndustryMarquee";
import { ROICalculator } from "@/components/marketing/ROICalculator";
import { VoiceNoteSimulator } from "@/components/marketing/VoiceNoteSimulator";
import { LiveActivityToast } from "@/components/marketing/LiveActivityToast";

/* ================================================================
   HERO
   ================================================================ */

function Hero() {
  const { dir } = useLang();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  const t = useT({
    ar: {
      badge: "✦ أكثر من ١٠٠ نشاط تجاري مصري يثق في ArqFlow",
      h1a: "موظف ذكاء اصطناعي",
      h1b: "يرد على عملاءك ٢٤ ساعة",
      sub: "حلول ذكية متكاملة للرد الفوري، استقبال الطلبات، وحجز المواعيد على الواتساب — بدون توقف، بدون إجازات.",
      cta1: "ابدأ الآن",
      cta2: "احجز ديمو مجاني",
      scroll: "اكتشف المزيد",
      preview: "لوحة التحكم",
      liveTag: "مباشر الآن",
    },
    en: {
      badge: "✦ 100+ Egyptian Businesses Trust ArqFlow",
      h1a: "Integrated AI Employee",
      h1b: "Answering Your Customers 24/7",
      sub: "Integrated smart solutions for instant replies, order taking, and appointment booking on WhatsApp — no downtime, no days off.",
      cta1: "Get Started",
      cta2: "Book a Free Demo",
      scroll: "Discover more",
      preview: "Dashboard",
      liveTag: "Live Now",
    },
  });

  const msgVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.95 },
    visible: (i: number) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { delay: 1.4 + i * 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  const bubbles = [
    { from: "customer", text: dir === "rtl" ? "كام سعر البرجر؟" : "How much is the burger?", delay: 0 },
    { from: "bot",      text: dir === "rtl" ? "البرجر الكلاسيك ٨٥ جنيه، ومعاه سلطة وعصير 🍔" : "Classic burger is 85 EGP, includes salad & juice 🍔", delay: 1 },
    { from: "customer", text: dir === "rtl" ? "تمام، عايز ٢ توصيل" : "Great, 2 for delivery", delay: 2 },
    { from: "bot",      text: dir === "rtl" ? "تم! طلبك ٠٠٤٢ قيد التحضير ✅" : "Done! Order #0042 is being prepared ✅", delay: 3 },
  ];

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-12 md:py-20 border-b border-app"
    >
      {/* Layered backgrounds */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none z-0" aria-hidden />
      <div className="absolute inset-0 hero-bg pointer-events-none z-0" aria-hidden />
      <MeshBackground intensity="normal" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="badge-premium inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-3 h-3" aria-hidden />
            {t.badge}
          </span>
        </motion.div>

        {/* Particle canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          dir="ltr"
          className="w-full max-w-2xl h-[110px] sm:h-[150px] md:h-[180px] flex items-center justify-center -mb-2 cursor-pointer"
        >
          <ParticleText text="ARQFLOW" className="w-full h-full" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center w-full"
        >
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.12] sm:leading-[1.08] text-app">
            {/* Line 1 — gradient */}
            <span className="gradient-text-aurora block pb-1">{t.h1a}</span>
            {/* Line 2 — solid */}
            <span className="block">{t.h1b}</span>
          </h1>

          <p className="text-muted mt-5 sm:mt-7 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {t.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 w-full max-w-sm sm:max-w-none mx-auto">
            <Link
              href="/onboarding"
              className="btn-primary text-sm !px-8 !py-4 w-full sm:w-auto border-animated rounded-lg"
            >
              {t.cta1}
              <DirArrow />
            </Link>
            <Link
              href="/onboarding?plan=free_trial"
              className="btn-outline text-sm !px-8 !py-4 w-full sm:w-auto"
            >
              <MessageCircle className="w-4 h-4" aria-hidden />
              {t.cta2}
            </Link>
          </div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className="flex flex-col items-center gap-1.5 mt-10 text-muted text-xs"
          >
            <span className="label-caps">{t.scroll}</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="w-4 h-4" aria-hidden />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Dashboard Mockup */}
      <motion.div
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20"
        style={{ y: mockupY }}
      >
        <TiltCard intensity={4} className="w-full">
          <div className="rounded-2xl sm:rounded-3xl border border-slate-700/60 dark:border-white/15 bg-[#070e17] text-white shadow-[0_25px_70px_-15px_rgba(14,32,56,0.35)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Mockup top bar */}
            <div className="bg-[#0b1523] px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-sm" />
                <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-sm" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-[#132238] border border-white/10 rounded-full px-4 py-1 text-xs text-slate-200 font-mono font-medium max-w-xs w-full text-center truncate">
                  dashboard.arqflow.app
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
                <span className="text-xs text-emerald-400 font-bold">{t.liveTag}</span>
              </div>
            </div>

            {/* Mockup body */}
            <div className="bg-[#08101a] p-3 sm:p-5 flex gap-3 sm:gap-5 min-h-[240px] sm:min-h-[300px]">
              {/* Sidebar mini */}
              <div className="hidden sm:flex flex-col gap-1 w-36 shrink-0 border-e border-white/10 pe-3">
                {["نظرة عامة", "المحادثات", "الطلبات", "العملاء", "التحليلات"].map((item, i) => (
                  <div
                    key={item}
                    className={cn(
                      "text-xs px-3 py-2 rounded-lg font-semibold transition-all",
                      i === 1
                        ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Chat area */}
              <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    ع
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">عميل جديد</p>
                    <p className="text-[10px] text-slate-400">منذ ثانيتين</p>
                  </div>
                  <div className="ms-auto flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold">مباشر</span>
                  </div>
                </div>

                {/* Chat bubbles */}
                <div className="flex flex-col gap-2.5 flex-1 justify-center">
                  {bubbles.map((bubble, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={msgVariants}
                      initial="hidden"
                      animate="visible"
                      className={cn(
                        "flex",
                        bubble.from === "customer" ? "justify-start" : "justify-end"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] sm:max-w-[75%] text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl leading-relaxed shadow-sm",
                          bubble.from === "customer"
                            ? "bg-[#152438] text-slate-100 border border-white/10 rounded-ss-none font-medium"
                            : "bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-se-none font-medium shadow-teal-500/20 shadow-md"
                        )}
                      >
                        {bubble.text}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats mini panel */}
              <div className="hidden lg:flex flex-col gap-2.5 w-36 shrink-0 border-s border-white/10 ps-3">
                {[
                  { label: "محادثات اليوم", value: "٤٨", color: "text-teal-400", icon: MessageCircle },
                  { label: "طلبات مؤكدة", value: "١٢", color: "text-emerald-400", icon: CheckCircle2 },
                  { label: "متوسط الرد", value: "٣ث", color: "text-amber-400", icon: Clock },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#0e1b2c] border border-white/10 rounded-xl p-3 shadow-sm">
                    <stat.icon className={cn("w-4 h-4 mb-1", stat.color)} aria-hidden />
                    <p className={cn("text-base font-extrabold font-display", stat.color)}>{stat.value}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </section>
  );
}

/* ================================================================
   STATS BAR (Animated Counters)
   ================================================================ */

function StatsBar() {
  const t = useT({
    ar: {
      stats: [
        { v: 24,  suffix: "/٧",  label: "شغّال بدون توقف" },
        { v: 5,   suffix: "ث",   label: "متوسط سرعة الرد" },
        { v: 9,   suffix: "+",   label: "مجال تجاري" },
        { v: 100, suffix: "+",   label: "نشاط تجاري" },
      ],
    },
    en: {
      stats: [
        { v: 24,  suffix: "/7",  label: "Always on" },
        { v: 5,   suffix: "s",   label: "Avg reply speed" },
        { v: 9,   suffix: "+",   label: "Industries" },
        { v: 100, suffix: "+",   label: "Businesses served" },
      ],
    },
  });

  return (
    <section className="w-full py-10 sm:py-14 border-b border-app overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="glass glow-teal-sm grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x rtl:divide-x-reverse divide-[var(--border)] overflow-hidden rounded-2xl">
            {t.stats.map((s, i) => (
              <div key={s.label} className="p-6 sm:p-8 text-center group">
                <p className="text-3xl sm:text-4xl font-extrabold gradient-text-aurora font-display">
                  {s.v}{s.suffix}
                </p>
                <p className="text-muted text-xs sm:text-sm mt-2 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   FEATURES GRID — Layered with featured card
   ================================================================ */

function Features() {
  const t = useT({
    ar: {
      badge: "المميزات",
      title: "كل اللي موظف خدمة العملاء المثالي يعمله — وأسرع",
      sub: "وكيل ذكاء اصطناعي مدرّب على نشاطك أنت بالذات: منتجاتك، أسعارك، مواعيدك، وطريقة كلامك.",
      items: [
        { icon: Zap,          h: "ردود فورية ٢٤ ساعة",         p: "عميلك يسأل الساعة ٣ الفجر؟ يلاقي رد كامل ومحترم في ثواني — مش رسالة آلية مقفولة." },
        { icon: ShoppingCart, h: "استقبال الطلبات والحجوزات",  p: "البوت ياخد الأوردر بالتفاصيل، يأكّد السعر والعنوان، ويسجّل كل حاجة في لوحة التحكم بتاعتك." },
        { icon: Mic,          h: "فهم الرسائل الصوتية",        p: "عملاءك بيحبوا الفويس؟ مفيش مشكلة. البوت بيسمع، بيفهم المصري، وبيرد كأنه سمعك بودنه." },
        { icon: Users,        h: "تحويل ذكي لموظف بشري",      p: "لو السؤال محتاج بني آدم، البوت بيحوّل المحادثة لفريقك في ثانية مع ملخص كامل للموقف." },
        { icon: BarChart3,    h: "تحليلات وتقارير",           p: "اعرف أكتر الأسئلة تكراراً، أوقات الذروة، وعدد الطلبات — أرقام حقيقية تبني عليها قرارات." },
        { icon: Languages,    h: "عربي + إنجليزي + مصري",    p: "بيرد بنفس لغة العميل تلقائياً، ومتدرّب على اللهجة المصرية مش بس الفصحى." },
      ],
    },
    en: {
      badge: "Features",
      title: "Everything the perfect support employee does — but faster",
      sub: "An AI agent trained on your business specifically: your products, prices, schedule, and tone of voice.",
      items: [
        { icon: Zap,          h: "Instant replies, 24/7",        p: "A customer asks at 3 AM? They get a complete, polite answer in seconds — not a canned auto-reply." },
        { icon: ShoppingCart, h: "Orders & bookings",            p: "The bot takes the full order, confirms price and address, and logs everything in your dashboard." },
        { icon: Mic,          h: "Voice message understanding",  p: "Your customers love voice notes? No problem. The bot listens, understands Egyptian Arabic, and replies naturally." },
        { icon: Users,        h: "Smart human escalation",       p: "When a question needs a human, the bot hands the chat to your team instantly — with a full summary." },
        { icon: BarChart3,    h: "Analytics & reports",          p: "Know your most-asked questions, peak hours, and order counts — real numbers for real decisions." },
        { icon: Languages,    h: "Arabic + English + Masry",     p: "Automatically replies in the customer's language, trained on the Egyptian dialect — not just formal Arabic." },
      ],
    },
  });

  return (
    <section id="features" className="w-full bg-app text-app py-14 sm:py-20 md:py-28 border-b border-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading badge={t.badge} title={t.title} subtitle={t.sub} />

        <div className="mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {t.items.map((f, i) => (
            <Reveal key={f.h} delay={i * 0.03}>
              <motion.div
                className={cn(
                  "card p-5 sm:p-7 h-full bg-elev group relative overflow-hidden",
                  /* Featured card — ردود فورية */
                  i === 0 && "sm:col-span-2 lg:col-span-1 border-[rgba(var(--accent-rgb),0.3)]"
                )}
                whileHover={{
                  y: -4,
                  borderColor: "rgba(var(--accent-rgb), 0.5)",
                  boxShadow: "0 16px 48px rgba(var(--accent-rgb), 0.08)",
                  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                {/* Background glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 30% 30%, rgba(var(--accent-rgb),0.05), transparent 60%)" }}
                />

                <span className="w-11 h-11 icon-chip mb-4 group-hover:scale-110 transition-transform duration-300 relative">
                  <f.icon className="w-5 h-5" aria-hidden />
                </span>
                <h3 className="font-bold text-lg relative">{f.h}</h3>
                <p className="text-muted text-sm mt-2 leading-relaxed relative">{f.p}</p>

                {/* Featured badge */}
                {i === 0 && (
                  <span className="absolute top-4 end-4 badge badge-accent text-[10px]">
                    {/* eslint-disable-next-line react/jsx-no-literals */}
                    ★ Core
                  </span>
                )}
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   HOW IT WORKS — Vertical Timeline
   ================================================================ */

function HowItWorks() {
  const t = useT({
    ar: {
      badge: "كيف يعمل",
      title: "من الاشتراك للتشغيل في ٤ خطوات",
      sub: "مفيش اجتماعات ولا أسابيع انتظار. النظام مبني عشان يشتغل بسرعة.",
      steps: [
        { h: "اختار باقتك", p: "ستارتر، بيزنس، أو إنتربرايز — كل باقة واضحة بالجنيه المصري.", icon: TrendingUp },
        { h: "املا بيانات نشاطك", p: "اسم النشاط، المنيو أو الخدمات، أسئلة عملاءك المعتادة — في فورم واحد بسيط.", icon: CheckCircle2 },
        { h: "ادفع بالطريقة اللي تريحك", p: "إنستاباي، فودافون كاش، أو وي باي — وارفع إثبات الدفع.", icon: ShoppingCart },
        { h: "البوت يشتغل في دقايق", p: "بنجهّز وكيلك الخاص ونوصّله بواتساب نشاطك — وعملاءك يبدأوا ياخدوا ردود فوراً.", icon: Zap },
      ],
      more: "اعرف التفاصيل الكاملة",
    },
    en: {
      badge: "How it works",
      title: "From subscription to live bot in 4 steps",
      sub: "No meetings, no weeks of waiting. The system is built for speed.",
      steps: [
        { h: "Choose your plan", p: "Starter, Business, or Enterprise — every plan clearly priced in EGP.", icon: TrendingUp },
        { h: "Fill the onboarding form", p: "Your business name, menu or services, and your customers' usual questions — one simple form.", icon: CheckCircle2 },
        { h: "Pay your way", p: "InstaPay, Vodafone Cash, or WE Pay — then upload your payment proof.", icon: ShoppingCart },
        { h: "Your bot goes live in minutes", p: "We provision your private agent and connect it to your WhatsApp — customers start getting instant answers.", icon: Zap },
      ],
      more: "See the full details",
    },
  });

  return (
    <section className="w-full bg-app text-app py-14 sm:py-20 md:py-28 border-b border-app relative overflow-hidden">
      {/* Decorative accent line */}
      <div className="absolute top-0 inset-x-0 section-divider-fancy" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading badge={t.badge} title={t.title} subtitle={t.sub} />

        <div className="relative mt-12 sm:mt-20 max-w-3xl mx-auto">
          {/* Vertical connector line */}
          <div
            className="absolute start-5 sm:start-7 top-6 bottom-6 w-[2px] bg-gradient-to-b from-[rgba(var(--accent-rgb),0.6)] via-[rgba(var(--accent-rgb),0.2)] to-transparent"
            aria-hidden
          />

          <div className="space-y-8 sm:space-y-10">
            {t.steps.map((s, i) => (
              <Reveal key={s.h} delay={i * 0.04}>
                <div className="flex gap-5 sm:gap-7 group">
                  {/* Step number circle */}
                  <div className="relative shrink-0 z-10">
                    <motion.div
                      className="w-10 h-10 sm:w-14 sm:h-14 rounded-full glass-strong flex items-center justify-center border-[rgba(var(--accent-rgb),0.3)] border group-hover:border-[rgba(var(--accent-rgb),0.7)] transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <span className="text-base sm:text-xl font-extrabold gradient-text">{i + 1}</span>
                    </motion.div>
                  </div>

                  {/* Step content */}
                  <motion.div
                    className="card card-elevated flex-1 p-5 sm:p-7"
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="icon-chip w-9 h-9 mt-0.5 shrink-0">
                        <s.icon className="w-4 h-4" aria-hidden />
                      </span>
                      <div>
                        <h3 className="font-bold text-lg text-app">{s.h}</h3>
                        <p className="text-muted text-sm mt-1.5 leading-relaxed">{s.p}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="text-center mt-12">
          <Link href="/how-it-works" className="btn-ghost text-accent hover:bg-solid">
            {t.more}
            <DirArrow />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   INDUSTRIES STRIP
   ================================================================ */

function Industries() {
  const t = useT({
    ar: {
      badge: "المجالات",
      title: "مبني لكل بيزنس مصري بيرد على واتساب",
      items: [
        { icon: UtensilsCrossed, l: "مطاعم وكافيهات" },
        { icon: Stethoscope,     l: "عيادات ومراكز طبية" },
        { icon: ShoppingBag,     l: "محلات وأونلاين ستورز" },
        { icon: Dumbbell,        l: "جيمات ولياقة" },
        { icon: Building2,       l: "عقارات" },
        { icon: Hotel,           l: "فنادق وشاليهات" },
        { icon: Scissors,        l: "صالونات وبيوتي" },
        { icon: GraduationCap,   l: "كورسات وتعليم" },
        { icon: Pill,            l: "صيدليات" },
      ],
    },
    en: {
      badge: "Industries",
      title: "Built for every Egyptian business that lives on WhatsApp",
      items: [
        { icon: UtensilsCrossed, l: "Restaurants & cafés" },
        { icon: Stethoscope,     l: "Clinics & medical centers" },
        { icon: ShoppingBag,     l: "Stores & online shops" },
        { icon: Dumbbell,        l: "Gyms & fitness" },
        { icon: Building2,       l: "Real estate" },
        { icon: Hotel,           l: "Hotels & rentals" },
        { icon: Scissors,        l: "Salons & beauty" },
        { icon: GraduationCap,   l: "Courses & education" },
        { icon: Pill,            l: "Pharmacies" },
      ],
    },
  });

  return (
    <section className="w-full bg-app text-app py-14 sm:py-20 md:py-28 border-b border-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading badge={t.badge} title={t.title} />
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-2 sm:gap-3 mt-10 sm:mt-14">
          {t.items.map((it, i) => (
            <Reveal key={it.l} delay={i * 0.02}>
              <motion.div
                className="card p-3 sm:p-5 text-center h-full flex flex-col items-center gap-2 sm:gap-3 bg-elev group"
                whileHover={{
                  y: -4, borderColor: "rgba(var(--accent-rgb), 0.4)",
                  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                <span className="w-10 h-10 sm:w-12 sm:h-12 icon-chip group-hover:scale-110 transition-transform duration-300">
                  <it.icon className="w-5 h-5" aria-hidden />
                </span>
                <p className="text-xs font-semibold leading-snug text-app">{it.l}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   PRICING PREVIEW
   ================================================================ */

function PricingPreview({ plans = PLANS }: { plans?: Plan[] }) {
  const t = useT({
    ar: {
      badge: "الأسعار",
      title: "أسعار واضحة بالجنيه المصري",
      sub: "رسوم تأسيس لمرة واحدة + اشتراك شهري. من غير مفاجآت ومن غير عقود طويلة.",
      full: "شوف تفاصيل الباقات كاملة",
    },
    en: {
      badge: "Pricing",
      title: "Clear pricing, in Egyptian pounds",
      sub: "A one-time setup fee + a monthly subscription. No surprises, no long contracts.",
      full: "See full plan details",
    },
  });

  const displayPlans = plans.filter((p) => p.id !== "free_trial");

  return (
    <section className="w-full bg-app text-app py-14 sm:py-20 md:py-28 border-b border-app relative overflow-hidden">
      <MeshBackground intensity="subtle" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading badge={t.badge} title={t.title} subtitle={t.sub} />
        <div className="grid lg:grid-cols-3 gap-5 sm:gap-7 mt-12 sm:mt-16 items-stretch">
          {displayPlans.map((p, i) => (
            <PlanCard key={p.id} plan={p} delay={i * 0.1} />
          ))}
        </div>
        <Reveal className="text-center mt-10">
          <Link href="/pricing" className="btn-ghost text-accent hover:bg-solid">
            {t.full}
            <DirArrow />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   HOME FAQ
   ================================================================ */

function HomeFaq() {
  const t = useT({
    ar: {
      badge: "أسئلة شائعة",
      title: "أكيد عندك أسئلة — عندنا إجابات",
      all: "كل الأسئلة الشائعة",
      items: [
        { q: "هل البوت بيشتغل على رقم الواتساب بتاعي الحالي؟", a: "أيوه. بنوصّل وكيل الذكاء الاصطناعي برقم واتساب نشاطك الموجود فعلاً — عملاءك مش هيحسوا بأي فرق في الرقم، بس هيلاحظوا إن الرد بقى فوري." },
        { q: "البوت هيعرف يرد عن نشاطي أنا بالذات إزاي؟", a: "في خطوة الأونبوردنج بتدّينا كل تفاصيل نشاطك: المنيو أو الخدمات، الأسعار، المواعيد، وسياساتك. بنبني للبوت قاعدة معرفة خاصة بيك لوحدك — مش نموذج عام." },
        { q: "لو العميل سأل سؤال صعب والبوت معرفش يرد؟", a: "البوت بيحوّل المحادثة تلقائياً لموظف بشري من فريقك مع ملخص كامل للمحادثة. عمره ما هيخترع إجابة غلط في موضوع حساس." },
        { q: "هل في عقد أو التزام طويل؟", a: "لأ. في رسوم تأسيس لمرة واحدة، وبعدها اشتراك شهري تقدر تلغيه في أي وقت. رسوم التأسيس فقط غير قابلة للاسترداد بعد تجهيز البوت." },
        { q: "الإعداد بياخد قد إيه فعلاً؟", a: "بعد تأكيد الدفع، تجهيز الوكيل الخاص بيك وربطه بالواتساب بياخد دقايق في أغلب الحالات — مش أيام ولا أسابيع." },
      ],
    },
    en: {
      badge: "FAQ",
      title: "You have questions — we have answers",
      all: "See all FAQs",
      items: [
        { q: "Does the bot work on my current WhatsApp number?", a: "Yes. We connect the AI agent to your existing business WhatsApp number — your customers won't notice any difference in the number, just that replies are now instant." },
        { q: "How will the bot know how to answer for my specific business?", a: "During onboarding you give us your business details: menu or services, prices, schedule, and policies. We build a private knowledge base just for you — not a generic model." },
        { q: "What if a customer asks something the bot can't answer?", a: "The bot automatically hands the conversation to a human on your team, with a full summary. It will never invent a wrong answer on a sensitive topic." },
        { q: "Is there a contract or long commitment?", a: "No. There's a one-time setup fee, then a monthly subscription you can cancel anytime. Only the setup fee is non-refundable after your bot is provisioned." },
        { q: "How long does setup really take?", a: "After payment confirmation, provisioning your private agent and connecting it to WhatsApp takes minutes in most cases — not days or weeks." },
      ],
    },
  });

  return (
    <section className="w-full bg-app text-app py-14 sm:py-20 md:py-28 border-b border-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading badge={t.badge} title={t.title} />
        <Reveal className="max-w-3xl mx-auto mt-12">
          <Accordion items={t.items} idPrefix="home-faq" />
          <div className="text-center mt-8">
            <Link href="/faq" className="btn-ghost text-accent hover:bg-solid">
              {t.all}
              <DirArrow />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   PAGE EXPORT
   ================================================================ */

export default function HomeClient({ plans }: { plans?: Plan[] }) {
  return (
    <>
      <Hero />
      <IndustryMarquee />
      <StatsBar />
      <BentoGrid />
      <VoiceNoteSimulator />
      <InteractivePlayground />
      <Features />
      <ROICalculator />
      <HowItWorks />
      <Industries />
      <PricingPreview plans={plans} />
      <HomeFaq />
      <CTABanner />
      <LiveActivityToast />
    </>
  );
}
