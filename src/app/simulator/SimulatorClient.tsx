"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User } from "lucide-react";

export default function SimulatorClient({ business }: { business: any }) {
  const router = useRouter();
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: business.greeting_message || "أهلاً بك! كيف يمكنني مساعدتك اليوم؟",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          businessId: business.id,
          history: messages.slice(-5), // Send up to the last 5 messages to preserve context
        }),
      });
      const json = await res.json();
      
      if (res.ok && json.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: json.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "عذراً، حدث خطأ أثناء الاتصال بالخادم." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "عذراً، حدث خطأ في الشبكة." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gradient-to-br dark:from-[#1a2f3c] dark:to-[#21394a] rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl overflow-hidden relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#1a2f3c]/80 backdrop-blur-md z-10 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-teal flex items-center justify-center shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">بوت {business.business_name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">نسخة تجريبية للمحاكاة (Simulator)</p>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50 dark:bg-black/20">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm dark:shadow-lg ${msg.role === "user" ? "bg-accent/20 text-accent" : "bg-gradient-to-tr from-brand-teal to-teal-400 text-white"}`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[85%] whitespace-pre-wrap text-sm sm:text-base leading-relaxed shadow-sm ${
              msg.role === "user" 
                ? "bg-accent text-white rounded-tl-sm dark:shadow-accent/20" 
                : "bg-white text-slate-800 border border-slate-200 rounded-tr-sm dark:bg-white/10 dark:text-white dark:border-white/5 dark:backdrop-blur-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm dark:shadow-lg bg-gradient-to-tr from-brand-teal to-teal-400 text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tr-sm bg-white text-slate-800 border border-slate-200 shadow-sm dark:bg-white/10 dark:text-white dark:border-white/5 dark:backdrop-blur-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-brand-teal animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-white/90 dark:bg-[#1a2f3c]/90 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالة لتجربة البوت..."
            disabled={loading}
            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full py-4 px-6 pe-16 focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 shadow-sm dark:shadow-none"
            dir="rtl"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute left-2 w-11 h-11 rounded-full bg-gradient-to-tr from-brand-teal to-teal-400 text-white flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-teal-500/20"
          >
            <Send className="w-5 h-5 rtl:-scale-x-100 -ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
