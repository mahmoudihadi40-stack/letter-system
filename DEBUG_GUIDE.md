# راهنمای دیبگ سیستم نامه‌نگاری

## مشکل ورود

اگر خطای "Invalid username or password" دریافت کردید:

### مراحل تشخیص:

1. **بررسی دیتابیس:**
   - به آدرس `http://localhost:3000/setup/debug` بروید
   - بررسی کنید که آیا `database.json` وجود دارد
   - بررسی کنید که کاربران در دیتابیس وجود دارند

2. **بررسی مستقیم API:**
   ```bash
   # تست API init
   curl -X GET http://localhost:3000/api/init
   
   # تست API debug
   curl http://localhost:3000/api/debug | jq
   ```

3. **تست ورود دستی:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

### اگر دیتابیس تهی است:

1. صفحه setup را بازبینی کنید
2. بر روی "شروع راه‌اندازی" کلیک کنید
3. console را بررسی کنید (F12) برای پیام‌های خطا

### اگر کاربران موجود هستند اما رمز درست نیست:

احتمال است bcryptjs hash درست ایجاد نشده باشد. در این صورت:

```bash
# دیتابیس را دوباره راه‌اندازی کنید
rm -rf data/
```

سپس صفحه setup را دوباره بازدید کنید.

## حساب‌های نمونه

بعد از راه‌اندازی، این حساب‌ها موجود هستند:

| نام‌کاربری | رمز | نقش |
|-----------|-----|------|
| admin | admin123 | مدیر سیستم |
| manager | user123 | مدیر HR |
| user | user123 | کارمند |

## نقاط مهم

- فایل دیتابیس در `data/database.json` ذخیره می‌شود
- رمزها با bcryptjs hash می‌شوند
- جتری کوکی‌ها برای نگه‌داری session استفاده می‌شود
