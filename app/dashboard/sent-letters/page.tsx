'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Letter {
  id: number;
  subject: string;
  to_department_id: number;
  status: string;
  created_at: string;
  sent_at?: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  sent: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  draft: 'پیش‌نویس',
  pending_approval: 'در انتظار تایید',
  approved: 'تایید شده',
  sent: 'ارسال شده',
  rejected: 'رد شده',
};

export default function SentLettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    try {
      const response = await fetch('/api/letters');
      if (response.ok) {
        const data = await response.json();
        setLetters((data.letters || []).sort((a: Letter, b: Letter) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (error) {
      toast.error('خطا در بارگذاری نامه‌ها');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">نامه‌های صادره</h1>
        <Link href="/dashboard/letter-writing">
          <Button>نامه جدید</Button>
        </Link>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>موضوع</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>تاریخ ایجاد</TableHead>
              <TableHead>تاریخ ارسال</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {letters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  نامه‌ای یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              letters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell className="font-semibold">{letter.subject}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[letter.status]}>
                      {statusLabels[letter.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(letter.created_at).toLocaleDateString('fa-IR')}
                  </TableCell>
                  <TableCell className="text-sm">
                    {letter.sent_at
                      ? new Date(letter.sent_at).toLocaleDateString('fa-IR')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
