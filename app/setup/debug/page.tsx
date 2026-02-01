import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DebugPage() {
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  const fetchDebugInfo = async () => {
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      setDbInfo(data);
      console.log('[v0] Debug info:', data);
    } catch (error) {
      console.error('[v0] Debug fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">اطلاعات دیتابیس</h1>

        {dbInfo && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>وضعیت دیتابیس</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-mono text-sm bg-gray-100 p-2 rounded block">
                    {dbInfo.dbPath}
                  </span>
                </div>
                <div>
                  <p>وجود دیتابیس: {dbInfo.dbExists ? '✅ بله' : '❌ خیر'}</p>
                </div>
              </CardContent>
            </Card>

            {dbInfo.dbContent && (
              <Card>
                <CardHeader>
                  <CardTitle>کاربران</CardTitle>
                  <CardDescription>{dbInfo.dbContent.users.length} کاربر</CardDescription>
                </CardHeader>
                <CardContent>
                  {dbInfo.dbContent.users.map((user: any) => (
                    <div key={user.id} className="border p-2 mb-2 rounded text-sm">
                      <p>
                        <strong>نام‌کاربری:</strong> {user.username}
                      </p>
                      <p>
                        <strong>نام:</strong> {user.full_name}
                      </p>
                      <p>
                        <strong>رمز:</strong> {user.password_hash.substring(0, 30)}...
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {dbInfo.dbContent && (
              <Card>
                <CardHeader>
                  <CardTitle>بخش‌ها</CardTitle>
                  <CardDescription>{dbInfo.dbContent.departments.length} بخش</CardDescription>
                </CardHeader>
                <CardContent>
                  {dbInfo.dbContent.departments.map((dept: any) => (
                    <div key={dept.id} className="border p-2 mb-2 rounded text-sm">
                      <p>
                        <strong>نام:</strong> {dept.name}
                      </p>
                      <p>
                        <strong>مسئول:</strong> {dept.manager_id || 'تعیین‌نشده'}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button onClick={fetchDebugInfo} className="w-full">
              تازه‌کردن
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
