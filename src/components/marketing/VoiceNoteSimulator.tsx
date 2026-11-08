"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Mic, Sparkles, Check, CheckCheck, Bot, Cpu, Zap } from "lucide-react";
import { useLang, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Reveal, SectionHeading } from "@/components/marketing/Shared";

export function VoiceNoteSimulator() {
  const { lang, dir } = useLang();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = useT({
    ar: {
      badge: "فهم الفويس نوت المصري",
      title: "عملاءك بيحبوا يبعتوا فويس؟ البوت بيفهم العامية ويرد كأنه إنسان",
      sub: "أكثر من ٧٠٪ من عملاء الواتساب في مصر يفضلون الرسائل الصوتية. نظام ArqFlow يفهم اللهجة المصرية بدقة، يستخرج الطلب، ويرد في ثوانٍ.",
      customerName: "أحمد مصطفى (عميل)",
      voiceDuration: "0:14",
      transcriptionLabel: "التفريغ الصوتي الفوري:",
      transcript: "« مساء الخير يا فندم، عايز أعرف المنيو وعرض الوجبات العائلية وهل في توصيل للشيخ زايد؟ »",
      analysisTitle: "تحليل الذكاء الاصطناعي اللحظي:",
      dialectLabel: "اللهجة:",
      dialectVal: "عامية مصرية (القاهرة والجيزة)",
      intentLabel: "استخراج النية:",
      intentVal: "استفسار منيو + عروض عائلية + نطاق التوصيل",
      speedLabel: "زمن التحليل والرد:",
      speedVal: "١.١ ثانية",
      botReplyTitle: "رد الموظف الذكي الفوري:",
      botReply: "أهلاً بحضرتك يا فندم! 🍔 عرض العيلة النهاردة ٤ برجر كومبو مع بطاطس ولتر بيبسي بـ ٣٢٠ جنيه بس، والتوصيل متاح للشيخ زايد وبيوصل في ٣٥ دقيقة. تحب نسجل الأوردر لحضرتك؟ ✅",
      playHint: "اضغط لتشغيل الفويس نوت وتجربة التحليل الذكي",
    },
    en: {
      badge: "Egyptian Voice Note AI",
      title: "Customers love voice notes? The bot understands colloquial Masry fluently",
      sub: "Over 70% of WhatsApp users in Egypt prefer voice notes. ArqFlow understands Egyptian slang, extracts orders, and replies in seconds.",
      customerName: "Ahmed Mostafa (Customer)",
      voiceDuration: "0:14",
      transcriptionLabel: "Instant Voice-to-Text Transcription:",
      transcript: "\"Good evening! Could you tell me your menu, the family meal specials, and do you deliver to Sheikh Zayed?\"",
      analysisTitle: "Real-Time AI Processing & Insights:",
      dialectLabel: "Dialect Detected:",
      dialectVal: "Egyptian Masry (Cairene)",
      intentLabel: "Extracted Intent:",
      intentVal: "Browse Menu + Family Offers + Delivery Zone",
      speedLabel: "Analysis & Reply Speed:",
      speedVal: "1.1 seconds",
      botReplyTitle: "Instant Intelligent Bot Response:",
      botReply: "Welcome! 🍔 Today's Family Special is 4 Burger Combos with fries & 1L soda for 320 EGP only. Delivery to Sheikh Zayed is available within 35 mins. Would you like to place your order now? ✅",
      playHint: "Click to play the voice note and see live AI analysis",
    },
  });

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      setIsPlaying(true);
      setShowAnalysis(true);
      // Play synthetic pleasant audio chime
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch {}

      if (progress >= 100) setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 100;
          }
          return prev + 5;
        });
      }, 180);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // 24 simulated waveform bar heights
  const bars = [18, 35, 60, 42, 80, 55, 90, 70, 45, 85, 95, 65, 40, 75, 88, 52, 98, 62, 38, 72, 50, 30, 20, 15];

  return (
    <section className="py-20 sm:py-28 bg-app relative overflow-hidden border-b border-app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeading badge={t.badge} title={t.title} subtitle={t.sub} />

        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <Reveal>
            <div className="rounded-3xl border border-slate-700/60 bg-[#070e17] text-white shadow-2xl p-6 sm:p-9 relative overflow-hidden">
              {/* Radial glow */}
              <div className="absolute top-0 end-0 w-80 h-80 bg-[radial-gradient(circle,rgba(20,184,166,0.12)_0%,transparent_70%)] pointer-events-none" />

              {/* Voice Note Player Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    م
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.customerName}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Mic className="w-3 h-3 text-teal-400" />
                      <span>{lang === "ar" ? "رسالة صوتية (واتساب)" : "WhatsApp Voice Note"}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                    {t.voiceDuration}
                  </span>
                </div>
              </div>

              {/* Waveform Player Bar */}
              <div className="mt-6 bg-[#0c1827] border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 text-[#050b14] flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ms-0.5" />}
                </button>

                {/* Animated Waveform Bars */}
                <div className="flex-1 flex items-center gap-1 sm:gap-1.5 h-12 overflow-hidden px-2">
                  {bars.map((h, i) => {
                    const isPlayed = (i / bars.length) * 100 <= progress;
                    return (
                      <motion.div
                        key={i}
                        animate={{
                          height: isPlaying ? [`${Math.max(15, h * 0.4)}%`, `${h}%`, `${Math.max(20, h * 0.7)}%`] : `${h}%`,
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: isPlaying ? Infinity : 0,
                          repeatType: "reverse",
                          delay: (i % 5) * 0.1,
                          ease: "easeInOut",
                        }}
                        className={cn(
                          "w-1.5 sm:w-2 rounded-full transition-colors duration-150",
                          isPlayed ? "bg-teal-400" : "bg-slate-700"
                        )}
                        style={{ height: `${h}%` }}
                      />
                    );
                  })}
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <CheckCheck className="w-4 h-4 text-sky-400" />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center mt-2.5">
                {t.playHint}
              </p>

              {/* Real-Time Live AI Breakdown (Appears when played or active) */}
              <AnimatePresence>
                {showAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 space-y-4 pt-6 border-t border-white/10"
                  >
                    {/* Live Transcription Box */}
                    <div className="bg-[#0e1d2f] border border-teal-500/30 rounded-2xl p-4">
                      <p className="text-xs font-bold text-teal-300 flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        {t.transcriptionLabel}
                      </p>
                      <p className="text-sm text-slate-100 font-medium leading-relaxed font-sans">
                        {t.transcript}
                      </p>
                    </div>

                    {/* AI Insights 3-col Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#0a1625] border border-white/10 rounded-xl p-3">
                        <p className="text-[10px] text-slate-400 mb-0.5">{t.dialectLabel}</p>
                        <p className="text-xs font-bold text-emerald-400">{t.dialectVal}</p>
                      </div>
                      <div className="bg-[#0a1625] border border-white/10 rounded-xl p-3">
                        <p className="text-[10px] text-slate-400 mb-0.5">{t.intentLabel}</p>
                        <p className="text-xs font-bold text-sky-400">{t.intentVal}</p>
                      </div>
                      <div className="bg-[#0a1625] border border-white/10 rounded-xl p-3">
                        <p className="text-[10px] text-slate-400 mb-0.5">{t.speedLabel}</p>
                        <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" />
                          {t.speedVal}
                        </p>
                      </div>
                    </div>

                    {/* Bot Smart Response */}
                    <div className="bg-gradient-to-r from-teal-500/15 to-emerald-500/10 border border-teal-500/30 rounded-2xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-teal-400 text-[#050b14] flex items-center justify-center font-bold text-xs">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-teal-300">{t.botReplyTitle}</span>
                      </div>
                      <p className="text-sm text-slate-100 leading-relaxed font-medium">
                        {t.botReply}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default VoiceNoteSimulator;
