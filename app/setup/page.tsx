import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [initialized, setInitialized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      const response = await fetch('/api/init');
      const data = await response.json();
      setInitialized(data.initialized);

      if (data.initialized) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError('خطا در بررسی وضعیت');
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/init', {
        method: 'POST',
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('[v0] Init failed:', responseData);
        throw new Error(responseData.details || 'خطا در راه‌اندازی');
      }

      console.log('[v0] Init successful:', responseData);
      setInitialized(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      console.error('[v0] Setup error:', err);
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">راه‌اندازی سیستم</CardTitle>
          <CardDescription>
            سیستم مدیریت نامه‌نگاری اداری
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialized === null && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {initialized === true && (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  سیستم با موفقیت راه‌اندازی شد
                </AlertDescription>
              </Alert>
              <p className="text-center text-sm text-gray-600">
                درحال انتقال به صفحه ورود...
              </p>
            </>
          )}

          {initialized === false && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  سیستم هنوز راه‌اندازی نشده است
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-gray-600">
                <p>این فرآیند:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>دیتابیس را ایجاد می‌کند</li>
                  <li>جداول را تنظیم می‌کند</li>
                  <li>کاربران و بخش‌های نمونه را افزوده می‌کند</li>
                </ul>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleInitialize}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    درحال راه‌اندازی...
                  </>
                ) : (
                  'شروع راه‌اندازی'
                )}
              </Button>
            </>
          )}

          {initialized === false && (
            <div className="pt-4 border-t space-y-3 text-xs text-gray-500">
              <p>حساب‌های نمونه:</p>
              <div>
                <p className="font-mono">نام‌کاربری: admin</p>
                <p className="font-mono">رمز: admin123</p>
              </div>
              
              <div className="pt-2 border-t">
                <a 
                  href="/setup/debug" 
                  className="text-blue-500 hover:underline"
                >
                  مشاهده اطلاعات دیتابیس
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
