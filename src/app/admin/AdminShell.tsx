"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Package,
  BarChart3,
  Terminal,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Megaphone,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ToastProvider } from "@/components/ui/Toast";
import { useT } from "@/lib/i18n";

const NAV = [
  { href: "/admin/overview", icon: LayoutDashboard, label: { ar: "نظرة عامة", en: "Overview" } },
  { href: "/admin/payments", icon: CreditCard, label: { ar: "المدفوعات", en: "Payments" } },
  { href: "/admin/clients", icon: Users, label: { ar: "العملاء", en: "Clients" } },
  { href: "/admin/plans", icon: Package, label: { ar: "الخطط", en: "Plans" } },
  { href: "/admin/analytics", icon: BarChart3, label: { ar: "التحليلات", en: "Analytics" } },
  { href: "/admin/logs", icon: Terminal, label: { ar: "سجلات الأتمتة", en: "Automation Logs" } },
  { href: "/admin/visitors", icon: Eye, label: { ar: "زوار الموقع", en: "Site Visitors" } },
  { href: "/admin/marketing", icon: Megaphone, label: { ar: "التسويق والتتبع", en: "Marketing & Tracking" } },
  { href: "/admin/settings", icon: Settings, label: { ar: "الإعدادات", en: "Settings" } },
];

interface Props {
  profile: { id: string; full_name: string | null; email: string | null; avatar_url: string | null; role: string };
  unreadCount: number;
  children: React.ReactNode;
}

export default function AdminShell({ profile, unreadCount, children }: Props) {
  const t = useT({ ar: "لوحة الإدارة", en: "Admin Panel" });
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = (profile.full_name ?? profile.email ?? "A")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <ToastProvider>
      <div className="min-h-screen flex bg-app">
        {/* Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 start-0 z-40 w-64 flex flex-col glass-strong border-e border-app",
            "transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "ltr:max-md:-translate-x-full rtl:max-md:translate-x-full md:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-app shrink-0">
            <Link href="/admin/overview" className="flex items-center gap-2">
              <span className="gradient-text font-bold text-xl tracking-tight">ArqFlow</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-[rgba(var(--accent-rgb),0.15)] text-accent border border-[rgba(var(--accent-rgb),0.25)]">
                Admin
              </span>
            </Link>
            <button
              className="btn-ghost !p-2 md:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                    active
                      ? "bg-[rgba(var(--accent-rgb),0.1)] text-accent font-semibold"
                      : "text-muted hover:bg-[rgba(var(--accent-rgb),0.04)] hover:text-app hover:translate-x-0.5 rtl:hover:-translate-x-0.5"
                  )}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span
                      className="absolute start-0 top-2 bottom-2 w-[3px] rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]"
                    />
                  )}
                  <Icon className={cn("w-4.5 h-4.5 shrink-0 transition-colors", active ? "text-accent" : "text-muted group-hover:text-app")} />
                  <span className="flex-1 truncate">{label.ar} / {label.en}</span>
                  {active && <ChevronRight className="w-3.5 h-3.5 text-accent shrink-0 rtl:rotate-180" />}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="px-4 pb-4 pt-2 border-t border-app shrink-0">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[rgba(var(--accent-rgb),0.04)] transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-teal to-brand-sky flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-app">{profile.full_name ?? "Admin"}</p>
                <p className="text-xs text-muted truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col md:ms-64 min-w-0">
          {/* Top bar */}
          <header className="h-16 glass border-b border-app flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20 rounded-none">
            <div className="flex items-center gap-3">
              <button
                className="btn-ghost !p-2 md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="font-bold text-lg gradient-text hidden sm:block">{t}</h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <Link href="/admin/overview" className="relative btn-ghost !p-2">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 end-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 btn-ghost !px-2 !py-1.5"
                  onClick={() => setUserMenuOpen((p) => !p)}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-teal to-brand-sky flex items-center justify-center text-xs font-bold text-white">
                    {initials}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute end-0 top-full mt-2 w-44 glass-strong rounded-xl overflow-hidden py-1 z-50">
                    <div className="px-3 py-2 border-b border-app">
                      <p className="text-xs text-muted truncate">{profile.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-[rgba(248,113,113,0.08)] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout / تسجيل خروج</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
