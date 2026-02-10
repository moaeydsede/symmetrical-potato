# Company Profile (GitHub Pages + Admin)

## الروابط
- **المشاهد:** `/` (صفحة البيانات)
- **التحرير:** `/admin/` (لوحة Decap CMS)

## التشغيل على GitHub Pages (خطوة بخطوة)
1) أنشئ Repository جديد على GitHub (مثلاً: `company-profile`).
2) ارفع كل ملفات هذا المشروع داخل الريبو (Upload files).
3) افتح الملف: `admin/config.yml` وعدّل:
   - `YOUR_GITHUB_USERNAME` ضع اسم حسابك
   - `YOUR_REPO_NAME` ضع اسم الريبو
4) فعّل GitHub Pages:
   - Settings → Pages → Source: **Deploy from a branch**
   - Branch: `main` / folder: `/ (root)`
5) افتح رابط GitHub Pages الناتج.
   - المشاهد: رابط الصفحة الرئيسية
   - التحرير: نفس الرابط + `/admin/`

## ملاحظة مهمة (صلاحيات دخول لوحة التحرير)
لوحة Decap CMS تحتاج تسجيل دخول GitHub OAuth.
لأسهل إعداد:
- أنشئ GitHub OAuth App من Settings → Developer settings → OAuth Apps
- ضع Homepage URL و Authorization callback URL مطابقين لرابط صفحاتك
- ثم استخدم Netlify Identity/Proxy أو OAuth gateway.

**إذا تريد طريقة بدون أي إعدادات OAuth:**
استخدم التعديل مباشرة من GitHub:
- افتح `data/company.json` → Edit → Commit
وسيتحدث الموقع تلقائياً بعد النشر.

> لو تحب، قلّي اسم حسابك واسم الريبو، وأنا أعدّل `config.yml` لك مباشرة قبل الرفع.
