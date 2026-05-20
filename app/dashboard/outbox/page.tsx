'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DEPARTMENTS } from '@/lib/persian-utils'

interface User {
  id: string
  full_name: string
  role?: string
}

interface Letter {
  id: string
  letterNumber: string
  letterDate: string
  subject: string
  fromDepart: string
  toDepart: string
  status: string
  createdBy: string
  createdAt: string
  approvedBy?: string
  signature?: string
}

export default function OutboxPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [letters, setLetters] = useState<Letter[]>([])
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      const allLetters = JSON.parse(localStorage.getItem('letters') || '[]')
      setLetters(allLetters.filter((l: Letter) => l.createdBy === parsedUser.id))
    } else {
      router.push('/')
    }
  }, [router])

  const handleViewLetter = (letter: Letter) => {
    setSelectedLetter(letter)
    setShowDetails(true)
  }

  const handleReturnLetter = (letterId: string) => {
    const letter = letters.find(l => l.id === letterId)
    if (!letter) return

    if (letter.status === 'approved') {
      alert('نامه‌ای که امضاء شده‌اند قابل عودت نیستند')
      return
    }

    if (letter.status === 'pending_approval') {
      if (confirm('آیا مطمئن هستید؟')) {
        const allLetters = JSON.parse(localStorage.getItem('letters') || '[]')
        const updated = allLetters.map((l: Letter) =>
          l.id === letterId ? { ...l, status: 'draft' } : l
        )
        localStorage.setItem('letters', JSON.stringify(updated))
        setLetters(updated.filter((l: Letter) => l.createdBy === user?.id))
        alert('نامه به پیش‌نویس برگشت')
      }
    }
  }

  if (!user) return null

  const pendingLetters = letters.filter(l => l.status === 'pending_approval')
  const approvedLetters = letters.filter(l => l.status === 'approved')

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
            <p className="text-sm text-gray-500">نامه‌های صادره</p>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
          >
            بازگشت
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <p className="text-sm text-gray-600">منتظر تایید</p>
            <p className="text-3xl font-bold text-yellow-600">{pendingLetters.length}</p>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-sm text-gray-600">تایید‌شده</p>
            <p className="text-3xl font-bold text-green-600">{approvedLetters.length}</p>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-gray-600">کل</p>
            <p className="text-3xl font-bold text-blue-600">{letters.length}</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 flex gap-4">
          <button className="px-4 py-2 border-b-2 border-blue-600 font-semibold text-blue-600">
            منتظر تایید ({pendingLetters.length})
          </button>
          <button className="px-4 py-2 text-gray-600 font-semibold">
            تایید‌شده ({approvedLetters.length})
          </button>
        </div>

        {/* Letters List */}
        <div className="space-y-4">
          {pendingLetters.length === 0 && approvedLetters.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">هیچ نامه‌ای وجود ندارد</p>
            </Card>
          ) : (
            pendingLetters.map((letter) => (
              <Card key={letter.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">
                      شماره: {letter.letterNumber} | تاریخ: {letter.letterDate}
                    </p>
                    <h3 className="text-lg font-semibold mb-2">{letter.subject}</h3>
                    <p className="text-sm text-gray-600">
                      به: {DEPARTMENTS.find(d => d.id === letter.toDepart)?.name || 'نامشخص'}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    منتظر تایید
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleViewLetter(letter)}
                    variant="outline"
                    size="sm"
                  >
                    مشاهده
                  </Button>
                  <Button
                    onClick={() => handleReturnLetter(letter.id)}
                    variant="outline"
                    size="sm"
                    className="text-orange-600"
                  >
                    برگشت برای اصلاح
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Letter Details Modal */}
      {showDetails && selectedLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-96 overflow-y-auto p-12" style={{ direction: 'rtl' }}>
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
              <p className="text-lg font-semibold mb-4">بسم الله الرحمن الرحیم</p>
              <div className="flex justify-between text-sm text-gray-600">
                <div className="text-right">
                  <p>تاریخ: {selectedLetter.letterDate}</p>
                  <p>شماره: {selectedLetter.letterNumber}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="mb-8">
              <p className="mb-4">
                <span className="font-semibold">از:</span> {DEPARTMENTS.find(d => d.id === selectedLetter.fromDepart)?.fullName}
              </p>
              <p className="mb-4">
                <span className="font-semibold">به:</span> {DEPARTMENTS.find(d => d.id === selectedLetter.toDepart)?.fullName}
              </p>
              <div className="mb-6 pb-4 border-b border-gray-300">
                <p>
                  <span className="font-semibold">موضوع:</span> {selectedLetter.subject}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setShowDetails(false)}
                variant="outline"
              >
                بستن
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
