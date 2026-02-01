'use client';

import { useState } from 'react';
import { LetterEditor } from '@/components/letter/editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Save, Send } from 'lucide-react';

export default function LetterWritingPage() {
  const [subject, setSubject] = useState('');
  const [toUser, setToUser] = useState('');
  const [toDepartment, setToDepartment] = useState('');
  const [content, setContent] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEditorChange = (text: string, html: string) => {
    setContent(text);
    setContentHtml(html);
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          content,
          contentHtml,
          toUser: toUser ? parseInt(toUser) : null,
          toDepartment: toDepartment ? parseInt(toDepartment) : null,
          status: 'draft',
        }),
      });

      if (!response.ok) {
        throw new Error('خطا در ذخیره پیش‌نویس');
      }

      setSuccess('نامه با موفقیت ذخیره شد');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setLoading(false);
    }
  };

  const handleSendLetter = async () => {
    if (!subject || !toUser || !contentHtml) {
      setError('لطفاً تمامی فیلدهای الزامی را پر کنید');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          content,
          contentHtml,
          toUser: parseInt(toUser),
          toDepartment: toDepartment ? parseInt(toDepartment) : null,
          status: 'pending_approval',
        }),
      });

      if (!response.ok) {
        throw new Error('خطا در ارسال نامه');
      }

      setSuccess('نامه برای تأیید ارسال شد');
      setSubject('');
      setToUser('');
      setToDepartment('');
      setContent('');
      setContentHtml('');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطای نامشخص');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">نامه‌نگاری</h1>
        <p className="text-gray-600">نوشتن و ارسال نامه‌های اداری</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>نامه جدید</CardTitle>
          <CardDescription>
            اطلاعات نامه و گیرنده را مشخص کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* موضوع */}
          <div className="space-y-2">
            <label className="text-sm font-medium">موضوع نامه *</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="موضوع نامه را وارد کنید"
              disabled={loading}
            />
          </div>

          {/* گیرنده */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">بخش گیرنده *</label>
              <Select value={toDepartment} onValueChange={setToDepartment}>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder="بخش را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">مدیریت عمومی</SelectItem>
                  <SelectItem value="2">منابع انسانی</SelectItem>
                  <SelectItem value="3">مالی</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">مسئول بخش *</label>
              <Select value={toUser} onValueChange={setToUser}>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder="مسئول را انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">مدیر سیستم</SelectItem>
                  <SelectItem value="2">مدیر HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ویرایشگر */}
          <div className="space-y-2">
            <label className="text-sm font-medium">متن نامه</label>
            <LetterEditor
              content={contentHtml}
              onContentChange={handleEditorChange}
            />
          </div>

          {/* دکمه‌های اقدام */}
          <div className="flex gap-3">
            <Button
              onClick={handleSaveDraft}
              disabled={loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  ذخیره پیش‌نویس
                </>
              )}
            </Button>

            <Button
              onClick={handleSendLetter}
              disabled={loading || !subject || !toUser}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال ارسال...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  ارسال برای تأیید
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
