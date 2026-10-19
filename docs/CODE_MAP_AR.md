# مرجع كود JOUW DRIVER

هذا مدخل للمبرمج ولأدوات البرمجة، يجمع خريطة Graphify الآلية مع دليل بشري للميزات.
الخريطة تصف البنية والعلاقات؛ الكود والاختبارات هما المرجع النهائي للسلوك.

## ابدأ من هنا

- [فهرس الملفات والرموز وأماكنها](../graphify-out/SOURCE_INDEX.md): ابحث عن اسم الملف أو الدالة.
- [شجرة الملفات التفاعلية](../graphify-out/GRAPH_TREE.html): نزّل الملف وافتحه في المتصفح؛ يحتاج مكتبة D3 من الإنترنت.
- [تقرير Graphify](../graphify-out/GRAPH_REPORT.md): المكوّنات الأكثر اتصالًا والمجموعات والعلاقات.
- [الخريطة القابلة للاستعلام](../graphify-out/graph.json): تستخدمها أوامر Graphify.
- [بصمات المصادر والإحصاءات](../graphify-out/source-manifest.json): تكشف الملفات المتغيرة والمضافة والمحذوفة.
- [تشخيص سلامة العلاقات](../graphify-out/health.json): حدود الفهرسة والعلاقات الخارجية والمكررة.
- [تعليمات أدوات البرمجة](../AGENTS.md): طريقة الاستخدام والتحديث الآمن.

## أين أعدّل؟

المسارات التالية نقاط بداية تمت مراجعتها، وليست حصرًا لكل تبعيات الميزة.
الروابط نسبية إلى الكود الحالي؛ رقم السطر في الفهرس صالح فقط حين ينجح فحص الحداثة.

