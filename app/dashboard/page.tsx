import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Mail, CheckSquare, Home, Send, Download, Plus, Search } from 'lucide-react';

export const metadata = {
  title: 'داشبورد - سیستم نامه‌نگاری',
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">خوش‌آمدید، {user?.full_name}</h1>
        <p className="text-gray-600">سیستم مدیریت نامه‌نگاری اداری</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* نامه‌های صادره */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              نامه‌های صادره
            </CardTitle>
            <CardDescription>
              نامه‌های ارسالی شما
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              مشاهده و پیگیری نامه‌های ارسالی
            </p>
            <Link href="/dashboard/sent-letters">
              <Button variant="outline" className="w-full bg-transparent">
                <Mail className="w-4 h-4 ml-2" />
                کارتابل صادره
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* نامه‌های وارده */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-500" />
              نامه‌های وارده
            </CardTitle>
            <CardDescription>
              نامه‌های دریافتی و درخواست‌ها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              مشاهده نامه‌های دریافتی و تأیید/رد آن‌ها
            </p>
            <Link href="/dashboard/inbox">
              <Button variant="outline" className="w-full bg-transparent">
                <CheckSquare className="w-4 h-4 ml-2" />
                کارتابل وارده
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* ثبت نامه جدید */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-purple-500" />
              نامه جدید
            </CardTitle>
            <CardDescription>
              نوشتن و ارسال نامه‌های اداری
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              ثبت نامه‌ی جدید با امکانات ویرایشی
            </p>
            <Link href="/dashboard/letter-writing">
              <Button variant="outline" className="w-full bg-transparent">
                <Mail className="w-4 h-4 ml-2" />
                نامه جدید
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* جست‌وجو در سوابق */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-orange-500" />
              جست‌وجو در سوابق
            </CardTitle>
            <CardDescription>
              جستجو در نامه‌های قدیمی
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              جستجو بر اساس تاریخ، موضوع یا شماره نامه
            </p>
            <Link href="/dashboard/search">
              <Button variant="outline" className="w-full bg-transparent">
                <Search className="w-4 h-4 ml-2" />
                جستجو
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* پنل مدیریت */}
        {(user?.is_admin || user?.role === 'IT') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-red-500" />
                پنل مدیریت
              </CardTitle>
              <CardDescription>
                مدیریت کاربران و بخش‌ها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                تنظیمات سیستم و مدیریت سازمان
              </p>
              <Link href="/dashboard/admin">
                <Button variant="outline" className="w-full bg-transparent">
                  <Home className="w-4 h-4 ml-2" />
                  ورود به مدیریت
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
