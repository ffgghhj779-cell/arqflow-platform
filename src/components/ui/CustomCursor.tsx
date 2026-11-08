"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL_COUNT = 5; // number of trailing dots

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  // Live position state
  const mouse = useRef({ x: -200, y: -200 });
  const dot   = useRef({ x: -200, y: -200 });
  const ring  = useRef({ x: -200, y: -200 });
  // Trail history: ring of past positions
  const trail = useRef(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: -200, y: -200 }))
  );

  const isHovered = useRef(false);
  const isClicking = useRef(false);

  useEffect(() => {
    // Only enable on mouse-driven devices
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const onMouseDown = () => {
      isClicking.current = true;
      dotRef.current?.classList.add("clicking");
      ringRef.current?.classList.add("clicking");
    };
    const onMouseUp = () => {
      isClicking.current = false;
      dotRef.current?.classList.remove("clicking");
      ringRef.current?.classList.remove("clicking");
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactive =
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.classList.contains("cursor-pointer");

      if (interactive) {
        isHovered.current = true;
        ringRef.current?.classList.add("hovered");
        dotRef.current?.classList.add("hovered");
      } else {
        isHovered.current = false;
        ringRef.current?.classList.remove("hovered");
        dotRef.current?.classList.remove("hovered");
      }
    };

    window.addEventListener("mousemove",  onMouseMove,  { passive: true });
    window.addEventListener("mouseover",  onMouseOver);
    window.addEventListener("mousedown",  onMouseDown);
    window.addEventListener("mouseup",    onMouseUp);

    // rAF loop — lerp everything
    const loop = () => {
      // Dot: snappy
      dot.current.x += (mouse.current.x - dot.current.x) * 0.5;
      dot.current.y += (mouse.current.y - dot.current.y) * 0.5;

      // Ring: slightly laggy
      ring.current.x += (mouse.current.x - ring.current.x) * 0.18;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.18;

      // Trail: each follows the previous position with decreasing speed
      trail.current[0].x += (dot.current.x - trail.current[0].x) * 0.35;
      trail.current[0].y += (dot.current.y - trail.current[0].y) * 0.35;
      for (let i = 1; i < TRAIL_COUNT; i++) {
        trail.current[i].x += (trail.current[i - 1].x - trail.current[i].x) * 0.4;
        trail.current[i].y += (trail.current[i - 1].y - trail.current[i].y) * 0.4;
      }

      // Apply positions
      if (dotRef.current) {
        const scale = isClicking.current ? 0.6 : 1;
        dotRef.current.style.transform =
          `translate3d(${dot.current.x - 4}px, ${dot.current.y - 4}px, 0) scale(${scale})`;
      }

      if (ringRef.current) {
        const rHalf = isHovered.current ? 20 : 13;
        const scale = isClicking.current ? 0.85 : 1;
        ringRef.current.style.transform =
          `translate3d(${ring.current.x - rHalf}px, ${ring.current.y - rHalf}px, 0) scale(${scale})`;
      }

      // Trail dots
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const el = trailRefs.current[i];
        if (el) {
          const size = 3 - i * 0.4; // shrink with distance
          el.style.width  = `${size}px`;
          el.style.height = `${size}px`;
          el.style.opacity = `${0.5 - i * 0.09}`;
          el.style.transform =
            `translate3d(${trail.current[i].x - size / 2}px, ${trail.current[i].y - size / 2}px, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup",   onMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden sm:block" aria-hidden>
      {/* Trail dots — rendered behind everything */}
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => { trailRefs.current[i] = el; }}
          className="fixed left-0 top-0 rounded-full bg-[var(--accent)]"
          style={{
            width: 3,
            height: 3,
            opacity: 0,
            willChange: "transform, opacity",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Core Dot — solid navy */}
      <div
        ref={dotRef}
        className="fixed left-0 top-0 w-2 h-2 rounded-full bg-[var(--fg)] transition-[width,height,background-color] duration-150 ease-out"
        style={{ willChange: "transform", pointerEvents: "none" }}
      />

      {/* Outer Ring — teal accent */}
      <div
        ref={ringRef}
        className="fixed left-0 top-0 w-[26px] h-[26px] rounded-full border-[1.5px] border-[var(--accent)] bg-[rgba(var(--accent-rgb),0.07)] transition-[width,height,border-color,background-color] duration-200 ease-out"
        style={{ willChange: "transform", pointerEvents: "none" }}
      />

      <style>{`
        /* Hover states */
        .clicking div[ref] { transform: scale(0.6); }

        /* When hovered over interactive elements */
        .hovered.fixed.left-0.top-0.w-2 {
          width: 6px !important;
          height: 6px !important;
          background: var(--accent) !important;
        }
        .hovered.fixed.left-0.top-0.w-\\[26px\\] {
          width: 40px !important;
          height: 40px !important;
          background: rgba(var(--accent-rgb), 0.12) !important;
          border-color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