| الميزة | ملفات البداية | ما يجب مراجعته معها |
| --- | --- | --- |
| صفحة الموقع الإعلاني | [page.tsx](../src/app/page.tsx)، [LandingPage](../src/components/landing/LandingPage.tsx)، [PlatformLanding](../src/components/landing/PlatformLanding.tsx) | `platform.css` و`onboarding-copy.ts` في مجلد landing، واللغات الثلاث |
| نموذج تسجيل الشركة | [CompanyRegistrationDialog](../src/components/registration/CompanyRegistrationDialog.tsx)، [الحقول والتحقق](../src/lib/company-registration.ts) | `copy.ts` و`registration.css` في registration، والتحقق على الخادم |
| حفظ التسجيل ومراجعته | [واجهة التسجيل](../src/app/next_api/company-registrations/route.ts)، [معاملات قاعدة البيانات](../migrations/20261017_company_registration.sql) | التشفير، عدم تكرار الطلب، عزل الشركة وحالة الحسابات |
| طلبات تعديل الشركة على الموقع | `src/lib/company-changes.ts`، `src/components/operations/CompanyChangesPanel.tsx`، `migrations/20261018_web_change_approvals.sql` | عزل الشركة، بيانات الطلب الآمنة، مراجعة ذرية دون تفعيل قبل الموافقة |
| فواتير الاشتراك والدفع النقدي | `src/components/operations/BillingPanel.tsx`، `src/lib/subscription-billing.ts`، `migrations/20261018_web_billing.sql` | TVA افتراضية 21%، دفعات يدوية، إصدار تجريبي دون بريد أو Peppol |
| عقد السنة والفوترة المرتبطة | `src/lib/contract-billing.ts`، `src/lib/subscription-offer.ts`، `src/components/operations/ContractBillingPanel.tsx`، `migrations/20261018_contract_billing.sql` | عرض 50€ شهريًا شامل 21%، توقيع المالك، ربط الأقساط والعقد وحفظ السجلات السابقة |
| موافقات الإدارة | [صفحة الموافقات](../src/app/admin/approval-requests/page.tsx)، [CompanyRegistrationApprovals](../src/components/registration/CompanyRegistrationApprovals.tsx) | صلاحية الإدارة وMFA؛ الحقول المعروضة لا تتضمن المفاتيح |
| بوابة السائق على الويب | [مجلد driver](../src/app/driver)، [واجهة السائق](../src/app/next_api/drivers) | الرحلات والملخص والملف الشخصي والمركبات |
| واجهة تطبيق Android/iOS | [توجيه الشاشات](../driver-app/src/app)، [شاشات experience](../driver-app/src/experience) | تعليمات `driver-app/AGENTS.md` وDESIGN.md وUX-CONTRACT.md |
| دخول التطبيق والتسجيل | [session.tsx](../driver-app/src/experience/session.tsx)، [api.ts](../driver-app/src/api.ts) | endpoint دخول السائق، لغة رابط تسجيل الشركة، حالات فشل الشبكة |
| الرحلات والإيرادات في التطبيق | [Trips](../driver-app/src/experience/Trips.tsx)، [Revenues](../driver-app/src/experience/Revenues.tsx) | `activity-state.tsx` و`ActivityFilters.tsx` و`driver-activity.ts` على الخادم |
| بدء وإنهاء الرحلات | [start](../src/app/next_api/trips/start/route.ts)، [end](../src/app/next_api/trips/end/route.ts) | [متحكم التطبيق](../driver-app/src/useTripController.ts)، دفتر الرحلة والتزامن |
| العداد والسجل المحلي | [trip-engine](../driver-app/src/trip-engine.ts)، [trip-store](../driver-app/src/trip-store.ts)، [trip-meter](../driver-app/src/trip-meter.ts) | [منطق الخادم](../src/lib/trip-meter.ts)، الاسترجاع وعدم فقد النقاط |
| شيرون | [ChironService](../src/lib/chiron-service.ts)، [البروتوكول](../src/lib/chiron-protocol.ts)، [إعادة المحاولة](../src/lib/chiron-retry.ts) | حالة الرسالة، بيئة الشركة، القبول الفعلي ومنع التكرار |
| مفاتيح شيرون | [secret-vault](../src/lib/secret-vault.ts)، [إعدادات الخادم](../src/app/next_api/chiron-settings/route.ts) | لا تطبع الأسرار ولا تنقلها إلى المرجع؛ التبديل للإنتاج ليس نتيجة فهرسة |
| فاتورة الرحلة PDF | [generate-invoice](../src/app/next_api/trips/generate-invoice/route.ts)، [pdf-generator](../src/lib/pdf-generator.ts) | [مشاركة الفاتورة في التطبيق](../driver-app/src/experience/receipt.ts)، الصلاحيات والتوقيت البلجيكي |
| التسعير والعناوين والمسار | [company-pricing](../src/lib/company-pricing.ts)، [address-search](../src/lib/address-search.ts)، [mapbox-route](../src/lib/mapbox-route.ts) | إعدادات الشركة وبلجيكا وحالات فشل مزود الخرائط |
| الخريطة الحية والأسطول | [fleet-tracking](../src/lib/fleet-tracking.ts)، [FleetPanel](../src/components/fleet/FleetPanel.tsx)، [native-fleet-runtime](../driver-app/src/native-fleet-runtime.ts) | مشاركة الموقع والصلاحيات وعزل الشركات |
| الرسائل | [message-access](../src/lib/message-access.ts)، [واجهات messages](../src/app/next_api/messages)، [Messages في التطبيق](../driver-app/src/experience/Messages.tsx) | المرسل والمستلم والشركة وصلاحية الوصول |
| الحسابات والصلاحيات | [api-utils](../src/lib/api-utils.ts)، [auth](../src/lib/auth.ts)، [security-session](../src/lib/security-session.ts)، [admin-mfa](../src/lib/admin-mfa.ts) | المصادقة قبل بيانات الشركة، وسياسة المتصفح وPostgREST |
| عقود الاشتراك والتوقيع | [ContractDocument](../src/components/contracts/ContractDocument.tsx)، [قالب العقد](../src/lib/contract-template.ts)، [واجهات contracts](../src/app/next_api/contracts) | العقود الموقعة والتوكنات والطباعة؛ لا تغيّر الوثائق السابقة ضمن تعديل تصميم |
| دعوة توقيع العقد | `src/lib/contract-invitation.ts`، `src/app/next_api/contracts/send-signature-link/route.ts` | حساب صاحب الشركة النشط، UUID لمنع التكرار، بوابة محمية دون رموز توقيع عامة |
| إعداد مزود البريد على الخادم | `deploy/configure-mail.mjs`، `.github/workflows/configure-mail.yml` | نسخة مختبرة منشورة، خطة مجانية، مرسل نشط، أسرار عبر SSH دون سجل، استرجاع إعدادات التطبيق عند الفشل |
| بريد Brevo المجاني | `src/lib/brevo-mail.ts`، `src/app/next_api/webhooks/brevo/route.ts` | مرسل متحقق منه، خطة مجانية، webhook محمي، القبول ليس التسليم |
| البريد | [mail-service](../src/lib/mail-service.ts)، [mail-policy](../src/lib/mail-policy.ts) | سجل التسليم؛ نجاح الطلب لا يثبت وصول البريد |
| الإشعارات | [push-pause](../driver-app/src/push-pause.ts)، [push-lifecycle](../driver-app/src/push-lifecycle.ts)، [push-worker](../scripts/push-worker.mjs) | وجود الكود لا يعني تفعيل الإشعارات؛ لا تغيّر حالة التشغيل ضمن تحديث المرجع |
| قاعدة البيانات والنشر | [migrations](../migrations)، [apply-release](../scripts/apply-release.mjs)، [readiness](../scripts/database-readiness.mjs)، [deploy](../deploy) | ترتيب الترحيلات، النسخ الاحتياطي وفحوص القبول؛ لا تصل إلى بيانات الإنتاج لبناء الخريطة |

