# توثيق تعديلات قاعدة البيانات — دعم Meta WhatsApp Cloud API
**تاريخ التعديل:** 18 أكتوبر 2026  
**مشروع Supabase:** `Arq Flow databases` (`zjathejcdkpxjyvululp`)  
**الحالة:** تم التنفيذ والتحقق بنجاح على قاعدة البيانات المباشرة ✅

---

## 📌 ملخص التغييرات

تم تحديث وتجهيز جداول قاعدة البيانات لتتوافق بالكامل مع متطلبات **Meta WhatsApp Cloud API (الربط الرسمي)**، مع الحفاظ الكامل على البيانات القديمة والتوافق التراجعي (Backward Compatibility).

---

## 1️⃣ جدول `instances` (ربط أرقام الواتساب)

تمت إضافة الأعمدة التالية لتخزين تفاصيل الحساب الرسمي من Meta:

| اسم العمود | النوع (Type) | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `waba_id` | `TEXT` | `NULL` | معرّف حساب واتساب للأعمال (WhatsApp Business Account ID) من Meta. |
| `phone_number_id` | `TEXT` | `NULL` | معرّف رقم الهاتف الخاص بـ Meta Graph API (يُستخدم لإرسال واستقبال الرسائل). |
| `meta_access_token` | `TEXT` | `NULL` | توكن الوصول الدائم/الممنوح من العميل أثناء الـ Embedded Signup للتحكم بالرقم. |
| `meta_token_expires_at`| `TIMESTAMPTZ` | `NULL` | تاريخ انتهاء التوكن (إن وجد). |
| `display_phone_number` | `TEXT` | `NULL` | الرقم المعروض بتنسيقه الدولي (مثال: `+20 109 036 2926`). |
| `connection_status` | `TEXT` | `'disconnected'` | حالة الاتصال الموحدة (`connected`, `disconnected`, `pending`). |

### الفهارس المضافة (Indexes):
* `idx_instances_phone_number_id`: للبحث الفوري اللحظي عند استلام Webhook من Meta لمعرفة أي نشاط تجاري تتبعه الرسالة.
* `idx_instances_waba_id`: للبحث السريع بحساب الـ WABA.

---

## 2️⃣ جدول `conversations` (المحادثات وإدارة نافذة الـ 24 ساعة)

وفقاً لسياسة Meta، تبدأ نافذة مجانية مدتها 24 ساعة للرد على العميل عند إرسال أي رسالة واردة. تم دعم ذلك بالأعمدة التالية:

| اسم العمود | النوع (Type) | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `meta_conversation_id` | `TEXT` | `NULL` | معرّف المحادثة الصادر من Meta (المستخدم في تتبع الفواتير والتقارير). |
| `window_expires_at` | `TIMESTAMPTZ` | `NULL` | وقت انتهاء نافذة الـ 24 ساعة لخدمة العملاء. بعد هذا الوقت يلزم إرسال Template. |
| `conversation_category`| `TEXT` | `'service'` | تصنيف المحادثة من Meta (`service`, `utility`, `marketing`, `authentication`). |

### الفهارس المضافة:
* `idx_conversations_window_expires`: لفحص المحادثات النشطة أو المنتهية نافذتها بسهولة.

---

## 3️⃣ جدول `messages` (الرسائل وحالات التسليم)

Meta ترسل إشعارات لحظية عبر الـ Webhook عند إرسال أو تسليم أو قراءة الرسالة:

| اسم العمود | النوع (Type) | القيمة الافتراضية | الوصف |
| :--- | :--- | :--- | :--- |
| `status` | `TEXT` | `'sent'` | حالة الرسالة (`sent`, `delivered`, `read`, `failed`, `received`). |
| `error_message` | `TEXT` | `NULL` | تفاصيل أي خطأ في حال فشل تسليم الرسالة من طرف Meta. |
| `meta_raw` | `JSONB` | `'{}'` | حفظ الـ Payload الخام للرسالة للرجوع إليه عند الحاجة لمرفقات أو وسائط. |

### الفهارس المضافة:
* `idx_messages_wa_message_id`: فهرس فريد للبحث بـ `wa_message_id` فور وصول إشعار القراءة/التسليم لتحديث الحالة في أجزاء من الثانية.
* `idx_messages_status`: لتسريع استعلامات تصفية الرسائل حسب حالتها ونشاطها التجاري.

---

## 4️⃣ جدول جديد: `whatsapp_templates` (إدارة قوالب الرسائل)

جدول جديد بالكامل مخصص لحفظ وإدارة قوالب رسائل Meta المعتمدة لكل نشاط تجاري (المستخدمة في البث، الإشعارات، أو الرسائل خارج نافذة الـ 24 ساعة):

### هيكل الجدول:
* `id` (`UUID`, Primary Key, `gen_random_uuid()`)
* `business_id` (`UUID`, Foreign Key إلى `businesses.id`, `ON DELETE CASCADE`)
* `meta_template_id` (`TEXT`): معرّف القالب على Meta Graph API.
* `name` (`TEXT`): اسم القالب الفريد (مثال: `order_shipped`, `welcome_promo`).
* `category` (`TEXT`): تصنيف القالب (`MARKETING`, `UTILITY`, `AUTHENTICATION`).
* `language` (`TEXT`): لغة القالب (افتراضياً `'ar'`).
* `status` (`TEXT`): حالة اعتماد القالب (`PENDING`, `APPROVED`, `REJECTED`, `PAUSED`, `DISABLED`).
* `components` (`JSONB`): مكونات القالب (Header, Body, Buttons, Parameters).
* `created_at` / `updated_at` (`TIMESTAMPTZ`)

### قيود الأمان (Row Level Security - RLS):
* **Owner Access:** صاحب النشاط التجاري فقط يمكنه قراءة وإدارة قوالبه الخاصة.
* **Service Role Access:** صلاحيات كاملة للباك إند والـ Webhooks عبر `service_role`.

---

## 5️⃣ كود الـ SQL المطبق (للتشغيل أو النسخ الاحتياطي)

ملف المايجريشن الكامل محفوظ في:  
[`supabase/migrations/20261018_meta_whatsapp_migration.sql`](file:///c:/Users/makka/Claude/Projects/Arq%20Flow%20Website/Arq_Flow_website-main/supabase/migrations/20261018_meta_whatsapp_migration.sql)
