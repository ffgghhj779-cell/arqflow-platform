"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTheme } from "next-themes";

/* ─────────────── Types ─────────────── */

interface Particle {
  /** Current position */
  x: number;
  y: number;
  /** Target position (the letter shape) */
  tx: number;
  ty: number;
  /** Scattered origin */
  ox: number;
  oy: number;
  /** Stagger delay (0-1) */
  delay: number;
  /** Radius */
  r: number;
  /** Colour */
  color: string;
  /** Velocity */
  vx: number;
  vy: number;
}

/* ─────────────── Config ─────────────── */

const PARTICLE_GAP   = 3.5;      // tighter sampling for crisp letters
const ANIM_DURATION  = 1500;     // ms initial assembly
const STAGGER_RANGE  = 450;      // ms stagger
const BASE_RADIUS    = 1.5;
const MAX_RADIUS     = 2.4;
const MOUSE_RADIUS   = 120;      // repel distance in px
const REPEL_FORCE    = 16;       // repel strength
const SPRING_FORCE   = 0.085;    // return spring
const FRICTION       = 0.82;     // damping

const LIGHT_COLOR_STOPS: [number, string][] = [
  [0.0,  "#2b6f77"],   // midnight navy
  [0.25, "#0b6b5d"],   // deep teal
  [0.6,  "#12a08a"],   // vibrant teal
  [0.85, "#06b6d4"],   // bright cyan
  [1.0,  "#5fd4bd"],   // mint cyan glow
];

const DARK_COLOR_STOPS: [number, string][] = [
  [0.0,  "#5eead4"],   // light mint teal
  [0.3,  "#5fd4bd"],   // bright teal
  [0.65, "#12a08a"],   // primary teal
  [0.85, "#38bdf8"],   // sky cyan glow
  [1.0,  "#818cf8"],   // soft indigo shimmer
];

function lerpColor(t: number, stops: [number, string][]): string {
  let lo = stops[0];
  let hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      lo = stops[i];
      hi = stops[i + 1];
      break;
    }
  }
  const f = (t - lo[0]) / (hi[0] - lo[0] || 1);
  return mixHex(lo[1], hi[1], f);
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/* ─────────────── Component ─────────────── */

interface ParticleTextProps {
  text?: string;
  className?: string;
}