## مثال: تتبّع تسجيل شركة

1. `PlatformLanding` يفتح `CompanyRegistrationDialog`؛ صفحة `/register-company` تفتح النموذج مباشرة.
2. `companyRegistrationSchema` يحدد الحقول والتحقق المشترك، ويتحقق الخادم منها مجددًا.
3. `POST` يشفر أسرار شيرون ويجزّئ كلمتي المرور ثم يستدعي `security_submit_company_registration`.
4. معاملة قاعدة البيانات تنشئ السجلات المترابطة بحالة انتظار وحسابات غير نشطة.
5. واجهة الموافقات تقرأ ملخصًا آمنًا؛ `PUT` يستدعي `security_review_company_registration` بصلاحية الإدارة.
6. الموافقة تفعّل السجلات معًا؛ لا تغيّر بيئة شيرون تلقائيًا ولا تنشئ دفعة مالية وهمية.

هذا تسلسل راجعه المبرمج، وليس سلسلة يدّعي Graphify أنه اكتشف كل روابطها تلقائيًا.
اتصالات HTTP وRPC وأسماء الجداول النصية والتنفيذ الديناميكي قد لا تظهر كاملة في التحليل البنيوي.

## التثبيت على جهاز تطوير جديد

تحتاج Python 3.10+ وuv أو pip. الأداة منفصلة عن حزم الموقع والتطبيق:

```bash
uv tool install 'graphifyy[sql]==0.9.92'
uv run --with 'graphifyy[sql]==0.9.92' python scripts/code-map.py
```

أو بيئة Python مخصصة:

```bash
python3 -m venv .venv-code-map
.venv-code-map/bin/python -m pip install -r scripts/requirements-code-map.txt
.venv-code-map/bin/python scripts/code-map.py
```

