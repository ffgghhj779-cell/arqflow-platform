"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Phone,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  QrCode,
  ArrowRightLeft,
  PowerOff,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Zap,
  Globe,
  ExternalLink,
  Info,
  CheckCircle2,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Badge, Spinner, Modal } from "@/components/ui";
import { useT, useLang } from "@/lib/i18n";
import { cn, formatDateTime, STATUS_BADGE } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";

type Instance = Tables<"instances">;

interface Props {
  businessId: string;
  initialInstance: Instance | null;
}

export default function WhatsAppClient({ businessId, initialInstance }: Props) {
  const { lang, dir } = useLang();
  const supabase = useMemo(() => createClient(), []);

  // Instance state
  const [instance, setInstance] = useState<Instance | null>(initialInstance);
  const [isVerifying, setIsVerifying] = useState(false);

  // Active provider detection
  const isMetaConnected = !!(instance?.phone_number_id || instance?.waba_id);
  const activeProvider = isMetaConnected ? "meta" : "evolution";

  // Provider Selection Tab (when disconnected)
  const [selectedProvider, setSelectedProvider] = useState<"meta" | "evolution">("meta");

  // Meta Modal state
  const [metaModalOpen, setMetaModalOpen] = useState(false);
  const [metaConnecting, setMetaConnecting] = useState(false);
  const [metaTab, setMetaTab] = useState<"embedded" | "sandbox">("embedded");
  const [sandboxPhoneId, setSandboxPhoneId] = useState("");
  const [sandboxWabaId, setSandboxWabaId] = useState("");
  const [sandboxToken, setSandboxToken] = useState("");
  const [sandboxDisplayNumber, setSandboxDisplayNumber] = useState("");
  const [metaError, setMetaError] = useState<string | null>(null);

  // QR Modal state (Evolution)
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(40);
  const [qrError, setQrError] = useState<string | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Change number modal state
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Success toast / banner
  const [connectionSuccess, setConnectionSuccess] = useState<string | null>(null);

  const t = useT({
    ar: {
      title: "إدارة واتساب والربط",
      subtitle: "اختر طريقة الربط المناسبة لنشاطك التجاري: Meta Cloud API الرسمي أو Evolution API السريع",
      notProvisioned: "واتساب لم يُفعَّل بعد",
      notProvisionedBody: "سيتم إنشاء وتجهيز إنستانس الواتساب تلقائياً بمجرد إتمام الإعداد.",
      connected: "متصل بنجاح",
      disconnected: "غير متصل",
      qrPending: "في انتظار مسح QR",
      verifying: "جاري الفحص المباشر...",
      refreshCheck: "تحديث الفحص",
      refreshing: "جاري الفحص...",
      number: "الرقم المتصل",
      instance: "معرّف الحساب",
      lastCheck: "آخر فحص اتصال",
      health: "حالة الخدمة",
      healthOk: "سليم ونشط",
      healthFail: "يوجد مشكلة / غير متصل",
      connectedVia: "طريقة الاتصال الحالية",
      metaOfficialBadge: "Meta WhatsApp Cloud API (رسمي معتمد)",
      evolutionBadge: "Evolution API (Multi-Device)",
      chooseProviderTitle: "اختر طريقة ربط واتساب المناسبة لنشاطك",
      chooseProviderSub: "ندعم طريقتين للربط؛ يمكنك اختيار الربط السحابي الرسمي من Meta أو الربط المباشر بمسح رمز QR.",
      providerMetaTitle: "Meta WhatsApp Cloud API",
      providerMetaTag: "موصى به ⭐ — اتصال سحابي رسمي",
      providerMetaDesc: "الربط الرسمي المباشر عبر خوادم Meta السحابية بدون مسح QR وبدون انقطاع اتصال أو خطر حظر الرقم.",
      providerMetaF1: "لا حاجة لترك الهاتف متصلاً بالإنترنت",
      providerMetaF2: "محادثات خدمة العملاء الواردة مجانية 100%",
      providerMetaF3: "دعم الأزرار والقوائم والردود التفاعلية السريعة",
      providerMetaF4: "استقرار دائم وضمان رسمي من WhatsApp",
      providerMetaBtn: "بدء الربط عبر Meta",
      providerEvoTitle: "Evolution API (مسح رمز QR)",
      providerEvoTag: "سريع وفوري — بدون توثيق تجاري",
      providerEvoDesc: "ربط فوري في ثوانٍ عبر مسح رمز QR من تطبيق واتساب بهاتفك باستخدام ميزة الأجهزة المرتبطة.",
      providerEvoF1: "ربط فوري وسريع في 10 ثوانٍ",
      providerEvoF2: "لا يتطلب سجل تجاري أو حساب مطورين",
      providerEvoF3: "يعمل مع أي رقم واتساب شخصي أو بيزنس",
      providerEvoF4: "تحكم كامل بقطع الاتصال من هاتفك مباشرة",
      providerEvoBtn: "ربط عبر مسح رمز QR",
      changeNumber: "تغيير الرقم أو طريقة الربط",
      disconnect: "قطع الاتصال",
      qrModalTitle: "ربط واتساب عبر رمز QR (Evolution API)",
      qrModalSub: "امسح الرمز بواسطة تطبيق واتساب لربط البوت بالرقم",
      step1: "افتح تطبيق واتساب على هاتفك.",
      step2: "اضغط على القائمة (⋮) أو الإعدادات ⚙️.",
      step3: "اختر الأجهزة المرتبطة (Linked Devices) ثم اضغط 'ربط جهاز'.",
      step4: "وجّه كاميرا الهاتف نحو الرمز الظاهر أدناه.",
      pairingCodeLabel: "أو استخدم كود الاقتران:",
      copyCode: "نسخ",
      copied: "تم النسخ!",
      expiresIn: "ينتهي الرمز خلال",
      seconds: "ثانية",
      codeExpired: "انتهت صلاحية الرمز",
      refreshQr: "توليد رمز جديد",
      listeningForScan: "في انتظار المسح من هاتفك... سيتم التحديث فوراً بمجرد الاقتران.",
      metaModalTitle: "ربط WhatsApp عبر Meta Cloud API",
      metaModalSub: "الربط الرسمي المعتمد من WhatsApp Business Platform",
      metaTabEmbedded: "الربط التلقائي (Embedded Signup)",
      metaTabSandbox: "البيئة التجريبية (Sandbox / Test Mode)",
      metaStep1: "تسجيل الدخول بحساب Facebook الخاص بنشاطك التجاري.",
      metaStep2: "اختيار أو إنشاء حساب WhatsApp Business Account (WABA).",
      metaStep3: "إدخال رقم هاتف النشاط التجاري وتأكيده عبر كود SMS أو مكالمة.",
      metaStep4: "منح الصلاحية للمنصة لإرسال واستقبال الرسائل آلياً.",
      metaLaunchBtn: "فتح نافذة ربط Meta الرسمية",
      metaSandboxNotice: "يمكنك استخدام هذه البيئة لاختبار الربط برقم تجريبي من Meta قبل التوثيق النهائي للشركة.",
      metaPhoneIdLabel: "Phone Number ID (من لوحة مطوري Meta):",
      metaWabaIdLabel: "WABA ID (معرّف حساب الأعمال):",
      metaTokenLabel: "Access Token (توكن الوصول):",
      metaDisplayNumLabel: "رقم الهاتف المعروض (مثال: +201090362926):",
      metaSaveSandbox: "حفظ وتفعيل الاتصال التجريبي",
      changeModalTitle: "تأكيد تغيير الرقم أو طريقة الربط",
      changeModalWarning: "تنبيه هام:",
      changeModalText: "سيتم قطع اتصال الرقم الحالي، وستتمكن من اختيار طريقة الربط مجدداً (Meta أو رمز QR).",
      currentNumber: "الرقم الحالي:",
      confirmChange: "نعم، قطع الاتصال وتغيير الإعدادات",
      cancel: "إلغاء",
      switchingNumber: "جاري قطع الاتصال وتجهيز الإعدادات...",
      justNow: "الآن",
      successLinked: "تم ربط واتساب بنجاح وهو جاهز للعمل والرد على العملاء الآن! 🎉",
      failNotice: "البوت غير متصل حالياً برقم واتساب فعال ولن يستطيع استقبال أو الرد على الرسائل.",
      healthyNotice: "البوت متصل ويعمل بكفاءة على رقم الواتساب الحالي.",
      privacyTitle: "سياسة الخصوصية والأمان",
      privacyMetaInfo: "في الربط الرسمي (Meta Cloud API)، تخضع المحادثات لسياسات Meta وWhatsApp الرسمية وتشفر بالكامل عبر SSL/TLS مع توقيعات رقمية آمنة.",
      privacyEvoInfo: "في الربط بمسح QR (Evolution API)، يتم استخدام بروتوكول الأجهزة المرتبطة المشفر محلياً ولا يتم تخزين محادثاتك الشخصية أو جهات اتصالك خارج قاعدة بيانات نشاطك.",
      readFullPrivacy: "قراءة سياسة الخصوصية الكاملة لكلتا الطريقتين",
    },
    en: {
      title: "WhatsApp & Connection Management",
      subtitle: "Choose your preferred connection protocol: Official Meta Cloud API or Fast Evolution API",
      notProvisioned: "WhatsApp not provisioned yet",
      notProvisionedBody: "WhatsApp instance will be automatically created once onboarding completes.",
      connected: "Connected successfully",
      disconnected: "Disconnected",
      qrPending: "Awaiting QR scan",
      verifying: "Verifying live connection...",
      refreshCheck: "Verify status",
      refreshing: "Verifying...",
      number: "Connected number",
      instance: "Account Identifier",
      lastCheck: "Last connection check",
      health: "Service health",
      healthOk: "Healthy & Active",
      healthFail: "Issue detected / Disconnected",
      connectedVia: "Active Protocol",
      metaOfficialBadge: "Meta WhatsApp Cloud API (Official)",
      evolutionBadge: "Evolution API (Multi-Device)",
      chooseProviderTitle: "Select your WhatsApp Connection Method",
      chooseProviderSub: "We support two robust connection methods: Official Meta Cloud API or Instant QR Linking.",
      providerMetaTitle: "Meta WhatsApp Cloud API",
      providerMetaTag: "Recommended ⭐ — Official Cloud Platform",
      providerMetaDesc: "Direct official integration via Meta cloud servers with zero disconnects, no QR expiration, and full anti-ban protection.",
      providerMetaF1: "No need to keep your phone connected online",
      providerMetaF2: "Customer-initiated service messages are 100% FREE",
      providerMetaF3: "Supports interactive quick-replies, lists, and templates",
      providerMetaF4: "Enterprise-grade reliability guaranteed by Meta",
      providerMetaBtn: "Connect via Meta Cloud API",
      providerEvoTitle: "Evolution API (QR Code Linking)",
      providerEvoTag: "Fast & Instant — No verification required",
      providerEvoDesc: "Instantly link any WhatsApp number in 10 seconds by scanning a QR code from your phone's Linked Devices menu.",
      providerEvoF1: "Quick 10-second setup via phone camera",
      providerEvoF2: "No commercial registration or developer account needed",
      providerEvoF3: "Works with personal or business WhatsApp numbers",
      providerEvoF4: "Disconnect anytime directly from your phone",
      providerEvoBtn: "Connect via QR Code",
      changeNumber: "Change Number or Protocol",
      disconnect: "Disconnect",
      qrModalTitle: "Link WhatsApp via QR Code (Evolution API)",
      qrModalSub: "Scan the code with WhatsApp to connect your bot",
      step1: "Open WhatsApp on your phone.",
      step2: "Tap Menu (⋮) or Settings ⚙️.",
      step3: "Tap Linked Devices → Link a Device.",
      step4: "Point your phone camera at the code below.",
      pairingCodeLabel: "Or use pairing code:",
      copyCode: "Copy",
      copied: "Copied!",
      expiresIn: "Code expires in",
      seconds: "s",
      codeExpired: "Code expired",
      refreshQr: "Get new code",
      listeningForScan: "Waiting for phone scan... this page will automatically update once linked.",
      metaModalTitle: "Connect WhatsApp via Meta Cloud API",
      metaModalSub: "Official integration via WhatsApp Business Platform",
      metaTabEmbedded: "Automatic Flow (Embedded Signup)",
      metaTabSandbox: "Developer Sandbox (Test Mode)",
      metaStep1: "Log in with your Facebook business account.",
      metaStep2: "Select or create your WhatsApp Business Account (WABA).",
      metaStep3: "Enter your phone number and verify it via SMS or voice call.",
      metaStep4: "Grant messaging permissions to ArqFlow platform.",
      metaLaunchBtn: "Open Official Meta Connect Window",
      metaSandboxNotice: "Use this sandbox mode to test with a Meta test number prior to full business verification.",
      metaPhoneIdLabel: "Phone Number ID (from Meta Developers):",
      metaWabaIdLabel: "WABA ID (WhatsApp Business Account ID):",
      metaTokenLabel: "Access Token:",
      metaDisplayNumLabel: "Display Phone Number (e.g. +201090362926):",
      metaSaveSandbox: "Save & Activate Test Connection",
      changeModalTitle: "Confirm Change WhatsApp Connection",
      changeModalWarning: "Important Warning:",
      changeModalText: "The current phone connection will be disconnected. You can then choose your preferred protocol again (Meta or QR code).",
      currentNumber: "Current number:",
      confirmChange: "Yes, disconnect & change settings",
      cancel: "Cancel",
      switchingNumber: "Disconnecting and preparing options...",
      justNow: "Just now",
      successLinked: "WhatsApp linked successfully! Your bot is ready to reply 🎉",
      failNotice: "Bot is currently disconnected and cannot receive or send messages.",
      healthyNotice: "Bot is connected and operating normally on this number.",
      privacyTitle: "Privacy & Security Policy",
      privacyMetaInfo: "Under Meta Cloud API, messages adhere to Meta & WhatsApp Business Platform policies with end-to-end transport encryption (SSL/TLS & HMAC-SHA256).",
      privacyEvoInfo: "Under Evolution API (QR), multi-device sessions are locally authenticated. Personal contacts and past chats are never inspected or exported.",
      readFullPrivacy: "Read complete Privacy Policy for both methods",
    },
  });

  // Start QR countdown
  const startCountdown = useCallback((ttl: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(ttl);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Supabase Realtime channel for instance row changes
  useEffect(() => {
    if (!businessId) return;
    const channel = supabase
      .channel("instance-live:" + businessId)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "instances", filter: `business_id=eq.${businessId}` },
        (payload) => {
          if (payload.new) {
            setInstance(payload.new as Instance);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [businessId, supabase]);

  // Live status verification
  const checkLiveStatus = useCallback(async (showFeedback = true) => {
    if (showFeedback) setIsVerifying(true);
    try {
      const res = await fetch("/api/dashboard/whatsapp/status", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setInstance((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            evolution_status: data.evolution_status,
            connection_status: data.connected ? "connected" : "disconnected",
            connected_number: data.connected_number,
            health_status: data.health_status,
            last_health_check: data.last_health_check,
            phone_number_id: data.phone_number_id ?? prev.phone_number_id,
            waba_id: data.waba_id ?? prev.waba_id,
            display_phone_number: data.display_phone_number ?? prev.display_phone_number,
          };
        });
        if (data.connected) {
          if (qrModalOpen) setQrModalOpen(false);
          if (metaModalOpen) setMetaModalOpen(false);
          setConnectionSuccess(t.successLinked);
        }
      }
    } catch {
      // Ignore network blip
    } finally {
      if (showFeedback) setIsVerifying(false);
    }
  }, [qrModalOpen, metaModalOpen, t.successLinked]);

  // Check live status on initial page load
  useEffect(() => {
    checkLiveStatus(false);
  }, [checkLiveStatus]);

  // Fetch a fresh QR code (Evolution API)
  const fetchQr = async () => {
    setQrLoading(true);
    setQrError(null);
    try {
      const res = await fetch("/api/dashboard/whatsapp/qr", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data.connected) {
        setQrModalOpen(false);
        setConnectionSuccess(t.successLinked);
        checkLiveStatus(false);
        return;
      }
      if (!res.ok || !data.qr_base64) {
        throw new Error(data.error || "Failed to load QR code");
      }
      setQrCode(data.qr_base64 as string);
      setPairingCode(data.pairing_code || null);
      startCountdown(Number(data.ttl_seconds ?? 40));
      setQrModalOpen(true);
    } catch (e) {
      setQrError(e instanceof Error ? e.message : "Failed to load QR");
    } finally {
      setQrLoading(false);
    }
  };

  // Live Polling while QR Modal is Open to auto-detect scan
  useEffect(() => {
    if (!qrModalOpen) return;
    const iv = setInterval(async () => {
      try {
        const res = await fetch("/api/dashboard/whatsapp/status", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (data.connected) {
          setQrModalOpen(false);
          setConnectionSuccess(t.successLinked);
          setInstance((prev) =>
            prev
              ? {
                  ...prev,
                  evolution_status: "connected",
                  connection_status: "connected",
                  connected_number: data.connected_number,
                  health_status: "healthy",
                  last_health_check: data.last_health_check,
                }
              : null
          );
        }
      } catch {
        // Continue polling
      }
    }, 3000);

    return () => clearInterval(iv);
  }, [qrModalOpen, t.successLinked]);

  // Save Sandbox / Test Mode Meta Credentials
  const handleSaveMetaSandbox = async () => {
    if (!sandboxPhoneId || !sandboxToken) {
      setMetaError(lang === "ar" ? "يرجى إدخال Phone Number ID والتوكن على الأقل" : "Please provide Phone Number ID and Token");
      return;
    }
    setMetaConnecting(true);
    setMetaError(null);
    try {
      const res = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id: sandboxPhoneId.trim(),
          waba_id: sandboxWabaId.trim() || null,
          access_token: sandboxToken.trim(),
          display_phone_number: sandboxDisplayNumber.trim() || null,
          mode: "sandbox",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to save Meta credentials");
      }
      setMetaModalOpen(false);
      setConnectionSuccess(t.successLinked);
      checkLiveStatus(false);
    } catch (e) {
      setMetaError(e instanceof Error ? e.message : "Failed to connect Meta Sandbox");
    } finally {
      setMetaConnecting(false);
    }
  };

  // Handle Disconnect or Change Provider
  const handleDisconnectOrChange = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/dashboard/whatsapp/disconnect", { method: "POST" });
      setChangeModalOpen(false);

      setInstance((prev) =>
        prev
          ? {
              ...prev,
              evolution_status: "disconnected",
              connection_status: "disconnected",
              connected_number: null,
              display_phone_number: null,
              phone_number_id: null,
              waba_id: null,
              meta_access_token: null,
              health_status: "warning",
            }
          : null
      );
    } catch {
      // Disconnect finished
    } finally {
      setDisconnecting(false);
    }
  };

  const copyPairingCode = () => {
    if (!pairingCode) return;
    navigator.clipboard.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (!instance) {
    return (
      <div className="card p-10 text-center max-w-lg mx-auto" dir={dir}>
        <div className="w-16 h-16 rounded-2xl bg-[rgba(184,144,99,0.12)] flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-accent" />
        </div>
        <h2 className="text-xl font-bold mb-2">{t.notProvisioned}</h2>
        <p className="text-muted">{t.notProvisionedBody}</p>
      </div>
    );
  }

  const isConnected =
    instance.evolution_status === "connected" ||
    instance.connection_status === "connected" ||
    !!instance.phone_number_id;

  const isQR = instance.evolution_status === "qr_pending" && !isConnected;
  const isDisconnected = !isConnected && !isQR;

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight">{t.title}</h1>
            <Badge variant="neutral" className="text-[11px] font-mono">
              v2.0 Dual-Provider
            </Badge>
          </div>
          <p className="text-muted text-sm mt-1">{t.subtitle}</p>
        </div>

        <button
          onClick={() => checkLiveStatus(true)}
          disabled={isVerifying}
          className="btn-outline flex items-center gap-2 self-start sm:self-auto text-sm"
        >
          <RefreshCw className={cn("w-4 h-4", isVerifying && "animate-spin text-accent")} />
          {isVerifying ? t.refreshing : t.refreshCheck}
        </button>
      </div>

      {/* Success Banner */}
      {connectionSuccess && (
        <div className="card p-4 border-l-4 border-l-[var(--success)] bg-[rgba(74,222,128,0.08)] flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-[var(--success)] shrink-0" />
            <p className="text-sm font-medium">{connectionSuccess}</p>
          </div>
          <button
            onClick={() => setConnectionSuccess(null)}
            className="text-muted hover:text-app text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Status / Provider Selection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Section (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Live Connection Status Card */}
          <div
            className={cn(
              "card p-6 transition-all",
              isConnected && "border-[rgba(74,222,128,0.3)] shadow-[0_0_20px_rgba(74,222,128,0.06)]",
              isDisconnected && "border-[rgba(248,113,113,0.3)] shadow-[0_0_20px_rgba(248,113,113,0.06)]",
              isQR && "border-[rgba(251,191,36,0.3)]"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    isConnected
                      ? "bg-[rgba(74,222,128,0.12)] text-[var(--success)]"
                      : isQR
                      ? "bg-[rgba(251,191,36,0.12)] text-[var(--warning)]"
                      : "bg-[rgba(248,113,113,0.12)] text-[var(--danger)]"
                  )}
                >
                  {isConnected ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : isQR ? (
                    <Clock className="w-8 h-8 animate-pulse" />
                  ) : (
                    <AlertCircle className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold">
                      {isConnected ? t.connected : isQR ? t.qrPending : t.disconnected}
                    </h2>
                    <Badge variant={isConnected ? "success" : isQR ? "warning" : "danger"}>
                      {isConnected ? (lang === "ar" ? "متصل ونشط" : "Active") : instance.evolution_status}
                    </Badge>
                    {isConnected && (
                      <Badge variant="accent" className="flex items-center gap-1 text-[11px]">
                        {isMetaConnected ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Meta Cloud API</span>
                          </>
                        ) : (
                          <>
                            <QrCode className="w-3 h-3" />
                            <span>Evolution API</span>
                          </>
                        )}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1">
                    {isConnected ? t.healthyNotice : t.failNotice}
                  </p>
                </div>
              </div>

              {/* Live Ping Indicator */}
              <div className="text-xs text-muted flex items-center gap-1.5 self-center">
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )}
                />
                <span>{isConnected ? "Live Session" : "Offline"}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-[rgba(13,34,54,0.03)] dark:bg-[rgba(255,255,255,0.02)] p-4 rounded-xl mb-6">
              <div>
                <p className="text-muted text-xs mb-1">{t.number}</p>
                <p className="font-semibold text-base font-mono truncate">
                  {instance.display_phone_number || instance.connected_number ? (
                    (instance.display_phone_number || instance.connected_number)?.startsWith("+")
                      ? (instance.display_phone_number || instance.connected_number)
                      : `+${instance.display_phone_number || instance.connected_number}`
                  ) : (
                    <span className="text-muted font-sans text-xs">غير محدد / غير متصل</span>
                  )}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-muted text-xs mb-1">
                  {isMetaConnected ? "Phone Number ID" : t.instance}
                </p>
                <p className="font-mono text-xs truncate" title={instance.phone_number_id || instance.instance_name}>
                  {instance.phone_number_id || instance.instance_name}
                </p>
              </div>

              <div>
                <p className="text-muted text-xs mb-1">{t.lastCheck}</p>
                <p className="text-xs truncate">
                  {instance.last_health_check
                    ? formatDateTime(instance.last_health_check, lang)
                    : t.justNow}
                </p>
              </div>

              <div>
                <p className="text-muted text-xs mb-1">{t.connectedVia}</p>
                <span className="text-xs font-semibold text-accent flex items-center gap-1">
                  {isMetaConnected ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-accent" />
                      <span>{t.metaOfficialBadge}</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-accent" />
                      <span>{t.evolutionBadge}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Action Buttons when Connected */}
            {isConnected && (
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setChangeModalOpen(true)}
                  className="btn-outline flex items-center gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4 text-accent" />
                  <span>{t.changeNumber}</span>
                </button>

                <button
                  onClick={() => setChangeModalOpen(true)}
                  className="btn-ghost text-[var(--danger)] hover:bg-[rgba(248,113,113,0.1)] flex items-center gap-2"
                >
                  <PowerOff className="w-4 h-4" />
                  <span>{t.disconnect}</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Dual Provider Selection Cards (Shown when Disconnected) */}
          {!isConnected && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-app">{t.chooseProviderTitle}</h3>
                <p className="text-xs text-muted mt-0.5">{t.chooseProviderSub}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Meta WhatsApp Cloud API */}
                <div
                  onClick={() => setSelectedProvider("meta")}
                  className={cn(
                    "card p-5 cursor-pointer transition-all border-2 relative flex flex-col justify-between hover:border-accent/60",
                    selectedProvider === "meta"
                      ? "border-accent bg-[rgba(184,144,99,0.04)] shadow-md"
                      : "border-glass bg-glass"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(184,144,99,0.15)] text-accent flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <Badge variant="accent" className="text-[10px] py-0.5 px-2">
                        {t.providerMetaTag}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-base text-app mb-1.5 flex items-center gap-1.5">
                      <span>{t.providerMetaTitle}</span>
                      <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </h4>
                    <p className="text-xs text-muted leading-relaxed mb-4">
                      {t.providerMetaDesc}
                    </p>

                    <ul className="space-y-2 text-xs text-muted mb-5">
                      <li className="flex items-center gap-2 text-app">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                        <span>{t.providerMetaF1}</span>
                      </li>
                      <li className="flex items-center gap-2 text-app">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                        <span>{t.providerMetaF2}</span>
                      </li>
                      <li className="flex items-center gap-2 text-app">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                        <span>{t.providerMetaF3}</span>
                      </li>
                      <li className="flex items-center gap-2 text-app">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                        <span>{t.providerMetaF4}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMetaModalOpen(true);
                    }}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-xs !py-2.5 shadow-md"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{t.providerMetaBtn}</span>
                  </button>
                </div>

                {/* Option 2: Evolution API (QR Code) */}
                <div
                  onClick={() => setSelectedProvider("evolution")}
                  className={cn(
                    "card p-5 cursor-pointer transition-all border-2 relative flex flex-col justify-between hover:border-accent/60",
                    selectedProvider === "evolution"
                      ? "border-accent bg-[rgba(184,144,99,0.04)] shadow-md"
                      : "border-glass bg-glass"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(13,34,54,0.08)] dark:bg-[rgba(255,255,255,0.08)] text-app flex items-center justify-center">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <Badge variant="neutral" className="text-[10px] py-0.5 px-2">
                        {t.providerEvoTag}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-base text-app mb-1.5 flex items-center gap-1.5">
                      <span>{t.providerEvoTitle}</span>
                    </h4>
                    <p className="text-xs text-muted leading-relaxed mb-4">
                      {t.providerEvoDesc}
                    </p>

                    <ul className="space-y-2 text-xs text-muted mb-5">
                      <li className="flex items-center gap-2 text-app">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                        <span>{t.providerEvoF1}</span>
                      </li>
                      <li className="flex items-center gap-2 text-app">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                        <span>{t.providerEvoF2}</span>
                      </li>
                      <li className="flex items-center gap-2 text-app">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                        <span>{t.providerEvoF3}</span>
                      </li>
                      <li className="flex items-center gap-2 text-app">
                        <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                        <span>{t.providerEvoF4}</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchQr();
                    }}
                    disabled={qrLoading}
                    className="btn-outline w-full flex items-center justify-center gap-2 text-xs !py-2.5"
                  >
                    {qrLoading ? <Spinner className="w-4 h-4" /> : <QrCode className="w-4 h-4 text-accent" />}
                    <span>{t.providerEvoBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Security, Instructions & Privacy Notice */}
        <div className="space-y-6">
          <div className="card p-6 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center gap-2 font-bold mb-3 text-app">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <span>تعليمات الأمان والخصوصية</span>
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">
                صممت منصة ArqFlow لتوفر أعلى درجات الخصوصية والتشفير لعزل بيانات عملائك ومحادثاتهم تماماً:
              </p>

              <div className="space-y-3 text-xs">
                {/* Meta Privacy note */}
                <div className="p-3 rounded-xl bg-[rgba(184,144,99,0.06)] border border-accent/20">
                  <div className="flex items-center gap-2 font-semibold text-accent mb-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>بروتوكول Meta Cloud API:</span>
                  </div>
                  <p className="text-muted leading-relaxed text-[11px]">
                    {t.privacyMetaInfo}
                  </p>
                </div>

                {/* Evolution Privacy note */}
                <div className="p-3 rounded-xl bg-[rgba(13,34,54,0.04)] dark:bg-[rgba(255,255,255,0.03)] border border-glass">
                  <div className="flex items-center gap-2 font-semibold text-app mb-1">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>بروتوكول Evolution API:</span>
                  </div>
                  <p className="text-muted leading-relaxed text-[11px]">
                    {t.privacyEvoInfo}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-glass pt-4">
              <Link
                href="/privacy"
                target="_blank"
                className="text-accent hover:underline text-xs flex items-center justify-between group"
              >
                <span>{t.readFullPrivacy}</span>
                <ChevronRight className={cn("w-4 h-4 transition-transform", dir === "rtl" && "rotate-180")} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Connection Modal */}
      <Modal
        open={metaModalOpen}
        onClose={() => !metaConnecting && setMetaModalOpen(false)}
        title={t.metaModalTitle}
      >
        <div className="space-y-5 pt-1" dir={dir}>
          <p className="text-xs text-muted">{t.metaModalSub}</p>

          {/* Mode Switch Tabs */}
          <div className="flex items-center gap-2 p-1 bg-[rgba(13,34,54,0.06)] dark:bg-[rgba(255,255,255,0.04)] rounded-xl text-xs">
            <button
              onClick={() => setMetaTab("embedded")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-lg font-medium transition-all",
                metaTab === "embedded"
                  ? "bg-surface shadow text-accent"
                  : "text-muted hover:text-app"
              )}
            >
              {t.metaTabEmbedded}
            </button>
            <button
              onClick={() => setMetaTab("sandbox")}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-lg font-medium transition-all",
                metaTab === "sandbox"
                  ? "bg-surface shadow text-accent"
                  : "text-muted hover:text-app"
              )}
            >
              {t.metaTabSandbox}
            </button>
          </div>

          {metaError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{metaError}</span>
            </div>
          )}

          {/* Embedded Flow Tab */}
          {metaTab === "embedded" && (
            <div className="space-y-4">
              <div className="space-y-2.5 bg-[rgba(13,34,54,0.03)] dark:bg-[rgba(255,255,255,0.02)] p-4 rounded-xl text-xs">
                {[t.metaStep1, t.metaStep2, t.metaStep3, t.metaStep4].map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[rgba(184,144,99,0.2)] text-accent flex items-center justify-center font-bold text-[10px] shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-app">{step}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[rgba(184,144,99,0.08)] border border-accent/20 text-xs text-muted flex items-start gap-2.5">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span>
                  {lang === "ar"
                    ? "عند الضغط، ستفتح نافذة فيسبوك الرسمية. لن تحتاج لتقديم سجل تجاري الآن؛ تتيح ميتا العمل فوراً لخدمة حتى 250 عميلاً يومياً."
                    : "A secure Facebook popup will appear. No business documents are required right now; Meta grants an immediate tier of up to 250 unique conversations/day."}
                </span>
              </div>

              <button
                onClick={() => {
                  // If FB SDK is loaded, trigger FB.login; otherwise inform user
                  if (typeof window !== "undefined" && (window as any).FB) {
                    (window as any).FB.login(
                      (response: any) => {
                        if (response.authResponse?.code) {
                          // Send code to backend
                          fetch("/api/whatsapp/connect", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ code: response.authResponse.code }),
                          })
                            .then((r) => r.json())
                            .then((res) => {
                              if (res.connected) {
                                setMetaModalOpen(false);
                                setConnectionSuccess(t.successLinked);
                                checkLiveStatus(false);
                              }
                            });
                        }
                      },
                      {
                        config_id: process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID,
                        response_type: "code",
                        override_default_response_type: true,
                        extras: { featureType: "only_waba_sharing", sessionInfoVersion: "3" },
                      }
                    );
                  } else {
                    setMetaTab("sandbox");
                    setMetaError(
                      lang === "ar"
                        ? "جاري إعداد تطبيق Meta للإنتاج. يمكنك الآن استخدام تبويب (البيئة التجريبية Sandbox) للتجربة الفورية."
                        : "Meta App production review pending. Please use the Sandbox tab for instant testing."
                    );
                  }
                }}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm !py-3"
              >
                <Zap className="w-4 h-4" />
                <span>{t.metaLaunchBtn}</span>
              </button>
            </div>
          )}

          {/* Sandbox Developer Flow Tab */}
          {metaTab === "sandbox" && (
            <div className="space-y-3 text-xs">
              <p className="text-muted leading-relaxed">
                {t.metaSandboxNotice}
              </p>

              <div>
                <label className="block text-muted text-[11px] mb-1">{t.metaPhoneIdLabel}</label>
                <input
                  type="text"
                  value={sandboxPhoneId}
                  onChange={(e) => setSandboxPhoneId(e.target.value)}
                  placeholder="e.g. 106540352242922"
                  className="input w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-muted text-[11px] mb-1">{t.metaWabaIdLabel}</label>
                <input
                  type="text"
                  value={sandboxWabaId}
                  onChange={(e) => setSandboxWabaId(e.target.value)}
                  placeholder="e.g. 102290129340398"
                  className="input w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-muted text-[11px] mb-1">{t.metaDisplayNumLabel}</label>
                <input
                  type="text"
                  value={sandboxDisplayNumber}
                  onChange={(e) => setSandboxDisplayNumber(e.target.value)}
                  placeholder="e.g. +201090362926"
                  className="input w-full font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-muted text-[11px] mb-1">{t.metaTokenLabel}</label>
                <input
                  type="password"
                  value={sandboxToken}
                  onChange={(e) => setSandboxToken(e.target.value)}
                  placeholder="EAAB..."
                  className="input w-full font-mono text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveMetaSandbox}
                  disabled={metaConnecting}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-xs !py-2.5"
                >
                  {metaConnecting ? <Spinner className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  <span>{t.metaSaveSandbox}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* QR Code Modal (Evolution API) */}
      <Modal
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title={t.qrModalTitle}
      >
        <div className="text-center space-y-4 pt-1" dir={dir}>
          <p className="text-xs text-muted">{t.qrModalSub}</p>

          {/* QR Image Box */}
          <div className="relative mx-auto w-64 h-64 rounded-2xl overflow-hidden bg-white p-3 shadow-md flex items-center justify-center border border-gray-200">
            {qrLoading ? (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <Spinner className="w-8 h-8 text-accent" />
                <span className="text-xs">جاري جلب رمز الاستجابة السريعة...</span>
              </div>
            ) : qrCode ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className={cn(
                    "w-full h-full object-contain transition-all",
                    countdown <= 0 && "blur-md opacity-30"
                  )}
                />
                {countdown <= 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-xs p-4">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <p className="text-xs font-bold text-gray-800">{t.codeExpired}</p>
                    <button
                      onClick={fetchQr}
                      disabled={qrLoading}
                      className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t.refreshQr}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-red-500 p-4">
                {qrError || "تعذر تحميل رمز QR، يرجى المحاولة مرة أخرى"}
              </div>
            )}
          </div>

          {/* Countdown & Refresh */}
          {qrCode && countdown > 0 && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>
                {t.expiresIn}{" "}
                <strong className="text-accent font-mono text-sm">{countdown}</strong> {t.seconds}
              </span>
              <button
                onClick={fetchQr}
                disabled={qrLoading}
                className="text-accent hover:underline text-xs ms-2 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                تحديث
              </button>
            </div>
          )}

          {/* Optional Pairing Code */}
          {pairingCode && (
            <div className="bg-[rgba(13,34,54,0.05)] dark:bg-[rgba(255,255,255,0.03)] p-3 rounded-xl max-w-xs mx-auto text-center">
              <p className="text-xs text-muted mb-1.5">{t.pairingCodeLabel}</p>
              <div className="flex items-center justify-center gap-2">
                <code className="text-sm font-mono font-bold tracking-widest text-accent">
                  {pairingCode}
                </code>
                <button
                  onClick={copyPairingCode}
                  className="btn-ghost !p-1 text-xs flex items-center gap-1"
                >
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Instructions List */}
          <div className="space-y-2 text-start bg-[rgba(13,34,54,0.03)] dark:bg-[rgba(255,255,255,0.02)] p-4 rounded-xl text-xs">
            {[t.step1, t.step2, t.step3, t.step4].map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[rgba(184,144,99,0.2)] text-accent flex items-center justify-center font-bold text-[10px] shrink-0">
                  {i + 1}
                </span>
                <span className="text-app">{step}</span>
              </div>
            ))}
          </div>

          {/* Realtime listener ping */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted pt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>{t.listeningForScan}</span>
          </div>
        </div>
      </Modal>

      {/* Change Number / Provider Confirmation Modal */}
      <Modal
        open={changeModalOpen}
        onClose={() => !disconnecting && setChangeModalOpen(false)}
        title={t.changeModalTitle}
      >
        <div className="space-y-4 pt-1" dir={dir}>
          <div className="w-12 h-12 rounded-2xl bg-[rgba(248,113,113,0.12)] text-[var(--danger)] flex items-center justify-center mx-auto mb-2">
            <Smartphone className="w-6 h-6" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="font-bold text-base text-app">{t.changeModalWarning}</h3>
            <p className="text-xs text-muted leading-relaxed">{t.changeModalText}</p>
            {(instance.display_phone_number || instance.connected_number) && (
              <p className="text-xs font-mono font-semibold bg-[rgba(13,34,54,0.04)] py-1 px-3 rounded-lg inline-block">
                {t.currentNumber} {instance.display_phone_number || instance.connected_number}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-glass">
            <button
              onClick={() => setChangeModalOpen(false)}
              disabled={disconnecting}
              className="btn-ghost text-xs"
            >
              {t.cancel}
            </button>

            <button
              onClick={handleDisconnectOrChange}
              disabled={disconnecting}
              className="btn-primary !bg-[var(--danger)] hover:!bg-red-600 !text-white text-xs flex items-center gap-2"
            >
              {disconnecting ? <Spinner className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
              <span>{disconnecting ? t.switchingNumber : t.confirmChange}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