export default function ParticleText({
  text = "ARQFLOW",
  className = "",
}: ParticleTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const particles    = useRef<Particle[]>([]);
  const animStart    = useRef<number | null>(null);
  const rafId        = useRef<number>(0);
  const isLoopRunning = useRef<boolean>(false);
  const mousePos     = useRef<{ x: number; y: number; active: boolean }>({ x: -3000, y: -3000, active: false });
  const [isMounted, setIsMounted] = useState(false);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const currentStops = isDark ? DARK_COLOR_STOPS : LIGHT_COLOR_STOPS;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ── Build particle targets from text bitmap ── */
  const buildParticles = useCallback((w: number, h: number) => {
    if (w <= 0 || h <= 0) {
      particles.current = [];
      return;
    }

    const off = document.createElement("canvas");
    off.dir = "ltr";
    off.width = w;
    off.height = h;
    const octx = off.getContext("2d");
    if (!octx) return;

    // Large background typography sizing
    let fontSize = Math.floor(Math.min(w * 0.18, h * 0.50));
    if (fontSize < 32) fontSize = 32;
    if (fontSize > 200) fontSize = 200;

    octx.font = `900 ${fontSize}px "Manrope", "Tajawal", "Cairo", system-ui, sans-serif`;
    
    // Add letter spacing to prevent overlapping
    if ('letterSpacing' in octx) {
      (octx as any).letterSpacing = `${Math.floor(fontSize * 0.15)}px`;
    }

    let measuredWidth = octx.measureText(text).width;

    // Scale to fill ~85% of width gracefully
    if (measuredWidth > w * 0.85 && measuredWidth > 0) {
      fontSize = Math.floor(fontSize * ((w * 0.85) / measuredWidth));
      octx.font = `900 ${fontSize}px "Manrope", "Tajawal", "Cairo", system-ui, sans-serif`;
      
      if ('letterSpacing' in octx) {
        (octx as any).letterSpacing = `${Math.floor(fontSize * 0.15)}px`;
      }
    }

    octx.direction = "ltr";
    octx.fillStyle = "#000000";
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillText(text, w / 2, h / 2);

    const imgData = octx.getImageData(0, 0, w, h).data;
    const pts: Particle[] = [];

    for (let y = 0; y < h; y += PARTICLE_GAP) {
      for (let x = 0; x < w; x += PARTICLE_GAP) {
        const pixelY = Math.floor(y);
        const pixelX = Math.floor(x);
        const idx = (pixelY * w + pixelX) * 4;
        const alpha = imgData[idx + 3];
        if (alpha > 128) {
          const normX = x / w;
          const angle = Math.random() * Math.PI * 2;
          const dist  = 260 + Math.random() * 450;

          pts.push({
            x:  x + Math.cos(angle) * dist,
            y:  y + Math.sin(angle) * dist,
            tx: x,
            ty: y,
            ox: x + Math.cos(angle) * dist,
            oy: y + Math.sin(angle) * dist,
            delay: Math.random(),
            r: BASE_RADIUS + Math.random() * (MAX_RADIUS - BASE_RADIUS),
            color: lerpColor(normX, currentStops),
            vx: 0,
            vy: 0,
          });
        }
      }
    }

    // Limit particles for buttery smooth 60fps/120fps performance
    const maxParticles = w < 768 ? 850 : 2500;
    if (pts.length > maxParticles) {
      pts.sort(() => Math.random() - 0.5);
      pts.length = maxParticles;
    }

    particles.current = pts;
  }, [text, currentStops]);

  /* ── Interactive Physics & Render Loop ── */
  const loop = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (animStart.current === null) animStart.current = timestamp;
    const elapsed = timestamp - animStart.current;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const logicalW = canvas.width / dpr;
    const logicalH = canvas.height / dpr;

    ctx.clearRect(0, 0, logicalW, logicalH);

    const pts = particles.current;
    const mx = mousePos.current.x;
    const my = mousePos.current.y;
    const mouseActive = mousePos.current.active;
    let maxVel = 0;

    // Pure particles only: NO solid text clashing under the dots
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const pElapsed = elapsed - p.delay * STAGGER_RANGE;

      if (pElapsed < 0) {
        // Subtle scatter hint before fly-in
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.ox, p.oy, p.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      const flightT = Math.min(pElapsed / ANIM_DURATION, 1);
      const easeT = easeOutCubic(flightT);

      const targetPathX = p.ox + (p.tx - p.ox) * easeT;
      const targetPathY = p.oy + (p.ty - p.oy) * easeT;

      if (flightT < 1) {
        p.x = targetPathX;
        p.y = targetPathY;
      } else {
        // Interactive Mouse Repel (scatter effect)
        if (mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * REPEL_FORCE;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Spring force pulling back to letter position
        const homeDx = p.tx - p.x;
        const homeDy = p.ty - p.y;
        p.vx += homeDx * SPRING_FORCE;
        p.vy += homeDy * SPRING_FORCE;

        // Friction damping
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        const velSq = p.vx * p.vx + p.vy * p.vy;
        if (velSq > maxVel) maxVel = velSq;

        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw glowing particle dot
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Auto-sleep loop once letters assemble and settle — saves 100% CPU on mobile
    if (elapsed > ANIM_DURATION + STAGGER_RANGE + 400 && !mouseActive && maxVel < 0.01) {
      isLoopRunning.current = false;
      return;
    }

    rafId.current = requestAnimationFrame(loop);
  }, []);

  /* ── Wake Animation Loop (only when needed) ── */
  const wakeLoop = useCallback(() => {
    if (isLoopRunning.current) return;
    isLoopRunning.current = true;
    rafId.current = requestAnimationFrame(loop);
  }, [loop]);

  /* ── Start Animation ── */
  const startAnimation = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    animStart.current = null;
    isLoopRunning.current = true;
    rafId.current = requestAnimationFrame(loop);
  }, [loop]);

  /* ── Resize Handling ── */
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const w = Math.floor(rect.width);
    const h = Math.floor(rect.height);

    if (w <= 0 || h <= 0) return;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    buildParticles(w, h);
    startAnimation();
  }, [buildParticles, startAnimation]);

  /* ── Global Pointer Event Listener (works through overlaying elements) ── */
  useEffect(() => {
    if (!isMounted) return;

    handleResize();

    if (document.fonts) {
      document.fonts.ready.then(() => {
        handleResize();
      });
    }

    const handleWindowPointerMove = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= -60 && x <= rect.width + 60 && y >= -60 && y <= rect.height + 60) {
        mousePos.current = { x, y, active: true };
        wakeLoop();
      } else {
        mousePos.current.active = false;
      }
    };

    const handleWindowPointerDown = (e: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // If clicked near the canvas, trigger blast on nearby particles
      if (cx >= -40 && cx <= rect.width + 40 && cy >= -40 && cy <= rect.height + 40) {
        wakeLoop();
        const BLAST_RADIUS = 220;
        const BLAST_FORCE = 35;
        for (let i = 0; i < particles.current.length; i++) {
          const p = particles.current[i];
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < BLAST_RADIUS && dist > 0) {
            const force = (1 - dist / BLAST_RADIUS) * BLAST_FORCE;
            const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }
        }
      }
    };

    const handleWindowPointerLeave = () => {
      mousePos.current.active = false;
    };

    // Pause physics completely when scrolled out of viewport
    let observer: IntersectionObserver | null = null;
    const container = containerRef.current;
    if (container && typeof window !== "undefined" && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) {
          cancelAnimationFrame(rafId.current);
          isLoopRunning.current = false;
        } else {
          wakeLoop();
        }
      }, { threshold: 0.05 });
      observer.observe(container);
    }

    window.addEventListener("pointermove", handleWindowPointerMove, { passive: true });
    window.addEventListener("pointerdown", handleWindowPointerDown, { passive: true });
    window.addEventListener("pointerleave", handleWindowPointerLeave, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerdown", handleWindowPointerDown);
      window.removeEventListener("pointerleave", handleWindowPointerLeave);
      window.removeEventListener("resize", handleResize);
      observer?.disconnect();
      cancelAnimationFrame(rafId.current);
      isLoopRunning.current = false;
    };
  }, [isMounted, handleResize, startAnimation, wakeLoop, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      dir="ltr"
      className={`relative select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        dir="ltr"
        className="block w-full h-full pointer-events-none"
      />
    </div>
  );
}
