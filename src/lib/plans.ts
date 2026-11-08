export type PlanId = "free_trial" | "starter" | "business" | "enterprise";

export type Plan = {
  id: PlanId;
  name: { ar: string; en: string };
  tagline: { ar: string; en: string };
  /** One-time setup fee (first payment only). */
  setupFee: number;
  /** Package price = the customer-facing wallet credit added each top-up. */
  monthlyFee: number;
  /** Wallet validity in days (bot stops when balance runs out OR this elapses). */
  validityDays: number;
  features: { ar: string[]; en: string[] };
  highlighted?: boolean;
  currency?: string;
};

/**
 * Static mirror of the `plans` table (single source of truth is Supabase).
 * Used for instant render on the pricing page & onboarding; dashboards read the DB.
 *
 * Billing model: token wallet. The customer pays the package price (monthlyFee),
 * which becomes a wallet of AI credit valid for `validityDays`. The bot consumes
 * the wallet by real token cost until it runs out or the validity elapses,
 * whichever comes first. Any unused balance rolls over on renewal/upgrade.
 */
export const PLANS: Plan[] = [
  {
    id: "free_trial",
    name: { ar: "تجربة مجانية", en: "Free Trial" },
    tagline: {
      ar: "جرب النظام بالكامل لمدة ٢٤ ساعة",
      en: "Try the full system for 24 hours",
    },
    setupFee: 0,
    monthlyFee: 0,
    validityDays: 1,
    features: {
      ar: [
        "رصيد لتجربة النظام",
        "صلاحية لمدة ٢٤ ساعة",
        "لوحة تحكم كاملة",
      ],
      en: [
        "Credit to try the system",
        "24-hour validity",
        "Full dashboard access",
      ],
    },
  },
  {
    id: "starter",
    name: { ar: "ستارتر", en: "Starter" },
    tagline: {
      ar: "للمحلات والعيادات اللي محتاجة رد ذكي سريع ومحترم",
      en: "For shops & clinics that need fast, polite AI replies",
    },
    setupFee: 2500,
    monthlyFee: 500,
    validityDays: 30,
    features: {
      ar: [
        "رصيد محادثات ذكية بقيمة الباقة — صلاحية ٣٠ يوم",
        "الرصيد المتبقي بيتجمّع مع التجديد",
        "محادثات نصية بالعربي والإنجليزي",
        "تحويل ذكي لموظف بشري",
        "تسجيل كل المحادثات والطلبات",
        "لوحة تحكم خاصة بنشاطك",
      ],
      en: [
        "AI conversation credit equal to the package — 30-day validity",
        "Unused balance rolls over on renewal",
        "Text conversations in Arabic & English",
        "Smart human handover",
        "Every conversation & order logged",
        "Your own client dashboard",
      ],
    },
  },
  {
    id: "business",
    name: { ar: "بيزنس", en: "Business" },
    tagline: {
      ar: "للمطاعم والمحلات اللي عايزة نظام يبيع ويحجز ويتابع لوحده",
      en: "For restaurants & stores that want a system that sells, books & follows up",
    },
    setupFee: 4000,
    monthlyFee: 1100,
    validityDays: 30,
    features: {
      ar: [
        "رصيد محادثات أكبر — صلاحية ٣٠ يوم والرصيد بيتجمّع",
        "موديل ذكاء أقوى (Sonnet)",
        "فهم الرسائل الصوتية",
        "استقبال الطلبات والحجوزات تلقائياً",
        "روابط ذكية (منيو، كتالوج، دفع)",
        "ذاكرة تفضيلات العملاء",
        "كل مميزات ستارتر",
      ],
      en: [
        "Bigger AI credit — 30-day validity, balance rolls over",
        "More capable model (Sonnet)",
        "Voice message understanding",
        "Automatic orders & bookings",
        "Smart links (menu, catalog, payment)",
        "Customer preference memory",
        "Everything in Starter",
      ],
    },
    highlighted: true,
  },
  {
    id: "enterprise",
    name: { ar: "إنتربرايز", en: "Enterprise" },
    tagline: {
      ar: "للشركات اللي محتاجة أقوى ذكاء وأعمق ذاكرة وتحليلات متقدمة",
      en: "For companies that need the deepest intelligence & analytics",
    },
    setupFee: 7000,
    monthlyFee: 1500,
    validityDays: 30,
    features: {
      ar: [
        "أكبر رصيد محادثات — صلاحية ٣٠ يوم والرصيد بيتجمّع",
        "فهم وتحليل الصور",
        "أعمق ذاكرة محادثة",
        "تحليلات وتقارير متقدمة",
        "بوت الموقع الإلكتروني (Web Widget)",
        "دعم ذو أولوية",
        "كل مميزات بيزنس",
      ],
      en: [
        "Largest AI credit — 30-day validity, balance rolls over",
        "Image understanding & analysis",
        "Deepest conversation memory",
        "Advanced analytics & reports",
        "Website Chatbot (Web Widget)",
        "Priority support",
        "Everything in Business",
      ],
    },
  },
];

