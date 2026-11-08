"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/lib/i18n";
import { SUPPORT_WHATSAPP } from "@/lib/plans";
import { Bot, HeadphonesIcon, X } from "lucide-react";
import { WebsiteChatbotModal } from "./WebsiteChatbotModal";

export function WhatsAppFloatingButton() {
  const { lang } = useLang();
  const phone = SUPPORT_WHATSAPP || "201029168056";
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  const supportPrompt = lang === "ar"
    ? "أهلاً، أحتاج إلى التواصل مع الدعم الفني."
    : "Hello, I need to contact technical support.";

  const supportUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(supportPrompt)}`;

  const text = lang === "ar" ? "تواصل معنا" : "Contact Us";
  const aiText = lang === "ar" ? "بدء محادثة مع الذكاء الاصطناعي" : "Start AI Chat";
  const supportText = lang === "ar" ? "الدعم الفني" : "Technical Support";

  return (
    <>
      <AnimatePresence>
        {!isChatOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="fixed bottom-5 start-4 sm:start-6 z-50 flex flex-col-reverse items-start gap-3 pointer-events-auto select-none safe-b"
          >
            {/* Main Toggle Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={text}
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative flex items-center gap-3 p-2.5 sm:p-3 rounded-full bg-[var(--color-brand-navy)] text-white backdrop-blur-xl border border-[var(--border-strong)] shadow-[0_8px_30px_rgba(13,34,54,0.25),0_0_20px_rgba(184,144,99,0.25)] hover:shadow-[0_12px_40px_rgba(13,34,54,0.35),0_0_30px_rgba(184,144,99,0.45)] hover:border-[var(--accent)] transition-all duration-300"
            >
              {/* Pulsing Gold Glow Ring (only when closed) */}
              {!isOpen && (
                <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--color-brand-navy)] opacity-40 blur-md group-hover:opacity-80 animate-pulse transition-opacity -z-10" />
              )}

              {/* Icon Container */}
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[var(--accent)] via-[#d4af37] to-[var(--color-brand-navy)] p-[2px] flex items-center justify-center shrink-0 shadow-md transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-[#f8fbf9] flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="whatsapp"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-center"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="w-7 h-7 sm:w-8 sm:h-8"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            fill="var(--accent)"
                            d="M12.011 2c-5.506 0-9.974 4.47-9.974 9.974 0 1.758.459 3.473 1.332 4.982L2 22l5.166-1.354a9.923 9.923 0 0 0 4.845 1.255h.004c5.505 0 9.974-4.47 9.974-9.975 0-2.664-1.038-5.167-2.923-7.051A9.914 9.914 0 0 0 12.011 2z"
                          />
                          <path
                            fill="#000000"
                            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
                          />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active Status Badge */}
                {!isOpen && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--color-brand-navy)] shadow-sm animate-pulse" />
                )}
              </div>

              {/* Text Badge */}
              {!isOpen && (
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-xs sm:text-sm font-bold text-[#f9f8f5] pe-0 group-hover:pe-2">
                  {text}
                </span>
              )}
            </motion.button>

            {/* Menu Options */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3 mb-2"
                >
                  {/* AI Assistant Option */}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsChatOpen(true);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white text-[var(--color-brand-navy)] shadow-lg hover:shadow-xl border border-gray-100 transition-all hover:scale-105 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-[var(--color-brand-navy)]" />
                    </div>
                    <span className="font-bold text-sm sm:text-base whitespace-nowrap">
                      {aiText}
                    </span>
                  </button>

                  {/* Support Option */}
                  <a
                    href={supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white text-[var(--color-brand-navy)] shadow-lg hover:shadow-xl border border-gray-100 transition-all hover:scale-105 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--color-brand-navy)]/10 flex items-center justify-center shrink-0">
                      <HeadphonesIcon className="w-5 h-5 text-[var(--color-brand-navy)]" />
                    </div>
                    <span className="font-bold text-sm sm:text-base whitespace-nowrap">
                      {supportText}
                    </span>
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Chatbot Modal */}
      <WebsiteChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}

