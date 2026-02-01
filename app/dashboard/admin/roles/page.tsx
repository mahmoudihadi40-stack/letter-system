'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

const permissionLabels: Record<string, string> = {
  manage_users: 'مدیریت کاربران',
  manage_departments: 'مدیریت بخش‌ها',
  manage_all_letters: 'مشاهده تمام نامه‌ها',
  view_all_reports: 'مشاهده گزارش‌ها',
  manage_department_users: 'مدیریت کاربران بخش',
  approve_letters: 'تأیید نامه‌ها',
  view_department_letters: 'مشاهده نامه‌های بخش',
  write_letters: 'نوشتن نامه‌ها',
  view_own_letters: 'مشاهده نامه‌های خود',
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">درحال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">مدیریت نقش‌ها</h1>
        <p className="text-gray-600">نقش‌های سیستم و دسترسی‌های آن‌ها</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle>{role.name}</CardTitle>
              <CardDescription>
                {role.permissions.length} دسترسی
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((perm) => (
                  <Badge key={perm} variant="outline">
                    {permissionLabels[perm] || perm}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {role.name === 'مدیر کل' && (
                  <p>مدیر کل دسترسی کامل به تمام بخش‌های سیستم دارد و می‌تواند تمام تنظیمات را مدیریت کند.</p>
                )}
                {role.name === 'مدیر بخش' && (
                  <p>مدیر بخش می‌تواند نامه‌های بخش خود را تأیید کند و نامه‌های بخش را مدیریت کند.</p>
                )}
                {role.name === 'کارمند بخش' && (
                  <p>کارمند بخش می‌تواند نامه‌های جدید بنویسد و نامه‌های خود را مشاهده کند.</p>
                )}
                {role.name === 'IT' && (
                  <p>نقش IT فقط امکان اضافه کردن کاربران جدید را دارد.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جدول دسترسی‌ها</CardTitle>
          <CardDescription>مقایسه دسترسی‌های نقش‌های مختلف</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-right p-2 font-semibold">دسترسی</th>
                {roles.map((role) => (
                  <th key={role.id} className="text-center p-2 font-semibold">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(permissionLabels).map(([perm, label]) => (
                <tr key={perm} className="border-b">
                  <td className="p-2">{label}</td>
                  {roles.map((role) => (
                    <td key={role.id} className="text-center p-2">
                      {role.permissions.includes(perm) ? (
                        <span className="text-green-600 font-bold">✓</span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
