"use client";

import { motion } from "framer-motion";
import { useLang, useT } from "@/lib/i18n";
import { formatEGP } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, AlertCircle, Sparkles } from "lucide-react";

interface WalletGaugeProps {
  percentage: number; // 0 to 100 (consumed %)
  balanceEgp: number; // total wallet budget
  remainingEgp: number; // remaining customer display EGP
  currency?: string;
  size?: number; // width & height in px, default 200
  strokeWidth?: number;
  showDetails?: boolean;
}

export function WalletGauge({
  percentage,
  balanceEgp,
  remainingEgp,
  currency = "EGP",
  size = 200,
  strokeWidth = 14,
  showDetails = true,
}: WalletGaugeProps) {
  const { lang } = useLang();
  const t = useT({
    ar: {
      remaining: "الرصيد المتبقي",
      consumed: "مستهلك",
      healthy: "الرصيد بحالة ممتازة",
      moderate: "استهلاك ملحوظ",
      critical: "الرصيد أوشك على النفاد",
    },
    en: {
      remaining: "Remaining Balance",
      consumed: "Consumed",
      healthy: "Healthy Balance",
      moderate: "Moderate Usage",
      critical: "Low Balance Alert",
    },
  });

  const clampedPct = Math.min(100, Math.max(0, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Stroke offset calculates how much to fill
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  // Determine health tier
  const isCritical = clampedPct >= 90;
  const isModerate = clampedPct >= 75 && clampedPct < 90;

  const gradientId = `wallet-gauge-grad-${Math.round(clampedPct)}`;

  const statusConfig = isCritical
    ? {
        label: t.critical,
        icon: AlertCircle,
        textColor: "text-danger",
        badgeBg: "bg-danger/10 border-danger/20 text-danger",
        fromColor: "#ef4444",
        toColor: "#f87171",
        glow: "rgba(239, 68, 68, 0.3)",
      }
    : isModerate
    ? {
        label: t.moderate,
        icon: AlertTriangle,
        textColor: "text-warning",
        badgeBg: "bg-warning/10 border-warning/20 text-warning",
        fromColor: "#f59e0b",
        toColor: "#fbbf24",
        glow: "rgba(245, 158, 11, 0.25)",
      }
    : {
        label: t.healthy,
        icon: ShieldCheck,
        textColor: "text-accent",
        badgeBg: "bg-[rgba(var(--accent-rgb),0.1)] border-[rgba(var(--accent-rgb),0.2)] text-accent",
        fromColor: "var(--accent)",
        toColor: "#5fd4bd",
        glow: "var(--accent-glow)",
      };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex flex-col items-center text-center">
      {/* SVG Circular Meter */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={statusConfig.fromColor} />
              <stop offset="100%" stopColor={statusConfig.toColor} />
            </linearGradient>
            <filter id={`gauge-glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={statusConfig.glow} />
            </filter>
          </defs>

          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-30"
          />

          {/* Animated active arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
            filter={`url(#gauge-glow-${gradientId})`}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <motion.span
            className="text-2xl sm:text-3xl font-extrabold font-display text-app leading-none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {formatEGP(remainingEgp, lang, currency)}
          </motion.span>
          <span className="text-[11px] font-medium text-muted mt-1 leading-tight">
            {t.remaining}
          </span>
          <span className="text-[10px] text-muted/70 mt-0.5">
            ({clampedPct}% {t.consumed})
          </span>
        </div>
      </div>

      {/* Details & Health Badge */}
      {showDetails && (
        <motion.div
          className="mt-4 flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeBg}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
