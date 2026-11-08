"use client";

import {
  UtensilsCrossed,
  Stethoscope,
  Dumbbell,
  ShoppingBag,
  Building2,
  Hotel,
  Star,
  TrendingUp,
} from "lucide-react";
import { useT } from "@/lib/i18n";
import { Reveal, PageHero, CTABanner } from "@/components/marketing/Shared";

export default function TestimonialsClient() {
  const t = useT({
    ar: {
      badge: "آراء العملاء",
      title: "نتايج حقيقية من بيزنس حقيقي",
      sub: "أصحاب أنشطة من مجالات مختلفة بيحكوا إيه اللي اتغير بعد ما وظّفوا موظف ArqFlow الذكي.",
      note: "أسماء الأنشطة معدّلة للحفاظ على خصوصية عملائنا.",
      items: [
        {
          icon: UtensilsCrossed,
          biz: "مطعم ومأكولات سريعة — الرياض",
          name: "فيصل س.",
          quote: "كنا بنخسر طلبات الليل وأوقات الذروة. دلوقتي البوت بياخد الأوردر كامل بالعنوان والتفاصيل ونصحى نلاقي كل الطلبات جاهزة ومنظمة في الداشبورد.",
          metric: "+٤٠٪",
          metricLabel: "زيادة في الطلبات أول شهر",
        },
        {
          icon: Stethoscope,
          biz: "عيادة أسنان وتجميل — جدة",
          name: "د. مريم ع.",
          quote: "السكرتارية كانت بتقضي نص يومها بترد على الأسعار والمواعيد. البوت خد الشغل ده كله، والحجوزات بقت بتتسجل لوحدها حتى بعد ساعات العمل.",
          metric: "-٧٠٪",
          metricLabel: "تقليل في المكالمات الروتينية",
        },
        {
          icon: Dumbbell,
          biz: "أكاديمية لياقة وجيم — القاهرة",
          name: "عمر ح.",
          quote: "أكتر وقت بييجي فيه استفسارات هو بالليل بعد ما الناس تخلص شغل. البوت بيرد عليهم في ثانية ويبعتلهم العروض، وبقينا بنقفل اشتراكات جديدة فوراً.",
          metric: "+٢٥٪",
          metricLabel: "زيادة في الاشتراكات الجديدة",
        },
        {
          icon: ShoppingBag,
          biz: "متجر ملابس وأزياء أونلاين",
          name: "سارة ك.",
          quote: "عملائي أغلبهم بيبعتوا فويسات: «المقاس متوفر؟» «التوصيل كم ياخذ؟». البوت بيفهم الصوتيات واللهجات ويرد بالتفاصيل والصور فوراً.",
          metric: "< ٥ ثواني",
          metricLabel: "متوسط الرد على أي استفسار",
        },
        {
          icon: Building2,
          biz: "شركة تسويق وتطوير عقاري",
          name: "محمود ر.",
          quote: "العميل اللي بيسأل عن عقار وما يلاقي رد سريع بيشوف غيرنا. البوت بيرد فوراً بالتفاصيل والصور ويحجز موعد المعاينة — مبيعاتنا حسّت بالفرق بسرعة.",
          metric: "x٣",
          metricLabel: "أضعاف عدد المعاينات المحجوزة",
        },
        {
          icon: Hotel,
          biz: "منتجع وشاليهات سياحية",
          name: "هشام ف.",
          quote: "في المواسم بيجيلنا مئات الرسائل يومياً عن الأسعار والمواعيد المتاحة. البوت بيرد على الجميع ويسجّل الحجز بدقة تامة.",
          metric: "١٠٠٪",
          metricLabel: "من الرسائل بتاخد رد فوري",
        },
      ],
    },
    en: {
      badge: "Testimonials",
      title: "Real results from real businesses",
      sub: "Business owners across industries share what changed after hiring their ArqFlow AI employee.",
      note: "Business names adjusted to protect our clients' privacy.",
      items: [
        {
          icon: UtensilsCrossed,
          biz: "Fast Food & Diner — Riyadh",
          name: "Faisal S.",
          quote: "We were losing late-night orders. Now the bot takes the complete order with address and details while we sleep, and we wake up to organized orders in our dashboard.",
          metric: "+40%",
          metricLabel: "more orders in the first month",
        },
        {
          icon: Stethoscope,
          biz: "Dental & Aesthetics Clinic — Jeddah",
          name: "Dr. Mariam A.",
          quote: "Our front desk spent half the day answering pricing and availability. The bot took over, and appointments now log automatically even after hours.",
          metric: "-70%",
          metricLabel: "fewer routine calls",
        },
        {
          icon: Dumbbell,
          biz: "Fitness Club & Gym — Cairo",
          name: "Omar H.",
          quote: "Most inquiries peak at night. The bot replies in a second and sends them offers — closing new memberships effortlessly.",
          metric: "+25%",
          metricLabel: "more new memberships",
        },
        {
          icon: ShoppingBag,
          biz: "Online Fashion Boutique",
          name: "Sara K.",
          quote: "Most of my customers send voice notes asking about size and shipping. The bot understands voice notes in any dialect and replies with photos and specs.",
          metric: "< 5s",
          metricLabel: "average reply to any inquiry",
        },
        {
          icon: Building2,
          biz: "Real Estate Brokerage",
          name: "Mahmoud R.",
          quote: "A buyer asking about property who waits an hour moves on. The bot replies instantly with brochures and schedules viewings — boosting our closings.",
          metric: "3x",
          metricLabel: "more viewings booked",
        },
        {
          icon: Hotel,
          biz: "Resort & Holiday Chalets",
          name: "Hesham F.",
          quote: "During peak seasons we receive hundreds of chats daily. The bot replies to everyone and confirms bookings accurately.",
          metric: "100%",
          metricLabel: "of inquiries receive instant replies",
        },
      ],
    },
  });

  return (
    <>
      <PageHero badge={t.badge} title={t.title} subtitle={t.sub} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.items.map((it, i) => (
            <Reveal key={it.biz} delay={i * 0.07}>
              <figure className="card card-hover p-6 sm:p-7 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-11 h-11 icon-chip shrink-0">
                    <it.icon className="w-5 h-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{it.name}</p>
                    <p className="text-muted text-xs truncate">{it.biz}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3" aria-label="5/5">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 text-warning fill-current" aria-hidden />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed flex-1">“{it.quote}”</blockquote>
                <figcaption className="mt-5 pt-4 border-t border-app flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-success shrink-0" aria-hidden />
                  <span className="text-xl font-extrabold gradient-text">{it.metric}</span>
                  <span className="text-muted text-xs leading-snug">{it.metricLabel}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="text-center text-muted text-xs mt-8">{t.note}</p>
      </section>
      <CTABanner />
    </>
  );
}
