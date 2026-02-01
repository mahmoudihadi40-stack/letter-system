import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, Building2, FileText, Lock, Settings } from 'lucide-react';

export const metadata = {
  title: 'مدیریت - سیستم نامه‌نگاری',
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user?.is_admin && user?.role !== 'IT') {
    redirect('/dashboard');
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">پنل مدیریت</h1>
        <p className="text-gray-600">مدیریت کاربران، بخش‌ها و نقش‌های سیستم</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              کاربران
            </CardTitle>
            <CardDescription>
              مدیریت کاربران سیستم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              افزودن، ویرایش و حذف کاربران و تعریف نقش‌های آن‌ها
            </p>
            <Link href="/dashboard/admin/users">
              <Button variant="outline" className="w-full bg-transparent">
                مدیریت کاربران
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-500" />
              تنظیمات حساب
            </CardTitle>
            <CardDescription>
              تغییر نام کاربری و رمز عبور
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              تنظیمات شخصی حساب کاربری
            </p>
            <Link href="/dashboard/admin/settings">
              <Button variant="outline" className="w-full bg-transparent">
                تنظیمات
              </Button>
            </Link>
          </CardContent>
        </Card>

        {user?.is_admin && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-500" />
                  بخش‌ها
                </CardTitle>
                <CardDescription>
                  مدیریت سازمان
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  ایجاد و مدیریت بخش‌های سازمانی
                </p>
                <Link href="/dashboard/admin/departments">
                  <Button variant="outline" className="w-full bg-transparent">
                    مدیریت بخش‌ها
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-500" />
                  نقش‌ها و دسترسی‌ها
                </CardTitle>
                <CardDescription>
                  مدیریت نقش‌ها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  مشاهده و مدیریت نقش‌های سیستم و دسترسی‌های آن‌ها
                </p>
                <Link href="/dashboard/admin/roles">
                  <Button variant="outline" className="w-full bg-transparent">
                    مدیریت نقش‌ها
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>نقش‌های سیستم</CardTitle>
          <CardDescription>نقش‌های مختلف و دسترسی‌های آن‌ها</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">مدیر کل</h3>
              <p className="text-sm text-gray-600 mb-3">دسترسی کامل به سیستم</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ مدیریت کاربران</li>
                <li>✓ مدیریت بخش‌ها</li>
                <li>✓ مشاهده تمام نامه‌ها</li>
                <li>✓ تأیید نامه‌های هر بخش</li>
                <li>✓ مدیریت نقش‌ها</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">مدیر بخش</h3>
              <p className="text-sm text-gray-600 mb-3">مدیریت بخش خود</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ نوشتن نامه‌ها</li>
                <li>✓ تأیید نامه‌های بخش</li>
                <li>✓ مشاهده نامه‌های بخش</li>
                <li>✓ ارجاع نامه‌ها</li>
                <li>✗ مدیریت کاربران</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">کارمند بخش</h3>
              <p className="text-sm text-gray-600 mb-3">دسترسی محدود</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ نوشتن نامه‌ها</li>
                <li>✓ مشاهده نامه‌های خود</li>
                <li>✗ تأیید نامه‌ها</li>
                <li>✗ مدیریت کاربران</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg border-red-200 bg-red-50">
              <h3 className="font-semibold text-lg mb-2">IT</h3>
              <p className="text-sm text-gray-600 mb-3">دسترسی کامل به سیستم</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ مدیریت کاربران</li>
                <li>✓ مدیریت بخش‌ها</li>
                <li>✓ مشاهده تمام نامه‌ها</li>
                <li>✓ تأیید نامه‌های هر بخش</li>
                <li>✓ نوشتن نامه‌ها</li>
                <li>✓ مدیریت نقش‌ها</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات سیستم</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">سیستم:</span> مدیریت نامه‌نگاری اداری
          </p>
          <p className="text-sm">
            <span className="font-medium">نسخه:</span> 2.0.0
          </p>
          <p className="text-sm">
            <span className="font-medium">پایگاه داده:</span> JSON
          </p>
          <p className="text-sm">
            <span className="font-medium">وضعیت:</span> <span className="text-green-600 font-medium">فعال</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