export const getPlan = (id: string | null | undefined): Plan | undefined =>
  PLANS.find((p) => p.id === id);

/** First-payment total = one-time setup fee + the package wallet credit. */
export const planTotal = (p: Plan): number => p.setupFee + p.monthlyFee;

export type PaymentChannel = "instapay" | "vodafone_cash" | "wepay" | "bank_transfer" | "card";

export interface BankAccountDetails {
  enabled?: boolean;
  bank_name: string;
  account_holder: string;
  account_number: string;
  iban: string;
  swift?: string;
}

export interface CardPaymentDetails {
  enabled?: boolean;
  payment_link?: string;
  instructions?: string;
}

export interface PaymentAccountsConfig {
  instapay: {
    enabled: boolean;
    number: string;
    account_name?: string;
  };
  vodafone_cash: {
    enabled: boolean;
    number: string;
  };
  wepay: {
    enabled: boolean;
    number: string;
  };
  bank_transfer: BankAccountDetails;
  card: CardPaymentDetails;
  notice_ar?: string;
  notice_en?: string;
  currency?: string;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentAccountsConfig = {
  instapay: {
    enabled: true,
    number: "01029168056",
    account_name: "ArqFlow Tech",
  },
  vodafone_cash: {
    enabled: true,
    number: "01029168056",
  },
  wepay: {
    enabled: true,
    number: "01559041894",
  },
  bank_transfer: {
    enabled: false,
    bank_name: "البنك الأهلي المصري (NBE)",
    account_holder: "ArqFlow Technologies",
    account_number: "",
    iban: "",
    swift: "",
  },
  card: {
    enabled: false,
    payment_link: "",
    instructions: "ادفع أونلاين بالفيزا أو ماستركارد بأمان",
  },
  notice_ar: "بعد التحويل، يرجى كتابة رقم العملية المكون من 12 رقم ورفع صورة إيصال التحويل لتأكيد التفعيل فوراً.",
  notice_en: "After transferring, enter the 12-digit transaction reference and upload the receipt screenshot for instant activation.",
  currency: "EGP",
};

export const PAYMENT_ACCOUNTS: Record<
  "instapay" | "vodafone_cash" | "wepay",
  { label: { ar: string; en: string }; number: string }
> = {
  instapay: { label: { ar: "إنستاباي", en: "InstaPay" }, number: DEFAULT_PAYMENT_CONFIG.instapay.number },
  vodafone_cash: { label: { ar: "فودافون كاش", en: "Vodafone Cash" }, number: DEFAULT_PAYMENT_CONFIG.vodafone_cash.number },
  wepay: { label: { ar: "وي باي", en: "WE Pay" }, number: DEFAULT_PAYMENT_CONFIG.wepay.number },
};

export const SUPPORT_WHATSAPP = "201029168056";

/**
 * Safely parse and resolve payment accounts configuration from `app_settings`
 * handling backwards compatibility where values may be simple strings or legacy keys.
 */
export function resolvePaymentAccounts(
  settingsMap: Record<string, unknown> | null | undefined
): PaymentAccountsConfig {
  if (!settingsMap) return DEFAULT_PAYMENT_CONFIG;

  const raw = (settingsMap["payment_accounts"] ?? {}) as Record<string, unknown>;

  // InstaPay
  let instapayNumber = DEFAULT_PAYMENT_CONFIG.instapay.number;
  let instapayName = DEFAULT_PAYMENT_CONFIG.instapay.account_name ?? "";
  let instapayEnabled = DEFAULT_PAYMENT_CONFIG.instapay.enabled;

  if (typeof raw.instapay === "string") {
    instapayNumber = raw.instapay;
  } else if (raw.instapay && typeof raw.instapay === "object") {
    const obj = raw.instapay as Record<string, unknown>;
    instapayNumber = String(obj.number ?? instapayNumber);
    instapayName = String(obj.account_name ?? instapayName);
    instapayEnabled = obj.enabled !== false;
  } else if (settingsMap["payment_instapay"]) {
    instapayNumber = String(settingsMap["payment_instapay"]);
  }

  // Vodafone Cash
  let vodafoneNumber = DEFAULT_PAYMENT_CONFIG.vodafone_cash.number;
  let vodafoneEnabled = DEFAULT_PAYMENT_CONFIG.vodafone_cash.enabled;

  if (typeof raw.vodafone_cash === "string") {
    vodafoneNumber = raw.vodafone_cash;
  } else if (raw.vodafone_cash && typeof raw.vodafone_cash === "object") {
    const obj = raw.vodafone_cash as Record<string, unknown>;
    vodafoneNumber = String(obj.number ?? vodafoneNumber);
    vodafoneEnabled = obj.enabled !== false;
  } else if (settingsMap["payment_vodafone"]) {
    vodafoneNumber = String(settingsMap["payment_vodafone"]);
  }

  // WE Pay
  let wepayNumber = DEFAULT_PAYMENT_CONFIG.wepay.number;
  let wepayEnabled = DEFAULT_PAYMENT_CONFIG.wepay.enabled;

  if (typeof raw.wepay === "string") {
    wepayNumber = raw.wepay;
  } else if (raw.wepay && typeof raw.wepay === "object") {
    const obj = raw.wepay as Record<string, unknown>;
    wepayNumber = String(obj.number ?? wepayNumber);
    wepayEnabled = obj.enabled !== false;
  } else if (settingsMap["payment_wepay"]) {
    wepayNumber = String(settingsMap["payment_wepay"]);
  }

  // Bank Transfer
  const bankRaw = (raw.bank_transfer ?? {}) as Record<string, unknown>;
  const bankTransfer: BankAccountDetails = {
    enabled: Boolean(bankRaw.enabled),
    bank_name: String(bankRaw.bank_name ?? DEFAULT_PAYMENT_CONFIG.bank_transfer.bank_name),
    account_holder: String(bankRaw.account_holder ?? DEFAULT_PAYMENT_CONFIG.bank_transfer.account_holder),
    account_number: String(bankRaw.account_number ?? ""),
    iban: String(bankRaw.iban ?? ""),
    swift: String(bankRaw.swift ?? ""),
  };

  // Card / Visa
  const cardRaw = (raw.card ?? {}) as Record<string, unknown>;
  const card: CardPaymentDetails = {
    enabled: Boolean(cardRaw.enabled),
    payment_link: String(cardRaw.payment_link ?? ""),
    instructions: String(cardRaw.instructions ?? DEFAULT_PAYMENT_CONFIG.card.instructions),
  };

  return {
    instapay: { enabled: instapayEnabled, number: instapayNumber, account_name: instapayName },
    vodafone_cash: { enabled: vodafoneEnabled, number: vodafoneNumber },
    wepay: { enabled: wepayEnabled, number: wepayNumber },
    bank_transfer: bankTransfer,
    card,
    notice_ar: String(raw.notice_ar ?? DEFAULT_PAYMENT_CONFIG.notice_ar),
    notice_en: String(raw.notice_en ?? DEFAULT_PAYMENT_CONFIG.notice_en),
    currency: String(settingsMap["currency"] ?? raw.currency ?? "EGP"),
  };
}

/**
 * Maps database rows from the `plans` table to the UI `Plan` shape,
 * preserving existing marketing taglines from static mirror where available.
 */
export function mapDbPlanToMarketingPlan(
  dbPlan: {
    id: string;
    name: string;
    name_ar: string;
    setup_fee_egp: number;
    monthly_fee_egp: number;
    validity_days: number;
    features: unknown;
    features_ar: unknown;
    highlighted?: boolean;
  },
  currency: string = "EGP"
): Plan {
  const staticFallback = getPlan(dbPlan.id);

  const featuresEn = Array.isArray(dbPlan.features)
    ? (dbPlan.features as string[])
    : staticFallback?.features.en ?? [];
  const featuresAr = Array.isArray(dbPlan.features_ar)
    ? (dbPlan.features_ar as string[])
    : staticFallback?.features.ar ?? [];

  return {
    id: dbPlan.id as PlanId,
    name: {
      ar: dbPlan.name_ar || staticFallback?.name.ar || dbPlan.name,
      en: dbPlan.name || staticFallback?.name.en || dbPlan.id,
    },
    tagline: staticFallback?.tagline ?? {
      ar: featuresAr[0] ?? "",
      en: featuresEn[0] ?? "",
    },
    setupFee: Number(dbPlan.setup_fee_egp ?? staticFallback?.setupFee ?? 0),
    monthlyFee: Number(dbPlan.monthly_fee_egp ?? staticFallback?.monthlyFee ?? 0),
    validityDays: Number(dbPlan.validity_days ?? staticFallback?.validityDays ?? 30),
    features: {
      ar: featuresAr,
      en: featuresEn,
    },
    highlighted: dbPlan.highlighted ?? staticFallback?.highlighted ?? false,
    currency,
  };
}

