"use client";

import { useEffect, useState, type FormEvent } from "react";
import Script from "next/script";
import { X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useT, useLang } from "@/lib/i18n";
import { SUPPORT_WHATSAPP } from "@/lib/plans";

type PopupSettings = {
  enabled: boolean;
  delay: number;
};

type PublicSettingsResponse = {
  facebook_pixel_id: string | null;
  google_analytics_id: string | null;
  popup_settings: PopupSettings;
};

export default function TrackerAndPopup() {
  const { lang } = useLang();
  const [facebookPixelId, setFacebookPixelId] = useState<string | null>(null);
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState<string | null>(null);
  const [popupSettings, setPopupSettings] = useState<PopupSettings>({
    enabled: false,
    delay: 5,
  });
  const [showPopup, setShowPopup] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [bizType, setBizType] = useState("");
  const [phone, setPhone] = useState("");

  const t = useT({
    ar: {
      title: "ابدأ رحلة النجاح مع ArqFlow 🚀",
      desc: "املا البيانات وهنفتحلك ديمو واتساب حقيقي ومجاني مصمم لمجالك تحديداً — قبل ما تدفع أي حاجة!",
      name: "الاسم",
      namePh: "اسمك الكريم",
      bizType: "نوع النشاط",
      bizPh: "اختار مجال نشاطك",
      phone: "رقم الموبايل (واتساب)",
      phonePh: "01xxxxxxxxx",
      submit: "احجز الديمو عبر واتساب",
      types: [
        "مطعم / كافيه",
        "عيادة / مركز طبي",
        "محل / متجر أونلاين",
        "جيم / لياقة",
        "عقارات",
        "فندق / شاليهات",
        "صالون / بيوتي",
        "كورسات / تعليم",
        "صيدلية",
        "مجال آخر",
      ],
      waMessage: (n: string, b: string, p: string) =>
        `مرحباً فريق ArqFlow 👋\n\nعايز أحجز ديمو مجاني.\n\nالاسم: ${n}\nنوع النشاط: ${b}\nرقم الواتساب: ${p}\n\nإمتى أقرب معاد متاح؟`,
    },
    en: {
      title: "Start your success story with ArqFlow 🚀",
      desc: "Fill in your details and we'll open a free live WhatsApp demo tailored for your industry — before paying a pound!",
      name: "Name",
      namePh: "Your name",
      bizType: "Business type",
      bizPh: "Choose your industry",
      phone: "Mobile number (WhatsApp)",
      phonePh: "01xxxxxxxxx",
      submit: "Book the demo via WhatsApp",
      types: [
        "Restaurant / café",
        "Clinic / medical center",
        "Store / online shop",
        "Gym / fitness",
        "Real estate",
        "Hotel / rentals",
        "Salon / beauty",
        "Courses / education",
        "Pharmacy",
        "Other",
      ],
      waMessage: (n: string, b: string, p: string) =>
        `Hello ArqFlow team 👋\n\nI'd like to book a free demo.\n\nName: ${n}\nBusiness type: ${b}\nWhatsApp number: ${p}\n\nWhen is the nearest available slot?`,
    },
  });

  useEffect(() => {
    // Track visitor page view
    fetch("/api/analytics/track", { method: "POST" }).catch(() => {});

    // Fetch public settings from endpoint
    fetch("/api/public-settings")
      .then((res) => res.json())
      .then((data: PublicSettingsResponse) => {
        if (data.facebook_pixel_id) setFacebookPixelId(data.facebook_pixel_id);
        if (data.google_analytics_id) setGoogleAnalyticsId(data.google_analytics_id);
        if (data.popup_settings) setPopupSettings(data.popup_settings);

        // Handle popup delay if enabled
        if (data.popup_settings?.enabled) {
          const submitted = localStorage.getItem("arqflow_popup_submitted");
          const dismissed = localStorage.getItem("arqflow_popup_dismissed");

          if (!submitted && !dismissed) {
            const delayMs = (data.popup_settings.delay ?? 5) * 1000;
            const timer = setTimeout(() => {
              setShowPopup(true);
            }, delayMs);
            return () => clearTimeout(timer);
          }
        }
      })
      .catch((err) => console.error("Failed to load tracking/popup settings:", err));
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("arqflow_popup_dismissed", "true");
    setShowPopup(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    localStorage.setItem("arqflow_popup_submitted", "true");
    const text = encodeURIComponent(t.waMessage(name.trim(), bizType, phone.trim()));
    window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`, "_blank", "noopener,noreferrer");
    setShowPopup(false);
  };

  return (
    <>
      {/* Google Analytics Integration */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel Integration */}
      {facebookPixelId && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${facebookPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${facebookPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Visitor Data Collection Popup */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="glass-strong w-full max-w-md overflow-hidden relative p-7 sm:p-9 shadow-2xl border border-[var(--border-strong)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Gold Accents / Glow background element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--accent)] to-transparent opacity-10 blur-2xl pointer-events-none -z-10" />
              
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[rgba(13,34,54,0.08)] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center sm:text-start">
                <h2 className="font-extrabold text-xl text-app leading-tight mb-2">
                  {t.title}
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  {t.desc}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-semibold mb-1.5 text-app">{t.name}</span>
                  <input
                    className="input-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.namePh}
                    required
                    autoComplete="name"
                  />
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold mb-1.5 text-app">{t.bizType}</span>
                  <select
                    className="input-base"
                    value={bizType}
                    onChange={(e) => setBizType(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      {t.bizPh}
                    </option>
                    {t.types.map((ty) => (
                      <option key={ty} value={ty}>
                        {ty}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="block text-sm font-semibold mb-1.5 text-app">{t.phone}</span>
                  <input
                    className="input-base"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePh}
                    required
                    autoComplete="tel"
                    dir="ltr"
                  />
                </label>

                <button type="submit" className="btn-primary w-full mt-6 py-3 flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5 shrink-0" aria-hidden />
                  <span className="font-bold text-sm">{t.submit}</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
