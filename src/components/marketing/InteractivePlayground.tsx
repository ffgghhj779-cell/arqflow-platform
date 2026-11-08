"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Volume2, VolumeX, Bot, CheckCheck, RefreshCw } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
}

const PRESET_PROMPTS = {
  ar: [
    { label: "سعر باقة الشركات؟", reply: "أهلاً بك! باقة الشركات (Business) قيمتها 2,900 ج.م شهرياً مع ميزانية توكنز سخية تغطي أكثر من 2,500 محادثة متقدمة وتدريب كامل على ملفات نشاطك 🚀" },
    { label: "عايز احجز موعد استشارة", reply: "بالتأكيد! متاح اليوم الساعة 4:00 عصراً أو غداً 11:00 صباحاً. ما الوقت الأنسب لك لتأكيد الحجز فوراً؟ 📅" },
    { label: "ازاي بتربطوا مع واتساب؟", reply: "الربط بيتم في دقيقة واحدة بمجرد مسح كود الـ QR من داخل لوحة التحكم، بدون أي برمجة أو تعقيد تقني! 📲" },
    { label: "هل بتفهموا اللهجة المصرية؟", reply: "طبعاً! البوت مدرب على فهم كل اللهجات العربية والمصرية المحكية والعامية بالإضافة للفصحى والإنجليزية بدقة تامة 🇪🇬" },
  ],
  en: [
    { label: "How much is Business Plan?", reply: "Hello! The Business Plan is 2,900 EGP/mo. It includes a dedicated token budget covering 2,500+ deep customer conversations, CRM sync & full knowledge base training 🚀" },
    { label: "Book a consultation demo", reply: "Sure thing! We have slots open today at 4:00 PM or tomorrow at 11:00 AM. Which one works best for you? 📅" },
    { label: "How does WhatsApp linking work?", reply: "It takes under 60 seconds! Just scan a QR code from your ArqFlow dashboard — no code or API hassle required 📲" },
  ],
};

