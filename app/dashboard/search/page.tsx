'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatPersianDate, gregorianToPersian } from '@/lib/persian-utils'

interface User {
  id: string
  full_name: string
}

interface Letter {
  id: string
  number: string
  subject: string
  date: string
  from: string
  to: string
}

export default function SearchPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [searchNumber, setSearchNumber] = useState('')
  const [searchSubject, setSearchSubject] = useState('')
  const [searchFromDate, setSearchFromDate] = useState('')
  const [searchToDate, setSearchToDate] = useState('')
  const [results, setResults] = useState<Letter[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push('/')
    }
  }, [router])

  // Sample data
  const allLetters: Letter[] = [
    {
      id: '1',
      number: '14041112001',
      subject: 'درخواست خرید تجهیزات IT',
      date: formatPersianDate(),
      from: 'واحد فناوری اطلاعات',
      to: 'واحد مالی'
    },
    {
      id: '2',
      number: '14041112002',
      subject: 'گزارش عملکرد ماهانه',
      date: formatPersianDate(),
      from: 'واحد منابع انسانی',
      to: 'مدیریت عامل'
    },
    {
      id: '3',
      number: '14041111501',
      subject: 'اطلاعیه جلسه هماهنگی',
      date: '1404/11/15',
      from: 'مدیریت عامل',
      to: 'تمام واحدها'
    }
  ]

  const handleSearch = () => {
    let filtered = allLetters

    if (searchNumber) {
      filtered = filtered.filter(l => l.number.includes(searchNumber))
    }

    if (searchSubject) {
      filtered = filtered.filter(l => l.subject.includes(searchSubject))
    }

    if (searchFromDate) {
      const fromDate = searchFromDate.replace(/-/g, '/')
      filtered = filtered.filter(l => l.date >= fromDate)
    }

    if (searchToDate) {
      const toDate = searchToDate.replace(/-/g, '/')
      filtered = filtered.filter(l => l.date <= toDate)
    }

    setResults(filtered)
    setHasSearched(true)
  }

  const handleClear = () => {
    setSearchNumber('')
    setSearchSubject('')
    setSearchFromDate('')
    setSearchToDate('')
    setResults([])
    setHasSearched(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b-2 border-amber-500">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="Nour Hayat Hotel"
              width={100}
              height={40}
              priority
            />
            <p className="text-sm text-gray-500">جستجو و آرشیو نامه‌ها</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            بازگشت
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Filters */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">معیارهای جستجو</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Number Search */}
            <div>
              <label className="block text-sm font-semibold mb-2">شماره نامه:</label>
              <input
                type="text"
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                placeholder="مثال: 1404111201"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Subject Search */}
            <div>
              <label className="block text-sm font-semibold mb-2">موضوع:</label>
              <input
                type="text"
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                placeholder="جستجو برای موضوع..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* From Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">از تاریخ:</label>
              <input
                type="date"
                value={searchFromDate}
                onChange={(e) => setSearchFromDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">تا تاریخ:</label>
              <input
                type="date"
                value={searchToDate}
                onChange={(e) => setSearchToDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              جستجو
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
            >
              حذف فیلترها
            </Button>
          </div>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div>
            <h3 className="text-lg font-semibold mb-4">
              نتایج جستجو: {results.length} نامه
            </h3>

            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((letter) => (
                  <Card
                    key={letter.id}
                    className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{letter.subject}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-semibold">شماره:</span> {letter.number}
                          </div>
                          <div>
                            <span className="font-semibold">تاریخ:</span> {letter.date}
                          </div>
                          <div>
                            <span className="font-semibold">از:</span> {letter.from}
                          </div>
                          <div>
                            <span className="font-semibold">به:</span> {letter.to}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                      >
                        مشاهده
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500 text-lg">هیچ نامه‌ای با این معیارها یافت نشد</p>
              </Card>
            )}
          </div>
        )}

        {/* Help Text */}
        {!hasSearched && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="font-semibold mb-2">نکات مفید:</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>می‌توانید بر اساس شماره نامه جستجو کنید (شماره منحصر به فرد است)</li>
              <li>می‌توانید بر اساس موضوع جستجو کنید</li>
              <li>می‌توانید بر اساس بازه‌ی زمانی جستجو کنید</li>
              <li>همه معیارها اختیاری هستند و می‌توانید ترکیبی از آنها استفاده کنید</li>
            </ul>
          </Card>
        )}
      </main>
    </div>
  )
}
