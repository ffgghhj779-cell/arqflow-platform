"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [nextTheme, setNextTheme] = useState<"light" | "dark" | null>(null);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  const handleToggle = () => {
    if (isTransitioning) return;
    
    const target = resolvedTheme === "dark" ? "light" : "dark";
    setNextTheme(target);
    setIsTransitioning(true);

    // After the curtain drops down (0.4s), switch the theme underneath
    setTimeout(() => {
      setTheme(target);
      
      // After the theme is applied and the curtain is down, wait a bit and lift the curtain
      setTimeout(() => {
        setIsTransitioning(false);
        setNextTheme(null);
      }, 200);
    }, 400);
  };

  if (!mounted) return <div className="w-9 h-9" />; // Placeholder of the same size

  const currentTheme = resolvedTheme === "dark" ? "dark" : "light";

  return (
    <>
      <button
        onClick={handleToggle}
        className={cn(
          "btn-ghost !p-2 transition-all duration-200 hover:-translate-y-[1px]",
          "text-muted hover:text-app"
        )}
        aria-label="Toggle theme"
      >
        {currentTheme === "dark" ? (
          <Sun className="w-5 h-5" aria-hidden />
        ) : (
          <Moon className="w-5 h-5" aria-hidden />
        )}
      </button>

      {/* The Curtain Transition */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ top: "-100%" }}
            animate={{ top: "0%" }}
            exit={{ top: "100%" }}
            transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
            className={cn(
              "fixed left-0 right-0 h-screen w-screen z-[100] flex items-center justify-center",
              nextTheme === "dark" ? "bg-[#050b14]" : "bg-[#fcfcfc]"
            )}
          >
            {/* Optional: Add a subtle loading indicator or brand mark inside the curtain */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2, duration: 0.2 }}
              className="text-4xl font-display font-extrabold"
            >
              <span className={nextTheme === "dark" ? "text-[#f1f5f9]" : "text-app"}>
                ArqFlow
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
