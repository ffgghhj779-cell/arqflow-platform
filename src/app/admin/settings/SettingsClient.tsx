"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Save, AlertTriangle, UserPlus, Trash2, CreditCard, Landmark,
  Smartphone, Wallet, ArrowUpRight, DollarSign, CheckCircle2,
  Info, ShieldCheck
} from "lucide-react";
import { Field, Badge } from "@/components/ui";
import { formatDate, setRuntimeCurrency, formatEGP } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { resolvePaymentAccounts, type PaymentAccountsConfig } from "@/lib/plans";

type Admin = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
};

interface Props {
  settingsMap: Record<string, unknown>;
  admins: Admin[];
}

export default function SettingsClient({ settingsMap, admins: initialAdmins }: Props) {
  const { success, error } = useToast();
  const [saving, setSaving] = useState<string | null>(null);

  // Initialize payment settings using the safe resolver
  const initialPaymentConfig = resolvePaymentAccounts(settingsMap);
  const [paymentConfig, setPaymentConfig] = useState<PaymentAccountsConfig>(initialPaymentConfig);

  // General settings
  const [currency, setCurrency] = useState(String(settingsMap["currency"] ?? initialPaymentConfig.currency ?? "EGP"));
  const [n8nWebhook, setN8nWebhook] = useState(String(settingsMap["n8n_factory_webhook"] ?? ""));
  const [supportWhatsapp, setSupportWhatsapp] = useState(String(settingsMap["support_whatsapp"] ?? ""));
  const [taxRate, setTaxRate] = useState(String(settingsMap["tax_rate"] ?? "0.14"));
  const [usdRate, setUsdRate] = useState(String(settingsMap["usd_to_egp"] ?? "50"));
  const [maintenanceMode, setMaintenanceMode] = useState(settingsMap["maintenance_mode"] === true);

  // Admin management
  const [admins, setAdmins] = useState(initialAdmins);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  async function saveSetting(key: string, value: unknown, label: string) {
    setSaving(key);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      success(`${label} saved`);
    } catch (e) {
      error("Save failed", (e as Error).message);
    } finally {
      setSaving(null);
    }
  }

  async function saveCurrency(targetCurr?: string) {
    const newCurr = (targetCurr ?? currency).trim().toUpperCase();
    if (!newCurr) return;

    setSaving("currency");
    try {
      // 1. Update UI state immediately
      setCurrency(newCurr);
      setRuntimeCurrency(newCurr);
      setPaymentConfig((prev) => ({ ...prev, currency: newCurr }));

      // 2. Persist to app_settings key "currency"
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "currency", value: newCurr }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save currency");

      // 3. Keep payment_accounts currency in sync
      await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "payment_accounts",
          value: { ...paymentConfig, currency: newCurr },
        }),
      });

      // 4. Update browser cookie for immediate reactivity across pages
      if (typeof document !== "undefined") {
        document.cookie = `arqflow_currency=${encodeURIComponent(newCurr)}; path=/; max-age=31536000; SameSite=Lax`;
      }

      success(`تم تعيين وحفظ العملة إلى ${newCurr} بنجاح`, `Currency updated to ${newCurr}`);
    } catch (e) {
      error("فشل حفظ العملة", (e as Error).message);
    } finally {
      setSaving(null);
    }
  }

  async function saveAllPaymentSettings() {
    setSaving("payments");
    try {
      const fullConfig = {
        ...paymentConfig,
        currency,
      };

      // Sync runtime currency and cookie
      setRuntimeCurrency(currency);
      if (typeof document !== "undefined") {
        document.cookie = `arqflow_currency=${encodeURIComponent(currency)}; path=/; max-age=31536000; SameSite=Lax`;
      }

      // 1. Save full `payment_accounts` object
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "payment_accounts",
          value: fullConfig,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");

      // 2. Also keep legacy string keys in sync for older endpoints
      await Promise.all([
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "payment_instapay", value: paymentConfig.instapay.number }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "payment_vodafone", value: paymentConfig.vodafone_cash.number }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "payment_wepay", value: paymentConfig.wepay.number }),
        }),
        fetch("/api/admin/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "currency", value: currency }),
        }),
      ]);

      success("Payment & currency accounts saved successfully");
    } catch (e) {
      error("Save failed", (e as Error).message);
    } finally {
      setSaving(null);
    }
  }

  async function inviteAdmin() {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const { admin } = await res.json();
      setAdmins((prev) => [...prev, admin]);
      setInviteEmail("");
      success("Admin invited", inviteEmail);
    } catch (e) {
      error("Invite failed", (e as Error).message);
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Quick link to Pricing & Plans management */}
      <div className="card p-5 bg-gradient-to-r from-accent/10 via-[rgba(14,32,56,0.04)] to-transparent border-accent/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" />
            باقات الأسعار والخطط (Pricing Plans)
          </h3>
          <p className="text-muted text-xs mt-1">
            الأسعار ورسوم التأسيس ومميزات كل باقة مربوطة بقاعدة البيانات وتتحكم بها من صفحة الخطط وتنعكس تلقائياً في صفحة الأسعار.
          </p>
        </div>
        <Link href="/admin/plans" className="btn-primary text-sm shrink-0 flex items-center gap-1.5 self-start sm:self-auto">
          <span>إدارة أسعار الباقات</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Currency & Billing Settings */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-app pb-3 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-lg">Currency & Billing / إعدادات العملة والتسعير</h3>
            <p className="text-muted text-xs mt-0.5">
              العملة الرسمية للمنصة (تنعكس فوراً على صفحة الأسعار والتسجيل ولوحة التحكم)، وسعر الصرف، ونسبة الضريبة
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">العملة النشطة:</span>
            <Badge variant="accent" className="font-mono text-sm px-3 py-1 font-bold">
              {currency}
            </Badge>
          </div>
        </div>

        {/* Currency Quick Selection Pills */}
        <div className="p-4 rounded-xl bg-[rgba(14,32,56,0.03)] border border-app space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-muted">اختيار سريع للعملة (اضغط لتفعيلها فوراً):</span>
            <span className="text-xs text-muted font-mono">
              معاينة الأسعار: <span className="font-bold text-accent">{formatEGP(1500, "ar", currency)}</span> ({formatEGP(1500, "en", currency)})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { code: "SAR", label: "ريال سعودي", flag: "🇸🇦" },
              { code: "EGP", label: "جنيه مصري", flag: "🇪🇬" },
              { code: "AED", label: "درهم إماراتي", flag: "🇦🇪" },
              { code: "USD", label: "دولار أمريكي", flag: "🇺🇸" },
              { code: "KWD", label: "دينار كويتي", flag: "🇰🇼" },
              { code: "QAR", label: "ريال قطري", flag: "🇶🇦" },
              { code: "BHD", label: "دينار بحريني", flag: "🇧🇭" },
              { code: "OMR", label: "ريال عماني", flag: "🇴🇲" },
              { code: "EUR", label: "يورو", flag: "🇪🇺" },
            ].map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => saveCurrency(c.code)}
                  disabled={saving === "currency"}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? "bg-accent text-white border-accent shadow-sm scale-105"
                      : "bg-surface hover:bg-hover border-app text-muted hover:text-app"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span className="font-bold font-mono">{c.code}</span>
                  <span className="opacity-80">({c.label})</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ms-1" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Custom Currency / رمز عملة مخصص" hint="أو اكتب رمز عملتك واضغط حفظ (مثل SAR, EGP, AED)">
            <div className="flex gap-2">
              <input
                type="text"
                className="input-base font-mono uppercase"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="SAR"
                maxLength={4}
              />
              <button
                type="button"
                onClick={() => saveCurrency(currency)}
                disabled={saving === "currency"}
                className="btn-primary shrink-0 !px-4 text-xs flex items-center gap-1.5"
                title="حفظ العملة"
              >
                <Save className="w-3.5 h-3.5" />
                {saving === "currency" ? "جاري..." : "حفظ"}
              </button>
            </div>
          </Field>

          <Field label="USD → Local Rate / سعر الصرف" hint="يحسب تكلفة استهلاك التوكينز بالعملة المحلية">
            <div className="flex gap-2">
              <input
                type="number"
                className="input-base"
                value={usdRate}
                onChange={(e) => setUsdRate(e.target.value)}
              />
              <button
                onClick={() => saveSetting("usd_to_egp", Number(usdRate), "USD Rate")}
                disabled={saving === "usd_to_egp"}
                className="btn-outline shrink-0 !px-3"
                title="Save USD Rate"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </Field>

          <Field label="Tax Rate / الضريبة" hint="e.g. 0.14 = 14%">
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                className="input-base"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              />
              <button
                onClick={() => saveSetting("tax_rate", Number(taxRate), "Tax Rate")}
                disabled={saving === "tax_rate"}
                className="btn-outline shrink-0 !px-3"
                title="Save Tax Rate"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          </Field>
        </div>
      </div>

      {/* Payment Accounts / طرق وحسابات الدفع */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-app pb-3">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-accent" />
              Payment Methods & Accounts / طرق وحسابات الدفع
            </h3>
            <p className="text-muted text-xs mt-1">
              البيانات والحسابات التي يحول عليها العميل وتظهر في صفحة الأسعار والتسجيل والدفع
            </p>
          </div>
          <button
            onClick={saveAllPaymentSettings}
            disabled={saving === "payments"}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {saving === "payments" ? "Saving..." : "حفظ كل إعدادات الدفع"}
          </button>
        </div>

        {/* 1. Bank Account Transfer (حساب بنكي) */}
        <div className="p-4 rounded-xl border border-app bg-[rgba(14,32,56,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-accent/10 text-accent">
                <Landmark className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm">الحساب البنكي (Bank Account Transfer)</h4>
                <p className="text-muted text-xs">تحويل بنكي مباشر / IBAN</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <span>{paymentConfig.bank_transfer.enabled ? "مفعل" : "معطل"}</span>
              <input
                type="checkbox"
                checked={!!paymentConfig.bank_transfer.enabled}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    bank_transfer: { ...prev.bank_transfer, enabled: e.target.checked },
                  }))
                }
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Field label="اسم البنك (Bank Name)">
              <input
                type="text"
                className="input-base"
                value={paymentConfig.bank_transfer.bank_name}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    bank_transfer: { ...prev.bank_transfer, bank_name: e.target.value },
                  }))
                }
                placeholder="مثال: البنك الأهلي المصري (NBE) أو CIB"
              />
            </Field>

            <Field label="اسم صاحب الحساب (Account Holder Name)">
              <input
                type="text"
                className="input-base"
                value={paymentConfig.bank_transfer.account_holder}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    bank_transfer: { ...prev.bank_transfer, account_holder: e.target.value },
                  }))
                }
                placeholder="اسم الشركة أو المستفيد"
              />
            </Field>

            <Field label="رقم الحساب (Account Number)">
              <input
                type="text"
                className="input-base font-mono"
                value={paymentConfig.bank_transfer.account_number}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    bank_transfer: { ...prev.bank_transfer, account_number: e.target.value },
                  }))
                }
                placeholder="1234567890123"
              />
            </Field>

            <Field label="رقم الآيبان (IBAN)">
              <input
                type="text"
                className="input-base font-mono"
                value={paymentConfig.bank_transfer.iban}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    bank_transfer: { ...prev.bank_transfer, iban: e.target.value },
                  }))
                }
                placeholder="EG120000000000000000000000"
              />
            </Field>

            <Field label="سويفت كود (Swift Code - اختياري)">
              <input
                type="text"
                className="input-base font-mono"
                value={paymentConfig.bank_transfer.swift ?? ""}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    bank_transfer: { ...prev.bank_transfer, swift: e.target.value },
                  }))
                }
                placeholder="NBEGEGCX..."
              />
            </Field>
          </div>
        </div>

        {/* 2. Credit Card / Visa (فيزا / ماستركارد) */}
        <div className="p-4 rounded-xl border border-app bg-[rgba(14,32,56,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-accent/10 text-accent">
                <CreditCard className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm">البطاقة البنكية / فيزا (Card & Visa Payment)</h4>
                <p className="text-muted text-xs">رابط بوابة دفع أونلاين أو تعليمات ربط البطاقة</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <span>{paymentConfig.card.enabled ? "مفعل" : "معطل"}</span>
              <input
                type="checkbox"
                checked={!!paymentConfig.card.enabled}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    card: { ...prev.card, enabled: e.target.checked },
                  }))
                }
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Field label="رابط بوابة الدفع الإلكتروني (Checkout / Payment Link)" hint="رابط دفع مباشر من بوابة الدفع (مثل Paymob أو Stripe أو فوري)">
              <input
                type="url"
                className="input-base"
                value={paymentConfig.card.payment_link ?? ""}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    card: { ...prev.card, payment_link: e.target.value },
                  }))
                }
                placeholder="https://accept.paymob.com/... أو رابط الدفع"
              />
            </Field>

            <Field label="تعليمات الدفع بالبطاقة (Card Instructions)">
              <input
                type="text"
                className="input-base"
                value={paymentConfig.card.instructions ?? ""}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    card: { ...prev.card, instructions: e.target.value },
                  }))
                }
                placeholder="ادفع بالفيزا أو ماستركارد بأمان عبر بوابتنا المعتمدة"
              />
            </Field>
          </div>
        </div>

        {/* 3. InstaPay (إنستاباي) */}
        <div className="p-4 rounded-xl border border-app bg-[rgba(14,32,56,0.02)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-accent/10 text-accent">
                <Smartphone className="w-5 h-5" />
              </span>
              <div>
                <h4 className="font-bold text-sm">إنستاباي (InstaPay)</h4>
                <p className="text-muted text-xs">تحويل لحظي بالرقم أو عنوان IPA</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <span>{paymentConfig.instapay.enabled ? "مفعل" : "معطل"}</span>
              <input
                type="checkbox"
                checked={!!paymentConfig.instapay.enabled}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    instapay: { ...prev.instapay, enabled: e.target.checked },
                  }))
                }
                className="rounded border-gray-300 text-accent focus:ring-accent"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Field label="رقم هاتف إنستاباي أو عنوان الـ IPA">
              <input
                type="text"
                className="input-base font-mono"
                value={paymentConfig.instapay.number}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    instapay: { ...prev.instapay, number: e.target.value },
                  }))
                }
                placeholder="01012345678 أو username@instapay"
              />
            </Field>

            <Field label="اسم صاحب حساب إنستاباي (اختياري للتأكيد)">
              <input
                type="text"
                className="input-base"
                value={paymentConfig.instapay.account_name ?? ""}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    instapay: { ...prev.instapay, account_name: e.target.value },
                  }))
                }
                placeholder="مثال: Mohamed Ali"
              />
            </Field>
          </div>
        </div>

        {/* 4. Mobile Wallets (فودافون كاش و وي باي) */}
        <div className="p-4 rounded-xl border border-app bg-[rgba(14,32,56,0.02)] space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-accent/10 text-accent">
              <Wallet className="w-5 h-5" />
            </span>
            <div>
              <h4 className="font-bold text-sm">المحافظ الإلكترونية (Mobile Wallets)</h4>
              <p className="text-muted text-xs">فودافون كاش، وي باي، محافظ المحمول</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-lg border border-app space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted">فودافون كاش (Vodafone Cash)</span>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <span>{paymentConfig.vodafone_cash.enabled ? "مفعل" : "معطل"}</span>
                  <input
                    type="checkbox"
                    checked={!!paymentConfig.vodafone_cash.enabled}
                    onChange={(e) =>
                      setPaymentConfig((prev) => ({
                        ...prev,
                        vodafone_cash: { ...prev.vodafone_cash, enabled: e.target.checked },
                      }))
                    }
                  />
                </label>
              </div>
              <input
                type="text"
                className="input-base font-mono"
                value={paymentConfig.vodafone_cash.number}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    vodafone_cash: { ...prev.vodafone_cash, number: e.target.value },
                  }))
                }
                placeholder="01012345678"
              />
            </div>

            <div className="p-3 rounded-lg border border-app space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted">وي باي (WE Pay / Orange)</span>
                <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <span>{paymentConfig.wepay.enabled ? "مفعل" : "معطل"}</span>
                  <input
                    type="checkbox"
                    checked={!!paymentConfig.wepay.enabled}
                    onChange={(e) =>
                      setPaymentConfig((prev) => ({
                        ...prev,
                        wepay: { ...prev.wepay, enabled: e.target.checked },
                      }))
                    }
                  />
                </label>
              </div>
              <input
                type="text"
                className="input-base font-mono"
                value={paymentConfig.wepay.number}
                onChange={(e) =>
                  setPaymentConfig((prev) => ({
                    ...prev,
                    wepay: { ...prev.wepay, number: e.target.value },
                  }))
                }
                placeholder="01512345678"
              />
            </div>
          </div>
        </div>

        {/* 5. Payment Notice & Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="ملاحظات الدفع (عربي)" hint="تظهر للعميل في نافذة تأكيد التحويل">
            <textarea
              className="input-base text-xs min-h-[70px]"
              value={paymentConfig.notice_ar ?? ""}
              onChange={(e) =>
                setPaymentConfig((prev) => ({
                  ...prev,
                  notice_ar: e.target.value,
                }))
              }
            />
          </Field>
          <Field label="Payment Notice (English)" hint="Shown to customers on the payment modal">
            <textarea
              className="input-base text-xs min-h-[70px]"
              value={paymentConfig.notice_en ?? ""}
              onChange={(e) =>
                setPaymentConfig((prev) => ({
                  ...prev,
                  notice_en: e.target.value,
                }))
              }
            />
          </Field>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={saveAllPaymentSettings}
            disabled={saving === "payments"}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving === "payments" ? "Saving..." : "حفظ كل إعدادات الدفع"}
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-lg">General Settings / الإعدادات العامة</h3>
        <Field label="n8n Factory Webhook URL">
          <div className="flex gap-2">
            <input
              type="url"
              className="input-base"
              value={n8nWebhook}
              onChange={(e) => setN8nWebhook(e.target.value)}
              placeholder="https://n8n.example.com/webhook/..."
            />
            <button
              onClick={() => saveSetting("n8n_factory_webhook", n8nWebhook, "n8n Webhook")}
              disabled={saving === "n8n_factory_webhook"}
              className="btn-outline shrink-0 !px-3"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </Field>
        <Field label="Support WhatsApp Number">
          <div className="flex gap-2">
            <input
              type="text"
              className="input-base"
              value={supportWhatsapp}
              onChange={(e) => setSupportWhatsapp(e.target.value)}
              placeholder="e.g. 201012345678"
            />
            <button
              onClick={() => saveSetting("support_whatsapp", supportWhatsapp, "Support WhatsApp")}
              disabled={saving === "support_whatsapp"}
              className="btn-outline shrink-0 !px-3"
            >
              <Save className="w-4 h-4" />
            </button>
          </div>
        </Field>
      </div>

      {/* Admin Management */}
      <div className="card p-6 space-y-4">
        <h3 className="font-bold text-lg">Admin Users / المديرون</h3>
        <div className="divide-y divide-app">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{a.full_name ?? "—"}</p>
                <p className="text-muted text-xs">{a.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">{formatDate(a.created_at, "en")}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-app pt-4">
          <p className="text-sm font-semibold mb-2">Invite New Admin / دعوة مدير جديد</p>
          <div className="flex gap-2">
            <input
              type="email"
              className="input-base flex-1"
              placeholder="admin@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && inviteAdmin()}
            />
            <button
              onClick={inviteAdmin}
              disabled={inviteLoading || !inviteEmail.trim()}
              className="btn-primary shrink-0 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {inviteLoading ? "Inviting..." : "Invite"}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 space-y-4 border-danger/30">
        <div className="flex items-center gap-2 text-danger">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-bold text-lg">Danger Zone / منطقة الخطر</h3>
        </div>
        <div className="flex items-center justify-between p-4 bg-danger/5 rounded-xl border border-danger/20">
          <div>
            <p className="font-semibold text-sm">Maintenance Mode / وضع الصيانة</p>
            <p className="text-muted text-xs mt-0.5">Disable public access to the platform</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={async (e) => {
                const newVal = e.target.checked;
                setMaintenanceMode(newVal);
                await saveSetting("maintenance_mode", newVal, "Maintenance Mode");
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[rgba(14,32,56,0.1)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-danger" />
          </label>
        </div>
      </div>
    </div>
  );
}
