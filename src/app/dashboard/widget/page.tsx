"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Code2, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Field } from "@/components/ui";

interface WidgetConfig {
  color: string;
  bot_name: string;
  welcome_message: string;
  logo_url?: string;
  font_family?: string;
  position?: string;
}

export default function WidgetSettingsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [business, setBusiness] = useState<any>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const { success, error: showError } = useToast();
  
  const [config, setConfig] = useState<WidgetConfig>({
    color: "#2563eb",
    bot_name: "",
    welcome_message: "مرحباً بك! كيف يمكنني مساعدتك اليوم؟",
    font_family: "Cairo",
    position: "right",
    logo_url: ""
  });
  const [loading, setLoading] = useState(false);
  const [appUrl, setAppUrl] = useState("https://arqflow.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    async function loadBusiness() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();
      
      if (data) {
        setBusiness(data);
        if ((data as any).widget_config) {
          setConfig({
            color: "#2563eb",
            font_family: "Cairo",
            position: "right",
            logo_url: "",
            ...(data as any).widget_config
          });
        } else {
          setConfig((prev) => ({
            ...prev,
            bot_name: data.business_name || "المساعد الذكي",
          }));
        }
      }
      setLoadingInitial(false);
    }
    loadBusiness();
  }, [supabase]);

  if (loadingInitial) return <div className="p-8 text-center text-muted">جاري التحميل...</div>;
  if (!business) return null;

  if (business.plan_id !== "enterprise") {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">بوت الموقع الإلكتروني</h1>
        <div className="card p-6 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
            <AlertCircle className="w-5 h-5" />
            <span>ميزة غير متاحة</span>
          </div>
          <div className="mt-2 flex flex-col gap-4 text-red-900">
            <p>
              هذه الميزة متاحة فقط في باقة الإنتربرايز (Enterprise). تتيح لك هذه الميزة إضافة البوت الخاص بك إلى موقعك الإلكتروني كـ Web Widget ليجيب على استفسارات عملائك مباشرة.
            </p>
            <Link href="/dashboard/subscription" className="btn-primary w-fit">
              ترقية الباقة الآن
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ widget_config: config } as any)
        .eq("id", business.id);

      if (error) throw error;
      success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      console.error("Error saving widget config:", error);
      showError("حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  const widgetCode = `<script src="${appUrl}/widget.js" data-business-id="${business.id}"></script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(widgetCode);
    success("تم نسخ الكود");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">بوت الموقع الإلكتروني (Web Widget)</h1>
        <p className="text-muted mt-2">
          قم بتخصيص شكل البوت الخاص بك ونسخ كود التضمين لإضافته إلى موقعك.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold">إعدادات المظهر</h2>
              <p className="text-muted text-sm mt-1">تحكم في اسم وألوان ورسالة البوت لتناسب هويتك التجارية</p>
            </div>
            
            <Field label="اسم البوت">
              <input
                className="input-base"
                value={config.bot_name}
                onChange={(e) => setConfig({ ...config, bot_name: e.target.value })}
                placeholder="مثال: مساعد أرك فلو"
              />
            </Field>

            <Field label="رابط الشعار (صورة البوت)">
              <input
                className="input-base"
                value={config.logo_url || ""}
                onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                placeholder="رابط الصورة (اتركه فارغاً لاستخدام شعار البيزنس)"
                dir="ltr"
              />
            </Field>

            <Field label="اللون الأساسي">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={config.color}
                  onChange={(e) => setConfig({ ...config, color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer rounded border border-[var(--border)]"
                />
                <input
                  type="text"
                  value={config.color}
                  onChange={(e) => setConfig({ ...config, color: e.target.value })}
                  className="input-base flex-1 font-mono text-left"
                  dir="ltr"
                />
              </div>
            </Field>

            <Field label="الخط (نوع النص)">
              <select 
                className="input-base bg-white"
                value={config.font_family || "Cairo"}
                onChange={(e) => setConfig({ ...config, font_family: e.target.value })}
              >
                <option value="Cairo">Cairo (كيرو)</option>
                <option value="Tajawal">Tajawal (تجوال)</option>
                <option value="Almarai">Almarai (المراعي)</option>
                <option value="system-ui">الخط الافتراضي للنظام</option>
              </select>
            </Field>

            <Field label="موضع الويدجيت">
              <select 
                className="input-base bg-white"
                value={config.position || "right"}
                onChange={(e) => setConfig({ ...config, position: e.target.value })}
              >
                <option value="right">يمين الشاشة</option>
                <option value="left">يسار الشاشة</option>
              </select>
            </Field>

            <Field label="الرسالة الترحيبية">
              <textarea
                className="input-base min-h-[80px]"
                value={config.welcome_message}
                onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                placeholder="كيف يمكنني مساعدتك؟"
              />
            </Field>

            <button onClick={handleSave} disabled={loading} className="btn-primary w-full mt-4 flex justify-center items-center gap-2">
              <Save className="h-4 w-4" />
              {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </button>
          </div>

          <div className="card p-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold">كود التضمين</h2>
              <p className="text-muted text-sm mt-1">
                انسخ هذا الكود وضعه في موقعك (يُفضل قبل إغلاق وسم &lt;/body&gt;)
              </p>
            </div>
            <div className="relative mt-2">
              <pre className="p-4 bg-[var(--bg)] rounded-lg text-left font-mono text-sm overflow-x-auto whitespace-pre-wrap direction-ltr break-all border border-[var(--border)]" dir="ltr">
                {widgetCode}
              </pre>
              <button
                className="btn-ghost absolute top-2 right-2 text-xs flex items-center gap-1 !py-1 !px-2 bg-white/50 backdrop-blur"
                onClick={copyCode}
              >
                <Code2 className="h-3 w-3" />
                نسخ
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview (Simplified) */}
        <div>
          <h3 className="font-semibold mb-4">معاينة البوت</h3>
          <div 
            className="border rounded-xl shadow-sm bg-gray-50 h-[500px] relative overflow-hidden flex flex-col"
            style={{ fontFamily: config.font_family === 'system-ui' ? 'inherit' : `"${config.font_family}", sans-serif` }}
          >
            <div 
              className="p-4 text-white flex items-center gap-3" 
              style={{ backgroundColor: config.color }}
            >
              {config.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover bg-white" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  {config.bot_name ? config.bot_name.charAt(0) : "ب"}
                </div>
              )}
              <span className="font-bold">{config.bot_name || "اسم البوت"}</span>
            </div>
            
            <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="bg-white border text-slate-900 self-start p-3 rounded-xl rounded-tr-sm max-w-[80%] text-sm shadow-sm">
                {config.welcome_message || "رسالة ترحيبية..."}
              </div>
              <div 
                className="text-white self-end p-3 rounded-xl rounded-tl-sm max-w-[80%] text-sm shadow-sm"
                style={{ backgroundColor: config.color }}
              >
                رسالة العميل تظهر هنا
              </div>
            </div>

            <div className="p-3 bg-white border-t flex gap-2">
              <div className="flex-1 border rounded-full px-4 py-2 text-sm text-gray-400 bg-gray-50">
                اكتب رسالتك...
              </div>
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: config.color }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

