"use client";

import { useState } from "react";
import { Hammer, RefreshCcw, Wallet, Landmark, CreditCard, Smartphone, Copy, Check, ExternalLink } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import {
  PLANS,
  DEFAULT_PAYMENT_CONFIG,
  type Plan,
  type PaymentAccountsConfig,
} from "@/lib/plans";
import {
  Reveal,
  PageHero,
  SectionHeading,
  Accordion,
  PlanCard,
  CTABanner,
} from "@/components/marketing/Shared";

function FeesExplainer() {
  const t = useT({
    ar: {
      badge: "إزاي بتدفع",
      title: "رسوم تأسيس مرة واحدة + رصيد محادثات — وخلاص",
      setupH: "رسوم التأسيس (مرة واحدة)",
      setupP: "دي تكلفة بناء وكيلك الخاص: تجهيز قاعدة المعرفة من بيانات نشاطك، إنشاء مسار الأتمتة الخاص بيك، ربط الواتساب، وتسليمك لوحة التحكم. بتتدفع مرة واحدة بس عند الاشتراك.",
      monthlyH: "رصيد المحادثات",
      monthlyP: "بتدفع قيمة الباقة فتتحول لرصيد ذكاء اصطناعي، والبوت بيرد من الرصيد ده لحد ما يخلص أو تعدّي ٣٠ يوم — أيهما أقرب. تقدر تجدد أو ترقّي في أي وقت، وأي رصيد متبقي بيتجمّع.",
    },
    en: {
      badge: "How you pay",
      title: "One setup fee + a conversation balance — that's it",
      setupH: "Setup fee (one time)",
      setupP: "This covers building your private agent: preparing the knowledge base from your business data, creating your dedicated automation flow, connecting WhatsApp, and handing over your dashboard. Paid once at subscription.",
      monthlyH: "Conversation balance",
      monthlyP: "You pay the package price, which becomes an AI credit balance. The bot replies from that balance until it runs out or 30 days pass — whichever comes first. Renew or upgrade anytime, and any leftover balance rolls over.",
    },
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SectionHeading badge={t.badge} title={t.title} />
      <div className="grid sm:grid-cols-2 gap-5 mt-10 max-w-4xl mx-auto">
        <Reveal>
          <div className="card card-hover p-6 sm:p-7 h-full">
            <span className="w-11 h-11 icon-chip mb-4">
              <Hammer className="w-5 h-5" aria-hidden />
            </span>
            <h3 className="font-bold text-lg">{t.setupH}</h3>
            <p className="text-muted text-sm mt-2 leading-relaxed">{t.setupP}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="card card-hover p-6 sm:p-7 h-full">
            <span className="w-11 h-11 icon-chip mb-4">
              <RefreshCcw className="w-5 h-5" aria-hidden />
            </span>
            <h3 className="font-bold text-lg">{t.monthlyH}</h3>
            <p className="text-muted text-sm mt-2 leading-relaxed">{t.monthlyP}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PaymentMethods({ config }: { config: PaymentAccountsConfig }) {
  const { lang } = useLang();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const t = useT({
    ar: {
      title: "طرق الدفع المتاحة",
      sub: "اختر الطريقة الأنسب لك: تحويل بنكي، فيزا وكروت دفع، إنستاباي، أو محافظ إلكترونية.",
      copied: "تم النسخ بنجاح!",
      bankH: "التحويل البنكي المباشر (Bank Transfer)",
      bankName: "البنك:",
      holder: "المستفيد:",
      accNum: "رقم الحساب:",
      iban: "الآيبان الدولي:",
      cardH: "الدفع بالفيزا والبطاقة البنكية",
      payOnline: "الدفع أونلاين الآن",
      instapayH: "إنستاباي (InstaPay)",
      walletsH: "محافظ الكاش والمحمول",
      notice: "بعد إتمام التحويل، يرجى إرفاق صورة إيصال الدفع ورقم العملية عند التسجيل لتأكيد تفعيل الحساب فوراً.",
    },
    en: {
      title: "Available Payment Methods",
      sub: "Choose the most convenient method: Bank transfer, Credit Card, InstaPay, or Mobile wallets.",
      copied: "Copied successfully!",
      bankH: "Bank Account Transfer",
      bankName: "Bank:",
      holder: "Beneficiary:",
      accNum: "Account No:",
      iban: "IBAN:",
      cardH: "Credit / Debit Card (Visa & Mastercard)",
      payOnline: "Pay Online Now",
      instapayH: "InstaPay",
      walletsH: "Mobile Wallets",
      notice: "After completing your transfer, attach the receipt screenshot and transaction reference during checkout for instant activation.",
    },
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasBank = config.bank_transfer?.enabled || !!config.bank_transfer?.account_number;
  const hasCard = config.card?.enabled || !!config.card?.payment_link;
  const hasInstapay = config.instapay?.enabled !== false && !!config.instapay?.number;
  const hasVodafone = config.vodafone_cash?.enabled !== false && !!config.vodafone_cash?.number;
  const hasWepay = config.wepay?.enabled !== false && !!config.wepay?.number;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
      <Reveal>
        <div className="glass p-6 sm:p-10 rounded-2xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="font-extrabold text-2xl flex items-center justify-center gap-2">
              <Wallet className="w-6 h-6 text-accent" aria-hidden /> {t.title}
            </h2>
            <p className="text-muted text-sm mt-2">{t.sub}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Bank Transfer */}
            {hasBank && (
              <div className="glass-strong p-6 rounded-xl border border-accent/20 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-2 rounded-lg bg-accent/10 text-accent">
                      <Landmark className="w-5 h-5" />
                    </span>
                    <h3 className="font-bold text-base">{t.bankH}</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-app">
                      <span className="text-muted">{t.bankName}</span>
                      <span className="font-semibold text-app">{config.bank_transfer.bank_name}</span>
                    </div>
                    {config.bank_transfer.account_holder && (
                      <div className="flex justify-between py-1 border-b border-app">
                        <span className="text-muted">{t.holder}</span>
                        <span className="font-semibold text-app">{config.bank_transfer.account_holder}</span>
                      </div>
                    )}
                    {config.bank_transfer.account_number && (
                      <div className="flex items-center justify-between py-1 border-b border-app">
                        <span className="text-muted">{t.accNum}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-accent" dir="ltr">{config.bank_transfer.account_number}</span>
                          <button
                            onClick={() => copyToClipboard(config.bank_transfer.account_number, "acc")}
                            className="p-1 text-muted hover:text-accent transition"
                            title="Copy Account Number"
                          >
                            {copiedKey === "acc" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {config.bank_transfer.iban && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted">{t.iban}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-semibold text-app truncate max-w-[170px]" dir="ltr">
                            {config.bank_transfer.iban}
                          </span>
                          <button
                            onClick={() => copyToClipboard(config.bank_transfer.iban, "iban")}
                            className="p-1 text-muted hover:text-accent transition"
                            title="Copy IBAN"
                          >
                            {copiedKey === "iban" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Credit / Debit Card */}
            {hasCard && (
              <div className="glass-strong p-6 rounded-xl border border-accent/20 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-2 rounded-lg bg-accent/10 text-accent">
                      <CreditCard className="w-5 h-5" />
                    </span>
                    <h3 className="font-bold text-base">{t.cardH}</h3>
                  </div>
                  <p className="text-muted text-xs leading-relaxed">
                    {config.card.instructions || (lang === "ar" ? "ادفع بالفيزا أو ماستركارد بأمان عبر بوابتنا المعتمدة." : "Pay securely using Visa or Mastercard.")}
                  </p>
                </div>
                {config.card.payment_link && (
                  <a
                    href={config.card.payment_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline w-full text-xs flex items-center justify-center gap-1.5"
                  >
                    <span>{t.payOnline}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {/* 3. InstaPay */}
            {hasInstapay && (
              <div className="glass-strong p-6 rounded-xl border border-accent/20 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-2 rounded-lg bg-accent/10 text-accent">
                      <Smartphone className="w-5 h-5" />
                    </span>
                    <h3 className="font-bold text-base">{t.instapayH}</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-app">
                      <span className="text-muted">{lang === "ar" ? "رقم التحويل / IPA:" : "Handle / Phone:"}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-accent" dir="ltr">{config.instapay.number}</span>
                        <button
                          onClick={() => copyToClipboard(config.instapay.number, "insta")}
                          className="p-1 text-muted hover:text-accent transition"
                          title="Copy"
                        >
                          {copiedKey === "insta" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    {config.instapay.account_name && (
                      <div className="flex justify-between py-1">
                        <span className="text-muted">{lang === "ar" ? "الاسم:" : "Name:"}</span>
                        <span className="font-semibold text-app">{config.instapay.account_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. Mobile Wallets (Vodafone & WE Pay) */}
            {(hasVodafone || hasWepay) && (
              <div className="glass-strong p-6 rounded-xl border border-accent/20 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="p-2 rounded-lg bg-accent/10 text-accent">
                      <Wallet className="w-5 h-5" />
                    </span>
                    <h3 className="font-bold text-base">{t.walletsH}</h3>
                  </div>
                  <div className="space-y-2 text-xs">
                    {hasVodafone && (
                      <div className="flex items-center justify-between py-1 border-b border-app">
                        <span className="text-muted">{lang === "ar" ? "فودافون كاش:" : "Vodafone Cash:"}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-accent" dir="ltr">{config.vodafone_cash.number}</span>
                          <button
                            onClick={() => copyToClipboard(config.vodafone_cash.number, "voda")}
                            className="p-1 text-muted hover:text-accent transition"
                            title="Copy"
                          >
                            {copiedKey === "voda" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {hasWepay && (
                      <div className="flex items-center justify-between py-1">
                        <span className="text-muted">{lang === "ar" ? "وي باي:" : "WE Pay:"}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-accent" dir="ltr">{config.wepay.number}</span>
                          <button
                            onClick={() => copyToClipboard(config.wepay.number, "we")}
                            className="p-1 text-muted hover:text-accent transition"
                            title="Copy"
                          >
                            {copiedKey === "we" ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-muted max-w-xl mx-auto bg-[rgba(14,32,56,0.03)] p-3 rounded-lg border border-app">
            {lang === "ar" ? (config.notice_ar || t.notice) : (config.notice_en || t.notice)}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function PricingFaq() {
  const t = useT({
    ar: {
      badge: "أسئلة الأسعار",
      title: "أسئلة شائعة عن الدفع والباقات",
      items: [
        {
          q: "لو خلص رصيدي قبل آخر الـ٣٠ يوم؟",
          a: "هنبعتلك تنبيهات قبل ما الرصيد يخلص. والبوت بيقف يرد لما الرصيد يخلص أو تعدّي ٣٠ يوم. تقدر تجدد أو ترقّي في أي لحظة بنفس طريقة الدفع، والرصيد المتبقي بيتجمّع مع الجديد.",
        },
        {
          q: "هل أقدر أغيّر الباقة بعدين؟",
          a: "أيوه، تقدر تترقى أو تنزل لباقة تانية في أي وقت — بتدفع قيمة الباقة الجديدة بس، من غير رسوم تأسيس جديدة، وأي رصيد متبقي بيتضاف للرصيد الجديد.",
        },
        {
          q: "إيه سياسة الاسترداد؟",
          a: "رسوم التأسيس غير قابلة للاسترداد بعد ما يتم تجهيز وكيلك وتشغيله، لأنها مقابل شغل بيتنفذ فعلاً. رصيد المحادثات بيتستهلك بالاستخدام وصالح ٣٠ يوم من تاريخ الدفع.",
        },
        {
          q: "هل في رسوم مخفية أو تكلفة بالدولار؟",
          a: "لأ. بتدفع قيمة الباقة بالجنيه المصري وهي رصيدك، والبوت بيرد من الرصيد ده. مفيش رسوم مخفية ولا مفاجآت بسعر صرف.",
        },
      ],
    },
    en: {
      badge: "Pricing FAQ",
      title: "Common questions about payment and plans",
      items: [
        {
          q: "What if my balance runs out before the 30 days end?",
          a: "We notify you before the balance runs low. The bot stops replying once the balance is used up or 30 days pass. You can renew or upgrade anytime using the same payment flow, and any leftover balance rolls over.",
        },
        {
          q: "Can I change my plan later?",
          a: "Yes, you can upgrade or downgrade anytime — you only pay the new package price, with no new setup fee, and any leftover balance is added to the new one.",
        },
        {
          q: "What is the refund policy?",
          a: "The setup fee is non-refundable once your agent has been provisioned and activated, since it pays for work that's actually performed. The conversation balance is consumed by usage and is valid for 30 days from payment.",
        },
        {
          q: "Are there hidden fees or dollar-based costs?",
          a: "No. You pay the package price in EGP and that's your balance — the bot replies from it. No hidden fees and no exchange-rate surprises.",
        },
      ],
    },
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SectionHeading badge={t.badge} title={t.title} />
      <Reveal className="max-w-3xl mx-auto mt-10">
        <Accordion items={t.items} idPrefix="pricing-faq" />
      </Reveal>
    </section>
  );
}

function PlanComparisonTable() {
  const { lang } = useLang();
  const t = useT({
    ar: {
      badge: "مقارنة دقيقة",
      title: "مقارنة المزايا بين كافة الباقات",
      swipeHint: "اسحب أفقياً لمقارنة كافة الباقات ⟵",
      feature: "الميزة أو الخاصية",
      starter: "الأساسية (Starter)",
      business: "الشركات (Business)",
      enterprise: "المؤسسات (Enterprise)",
      rows: [
        { f: "رقم واتساب مخصص لنشاطك", s: "✓", b: "✓", e: "✓" },
        { f: "التدريب على كتالوج وقائمة أسعار نشاطك", s: "✓", b: "✓", e: "✓" },
        { f: "ميزانية استهلاك التوكنز التقديرية", s: "~800 محادثة", b: "~2,500 محادثة", e: "~7,000+ محادثة" },
        { f: "مزامنة تلقائية مع Google Sheets", s: "—", b: "✓", e: "✓" },
        { f: "الربط مع CRM و Webhooks مخصصة", s: "—", b: "✓", e: "✓" },
        { f: "فهم الصور والملفات الصوتية", s: "—", b: "✓", e: "✓" },
        { f: "تصعيد ذكي ومباشر لموظف بشري", s: "✓", b: "✓", e: "✓" },
        { f: "لوحة تحكم وتحليلات لحظية", s: "✓", b: "✓", e: "✓" },
        { f: "مدير حساب ودعم فني مخصص VIP", s: "—", b: "—", e: "✓" },
        { f: "ترحيل رصيد التوكنز المتبقي عند التجديد", s: "✓", b: "✓", e: "✓" },
      ],
    },
    en: {
      badge: "Feature Matrix",
      title: "Detailed Plan Comparison",
      swipeHint: "Swipe horizontally to compare all plans ⟶",
      feature: "Feature",
      starter: "Starter",
      business: "Business (Popular)",
      enterprise: "Enterprise",
      rows: [
        { f: "Dedicated WhatsApp Number Integration", s: "✓", b: "✓", e: "✓" },
        { f: "Custom Business Knowledge Base Training", s: "✓", b: "✓", e: "✓" },
        { f: "Estimated Token Conversation Budget", s: "~800 chats", b: "~2,500 chats", e: "~7,000+ chats" },
        { f: "Real-Time Google Sheets Sync", s: "—", b: "✓", e: "✓" },
        { f: "CRM & Custom Webhook Integrations", s: "—", b: "✓", e: "✓" },
        { f: "Voice Note & Document Analysis", s: "—", b: "✓", e: "✓" },
        { f: "Smart Human Agent Escalation", s: "✓", b: "✓", e: "✓" },
        { f: "Live Real-Time Analytics Dashboard", s: "✓", b: "✓", e: "✓" },
        { f: "Dedicated VIP Account Manager", s: "—", b: "—", e: "✓" },
        { f: "Unused Token Rollover on Renewal", s: "✓", b: "✓", e: "✓" },
      ],
    },
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      <SectionHeading badge={t.badge} title={t.title} />

      {/* Mobile swipe hint */}
      <div className="flex sm:hidden items-center justify-center gap-1.5 text-xs text-muted mt-8 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
        <span className="font-medium">{t.swipeHint}</span>
      </div>

      <div
        className="mt-4 sm:mt-12 overflow-x-auto overscroll-x-contain touch-pan-x -mx-4 sm:mx-0 px-4 sm:px-0"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="min-w-[620px] glass-strong card-elevated rounded-2xl border border-app overflow-hidden">
          <table className="w-full text-start text-sm">
            <thead>
              <tr className="border-b border-app bg-solid/60">
                <th className="py-4 px-4 sm:px-6 font-bold text-app text-start w-2/5 sticky start-0 bg-[var(--bg)] sm:bg-transparent z-10 border-e sm:border-e-0 border-app/40">
                  {t.feature}
                </th>
                <th className="py-4 px-4 font-bold text-muted text-center w-1/5">{t.starter}</th>
                <th className="py-4 px-4 font-bold text-accent text-center w-1/5 bg-[rgba(var(--accent-rgb),0.08)]">
                  {t.business} ✦
                </th>
                <th className="py-4 px-4 font-bold text-muted text-center w-1/5">{t.enterprise}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app">
              {t.rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-solid/30 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-app sticky start-0 bg-[var(--bg)] sm:bg-transparent z-10 border-e sm:border-e-0 border-app/40 text-xs sm:text-sm">
                    {row.f}
                  </td>
                  <td className="py-3.5 px-4 text-center text-muted font-mono text-xs sm:text-sm">{row.s}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-accent font-mono text-xs sm:text-sm bg-[rgba(var(--accent-rgb),0.03)]">
                    {row.b}
                  </td>
                  <td className="py-3.5 px-4 text-center text-muted font-mono text-xs sm:text-sm">{row.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

interface PricingClientProps {
  plans?: Plan[];
  paymentConfig?: PaymentAccountsConfig;
}

export default function PricingClient({
  plans = PLANS,
  paymentConfig = DEFAULT_PAYMENT_CONFIG,
}: PricingClientProps) {
  const t = useT({
    ar: {
      badge: "الأسعار",
      title: "باقة لكل حجم بيزنس — وكلها بالجنيه",
      sub: "اختار الباقة، ادفع رسوم التأسيس + رصيد الباقة، وبوتك يشتغل في دقايق. البوت بيرد من رصيدك (صالح ٣٠ يوم) وتقدر تجدد أو ترقّي في أي وقت.",
    },
    en: {
      badge: "Pricing",
      title: "A plan for every business size — all in EGP",
      sub: "Pick a plan, pay the setup fee + the package balance, and your bot is live in minutes. The bot replies from your balance (valid 30 days) — renew or upgrade anytime.",
    },
  });

  const displayPlans = plans.filter((p) => p.id !== "free_trial");

  return (
    <>
      <PageHero badge={t.badge} title={t.title} subtitle={t.sub} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid lg:grid-cols-3 gap-6 items-stretch pt-4">
          {displayPlans.map((p, i) => (
            <PlanCard key={p.id} plan={p} delay={i * 0.1} detailed />
          ))}
        </div>
      </section>
      <PlanComparisonTable />
      <FeesExplainer />
      <PaymentMethods config={paymentConfig} />
      <PricingFaq />
      <CTABanner />
    </>
  );
}
