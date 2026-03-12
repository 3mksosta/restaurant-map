# 🗺️ مطاعم ماب — دليل المطاعم التفاعلي

## خطوات التشغيل

### 1. تثبيت الـ Dependencies
```bash
npm install
```

### 2. إعداد متغيرات البيئة
```bash
cp .env.local.example .env.local
# افتح .env.local وأضف مفاتيح Supabase
```

### 3. إنشاء جداول قاعدة البيانات
- افتح Supabase Dashboard → SQL Editor
- الصق محتوى ملف `schema.sql` وشغّله

### 4. إنشاء Storage Bucket في Supabase
- افتح Storage → Create new bucket
- اسمه: `restaurants`
- اجعله Public

### 5. تشغيل المشروع
```bash
npm run dev
```

---

## 🔑 بيانات الدخول الافتراضية

| المستخدم | كلمة المرور |
|----------|-------------|
| `5471125595` | `5471125595` |

**رابط لوحة الإدارة:** `http://localhost:3000/DFG`

---

## 📁 هيكل المشروع

```
src/
├── app/
│   ├── page.tsx              ← الصفحة الرئيسية (الخريطة)
│   ├── DFG/                  ← لوحة الإدارة
│   └── api/                  ← API endpoints
├── components/               ← مكونات React
├── lib/
│   ├── supabase/             ← Supabase clients
│   ├── services/             ← Business logic
│   ├── adminAuth.ts          ← JWT (server only)
│   ├── utils.ts              ← Client-safe utilities
│   └── constants.ts          ← الثوابت
└── types/index.ts            ← TypeScript types
```

---

## 🚀 النشر على Vercel

1. ادفع الكود على GitHub
2. افتح Vercel → Import Project
3. أضف متغيرات البيئة في Settings → Environment Variables
4. اضغط Deploy

---

## 💳 نظام الاشتراكات

### الاشتراك الشهري (fixed)
- مبلغ ثابت شهرياً
- تواريخ بداية ونهاية
- تنبيه تلقائي قبل 3 أيام من الانتهاء

### الاشتراك حسب الطلبات (per_order)
- نسبة مئوية من كل طلب
- أو مبلغ ثابت لكل طلب
- تقرير شهري في لوحة الإدارة
