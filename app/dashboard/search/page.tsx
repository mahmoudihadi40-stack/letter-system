'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResult {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  letter_number?: number;
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

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'subject' | 'date' | 'letter_number'>('subject');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast.error('لطفاً عبارت جستجو را وارد کنید');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('/api/letters');
      if (response.ok) {
        const data = await response.json();
        let filtered = data.letters || [];

        // فیلتر کردن بر اساس نوع جستجو
        if (searchType === 'subject') {
          filtered = filtered.filter((l: any) =>
            l.subject.includes(searchTerm)
          );
        } else if (searchType === 'date') {
          // جستجو بر اساس تاریخ
          filtered = filtered.filter((l: any) => {
            const letterDate = new Date(l.created_at)
              .toLocaleDateString('fa-IR')
              .replace(/\u200E/g, '');
            return letterDate.includes(searchTerm);
          });
        } else if (searchType === 'letter_number') {
          filtered = filtered.filter((l: any) => l.id.toString() === searchTerm);
        }

        setResults(filtered);
        if (filtered.length === 0) {
          toast.info('نتیجه‌ای یافت نشد');
        }
      }
    } catch (error) {
      toast.error('خطا در جستجو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">جستجو در سوابق نامه‌ها</h1>

      <Card className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <select
              value={searchType}
              onChange={(e) =>
                setSearchType(e.target.value as 'subject' | 'date' | 'letter_number')
              }
              className="px-4 py-2 border rounded-lg"
            >
              <option value="subject">موضوع</option>
              <option value="date">تاریخ</option>
              <option value="letter_number">شماره نامه</option>
            </select>
            <Input
              placeholder={
                searchType === 'subject'
                  ? 'موضوع را وارد کنید...'
                  : searchType === 'date'
                  ? 'تاریخ را وارد کنید (مثال: 1402/10/15)...'
                  : 'شماره نامه را وارد کنید...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              <Search className="w-4 h-4 ml-2" />
              جستجو
            </Button>
          </div>
        </form>
      </Card>

      {searched && (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره</TableHead>
                <TableHead>موضوع</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>تاریخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    نتیجه‌ای یافت نشد
                  </TableCell>
                </TableRow>
              ) : (
                results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell className="font-mono text-sm">#{result.id}</TableCell>
                    <TableCell className="font-semibold">{result.subject}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[result.status]}>
                        {statusLabels[result.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(result.created_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
