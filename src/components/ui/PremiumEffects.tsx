"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * AnimatedCounter — يعد من 0 للقيمة المستهدفة عند الدخول للـ viewport
 */
export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1800,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [displayed, setDisplayed] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayed.toLocaleString("ar-EG")}{suffix}
    </span>
  );
}

/**
 * MeshBackground — خلفية mesh gradient متحركة قابلة للتخصيص
 */
export function MeshBackground({
  className = "",
  intensity = "normal",
}: {
  className?: string;
  intensity?: "subtle" | "normal" | "strong";
}) {
  const opacityMap = { subtle: 0.5, normal: 1, strong: 1.5 };
  const op = opacityMap[intensity];

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
      style={{ opacity: op }}
    >
      {/* Orb 1 — teal top-left */}
      <motion.div
        className="absolute -top-32 -start-32 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orb 2 — navy bottom-right */}
      <motion.div
        className="absolute -bottom-40 -end-24 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(14,32,56,0.09) 0%, transparent 70%)",
        }}
        animate={{ scale: [1.05, 1, 1.05], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      {/* Orb 3 — small teal accent center-right */}
      <motion.div
        className="absolute top-1/3 end-1/4 w-[280px] h-[280px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
        }}
        animate={{ y: [-16, 16, -16], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

/**
 * TiltCard — كارت بـ 3D tilt بناءً على حركة الماوس
 */
export function TiltCard({
  children,
  className = "",
  intensity = 8,
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 300, damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 300, damping: 30,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
