"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Globe, Github, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang, useT } from "@/lib/i18n";
import { Spinner } from "@/components/ui";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#EA4335"
        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.339 0 3.321 2.714 1.455 6.648L5.266 9.765z"
      />
      <path
        fill="#34A853"
        d="M16.04 15.341c-1.07.727-2.43 1.168-4.04 1.168a7.077 7.077 0 0 1-6.734-4.856L1.455 14.77C3.321 18.704 7.339 21.418 12 21.418c3.065 0 5.864-1.009 8.018-2.909l-3.978-3.168z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.273c0-.818-.082-1.609-.227-2.373H12v4.545h6.464a5.532 5.532 0 0 1-2.4 3.636l3.977 3.168c2.327-2.145 3.649-5.3 3.649-8.976z"
      />
      <path
        fill="#FBBC05"
        d="M5.266 9.765A7.01 7.01 0 0 0 4.909 12c0 .79.136 1.545.357 2.25l-3.81 2.52A11.91 11.91 0 0 1 0 12c0-1.745.37-3.4 1.026-4.909l4.24 2.674z"
      />
    </svg>
  );
}

function LoginForm() {
  const params = useSearchParams();
  const { lang, setLang } = useLang();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = useT({
    ar: {
      title: "تسجيل الدخول",
      subtitle: "ادخل على لوحة التحكم أو ابدأ إعداد الباقة",
      googleSubmit: "تسجيل الدخول بواسطة Google",
      githubSubmit: "تسجيل الدخول بواسطة GitHub",
      authRequired: "يرجى تسجيل الدخول أولاً للمتابعة",
      errorPrefix: "حدث خطأ أثناء الاتصال: ",
      back: "العودة للرئيسية",
    },
    en: {
      title: "Login",
      subtitle: "Access your dashboard or start plan onboarding",
      googleSubmit: "Sign in with Google",
      githubSubmit: "Sign in with GitHub",
      authRequired: "Please sign in first to continue",
      errorPrefix: "An error occurred: ",
      back: "Back to home",
    },
  });

  const next = params.get("next");
  const isAuthRequired = next !== null;
  const paramError = params.get("error");

  async function handleOAuthLogin(provider: "google" | "github") {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next ?? "/dashboard")}`;
    
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-app">
      {/* Background orbs */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" aria-hidden />
      <div
        className="absolute -top-32 -start-32 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.12) 0%, transparent 70%)" }}
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -end-32 w-[450px] h-[450px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(13, 34, 54, 0.15) 0%, transparent 70%)" }}
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="glass-strong card-elevated w-full max-w-md p-8 relative rounded-2xl border border-app shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 font-extrabold text-lg">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-teal to-brand-sky flex items-center justify-center text-white shadow-md">
              <MessageCircle className="w-5 h-5" />
            </span>
            <span className="gradient-text font-display">ArqFlow</span>
          </Link>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="btn-ghost !px-3 text-sm font-semibold"
          >
            <Globe className="w-4 h-4" /> {lang === "ar" ? "EN" : "عربي"}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-app">{t.title}</h1>
        <p className="text-muted text-sm mt-1.5 mb-6 leading-relaxed">{t.subtitle}</p>

        {isAuthRequired && (
          <div className="mb-6 rounded-xl border border-[rgba(var(--accent-rgb),0.3)] bg-[rgba(var(--accent-rgb),0.06)] px-4 py-3 flex items-center gap-3 text-sm text-accent">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{t.authRequired}</span>
          </div>
        )}

        <div className="space-y-3.5">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthLogin("google")}
            disabled={loading}
            className="btn-outline w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-app hover:border-[rgba(var(--accent-rgb),0.4)] hover:bg-solid transition-all font-semibold shadow-sm"
          >
            {loading ? <Spinner /> : (
              <>
                <GoogleIcon className="w-5 h-5" />
                <span>{t.googleSubmit}</span>
              </>
            )}
          </motion.button>

          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleOAuthLogin("github")}
            disabled={loading}
            className="btn-outline w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-app hover:border-[rgba(var(--accent-rgb),0.4)] hover:bg-solid transition-all font-semibold shadow-sm"
          >
            {loading ? <Spinner /> : (
              <>
                <Github className="w-5 h-5 text-app" />
                <span>{t.githubSubmit}</span>
              </>
            )}
          </motion.button>

          {(error || paramError) && (
            <p className="text-danger text-sm bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {t.errorPrefix}
                {error || (paramError === "auth_failed" ? "Authentication Failed" : paramError)}
              </span>
            </p>
          )}
        </div>

        <p className="text-center mt-8">
          <Link href="/" className="text-muted text-xs hover:text-accent transition-colors">
            ← {t.back}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
