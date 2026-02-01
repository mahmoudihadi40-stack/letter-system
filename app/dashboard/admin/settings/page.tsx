'use client';

import React from "react"

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Lock, User, Key } from 'lucide-react';

export default function SettingsPage() {
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingUsername, setLoadingUsername] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim()) {
      toast.error('نام کاربری جدید را وارد کنید');
      return;
    }

    if (newUsername.trim().length < 3) {
      toast.error('نام کاربری باید حداقل 3 کاراکتر باشد');
      return;
    }

    setLoadingUsername(true);
    try {
      const response = await fetch('/api/settings/username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: newUsername.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'خطا در تغییر نام کاربری');
        return;
      }

      toast.success('نام کاربری با موفقیت تغییر یافت');
      setNewUsername('');
      setUsername(newUsername.trim());
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoadingUsername(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error('رمز عبور فعلی را وارد کنید');
      return;
    }

    if (!newPassword) {
      toast.error('رمز عبور جدید را وارد کنید');
      return;
    }

    if (newPassword.length < 3) {
      toast.error('رمز عبور باید حداقل 3 کاراکتر باشد');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('رمزهای عبور مطابقت ندارند');
      return;
    }

    setLoadingPassword(true);
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error || 'خطا در تغییر رمز عبور');
        return;
      }

      toast.success('رمز عبور با موفقیت تغییر یافت');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">تنظیمات حساب</h1>
        <p className="text-gray-600">تغییر نام کاربری و رمز عبور</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* تغییر نام کاربری */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              تغییر نام کاربری
            </CardTitle>
            <CardDescription>
              نام کاربری جدید را وارد کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameChange} className="space-y-4">
              {username && (
                <div>
                  <Label className="text-gray-600">نام کاربری فعلی</Label>
                  <div className="mt-1 p-3 bg-gray-100 rounded border">
                    <p className="font-mono text-sm">{username}</p>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="newUsername">نام کاربری جدید</Label>
                <Input
                  id="newUsername"
                  type="text"
                  placeholder="نام کاربری جدید را وارد کنید"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  dir="ltr"
                  disabled={loadingUsername}
                />
              </div>

              <Button
                type="submit"
                disabled={loadingUsername || !newUsername}
                className="w-full"
              >
                {loadingUsername ? 'درحال پردازش...' : 'تغییر نام کاربری'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* تغییر رمز عبور */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-500" />
              تغییر رمز عبور
            </CardTitle>
            <CardDescription>
              رمز عبور جدید را تنظیم کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="رمز عبور فعلی"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={loadingPassword}
                />
              </div>

              <div>
                <Label htmlFor="newPassword">رمز عبور جدید</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="رمز عبور جدید"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loadingPassword}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">تأیید رمز عبور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="تأیید رمز عبور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loadingPassword}
                />
              </div>

              <Button
                type="submit"
                disabled={loadingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="w-full"
              >
                {loadingPassword ? 'درحال پردازش...' : 'تغییر رمز عبور'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-orange-600" />
            نکات امنیتی
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-gray-700">
          <p>• نام کاربری باید حداقل 3 کاراکتر داشته باشد</p>
          <p>• رمز عبور باید حداقل 3 کاراکتر داشته باشد</p>
          <p>• رمز عبور فعلی را برای تغییر رمز عبور جدید وارد کنید</p>
          <p>• رمزهای عبور با حروف بزرگ و کوچک متفاوت هستند</p>
        </CardContent>
      </Card>
    </div>
  );
}
