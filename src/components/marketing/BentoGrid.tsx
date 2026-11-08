"use client";

import { motion } from "framer-motion";
import { MessageSquare, Zap, Database, ShieldCheck, Activity, Cpu, ArrowUpRight } from "lucide-react";
import { useT, useLang } from "@/lib/i18n";
import { TiltCard } from "@/components/ui/PremiumEffects";
import { DirArrow } from "@/components/marketing/Shared";
import Link from "next/link";

export function BentoGrid() {
  const { lang } = useLang();
  const t = useT({
    ar: {
      badge: "قدرات الجيل القادم",
      title: "بنية تحتية متكاملة مصممة لأداء استثنائي",
      subtitle: "كل أداة وتقنية تحتاجها لإدارة مبيعاتك وخدمة عملائك على مدار الساعة بأعلى معايير الدقة والسرعة:",
      card1Title: "فهم عميق للهجات المحلية والسياق",
      card1Desc: "لا يعتمد على ردود جاهزة؛ البوت يفهم العامية والمصطلحة بدقة، ويتذكر سياق المحادثة بالكامل لتقديم إجابات مخصصة كأفضل موظف مبيعات.",
      card2Title: "مزامنة لحظية مع CRM وجداول البيانات",
      card2Desc: "تسجيل فوري لبيانات العملاء والطلبات داخل Google Sheets أو نظام الـ CRM الخاص بك تلقائياً.",
      card3Title: "نموذج محفظة التوكنز العادل (Smart Token Wallet)",
      card3Desc: "لا تدفع مقابل باقات رسائل تنتهي؛ ادفع فقط مقابل ما يستهلكه عملاؤك بمحفظة رصيد مرنة وشفافة مع ترحيل الرصيد المتبقي تلقائياً.",
      card4Title: "تصعيد ذكي للموظف البشري",
      card4Desc: "تحويل سلس للعميل إلى فريقك البشري فوراً عند طلب استشارة خاصة أو مواقف تتطلب تدخلاً يدوياً.",
      card5Title: "تحليلات استهلاك وتفاعل لحظية",
      card5Desc: "لوحة تحكم مباشرة توضح عدد المحادثات النشطة، أوقات الذروة، ونسبة رضا العملاء لحظة بلحظة.",
      explore: "استكشف كل المميزات",
    },
    en: {
      badge: "Next-Gen Capabilities",
      title: "An Enterprise-Grade AI Infrastructure",
      subtitle: "Every tool and capability you need to manage customer interactions and sales 24/7 with peak precision:",
      card1Title: "Deep Context & Dialect Understanding",
      card1Desc: "No static robotic answers; our AI understands local Arabic dialects & slang, remembering customer history to close deals effortlessly.",
      card2Title: "Instant CRM & Sheets Synchronization",
      card2Desc: "Captures lead details, orders, and inquiries directly into Google Sheets or your CRM in real-time.",
      card3Title: "Smart Prepaid Token-Wallet Model",
      card3Desc: "Never waste unused monthly quotas; pay only for actual token consumption with fair, transparent pricing and automatic rollover.",
      card4Title: "Smart Human Agent Escalation",
      card4Desc: "Seamless handoff to human representatives whenever a VIP client requests personal assistance.",
      card5Title: "Live Real-Time Analytics & Metrics",
      card5Desc: "Real-time visibility into active customer chats, peak conversion hours, and precise token expenditure.",
      explore: "Explore All Features",
    },
  });

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-3"
          >
            <span className="badge-premium">
              <Cpu className="w-3.5 h-3.5" />
              {t.badge}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-app font-display tracking-tight"
          >
            <span className="gradient-text-aurora">{t.title}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted text-base sm:text-lg mt-4 leading-relaxed"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Large (Span 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "30px 0px" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-2"
          >
            <TiltCard className="h-full">
              <div className="glass-strong card-elevated h-full p-5 sm:p-7 md:p-9 rounded-2xl sm:rounded-3xl border border-app relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute top-0 end-0 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(var(--accent-rgb),0.1)_0%,transparent_70%)] pointer-events-none group-hover:scale-110 transition-transform duration-500" />
                
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[rgba(var(--accent-rgb),0.12)] border border-[rgba(var(--accent-rgb),0.2)] flex items-center justify-center text-accent mb-4 sm:mb-6 shadow-sm">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-2xl font-bold text-app font-display mb-2 sm:mb-3">
                    {t.card1Title}
                  </h3>
                  <p className="text-muted text-xs sm:text-base leading-relaxed max-w-xl">
                    {t.card1Desc}
                  </p>
                </div>

                {/* Visual Widget Preview */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-app flex items-center justify-between text-xs text-muted flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-semibold text-app text-[11px] sm:text-xs">سرعة الاستجابة: &lt; 0.8 ثانية</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-xs">
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-solid text-accent font-bold">GPT-4o</span>
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-solid text-app font-bold">Claude 3.5</span>
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-solid text-app font-bold">DeepSeek V3</span>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 2: CRM & Sync */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "30px 0px" }}
            transition={{ duration: 0.4, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="h-full">
              <div className="glass-strong card-elevated h-full p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-app relative overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 sm:mb-6 shadow-sm">
                    <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-app font-display mb-2 sm:mb-3">
                    {t.card2Title}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">
                    {t.card2Desc}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-app flex items-center gap-2 text-xs text-muted">
                  <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                  <span className="text-[11px] sm:text-xs">تحديث الجداول في نفس الثانية</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 3: Token Wallet */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "30px 0px" }}
            transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="h-full">
              <div className="glass-strong card-elevated h-full p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-app relative overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4 sm:mb-6 shadow-sm">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-app font-display mb-2 sm:mb-3">
                    {t.card3Title}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">
                    {t.card3Desc}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-app">
                  <div className="flex justify-between text-[11px] sm:text-xs text-muted mb-1.5">
                    <span>رصيد التوكنز المحمي</span>
                    <span className="text-emerald-500 font-bold">100% شفاف</span>
                  </div>
                  <div className="wallet-bar">
                    <div className="wallet-bar-fill healthy" style={{ width: "88%" }} />
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 4: Human Escalation */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "30px 0px" }}
            transition={{ duration: 0.4, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="h-full">
              <div className="glass-strong card-elevated h-full p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-app relative overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 mb-4 sm:mb-6 shadow-sm">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-app font-display mb-2 sm:mb-3">
                    {t.card4Title}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">
                    {t.card4Desc}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-app flex items-center gap-2 text-xs text-muted">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-[11px] sm:text-xs">إشعار فوري لموظف خدمة العملاء</span>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Card 5: Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "30px 0px" }}
            transition={{ duration: 0.4, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <TiltCard className="h-full">
              <div className="glass-strong card-elevated h-full p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-app relative overflow-hidden flex flex-col justify-between group">
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[rgba(var(--accent-rgb),0.12)] border border-[rgba(var(--accent-rgb),0.2)] flex items-center justify-center text-accent mb-4 sm:mb-6 shadow-sm">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-app font-display mb-2 sm:mb-3">
                    {t.card5Title}
                  </h3>
                  <p className="text-muted text-xs sm:text-sm leading-relaxed">
                    {t.card5Desc}
                  </p>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-app flex items-center justify-between">
                  <Link href="/features" className="text-xs font-bold text-accent flex items-center gap-1 hover:underline">
                    {t.explore}
                    <DirArrow />
                  </Link>
                  <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />
                </div>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
