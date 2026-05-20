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
  department?: string
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
  approvedBy?: string
  content?: string
}

export default function InboxPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [letters, setLetters] = useState<Letter[]>([])
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [canAddInstructions, setCanAddInstructions] = useState(false)

  useEffect(() => {
    const userData = sessionStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // نامه‌هایی که به این بخش ارسال شده‌اند
      const allLetters = JSON.parse(localStorage.getItem('letters') || '[]')
      const inboxLetters = allLetters.filter((l: Letter) => l.toDepart === parsedUser.department)
      setLetters(inboxLetters)
    } else {
      router.push('/')
    }
  }, [router])

  const handleViewLetter = (letter: Letter) => {
    setSelectedLetter(letter)
    setShowDetails(true)
    
    // فقط مسئول بخش و مدیر عامل می‌توانند دستورات بنویسند
    const canWrite = user?.role === 'مسئول بخش' || user?.role === 'مدیر عامل'
    setCanAddInstructions(canWrite && letter.status === 'pending_approval')
  }

  const handleAddInstructions = (letterId: string) => {
    if (!user || !instructions.trim()) {
      alert('لطفاً دستورات را وارد کنید')
      return
    }

    const allLetters = JSON.parse(localStorage.getItem('letters') || '[]')
    const updated = allLetters.map((l: Letter) =>
      l.id === letterId ? { ...l, instructions, status: 'approved' } : l
    )
    localStorage.setItem('letters', JSON.stringify(updated))
    
    const inboxLetters = updated.filter((l: Letter) => l.toDepart === user.department)
    setLetters(inboxLetters)
    setShowDetails(false)
    setInstructions('')
    
    alert('دستورات ثبت شد')
  }

  const handleReturnToSender = (letterId: string) => {
    if (!user) return

    const letter = letters.find(l => l.id === letterId)
    if (!letter) return

    if (letter.status === 'approved') {
      alert('نامه‌ی امضاء‌شده قابل عودت نیست')
      return
    }

    if (confirm('آیا مطمئن هستید که می‌خواهید نامه را برگردانید؟')) {
      const allLetters = JSON.parse(localStorage.getItem('letters') || '[]')
      const updated = allLetters.map((l: Letter) =>
        l.id === letterId ? { ...l, status: 'returned', returnedBy: user.id } : l
      )
      localStorage.setItem('letters', JSON.stringify(updated))
      
      const inboxLetters = updated.filter((l: Letter) => l.toDepart === user.department)
      setLetters(inboxLetters)
      setShowDetails(false)
      
      alert('نامه به فرستنده برگشت داده شد')
    }
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
            <p className="text-sm text-gray-500">نامه‌های وارده</p>
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
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="جستجو برای موضوع یا شماره..."
              className="px-4 py-2 border rounded-lg flex-1"
            />
          </div>
        </Card>

        {/* Letters List */}
        <div className="space-y-4">
          {letters.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">هیچ نامه‌ای وجود ندارد</p>
            </Card>
          ) : (
            letters.map((letter) => (
              <Card key={letter.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">
                      شماره: {letter.letterNumber} | تاریخ: {letter.letterDate}
                    </p>
                    <h3 className="text-lg font-semibold mb-2">{letter.subject}</h3>
                    <p className="text-sm text-gray-600">
                      از: {DEPARTMENTS.find(d => d.id === letter.fromDepart)?.name || 'نامشخص'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      letter.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : letter.status === 'returned'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {letter.status === 'approved'
                      ? 'تایید‌شده'
                      : letter.status === 'returned'
                        ? 'برگشت‌خورده'
                        : 'درانتظار'}
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
                  {letter.status !== 'approved' && letter.status !== 'returned' && (
                    <Button
                      onClick={() => handleReturnToSender(letter.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                    >
                      برگشت به فرستنده
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Letter Details Modal */}
      {showDetails && selectedLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <Card className="max-w-4xl w-full p-8" style={{ direction: 'rtl' }}>
            <div className="grid grid-cols-3 gap-6">
              {/* Letter Content */}
              <div className="col-span-2">
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

                  <p className="whitespace-pre-wrap mb-8">{selectedLetter.content}</p>

                  {/* Signature */}
                  <div className="mt-8 flex justify-end">
                    <div className="text-center w-40">
                      <div className="mb-8 h-12 border-b border-gray-400"></div>
                      <p className="font-semibold">امضاء</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-4">پینوشت / دستورات</h4>
                {canAddInstructions && selectedLetter.status === 'pending_approval' ? (
                  <div>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="دستورات خود را بنویسید..."
                      className="w-full px-3 py-2 border rounded-md text-sm min-h-24 focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      onClick={() => handleAddInstructions(selectedLetter.id)}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      ثبت دستورات
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    {user?.role === 'مسئول بخش' || user?.role === 'مدیر عامل'
                      ? 'می‌توانید دستورات اضافه کنید'
                      : 'شما نمی‌توانید دستورات اضافه کنید'}
                  </p>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end mt-6 gap-2">
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
