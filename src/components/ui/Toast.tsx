"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  body?: string;
  duration?: number;
}

interface ToastContextValue {
  toast:   (opts: { type: ToastType; title: string; body?: string; duration?: number }) => void;
  success: (title: string, body?: string) => void;
  error:   (title: string, body?: string) => void;
  info:    (title: string, body?: string) => void;
  warning: (title: string, body?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  success: () => {},
  error:   () => {},
  info:    () => {},
  warning: () => {},
});

/* Individual toast item with animated progress bar */
function ToastItem({ t, onRemove }: { t: Toast; onRemove: (id: string) => void }) {
  const duration = t.duration ?? 5000;
  const [paused, setPaused] = useState(false);
  const startRef  = useRef<number>(Date.now());
  const elapsed   = useRef<number>(0);
  const rafRef    = useRef<number | null>(null);
  const [progress, setProgress] = useState(100);

  // Run progress countdown
  useEffect(() => {
    if (paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    startRef.current = Date.now() - elapsed.current;

    const tick = () => {
      const now = Date.now();
      elapsed.current = now - startRef.current;
      const pct = Math.max(0, 100 - (elapsed.current / duration) * 100);
      setProgress(pct);
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        onRemove(t.id);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [paused, t.id, duration, onRemove]);

  const styles: Record<ToastType, { border: string; iconBg: string; progressColor: string }> = {
    success: {
      border:        "border-[rgba(16,185,129,0.3)]",
      iconBg:        "bg-[rgba(16,185,129,0.1)]",
      progressColor: "#10b981",
    },
    error: {
      border:        "border-[rgba(239,68,68,0.3)]",
      iconBg:        "bg-[rgba(239,68,68,0.1)]",
      progressColor: "#ef4444",
    },
    warning: {
      border:        "border-[rgba(245,158,11,0.3)]",
      iconBg:        "bg-[rgba(245,158,11,0.1)]",
      progressColor: "#f59e0b",
    },
    info: {
      border:        "border-[rgba(var(--accent-rgb),0.3)]",
      iconBg:        "bg-[rgba(var(--accent-rgb),0.1)]",
      progressColor: "var(--accent)",
    },
  };

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-success"   aria-hidden />,
    error:   <AlertCircle  className="w-4 h-4 text-danger"    aria-hidden />,
    warning: <AlertTriangle className="w-4 h-4 text-warning"  aria-hidden />,
    info:    <Info          className="w-4 h-4 text-accent"   aria-hidden />,
  };

  const s = styles[t.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{   opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "glass-strong pointer-events-auto relative overflow-hidden",
        "border rounded-2xl shadow-xl",
        s.border
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon badge */}
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", s.iconBg)}>
          {icons[t.type]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold leading-snug text-app">{t.title}</p>
          {t.body && <p className="text-xs text-muted mt-1 leading-relaxed">{t.body}</p>}
        </div>

        {/* Close button */}
        <button
          onClick={() => onRemove(t.id)}
          className="btn-ghost !p-1.5 shrink-0 -mt-0.5 -me-1 hover:bg-[var(--bg-solid)]"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Animated progress bar */}
      <div className="absolute bottom-0 start-0 end-0 h-[2px] bg-[var(--border)]">
        <div
          className="h-full rounded-full transition-none"
          style={{
            width:      `${progress}%`,
            background: s.progressColor,
            transition:  paused ? "none" : undefined,
          }}
        />
      </div>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, body, duration }: { type: ToastType; title: string; body?: string; duration?: number }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-4), { id, type, title, body, duration }]);
    },
    []
  );

  const success = useCallback((title: string, body?: string) => toast({ type: "success", title, body }), [toast]);
  const error   = useCallback((title: string, body?: string) => toast({ type: "error",   title, body }), [toast]);
  const info    = useCallback((title: string, body?: string) => toast({ type: "info",    title, body }), [toast]);
  const warning = useCallback((title: string, body?: string) => toast({ type: "warning", title, body }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast container — bottom-right (flipped for RTL via CSS end-4) */}
      <div
        className="fixed bottom-5 end-4 z-[9990] flex flex-col gap-2.5 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none pb-[env(safe-area-inset-bottom)]"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {toasts.map((t) => (
            <ToastItem key={t.id} t={t} onRemove={remove} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