// Subtle Web Audio synthesized click/pop chime
function playChime(isMuted: boolean) {
  if (isMuted || typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(640, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function InteractivePlayground() {
  const { lang, dir } = useLang();
  const t = useT({
    ar: {
      badge: "تجربة حيّة تفاعلية",
      title: "جرّب موظف الذكاء الاصطناعي الآن بنفسك",
      subtitle: "اضغط على أي استفسار جاهز أو اكتب سؤالك الخاص وشاهد كيف يرد البوت على عملائك في أجزاء من الثانية:",
      botName: "مساعد ArqFlow الذكي",
      status: "متصل الآن ✦ رد فوري",
      placeholder: "اكتب رسالة تجريبية للبوت...",
      soundOn: "الصوت مفعّل",
      soundOff: "صامت",
      reset: "إعادة المحادثة",
      initialGreeting: "مرحباً بك في ArqFlow! 👋 أنا موظفك الذكي المدرب لخدمة عملائك وزيادة مبيعاتك 24/7. اسألني أي حاجة وسأرد عليك فوراً!",
    },
    en: {
      badge: "Live Interactive Demo",
      title: "Test Drive Your AI Employee Now",
      subtitle: "Click any prompt below or type your own question to see how your AI agent replies to customers in milliseconds:",
      botName: "ArqFlow AI Assistant",
      status: "Online ✦ Instant Reply",
      placeholder: "Type a test message...",
      soundOn: "Sound On",
      soundOff: "Muted",
      reset: "Reset Chat",
      initialGreeting: "Welcome to ArqFlow! 👋 I'm your dedicated AI agent trained to serve your customers and boost sales 24/7. Ask me anything!",
    },
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      sender: "bot",
      text: t.initialGreeting,
      time: "12:00 PM",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const presets = lang === "ar" ? PRESET_PROMPTS.ar : PRESET_PROMPTS.en;

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isTyping) return;

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    playChime(soundMuted);

    // Simulate smart AI reply after 700ms typing delay
    setTimeout(() => {
      // Find matching preset or generate intelligent context reply
      const matched = presets.find((p) => p.label.toLowerCase() === text.toLowerCase());
      const replyText = matched
        ? matched.reply
        : lang === "ar"
        ? `ممتاز! بصفتي موظف الذكاء الاصطناعي لنشاطك، يتم تدريبي فوراً على كل تفاصيل منتجاتك وقوائم أسعارك للإجابة على مثل هذا الاستفسار بدقة متناهية وإغلاق الصفقة بنجاح 🎯`
        : `Great question! As your AI employee, I will be trained on your exact catalogs, prices, and FAQs to handle this inquiry flawlessly and close the deal 🎯`;

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      playChime(soundMuted);
    }, 750);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: "bot",
        text: t.initialGreeting,
        time: "12:00 PM",
      },
    ]);
    setIsTyping(false);
  };

  return (
    <section className="w-full py-16 sm:py-24 relative overflow-hidden bg-app">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(var(--accent-rgb), 0.08) 0%, transparent 65%)" }}
        aria-hidden
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-3"
          >
            <span className="badge-premium">
              <Sparkles className="w-3.5 h-3.5" />
              {t.badge}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl font-extrabold text-app font-display tracking-tight"
          >
            <span className="gradient-text-aurora">{t.title}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted text-sm sm:text-base mt-3 leading-relaxed"
          >
            {t.subtitle}
          </motion.p>
        </div>

        {/* WhatsApp Mock Simulator Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 16 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "30px 0px" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong card-elevated rounded-2xl sm:rounded-3xl overflow-hidden border border-app shadow-2xl max-w-3xl mx-auto"
        >
          {/* WhatsApp Header */}
          <div className="bg-[#0b141a] text-white px-4 py-3.5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 end-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0b141a]" />
              </div>
              <div className="text-start">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">{t.botName}</h3>
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[9px] font-black">
                    ✓
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium">{t.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundMuted((m) => !m)}
                className="btn-ghost !p-2 text-white/70 hover:text-white"
                title={soundMuted ? t.soundOn : t.soundOff}
              >
                {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
              </button>
              <button
                onClick={handleReset}
                className="btn-ghost !p-2 text-white/70 hover:text-white"
                title={t.reset}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div
            ref={scrollRef}
            className="h-[280px] sm:h-[360px] overflow-y-auto p-3 sm:p-4 space-y-3 relative overscroll-contain"
            style={{
              backgroundColor: "var(--bg-solid)",
              backgroundImage: "radial-gradient(rgba(var(--accent-rgb), 0.04) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm shadow-sm relative leading-relaxed",
                      isUser
                        ? "bg-[#0f766e] text-white rounded-br-xs"
                        : "bg-[var(--bg-elev)] text-app border border-app rounded-bl-xs"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div className={cn("flex items-center gap-1 text-[10px] mt-1 justify-end", isUser ? "text-teal-200/80" : "text-muted")}>
                      <span>{m.time}</span>
                      {isUser && <CheckCheck className="w-3.5 h-3.5 text-teal-300" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex justify-start"
                >
                  <div className="bg-[var(--bg-elev)] border border-app rounded-2xl rounded-bl-xs px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Preset Buttons */}
          <div
            className="p-2.5 sm:p-3 bg-[var(--bg-elev)] border-t border-app overflow-x-auto no-scrollbar overscroll-x-contain touch-pan-x"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-bold text-muted shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent" />
                {lang === "ar" ? "جرّب تسأل:" : "Try asking:"}
              </span>
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.label)}
                  disabled={isTyping}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold bg-solid hover:bg-[rgba(var(--accent-rgb),0.1)] hover:text-accent border border-app transition-all duration-150 disabled:opacity-50 touch-manipulation"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 sm:p-3 bg-[var(--bg)] border-t border-app flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholder}
              disabled={isTyping}
              className="flex-1 bg-solid border border-app rounded-xl px-3.5 py-2.5 sm:px-4 text-base sm:text-sm text-app placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-[var(--accent)] text-[#050b14] flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-white transition-all shadow-md touch-manipulation"
              aria-label="Send"
            >
              <Send className={cn("w-4 h-4", dir === "rtl" && "rotate-180")} />
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
