import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

const SYSTEM_PROMPT = `أنت المساعد الذكي الرسمي لمنصة Arq Flow (أرك فلو). 
مهمتك هي الرد على استفسارات العملاء المحتملين وإقناعهم بالاشتراك في خدماتنا، وشرح المميزات والأسعار لهم بناءً على المعلومات التالية فقط.

# عن المنصة (Arq Flow):
أرك فلو هي منصة ذكية توفر روبوتات محادثة (Chatbots) متطورة جداً باستخدام الذكاء الاصطناعي للرد على العملاء عبر الواتساب والموقع الإلكتروني.
النظام مصمم للمطاعم، المحلات، العيادات، والشركات لزيادة المبيعات وتقليل ضغط خدمة العملاء.

# لوحة التحكم والمميزات الفعلية من الداخل (Dashboard Features):
يحصل العميل على لوحة تحكم كاملة تشمل:
1. إعدادات الذكاء الاصطناعي (AI Settings): تحديد شخصية البوت، طريقة رده، وتدريبه.
2. قاعدة المعرفة (Knowledge Base): يمكن للعميل رفع ملفات (PDF, Word) والأسئلة الشائعة ليتعلم منها البوت ويرد منها فوراً.
3. المبيعات والطلبات (Orders & Products): إدارة الكتالوج، المنتجات، واستقبال الطلبات تلقائياً من الواتساب.
4. الحجوزات (Services): نظام حجز مواعيد تلقائي (للعيادات والخدمات).
5. العملاء (CRM): تسجيل كل عميل، تفضيلاته، وتاريخ محادثاته.
6. المحادثات (Conversations): صندوق وارد للرد اليدوي (Human Handoff) في حال احتاج العميل للتدخل.
7. الحملات الإعلانية (Broadcasts): إرسال رسائل ترويجية وتذكيرات عبر الواتساب.
8. التحليلات (Analytics): تقارير كاملة عن أداء البوت والمبيعات.

# نظام المحاسبة (Token-Wallet Billing):
نحن لا نبيع باقات بعدد رسائل محدد! بل نستخدم نظام "المحفظة" (Token-Wallet).
العميل يدفع سعر الباقة، ويتحول المبلغ إلى رصيد (EGP) في محفظته. البوت يستهلك من هذا الرصيد بناءً على تكلفة التوكنز الفعلية.
في حال تبقي رصيد ولم تنتهِ الصلاحية، يتم ترحيل الرصيد للشهر التالي عند التجديد!

# الباقات والأسعار:
1. تجربة مجانية (Free Trial): رصيد مجاني وصلاحية 24 ساعة لتجربة لوحة التحكم بالكامل.
2. باقة ستارتر (Starter): 500 جنيه/شهرياً (رسوم إعداد لأول مرة 2500 جنيه). تناسب المحلات والعيادات للردود السريعة، محادثات نصية، تحويل لموظف، وتسجيل المحادثات.
3. باقة بيزنس (Business): 1100 جنيه/شهرياً (إعداد 4000 جنيه). الأقوى للمطاعم والمتاجر! تشمل موديل Sonnet الأذكى، فهم الرسائل الصوتية، استقبال طلبات وحجوزات، وروابط ذكية، وذاكرة تفضيلات العملاء.
4. باقة إنتربرايز (Enterprise): 1500 جنيه/شهرياً (إعداد 7000 جنيه). فهم وتحليل الصور، أعمق ذاكرة، بوت موقع ويب، وتقارير متقدمة.

# طرق الدفع:
إنستاباي (InstaPay)، فودافون كاش، وي باي، ورقم التحويل هو 01029168056. الدعم الفني متاح على نفس الرقم.

# تعليمات الرد:
- الرد بلغة ولهجة المستخدم (عربي/إنجليزي/سعودي/مصري/خليجي)، وبأسلوب لبق، محترم، وودي ولكن احترافي.
- المنصة تخدم الأنشطة التجارية في السعودية ومصر والوطن العربي.
- كن مختصراً ومباشراً وضع نقاط للإيضاح.
- إذا سأل العميل "ما هي المميزات؟"، اذكر مميزات لوحة التحكم (المنتجات، قاعدة المعرفة، المحفظة...).
- شجع العميل على التسجيل وبدء التجربة المجانية.
- لا تخترع أي معلومات غير موجودة هنا.
`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.ROOYA_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        reply: "عذراً، نظام الذكاء الاصطناعي غير متصل حالياً (مفتاح API غير متوفر). يرجى التواصل معنا عبر الواتساب على 01029168056." 
      });
    }

    const messagesPayload = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message },
    ];

    const aiRes = await fetch(process.env.ROOYA_API_KEY ? "https://llm.rooyai.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.ROOYA_API_KEY ? "gpt-4o-mini" : "gpt-4o-mini",
        messages: messagesPayload,
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) {
      console.error("AI API Error:", await aiRes.text());
      return NextResponse.json({ error: "Failed to generate reply" }, { status: 500 });
    }

    const aiJson = await aiRes.json();
    const reply = aiJson.choices[0].message.content;

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Website Chatbot Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
