"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Bell,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Loader2,
  Clock,
  CheckCircle,
  Lock,
} from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { useLang, useT } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/database.types";
import type { Capabilities } from "@/lib/capabilities";
import { CapabilitiesProvider } from "@/lib/capabilities-context";
import { ToastProvider } from "@/components/ui/Toast";
import { resolveModules, getModuleByPath } from "@/lib/modules";
import { getIcon } from "@/lib/modules/icons";

type Profile = Tables<"profiles">;
type Business = Tables<"businesses">;

interface Props {
  profile: Profile;
  business: Business;
  capabilities: Capabilities;
  unreadCount: number;
  children: React.ReactNode;
}

function ProvisioningPlaceholder({ business, lang }: { business: Business; lang: "ar" | "en" }) {
  const t = {
    ar: {
      title: "بوتك قيد الإعداد",
      subtitle: "فريقنا يعمل على تجهيز مساعدك الذكي الآن",
      step1: "استلام طلبك",
      step2: "إعداد البوت",
      step3: "ربط واتساب",
      step4: "اختبار النظام",
      step5: "التشغيل",
      eta: "متوقع خلال ٢٤-٤٨ ساعة عمل",
      support: "للاستفسار تواصل معنا عبر واتساب",
    },
    en: {
      title: "Your bot is being set up",
      subtitle: "Our team is configuring your AI assistant right now",
      step1: "Request received",
      step2: "Bot configuration",
      step3: "WhatsApp connection",
      step4: "System testing",
      step5: "Go live",
      eta: "Expected within 24-48 business hours",
      support: "For inquiries contact us via WhatsApp",
    },
  }[lang];

  const steps = [t.step1, t.step2, t.step3, t.step4, t.step5];
  const activeStep = business.status === "pending_approval" ? 0 : 1;

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg)" }}>
      <div className="glass-strong max-w-lg w-full p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[rgba(184,144,99,0.12)] flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
        <p className="text-muted mb-8">{t.subtitle}</p>
        <div className="space-y-3 text-start mb-8">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  i < activeStep
                    ? "bg-[rgba(74,222,128,0.15)] text-[var(--success)]"
                    : i === activeStep
                    ? "bg-[rgba(184,144,99,0.2)] text-accent animate-pulse"
                    : "bg-[rgba(13,34,54,0.06)] text-muted"
                )}
              >
                {i < activeStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(i <= activeStep ? "text-app" : "text-muted")}>{step}</span>
            </div>
          ))}
        </div>
        <div className="glass p-4 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{t.eta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardShell({ profile, business, capabilities, unreadCount: initialUnread, children }: Props) {
  const { lang, dir, setLang } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [notifications, setNotifications] = useState<Tables<"notifications">[]>([]);
  const [signingOut, setSigningOut] = useState(false);

  // 'provisioning' and later stages are handled by ProvisioningScreen in the
  // layout; this placeholder now only covers the pre-approval waiting state.
  const isProvisioning = business.status === "pending_approval";

  // Dynamic, industry-aware navigation. Unknown/legacy business types
  // fall back to the full current navigation (100% backward compatible).
  const { nav } = useMemo(
    () => resolveModules(business.business_type, capabilities),
    [business.business_type, capabilities]
  );

  const activeModule = getModuleByPath(pathname, business.business_type);
  const pageTitle = activeModule?.label ?? { ar: "لوحة التحكم", en: "Dashboard" };

  // bilingual "Soon" pill for modules whose page hasn't shipped yet
  const soonLabel = lang === "ar" ? "قريباً" : "Soon";
  // bilingual "Upgrade" pill for plan-locked (showcase) modules
  const upgradeLabel = lang === "ar" ? "ترقية" : "Upgrade";

  // Stable supabase instance — must not be recreated on every render
  const supabase = useMemo(() => createClient(), []);

  const loadNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setNotifications(data);
      setUnread(data.filter((n) => !n.read).length);
    }
  }, [profile.id, supabase]);

  useEffect(() => {
    loadNotifications();
    const channel = supabase
      .channel("notifications:" + profile.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${profile.id}` },
        () => loadNotifications()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadNotifications, profile.id, supabase]);

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", profile.id)
      .eq("read", false);
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (isProvisioning) {
    return <ProvisioningPlaceholder business={business} lang={lang} />;
  }

  return (
    <ToastProvider>
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }} dir={dir}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 w-64 glass-strong flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:static md:translate-x-0 md:z-auto",
          dir === "rtl"
            ? sidebarOpen ? "translate-x-0 right-0" : "max-md:translate-x-full right-0"
            : sidebarOpen ? "translate-x-0 left-0" : "max-md:-translate-x-full left-0"
        )}
      >
        {/* Logo + Business info */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard/overview" className="flex items-center gap-2">
              <motion.div
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[#2b6f77] flex items-center justify-center shadow-md"
                whileHover={{ scale: 1.08, rotate: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Bot className="w-4 h-4 text-white" />
              </motion.div>
              <span className="font-bold text-lg gradient-text">ArqFlow</span>
            </Link>
            <button className="btn-ghost !p-1.5 md:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Business card */}
          <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[rgba(var(--accent-rgb),0.15)] flex items-center justify-center text-accent font-bold text-xs shrink-0">
              {(business.business_name ?? "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate text-app">{business.business_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  business.status === "active" ? "bg-success" : "bg-warning animate-pulse-soft"
                )} />
                <p className="text-[10px] text-muted truncate">
                  {lang === "ar"
                    ? (business.status === "active" ? "نشط" : "معلّق")
                    : (business.status === "active" ? "Active" : "Suspended")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {nav.map((mod) => {
            const Icon = getIcon(mod.icon);
            const label = lang === "ar" ? mod.label.ar : mod.label.en;

            if (!mod.available) {
              return (
                <div
                  key={mod.key}
                  aria-disabled="true"
                  title={soonLabel}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted/50 cursor-default select-none"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                  <span className="ms-auto shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-[rgba(13,34,54,0.07)] text-muted">
                    {soonLabel}
                  </span>
                </div>
              );
            }

            if (mod.locked) {
              return (
                <Link
                  key={mod.key}
                  href={`/dashboard/subscription?upgrade=${mod.key}`}
                  onClick={() => setSidebarOpen(false)}
                  title={upgradeLabel}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted/70 hover:bg-[rgba(var(--accent-rgb),0.04)] hover:text-app transition-all"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                  <span className="ms-auto shrink-0 badge-upgrade flex items-center gap-1 text-[9px]">
                    <Lock className="w-2.5 h-2.5" />
                    {upgradeLabel}
                  </span>
                </Link>
              );
            }

            const active = pathname === mod.href || pathname.startsWith(mod.href + "/");
            return (
              <Link
                key={mod.key}
                href={mod.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[rgba(var(--accent-rgb),0.1)] text-accent"
                    : "text-muted hover:bg-[rgba(var(--accent-rgb),0.04)] hover:text-app hover:translate-x-0.5 rtl:hover:-translate-x-0.5"
                )}
              >
                {/* Active indicator bar */}
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute start-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--accent)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 shrink-0", active && "text-accent")} />
                <span className="truncate">{label}</span>
                {active && (
                  <ChevronRight
                    className={cn("w-3 h-3 ms-auto shrink-0 text-accent", dir === "rtl" ? "rotate-180" : "")}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: wallet mini bar + user */}
        <div className="p-3 border-t border-[var(--border)] space-y-2">
          {/* Mini wallet indicator — static display, actual values from server */}
          <div className="glass rounded-xl px-3 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted font-medium">
                {lang === "ar" ? "رصيد الذكاء الاصطناعي" : "AI Wallet"}
              </span>
              <Link href="/dashboard/usage" className="text-[10px] text-accent hover:underline">
                {lang === "ar" ? "التفاصيل" : "Details"}
              </Link>
            </div>
            <div className="wallet-bar">
              <div
                className="wallet-bar-fill healthy"
                style={{ width: "72%" }}
              />
            </div>
          </div>

          {/* User row */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[rgba(var(--accent-rgb),0.15)] flex items-center justify-center text-accent font-bold text-sm shrink-0">
              {(profile.full_name ?? profile.email ?? "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{profile.full_name ?? profile.email}</p>
              <p className="text-xs text-muted truncate">{business.business_name}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            disabled={signingOut}
            className="btn-ghost w-full justify-start mt-1 text-sm hover:text-danger hover:bg-[rgba(239,68,68,0.06)] transition-colors"
          >
            {signingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span>{lang === "ar" ? "تسجيل الخروج" : "Sign out"}</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 shrink-0 glass border-b border-[var(--border)] flex items-center gap-4 px-4 lg:px-6 relative">
          <button className="btn-ghost !p-2 md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>

          <h1 className="font-bold text-lg flex-1 truncate text-app">
            {lang === "ar" ? pageTitle.ar : pageTitle.en}
          </h1>

          <div className="flex items-center gap-1.5">
            {/* Language toggle */}
            <motion.button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="btn-ghost !px-3 !py-1.5 text-sm font-bold"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              {lang === "ar" ? "EN" : "عر"}
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                className="btn-ghost !p-2 relative"
                onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) loadNotifications(); }}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  key={unread}
                  initial={unread > 0 ? { rotate: -15, scale: 1.3 } : {}}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Bell className="w-5 h-5" />
                </motion.div>
                {unread > 0 && (
                  <motion.span
                    key={`badge-${unread}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -end-0.5 w-4 h-4 rounded-full bg-[var(--danger)] text-white text-[9px] font-bold flex items-center justify-center"
                  >
                    {unread > 9 ? "9+" : unread}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "absolute top-full mt-2 w-80 glass-strong rounded-2xl shadow-2xl z-50",
                      dir === "rtl" ? "left-0" : "right-0"
                    )}
                  >
                    <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                      <h3 className="font-bold">{lang === "ar" ? "الإشعارات" : "Notifications"}</h3>
                      {unread > 0 && (
                        <button onClick={markAllRead} className="text-xs text-accent hover:underline">
                          {lang === "ar" ? "قراءة الكل" : "Mark all read"}
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-muted text-sm text-center p-6">
                          {lang === "ar" ? "لا توجد إشعارات" : "No notifications"}
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <motion.div
                            key={n.id}
                            className={cn(
                              "p-4 border-b border-[var(--border)] last:border-0 cursor-pointer transition-colors hover:bg-[rgba(var(--accent-rgb),0.04)]",
                              !n.read && "bg-[rgba(var(--accent-rgb),0.05)]"
                            )}
                            onClick={() => { if (n.link) router.push(n.link); setNotifOpen(false); }}
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.15 }}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">{n.title}</p>
                                {n.body && <p className="text-xs text-muted mt-0.5">{n.body}</p>}
                                <p className="text-xs text-muted mt-1">{timeAgo(n.created_at, lang)}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <CapabilitiesProvider value={capabilities}>
            {children}
          </CapabilitiesProvider>
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
