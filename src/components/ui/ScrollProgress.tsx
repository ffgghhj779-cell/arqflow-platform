"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useLang } from "@/lib/i18n";

export function ScrollProgressBar() {
  const { dir } = useLang();
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    // Only mount on desktop / fine pointer devices to save 100% of spring physics and scroll recalculations on mobile touch screens
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      return;
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 h-[2.5px] z-[9999] pointer-events-none select-none"
      aria-hidden
    >
      <motion.div
        className="h-full bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400"
        style={{
          scaleX,
          transformOrigin: dir === "rtl" ? "100% 50%" : "0% 50%",
          boxShadow: "0 0 14px rgba(95, 212, 189, 0.8), 0 0 4px rgba(56, 189, 248, 0.6)",
        }}
      />
    </div>
  );
}

export default ScrollProgressBar;
