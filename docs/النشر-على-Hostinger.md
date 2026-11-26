# نشر المشروع على Hostinger

الدومين المستهدف هو `cv.logicstack.tech`. المشروع تطبيق Next.js ديناميكي، لذلك أنشئه في Hostinger كـ **Web App** مستقل، وليس كمجلد ملفات PHP عادي.

## قاعدة البيانات

خطة Unlimited توفر MariaDB عبر phpMyAdmin، بينما PostgreSQL المحلي يبقى للمطور. اختر `DB_DRIVER=mysql` في إعدادات تطبيق Hostinger وأنشئ قاعدة MariaDB من hPanel، ثم استورد `database/schema.mariadb.sql` باستخدام phpMyAdmin. عند تشغيل التطبيق على Hostinger، استخدم `MYSQL_HOST=127.0.0.1` و`MYSQL_PORT=3306`. اسم المضيف `srv...hstgr.io` مخصص للاتصالات البعيدة القادمة من خارج Hostinger، مثل نقل البيانات من جهازك. إعدادات الاتصال موضحة في `database/README.md`.

قاعدة MariaDB الجديدة تبدأ فارغة؛ حسابات وملفات CV الموجودة في PostgreSQL المحلي لا تنتقل تلقائيًا. بعد استيراد المخطط، فعّل الاتصال البعيد مؤقتًا من صفحة قاعدة البيانات في hPanel عبر **External connections → Allow IP**، وأضف عنوان IP الحالي لجهازك. ضع بيانات الاتصال في `.env.local` وشغّل `npm run db:migrate:mariadb`؛ استخدم اسم الخادم الذي تعرضه Hostinger لهذا الاتصال البعيد. أزل سماح الاتصال البعيد بعد النقل. السكربت يوقف النقل إذا كانت جداول الوجهة تحتوي بيانات، ولا يحذف أو يعدّل قاعدة PostgreSQL. الجلسات لا تُنقل، لذا سيسجل المستخدمون الدخول مجددًا.

## إنشاء تطبيق الويب

1. في Hostinger افتح **Websites → Create site → Web App**.
2. اختر `cv.logicstack.tech` أو أضفه كنطاق فرعي إذا لم يظهر.
3. اربط مستودع Git أو ارفع ملف ZIP للمشروع.
4. اختر إطار **Next.js** وإصدار **Node.js 24**.
5. استخدم أمر البناء `npm run build` وأمر التشغيل `npm run start` إذا طلبتهما الشاشة.
6. أضف `DB_DRIVER=mysql` و`DB_HOST=127.0.0.1` و`DB_PORT=3306` و`DB_NAME` و`DB_USER` و`DB_PASSWORD`، إضافة إلى `NODE_ENV=production`. يقبل التطبيق أيضًا أسماء `MYSQL_HOST` و`MYSQL_PORT` و`MYSQL_DATABASE` و`MYSQL_USER` و`MYSQL_PASSWORD`. أضفها من إعدادات Environment Variables في Hostinger، ولا ترفع ملف `.env` إلى GitHub. إذا غاب `DB_DRIVER` فوجود `DB_NAME` يختار MySQL تلقائيًا.
7. أضف `CV_UPLOAD_DIR` كمسار قابل للكتابة خارج مجلدات البناء. Hostinger ينشئ مجلد بناء جديدًا عند كل نشر، ويُدار محتوى مجلدات البناء بواسطة منصة النشر.
8. انشر التطبيق، فعّل SSL، ثم اختبر التسجيل والدخول وإنشاء CV ورفع صورة.

## الملفات والصور

لا ترفع `.env.local` أو `node_modules` أو `.next` في ملف ZIP. صور PostgreSQL المحلية موجودة في `storage/uploads/`؛ انسخها إلى مجلد التخزين الدائم إذا كنت تنقل السجلات التي تشير إليها. بعد تحديد `CV_UPLOAD_DIR` في Hostinger، انسخ الصور إلى المسار نفسه.

## حفظ البيانات الحالية

المشروع يدعم PostgreSQL محليًا وMariaDB على Hostinger، لكن اختيار قاعدة جديدة لا ينسخ البيانات القديمة. قبل النشر العام يجب تصدير الحسابات والسير الذاتية والصور من PostgreSQL واستيرادها إلى MariaDB. لا توجّه الدومين للموقع الجديد قبل تأكيد ظهور البيانات التي تريد الاحتفاظ بها.
