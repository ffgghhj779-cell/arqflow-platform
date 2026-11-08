"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calculator, TrendingUp, Sparkles, CheckCircle2,
  Clock, Shield, ArrowRight, ArrowLeft, Moon,
} from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import { formatEGP } from "@/lib/utils";
import { Reveal, SectionHeading, DirArrow } from "@/components/marketing/Shared";

export function ROICalculator() {
  const { lang, dir } = useLang();

  // State sliders
  const [agents, setAgents] = useState(2);
  const [salary, setSalary] = useState(6500);
  const [monthlyChats, setMonthlyChats] = useState(1800);

  // Calculations
  const currentMonthlyCost = agents * salary;
  const currentAnnualCost = currentMonthlyCost * 12;

  // Best ArqFlow Plan recommendation
  const recommendedPlan =
    monthlyChats <= 800
      ? { name: lang === "ar" ? "باقة ستارتر" : "Starter Plan", fee: 500 }
      : monthlyChats <= 3000
      ? { name: lang === "ar" ? "باقة بيزنس (الأكثر طلباً)" : "Business Plan (Popular)", fee: 1100 }
      : { name: lang === "ar" ? "باقة إنتربرايز" : "Enterprise Plan", fee: 1500 };

  const monthlySavings = Math.max(0, currentMonthlyCost - recommendedPlan.fee);
  const annualSavings = monthlySavings * 12;
  const savingsPct = Math.min(96, Math.max(0, Math.round((monthlySavings / currentMonthlyCost) * 100)));

  const t = useT({
    ar: {
      badge: "حاسبة العائد والوفر المالي",
      title: "احسب وفرك الحقيقي مع موظف الذكاء الاصطناعي",
      sub: "حرّك المؤشرات وشوف بنفسك كم ستوفر شهرياً وسنوياً مع تحسين سرعة الرد بنسبة ١٠٠٪.",
      slider1: "عدد موظفي خدمة العملاء الحاليين:",
      slider2: "متوسط راتب الموظف الواحد شهرياً:",
      slider3: "عدد محادثات الواتساب الشهرية التقديرية:",
      agentsUnit: "موظف",
      chatsUnit: "محادثة / شهر",
      currentCost: "تكلفتك البشرية الحالية:",
      arqflowCost: "تكلفتك مع ArqFlow:",
      monthlySavings: "وفرك الشهري الصافي:",
      annualSavings: "إجمالي وفرك السنوي:",
      savingsRate: "نسبة التوفير المالي:",
      perksTitle: "قيمة مضافة فوق التوفير المالي:",
      perk1: "رد فوري في ثوانٍ ٢٤ ساعة بدون دقيقة نوم",
      perk2: "صفر إجازات، صفر غيابات، وصفر تكاليف تدريب",
      perk3: "استقبال وتأكيد الأوردرات والحجوزات بدقة تامة",
      perk4: "تغطية كاملة لساعات الليل المتأخرة والذروة",
      cta: "ابدأ التوفير الآن مع ArqFlow",
    },
    en: {
      badge: "ROI & Cost Calculator",
      title: "Calculate Your Real Savings with AI Support",
      sub: "Adjust the sliders and see exactly how much your business will save every single month.",
      slider1: "Current human support agents:",
      slider2: "Average monthly salary per agent:",
      slider3: "Estimated monthly WhatsApp chats:",
      agentsUnit: "agents",
      chatsUnit: "chats / month",
      currentCost: "Current Human Cost:",
      arqflowCost: "Cost with ArqFlow:",
      monthlySavings: "Net Monthly Savings:",
      annualSavings: "Total Annual Savings:",
      savingsRate: "Cost Reduction Rate:",
      perksTitle: "Value Added Beyond Financial Savings:",
      perk1: "Instant 24/7 replies with zero downtime or sleep",
      perk2: "Zero sick leaves, zero turnover, zero onboarding delays",
      perk3: "Accurate order taking and automated scheduling",
      perk4: "100% night-time lead recovery and peak surge handling",
      cta: "Start Saving Today with ArqFlow",
    },
  });

  return (
    <section className="py-20 sm:py-28 bg-app relative overflow-hidden border-b border-app">
      {/* Background glow orbs */}
      <div className="absolute top-1/2 -start-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(18,160,138,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-10 -end-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(13,34,54,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading badge={t.badge} title={t.title} subtitle={t.sub} />

        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Column: Sliders Controller */}
            <Reveal className="lg:col-span-7 h-full">
              <div className="glass-strong card-elevated h-full p-6 sm:p-8 rounded-3xl border border-app flex flex-col justify-between space-y-7">
                <div className="space-y-6">
                  {/* Slider 1: Agents */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-app">{t.slider1}</span>
                      <span className="font-bold font-mono text-accent bg-solid px-3 py-1 rounded-lg">
                        {agents} {t.agentsUnit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={agents}
                      onChange={(e) => setAgents(Number(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-solid rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-muted font-mono">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>

                  {/* Slider 2: Salary */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-app">{t.slider2}</span>
                      <span className="font-bold font-mono text-accent bg-solid px-3 py-1 rounded-lg">
                        {formatEGP(salary, lang)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={4000}
                      max={15000}
                      step={500}
                      value={salary}
                      onChange={(e) => setSalary(Number(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-solid rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-muted font-mono">
                      <span>{formatEGP(4000, lang)}</span>
                      <span>{formatEGP(9500, lang)}</span>
                      <span>{formatEGP(15000, lang)}</span>
                    </div>
                  </div>

                  {/* Slider 3: Chats Volume */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-app">{t.slider3}</span>
                      <span className="font-bold font-mono text-accent bg-solid px-3 py-1 rounded-lg">
                        ~{monthlyChats.toLocaleString()} {t.chatsUnit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={8000}
                      step={250}
                      value={monthlyChats}
                      onChange={(e) => setMonthlyChats(Number(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer h-2 bg-solid rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-muted font-mono">
                      <span>500</span>
                      <span>4,000</span>
                      <span>8,000+</span>
                    </div>
                  </div>
                </div>

                {/* Additional Perks Box */}
                <div className="pt-4 border-t border-app">
                  <p className="text-xs font-bold text-app uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    {t.perksTitle}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-muted">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{t.perk1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{t.perk2}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{t.perk3}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{t.perk4}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right Column: Financial Results Card */}
            <Reveal delay={0.15} className="lg:col-span-5 h-full">
              <div className="rounded-3xl p-6 sm:p-8 bg-[#2a6b73] text-white border border-white/20 shadow-2xl relative overflow-hidden flex flex-col justify-between h-full">
                {/* Background ambient radial */}
                <div className="absolute top-0 end-0 w-64 h-64 bg-[radial-gradient(circle,rgba(95,212,189,0.15)_0%,transparent_70%)] pointer-events-none" />

                <div>
                  {/* Savings percentage badge */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <span className="text-xs text-white/85 font-semibold">{t.savingsRate}</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-sm border border-emerald-500/30">
                      -{savingsPct}% {lang === "ar" ? "توفير" : "Saved"}
                    </span>
                  </div>

                  {/* Main Highlight: Annual Savings */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <p className="text-xs text-white/75 mb-1">{t.annualSavings}</p>
                    <p className="text-3xl sm:text-4xl font-extrabold gradient-text-aurora font-mono tracking-tight">
                      {formatEGP(annualSavings, lang)}
                    </p>
                    <p className="text-[11px] text-white/75 mt-1">
                      {lang === "ar"
                        ? `وفر شهري مباشر بقيمة ${formatEGP(monthlySavings, lang)} داخل جيبك`
                        : `Direct monthly cash saved: ${formatEGP(monthlySavings, lang)}`}
                    </p>
                  </div>

                  {/* Cost comparison breakdown */}
                  <div className="space-y-3 text-xs mb-8">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/75">{t.currentCost}</span>
                      <span className="font-mono line-through text-rose-400 font-semibold">
                        {formatEGP(currentMonthlyCost, lang)} / {lang === "ar" ? "شهر" : "mo"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-white/75">
                        {t.arqflowCost} ({recommendedPlan.name})
                      </span>
                      <span className="font-mono text-teal-300 font-bold">
                        {formatEGP(recommendedPlan.fee, lang)} / {lang === "ar" ? "شهر" : "mo"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Call to action */}
                <Link
                  href="/onboarding"
                  className="btn-primary w-full !py-4 text-center justify-center font-bold text-sm shadow-xl shadow-teal-500/20"
                >
                  <span>{t.cta}</span>
                  <DirArrow />
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ROICalculator;
