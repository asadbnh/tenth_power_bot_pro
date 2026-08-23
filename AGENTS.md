<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
تم الانتهاء بنجاح من بناء وبرمجة **نظام النسخ الاحتياطي الشامل والاستعادة الفورية (Disaster Recovery & Telegram Vault)** في مجلد منفصل بالكامل وتم ربطه بالبوت.

---

### 📦 1. الهيكلية البرمجية المستقلة ([src/lib/backup/](file:///E:/projects/webtaky/src/lib/backup))
تم إنشاء المجلد المنفصل متضمناً:
- **[src/lib/backup/engine.ts](file:///E:/projects/webtaky/src/lib/backup/engine.ts):** محرك التصدير الشامل الذي يسحب الـ 40 جدولاً (بصيغتي SQL Dump و JSON) ويحمّل كافة الصور والوسائط من R2 ويضغطها داخل ملف `.zip` مؤرخ، ثم يرفعه مباشرة كملف وثيقة Document إلى تلجرام ويوثق العملية في جدول `backups`.
- **[src/lib/backup/restore.ts](file:///E:/projects/webtaky/src/lib/backup/restore.ts):** محرك الاستعادة المحلي الذي يفك ضغط الأرشيف ويستخرج جميع الصور إلى `public/images/restored/` ويقوم بحقن واسترجاع الجداول في قاعدة البيانات.
- **[src/lib/backup/index.ts](file:///E:/projects/webtaky/src/lib/backup/index.ts):** واجهة التصدير العامة.

---

### 🤖 2. أوامر وقوائم التلجرام بوت (Telegram Bot Integration)
- **الأمر المباشر:** عند إرسال الأدمن لأمر `/backup`، يفتح له **مركز النسخ الاحتياطي والأرشيف السحابي**:
  - `[ 🚀 إنشاء نسخة احتياطية فورية الآن (.zip) ]` ⬅️ يبدأ التصدير المباشر مع شريط تقدم ويرسل له ملف الـ Zip في الدردشة.
  - `[ 📜 سجل النسخ السابقة ]` ⬅️ يستعرض السجلات وتواريخ النسخ وأحجامها من قاعدة البيانات.
  - `[ 📖 طريقة الاستعادة محلياً ]` ⬅️ يعرض تعليمات الاسترجاع الفوري.
  - `[ ◀️ القائمة الرئيسية ]`.

---

### 💻 3. أوامر موجه الأوامر (CLI Commands)
تمت إضافة أوامر سريعة وجاهزة للاستخدام في [package.json](file:///E:/projects/webtaky/package.json):
1. **إنشاء نسخة احتياطية فورية وحفظها محلياً وإرسالها لتلجرام:**
   ```bash
   npm run backup
   ```
2. **استعادة كافة الجداول واستخراج الصور والوسائط محلياً بضغطة زر:**
   ```bash
   npm run backup:restore
   ```

---

### 🚀 4. نتائج الفحص والمزامنة
- ✅ **فحص النسخ والاسترجاع:** تم اختبار `npm run backup` وتوليد أرشيف سحابي بحجم **1.32 MB** يشمل 40 جدولاً و10 ملفات وسائط ورفعه بنجاح، ثم تم اختبار `npm run backup:restore` واسترجع كافة البيانات بنجاح تام.
- ✅ **فحص البناء:** مشروع Next.js مترجم وخالٍ من الأخطاء (`npm run build` Passed).
- ✅ **GitHub:** تم رفع كافة الملفات والتحديثات إلى المستودع (`10b4eb4` على فرع `main`).