على Windows استعمل `.venv-code-map\Scripts\python.exe` بدل مسار `bin/python`.
المهارة الرسمية لـCodex مثبتة داخل `.codex/skills/graphify/`؛ تحميلها يعتمد على دعم الأداة المضيفة.
إذا احتجت إعادة تثبيتها: `graphify install --project --platform codex`، ثم راجع التغييرات
واحفظ تعليمات النطاق في AGENTS.md. لا تحتاج حساب Graphify Cloud أو مفاتيح نموذج أو قاعدة بيانات.

## كيف أستخدم المرجع؟

```bash
python3 scripts/code-map.py --check
graphify query "PlatformLanding registration" --budget 1500
graphify explain "ChironService"
graphify query "generate-invoice shareReceipt" --budget 1500
graphify affected "ChironService" --depth 2
```

عند تشابه أسماء الدوال، استخدم معرّف العقدة الذي تعرضه الأداة أو `--seed` بمسار الملف.
إذا تعذر تشغيل CLI، ابحث في SOURCE_INDEX.md ثم افتح المصدر؛ لا تعتمد على خط قديم.

لإنشاء العرض التفاعلي محليًا:

```bash
graphify export html
graphify tree --label 'JOUW DRIVER'
```

افتح `graphify-out/graph.html` للخريطة أو `graphify-out/GRAPH_TREE.html` لشجرة الملفات.
في الخرائط الكبيرة يكون العرض الأول ملخصًا للمجموعات. قد يعتمد العرض على مكتبات JavaScript
من CDN؛ هذا ليس رفعًا للمستودع إلى خدمة Graphify، ولا يعني ضمان العمل دون إنترنت.
لا تنشر العرض أو محتوى المرجع على موقع عام دون مراجعة محتواه.

## التحديث والحدود

- بعد إضافة ملفات مصدر جديدة: `git add` للملفات المقصودة، ثم شغّل `scripts/code-map.py` من البيئة المخصصة.
- احفظ `graphify-out/` مع التعديل. فحص GitHub **Code reference freshness** يمنع مرور مرجع قديم بصمت.
- يفحص `--check` بصمات المصادر والمخرجات، دون تثبيت Graphify أو استدعاء نماذج. تغيّر رقم commit وحده لا يجعل الخريطة قديمة؛ بصمات الملفات هي المعيار.
- الإصدار المثبت للأداة محدد، لكن التبعيات العابرة ليست مقفلة بالكامل؛ حدّث الإصدار عمدًا مع مراجعة الخريطة والاختبارات.
- الأداة تقرأ المصادر المدرجة في Git ضمن قائمة مسموحة فقط. تستبعد الأسرار والوثائق الشخصية والصور والسجلات وملفات التصدير وملفات SQL التاريخية الكبيرة، وتستبعد الاختبارات من الرسم لتقليل التشويش. الاختبارات تبقى مرجع التحقق.
- CSS مدرج في فهرس الملفات والبصمات فقط، وليس تحليلًا للدوال. بعض ملفات التصدير والإعداد ليس لها رموز مستخرجة؛ الفهرس يصرح بذلك.
- `EXTRACTED` علاقة مباشرة من المصدر؛ `INFERRED` علاقة استنتجها المحلل. لا تثبت أي منهما صلاحية الأمان أو نجاح الإنتاج.
- الرسم المبسط قد يجمع علاقات مختلفة بين العقدتين نفسيهما. يحتفظ JSON بروابط الاستخراج الأصلية، ويعرض health.json مخاطر التجميع. لا تعتبر غياب علاقة دليلًا على عدم وجودها.
- بناء الخريطة البنيوي يستهلك صفر توكنات نماذج؛ هذا لا يعني أن جلسات شرح الكود مع مساعد ذكاء اصطناعي مجانية أو بلا توكنات.

المصدر الرسمي للأداة: https://github.com/Graphify-Labs/graphify — الحزمة الصحيحة `graphifyy` بحرفي y.
