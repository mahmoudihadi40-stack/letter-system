'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, Check, X, Loader2 } from 'lucide-react';
import { LetterEditor } from '@/components/letter/editor';

interface Letter {
  id: number;
  from_user_id: number;
  subject: string;
  content: string;
  content_html: string;
  status: string;
  created_at: string;
}

export default function InboxPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [comment, setComment] = useState('');
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const response = await fetch('/api/inbox');
      if (!response.ok) throw new Error('خطا در بارگیری');
      const data = await response.json();
      setLetters(data.letters);
    } catch (err) {
      setError('خطا در بارگیری نامه‌ها');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (action: 'approve' | 'reject') => {
    if (!selectedLetter) return;

    try {
      const response = await fetch(`/api/letters/${selectedLetter.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          comment,
        }),
      });

      if (!response.ok) throw new Error('خطا در تأیید');

      setSuccess(action === 'approve' ? 'نامه تأیید شد' : 'نامه رد شد');
      setSelectedLetter(null);
      setComment('');
      setApprovalAction(null);
      fetchLetters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'default',
      approved: 'secondary',
      rejected: 'destructive',
      forwarded: 'outline',
    };
    return variants[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'در انتظار تأیید',
      approved: 'تأیید شده',
      rejected: 'رد شده',
      forwarded: 'ارجاع شده',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">کارتابل</h1>
        <p className="text-gray-600">نامه‌های دریافتی و درخواست‌های تأیید</p>
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

      {letters.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">نامه‌ای برای تأیید وجود ندارد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {letters.map((letter) => (
            <Card key={letter.id} className="cursor-pointer hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{letter.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      تاریخ: {new Date(letter.created_at).toLocaleDateString('fa-IR')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {letter.content.substring(0, 100)}...
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Badge variant={getStatusBadge(letter.status)}>
                      {getStatusLabel(letter.status)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedLetter(letter)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      مشاهده
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog مشاهده نامه */}
      {selectedLetter && (
        <Dialog open={!!selectedLetter} onOpenChange={() => setSelectedLetter(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{selectedLetter.subject}</DialogTitle>
              <DialogDescription>
                نامه از تاریخ {new Date(selectedLetter.created_at).toLocaleDateString('fa-IR')}
              </DialogDescription>
            </DialogHeader>

            {selectedLetter.status === 'pending' && (
              <div className="space-y-4 bg-yellow-50 p-4 rounded border border-yellow-200">
                <p className="text-sm font-medium">عملیات تأیید</p>

                <Textarea
                  placeholder="نظر یا توضیح (اختیاری)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-20"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApproveReject('approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    تأیید و ارسال
                  </Button>
                  <Button
                    onClick={() => handleApproveReject('reject')}
                    variant="destructive"
                  >
                    <X className="h-4 w-4 mr-2" />
                    رد کردن
                  </Button>
                </div>
              </div>
            )}

            <div className="border rounded p-4">
              <h4 className="font-semibold mb-4">متن نامه</h4>
              <LetterEditor
                content={selectedLetter.content_html}
                readOnly
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
